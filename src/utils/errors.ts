import { Config, Environment } from "@/config";
export type LogErrorType = "api-error" | "firebase-error" | "ui-error";
import { firebaseAuth } from "@/config/firebase";

export type LogErrorConfig<ErrorType extends Error | string> = {
  error: ErrorType;
  slackChannel: "ui-errors" | "firebase-errors" | "frontend-errors" | "none";
  description: string;
};
export interface SlackErrorRequest {
  email?: string | null;
  sessionId?: string | null;
  error: string;
  description: string;
  channel: "frontend-errors";
  environment: Environment;
  webappVersion: string;
  source: "webapp";
}

const shouldLogError = <ErrorType extends Error | string>(
  error: ErrorType
): boolean => {
  if (Config.environment === "local") {
    return false;
  }
  if (typeof error !== "string") {
    const isEmptyError = !error.message && !error.name;
    const isCancelledError = ["AbortError"].includes(error.name);
    if (isEmptyError || isCancelledError) {
      return false;
    }
    return true;
  }
  return !!error;
};
export const logError = <ErrorType extends Error | string>({
  description,
  error,
  slackChannel,
}: LogErrorConfig<ErrorType>) => {
  try {
    if (!shouldLogError(error)) {
      return;
    }
    if (slackChannel !== "none") {
      logErrorsToSlack({ description, error, slackChannel });
    }
  } catch (err) {
    console.error("Error logging error:", err);
    return;
  }
};

const logErrorsToSlack = async <ErrorType extends Error | string>({
  description,
  error,
  slackChannel,
}: LogErrorConfig<ErrorType>) => {
  try {
    const message = typeof error === "string" ? error : error.message;
    const shouldIgnore =
      message === "Load failed" ||
      message === "staleQuery" ||
      message === "Bearer token not found" ||
      message === "NetworkError when attempting to fetch resource." ||
      message.includes("auth/network-request-failed") ||
      message.includes("invalid user while verifying") ||
      message.includes("user is not allowed to access the dev app") ||
      message.includes("Error while fetching self labelled app icon");

    if (slackChannel === "none" || shouldIgnore) {
      return;
    }
    const isNetworkError = message === "Failed to fetch";
    const isImportantError =
      description.includes("QNA") ||
      description === "Failed to fetch user plan details" ||
      description === "Failed to fetch search results" ||
      !description.startsWith("Failed to fetch");
    if (isNetworkError && !isImportantError) {
      return;
    }

    const request: SlackErrorRequest = {
      channel: "frontend-errors",
      environment: Config.environment,
      error: typeof error === "string" ? error : error.message,
      email: firebaseAuth.currentUser?.email,
      sessionId: sessionStorage.getItem("session_id"),
      description,
      source: "webapp",
      webappVersion: Config.version,
    };
    await fetch(`${Config.frontendUrl}/api/log`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch (err) {
    console.error("Error logging error to Slack:", err);
    return;
  }
};
