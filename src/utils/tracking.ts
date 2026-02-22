import { Config } from "@/config";

type TrackingEventName =
  | "KYCCompleted"
  | "PhoneSubmitted"
  | "LocationSubmitted"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "CompleteRegistration"
  | "OnboardingStepFailed";

interface TrackMetaEventParams {
  eventName: TrackingEventName;
  plan: string;
}

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

export async function trackMetaEvent({ eventName, plan }: TrackMetaEventParams): Promise<void> {
  try {
    const body: Record<string, string> = {
      eventName,
      eventId: crypto.randomUUID(),
      plan,
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
