import { RequestMethod } from "@/models/types";
import { firebaseAuth } from "../../config/firebase";
import { Config } from "../../config";
import { logError } from "@/utils/errors";
import { getSessionId } from "@/lib/session";
import {
  forceLogoutDueToSession,
  isSessionErrorCode,
} from "@/lib/authSession";

let lastTokenRefetch = 0;
interface PostHog {
  capture: (event: string, properties?: Record<string, unknown>) => void;
}
export type CustomFetchConfig<RequestType> = {
  method: RequestMethod;
  body?: RequestType;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  isProtected: boolean;
  bearerToken?: string;
  keepalive?: boolean;
  isRetry?: boolean;
} & (
    | {
      path: string;
    }
    | {
      url: string;
    }
  );

export const customFetch = async <ResponseType, RequestType extends object>({
  method,
  body,
  headers,
  query,
  signal,
  isProtected,
  bearerToken,
  keepalive,
  isRetry,
  ...config
}: CustomFetchConfig<RequestType>): Promise<ResponseType> => {
  try {
    const formattedQuery = query
      ? `?${new URLSearchParams(query).toString()}`
      : "";
    const formattedUrl =
      ("path" in config ? `${Config.backendUrl}${config.path}` : config.url) +
      formattedQuery;

    const formattedHeaders: Record<string, string> = {
      Accept: "application/json",
      Source: "webapp",
      ...headers,
    };
    if (isProtected) {
      console.log("[customFetch] Getting Firebase token...");
      console.log("[customFetch] Current user:", firebaseAuth.currentUser?.uid);
      const token =
        bearerToken || (await firebaseAuth.currentUser?.getIdToken());
      if (!token) {
        console.error("[customFetch] No token found!");
        throw new Error("Bearer token not found");
      }
      console.log("[customFetch] Token obtained, length:", token.length);
      formattedHeaders.Authorization = `Bearer ${token}`;

      const sessionId = getSessionId();
      if (sessionId) {
        formattedHeaders["x-session-id"] = sessionId;
      }
    }
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    if (body && !isFormData) {
      formattedHeaders["Content-Type"] = "application/json";
    }

    console.log("[customFetch] Making fetch request...");
    const response = await fetch(formattedUrl, {
      method,
      body: body
        ? isFormData
          ? (body as unknown as FormData)
          : JSON.stringify(body)
        : undefined,
      headers: formattedHeaders,
      signal,
      keepalive: keepalive,
    });
    console.log("[customFetch] Response status:", response.status);
    const data = (await response.json()) as ResponseType;
    console.log("[customFetch] Response data received");
    if (response.status >= 400 || !response.ok) {
      const sessionCode =
        typeof (data as { code?: unknown })?.code === "string"
          ? (data as { code: string }).code
          : undefined;

      if (response.status === 401 && isSessionErrorCode(sessionCode)) {
        await forceLogoutDueToSession();
      }

      throw new Error(JSON.stringify(data));
    }

    if (
      response.status === 200 &&
      typeof window !== "undefined" &&
      (window as unknown as Window & { posthog: PostHog }).posthog &&
      !("path" in config && config.path === "/analytics/user_session_metrics")
    ) {
      (window as unknown as Window & { posthog: PostHog }).posthog.capture(
        "api_success",
        {
          url: formattedUrl,
          method,
          status: response.status,
        }
      );
    }

    return data;
  } catch (err) {
    const error = err as Error;
    const message = typeof error === "string" ? error : error.message;
    if (
      message?.includes("Failed to fetch user email") ||
      message?.includes("invalid user while verifying")
    ) {
      let token: string | undefined;
      if (Date.now() - lastTokenRefetch <= 10000) {
        token = await firebaseAuth.currentUser?.getIdToken();
      } else {
        token = await firebaseAuth.currentUser?.getIdToken(true);
        lastTokenRefetch = Date.now();
      }
      return await customFetch({
        method,
        body,
        headers,
        query,
        signal,
        isProtected,
        bearerToken: token,
        isRetry,
        keepalive,
        ...config,
      });
    }
    if (!isRetry && message.startsWith("Failed to fetch")) {
      return await customFetch({
        method,
        body,
        headers,
        query,
        signal,
        isProtected,
        bearerToken,
        keepalive,
        isRetry: true,
        ...config,
      });
    }
    throw err;
  }
};

export const retryFetch = <ResponseType>(
  apiFunction: (flag?: boolean) => Promise<ResponseType>,
  delay = 10000,
  label: string,
  passRetryFlag?: boolean
): Promise<ResponseType> =>
  new Promise((res, rej) => {
    let errorCount = 0;
    let hasStartedRetry = false;
    const timeoutId = setTimeout(() => {
      hasStartedRetry = true;
      logError({
        description: `${label} taking too long to respond`,
        error: `${label} took more than ${delay / 1000
          }s. A retry has been initiated`,
        slackChannel: "frontend-errors",
      });
      apiFunction(passRetryFlag)
        .then(res)
        .catch((err) => {
          const error = err as Error;
          errorCount++;
          if (error.name === "AbortError" || errorCount === 2) {
            rej(error);
          } else {
            logError({
              description: `Failed to fetch`,
              error,
              slackChannel: "frontend-errors",
            });
          }
        });
    }, delay);
    apiFunction()
      .then((data) => {
        clearTimeout(timeoutId);
        res(data);
      })
      .catch((err) => {
        const error = err as Error;
        errorCount++;
        if (
          error.name === "AbortError" ||
          errorCount === 2 ||
          !hasStartedRetry
        ) {
          clearTimeout(timeoutId);
          rej(err);
        } else {
          logError({
            description: `${label} failed`,
            error,
            slackChannel: "frontend-errors",
          });
        }
      });
  });
