import { Config } from "@/config";
import { customFetch } from "@/models/api";
import { detectDevicePlatform, getDeviceName } from "@/lib/session";

interface SessionEnvelope<T> {
  success: boolean;
  status: number;
  data: T;
}

interface SessionData {
  uid: string;
  sessionId: string;
  userType: "broker" | "company" | "unknown";
  lastSeenAt?: string;
  lastActivatedAt?: string;
}

export const activateSession = async (sessionId: string) =>
  {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      return await customFetch<SessionEnvelope<SessionData>, Record<string, unknown>>({
        method: "POST",
        path: "/session/activate",
        isProtected: true,
        includeSessionHeader: false,
        signal: controller.signal,
        body: {
          sessionId,
          devicePlatform: detectDevicePlatform(),
          deviceName: getDeviceName(),
          appVersion: Config.version,
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

export const getCurrentSession = async () =>
  customFetch<SessionEnvelope<SessionData>, Record<string, never>>({
    method: "GET",
    path: "/session/current",
    isProtected: true,
  });
