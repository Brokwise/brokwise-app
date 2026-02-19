const SESSION_STORAGE_KEY = "brokwise_active_session_id";

export type DevicePlatform = "web" | "ios" | "android" | "unknown";

const getWindowObject = () =>
  typeof window !== "undefined" ? window : undefined;

const generateSessionId = () => {
  const win = getWindowObject();
  if (!win) return null;

  if (typeof win.crypto?.randomUUID === "function") {
    return win.crypto.randomUUID();
  }

  const random = Math.random().toString(36).slice(2);
  return `sid_${Date.now()}_${random}`;
};

export const getSessionId = () => {
  const win = getWindowObject();
  if (!win) return null;
  return win.localStorage.getItem(SESSION_STORAGE_KEY);
};

export const rotateSessionId = () => {
  const win = getWindowObject();
  if (!win) return null;

  const nextSessionId = generateSessionId();
  if (!nextSessionId) return null;

  win.localStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);
  return nextSessionId;
};

export const clearSessionId = () => {
  const win = getWindowObject();
  if (!win) return;
  win.localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const detectDevicePlatform = (): DevicePlatform => {
  const win = getWindowObject();
  if (!win) return "unknown";

  const ua = win.navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return "ios";
  }
  if (ua.length > 0) return "web";
  return "unknown";
};

export const getDeviceName = () => {
  const win = getWindowObject();
  if (!win) return undefined;

  const platform = win.navigator.platform?.trim();
  const userAgent = win.navigator.userAgent?.trim();

  if (platform) return platform.slice(0, 120);
  if (userAgent) return userAgent.slice(0, 120);
  return undefined;
};
