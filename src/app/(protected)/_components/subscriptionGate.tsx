"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetCurrentSubscription } from "@/hooks/useSubscription";
import { useApp } from "@/context/AppContext";
import { Loader } from "@/components/ui/loader";
import Image from "next/image";

/**
 * Paths that are accessible without an active subscription.
 * The subscription page itself must always be reachable so the
 * broker can purchase a plan.  Profile is kept open so they can
 * view / edit their details.
 */
const ALLOWED_WITHOUT_SUBSCRIPTION = ["/subscription", "/profile"];

/**
 * Gate that blocks access to the platform when the broker does
 * not have an active subscription (activation or regular).
 *
 * - While loading → spinner
 * - No subscription / expired / cancelled → redirect to /subscription
 * - Active subscription → render children
 *
 * Company users are not gated (they have their own flow).
 */
export const SubscriptionGate = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { brokerData, companyData } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  // Only fetch subscription for broker users
  const isBroker = !!brokerData && !companyData;
  const { subscription, isLoading } = useGetCurrentSubscription({
    enabled: isBroker,
  });

  // Check if the current path is allowed without a subscription
  const isAllowedPath = ALLOWED_WITHOUT_SUBSCRIPTION.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // Determine if the subscription is usable
  const hasActiveSubscription =
    !!subscription &&
    (subscription.status === "active" ||
      subscription.status === "authenticated" ||
      subscription.status === "created");

  // Redirect when needed
  useEffect(() => {
    if (!isBroker) return; // not a broker → skip
    if (isLoading) return; // still loading → wait
    if (isAllowedPath) return; // already on an allowed page
    if (hasActiveSubscription) return; // has a valid sub

    router.replace("/subscription");
  }, [isBroker, isLoading, isAllowedPath, hasActiveSubscription, router]);

  // ── Non-broker users pass through ──────────────────────────────────────────
  if (!isBroker) return <>{children}</>;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <div className="relative flex items-center justify-center">
          <Loader size="4rem" className="absolute" />
          <Image
            src="/logo.webp"
            height={40}
            width={40}
            alt="Brokwise"
            className="rounded-full z-10"
          />
        </div>
      </div>
    );
  }

  // ── Allowed path (subscription / profile) always renders ───────────────────
  if (isAllowedPath) return <>{children}</>;

  // ── No active subscription → redirect is happening, render nothing ─────────
  if (!hasActiveSubscription) return null;

  // ── Active subscription → render the app ──────────────────────────────────
  return <>{children}</>;
};
