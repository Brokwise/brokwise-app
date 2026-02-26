// import { sendGTMEvent } from "@next/third-parties/google";

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

// Extend Window interface to include fbq
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export async function trackMetaEvent(params: TrackMetaEventParams): Promise<void> {
  const eventId = crypto.randomUUID();
  const { eventName } = params;

  // Fire client-side pixel directly via fbq()
  try {
    if (typeof window !== "undefined" && window.fbq) {
      const commonData = {
        eventID: eventId,
      };

      switch (eventName) {
        case "InitiateCheckout":
        case "Purchase":
        case "AddToCart":
        case "CompleteRegistration": {
          // Standard Events
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const payload: any = {
            content_name: params.plan,
            currency: "INR",
          };

          if ("firstName" in params) payload.fn = params.firstName;
          if ("lastName" in params) payload.ln = params.lastName;
          if ("phoneNumber" in params) payload.ph = params.phoneNumber;
          if ("email" in params) payload.em = params.email;
          if ("city" in params) payload.ct = params.city;

          window.fbq("track", eventName, payload, commonData);
          break;
        }
        case "KYCCompleted": {
          // Custom Event
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const payload: any = {
            content_name: params.plan,
          };
          if (params.firstName) payload.fn = params.firstName;
          if (params.lastName) payload.ln = params.lastName;
          if (params.phoneNumber) payload.ph = params.phoneNumber;

          window.fbq("trackCustom", "KYCCompleted", payload, commonData);
          break;
        }
        case "PhoneSubmitted": {
          // Custom Event
          window.fbq("trackCustom", "PhoneSubmitted", {
            ph: params.phoneNumber
          }, commonData);
          break;
        }
        case "LocationSubmitted": {
          // Custom Event
          window.fbq("trackCustom", "LocationSubmitted", {
            ct: params.city
          }, commonData);
          break;
        }
        case "OnboardingStepFailed": {
          // Custom Event
          window.fbq("trackCustom", "OnboardingStepFailed", {
            step_failed: params.step,
            error_reason: params.reason
          }, commonData);
          break;
        }
      }
    }
  } catch (err) {
    console.error("Meta Pixel Error:", err);
    // Never block UX — silently swallow tracking errors
  }

  /*
  // Fire client-side pixel via GTM dataLayer (same eventId for deduplication)
  try {
    const gtmPayload: Record<string, string> = { eventId, ...params };

    switch (eventName) {
      case "InitiateCheckout":
        gtmPayload.event = "InitiateCheckout";
        break;
      case "Purchase":
        gtmPayload.event = "Purchase";
        break;
      case "AddToCart":
        gtmPayload.event = "AddToCart";
        break;
      case "KYCCompleted":
        gtmPayload.event = "KYCCompleted";
        break;
      case "CompleteRegistration":
        gtmPayload.event = "CompleteRegistration";
        break;
      default:
        gtmPayload.event = eventName;
        break;
    }

    sendGTMEvent(gtmPayload);
  } catch {
    // Never block UX — silently swallow tracking errors
  }
  */

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
