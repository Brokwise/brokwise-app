import { toast } from "sonner";
import { firebaseAuth } from "@/config/firebase";
import { clearSessionId } from "./session";

const SESSION_ERROR_CODES = new Set([
  "SESSION_ID_MISSING",
  "SESSION_NOT_ACTIVE",
  "SESSION_REPLACED",
]);

let isHandlingForcedLogout = false;

export const isSessionErrorCode = (code?: string | null) =>
  !!code && SESSION_ERROR_CODES.has(code);

const safeParseJson = (value?: string) => {
  if (!value) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const extractApiErrorCode = (error: unknown): string | undefined => {
  const unknownError = error as {
    message?: string;
    response?: { data?: { code?: string } };
    code?: string;
  };

  const axiosCode = unknownError?.response?.data?.code;
  if (typeof axiosCode === "string") return axiosCode;

  if (typeof unknownError?.code === "string" && isSessionErrorCode(unknownError.code)) {
    return unknownError.code;
  }

  const parsed = safeParseJson(unknownError?.message);
  const parsedCode = parsed?.code;
  if (typeof parsedCode === "string") return parsedCode;

  return undefined;
};

export const forceLogoutDueToSession = async (options?: {
  router?: { push: (href: string) => void };
  message?: string;
}) => {
  if (isHandlingForcedLogout) return;
  isHandlingForcedLogout = true;

  try {
    clearSessionId();
    try {
      await firebaseAuth.signOut();
    } catch {
      // Ignore sign out failures; redirect still clears access.
    }

    toast.error(
      options?.message ??
        "Logged out because your account was signed in on another device."
    );

    if (typeof window !== "undefined") {
      window.location.assign("/login");
      return;
    }
    options?.router?.push("/login");
  } finally {
    setTimeout(() => {
      isHandlingForcedLogout = false;
    }, 1500);
  }
};
