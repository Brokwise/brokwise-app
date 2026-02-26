import { sendGTMEvent } from "@next/third-parties/google";

import { Config } from "@/config";

// type TrackingEventName =
//   | "KYCCompleted"
//   | "PhoneSubmitted"
//   | "LocationSubmitted"
//   | "AddToCart"
//   | "InitiateCheckout"
//   | "Purchase"
//   | "CompleteRegistration"
//   | "OnboardingStepFailed";

export type TrackMetaEventParams =
  | { eventName: "KYCCompleted"; firstName?: string; lastName?: string; phoneNumber?: string; plan?: string }
  | { eventName: "PhoneSubmitted"; phoneNumber?: string }
  | { eventName: "LocationSubmitted"; city?: string }
  | { eventName: "AddToCart"; plan: string; firstName?: string; lastName?: string; phoneNumber?: string; city?: string }
  | { eventName: "InitiateCheckout"; plan: string; firstName?: string; lastName?: string; phoneNumber?: string; city?: string }
  | { eventName: "Purchase"; plan: string; firstName?: string; lastName?: string; phoneNumber?: string; email?: string }
  | { eventName: "CompleteRegistration"; plan: string; firstName?: string; lastName?: string; phoneNumber?: string; email?: string }
  | { eventName: "OnboardingStepFailed"; step: string; reason?: string };

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

const PAYMENT_TRACKED_KEY = "bw_payment_tracked";
const REGISTRATION_TRACKED_KEY = "bw_registration_tracked";

export function markPaymentTracked() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(PAYMENT_TRACKED_KEY, "1");
  }
}

export function isPaymentTracked(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(PAYMENT_TRACKED_KEY) === "1";
}

export function markRegistrationTracked() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(REGISTRATION_TRACKED_KEY, "1");
  }
}

export function isRegistrationTracked(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(REGISTRATION_TRACKED_KEY) === "1";
}

export async function trackMetaEvent(params: TrackMetaEventParams): Promise<void> {
  const eventId = crypto.randomUUID();
  const { eventName } = params;

  try {
    const gtmPayload: Record<string, string> = { eventId, ...params };

    switch (eventName) {
      case "InitiateCheckout":
        gtmPayload.event = "InitiateCheckout - Landing";
        break;
      case "Purchase":
        gtmPayload.event = "Purchase - Landing";
        break;
      case "AddToCart":
        gtmPayload.event = "AddToCart - Landing";
        break;
      case "KYCCompleted":
        gtmPayload.event = "KYCCompleted - Landing";
        break;
      case "CompleteRegistration":
        gtmPayload.event = "CompleteRegistration - Landing";
        break;
      default:
        gtmPayload.event = eventName;
        break;
    }

    sendGTMEvent(gtmPayload);
  } catch {
    // Never block UX — silently swallow tracking errors
  }

  // Fire server-side Conversions API
  try {
    const body: Record<string, string> = {
      ...params,
      eventId,
    };

    const fbp = getCookie("_fbp");
    const fbc = getCookie("_fbc");
    if (fbp) body.fbp = fbp;
    if (fbc) body.fbc = fbc;

    await fetch(`${Config.backendUrl}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // Never block UX — silently swallow tracking errors
  }
}
