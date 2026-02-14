export type NotificationRelatedTo =
  | "PROPERTY"
  | "BROKER"
  | "ADMIN"
  | "FORM"
  | "ENQUIRY"
  | "COMPANY"
  | "CONTACT_REQUEST"
  | "MESSAGING";

export interface NotificationNavigationInput {
  route?: string | null;
  relatedTo?: NotificationRelatedTo;
}

const FALLBACK_BY_RELATED_TO: Record<NotificationRelatedTo, string> = {
  PROPERTY: "/my-listings",
  BROKER: "/profile",
  ADMIN: "/enquiries",
  FORM: "/resources/jda-forms",
  ENQUIRY: "/enquiries",
  COMPANY: "/",
  CONTACT_REQUEST: "/contacts",
  MESSAGING: "/message",
};

const LEGACY_ROUTE_MAP: Record<string, string> = {
  "/dashboard": "/",
  "/contact-requests": "/contacts",
  "/invitations": "/",
  "/properties": "/my-listings",
};

export const isSafeInternalRoute = (route: string): boolean => {
  const trimmed = route.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return false;
  if (trimmed.includes("://")) return false;
  return true;
};

export const normalizeNotificationRoute = (
  route?: string | null
): string | null => {
  if (!route || typeof route !== "string") return null;

  const trimmed = route.trim();
  if (!isSafeInternalRoute(trimmed)) return null;

  const mapped = LEGACY_ROUTE_MAP[trimmed];
  if (mapped) return mapped;

  const propertyMatch = trimmed.match(/^\/property\/([^/?#]+)$/);
  if (propertyMatch?.[1]) {
    return `/property/detail?id=${encodeURIComponent(propertyMatch[1])}`;
  }

  const enquiryMatch = trimmed.match(/^\/enquiry\/([^/?#]+)$/);
  if (enquiryMatch?.[1]) {
    return `/enquiries/detail?id=${encodeURIComponent(enquiryMatch[1])}`;
  }

  return trimmed;
};

export const resolveNotificationRoute = (
  input: NotificationNavigationInput
): string => {
  const directRoute = normalizeNotificationRoute(input.route);
  if (directRoute) return directRoute;

  if (input.relatedTo) {
    return FALLBACK_BY_RELATED_TO[input.relatedTo];
  }

  return "/";
};
