"use client";

import React from "react";
import Script from "next/script";
import { useGetCurrentSubscription, usePurchaseActivation, useLinkRazorpaySubscription } from "@/hooks/useSubscription";
import { useApp } from "@/context/AppContext";
import { Loader } from "@/components/ui/loader";
import Image from "next/image";
import { toast } from "sonner";
import {
  Crown,
  Zap,
  Rocket,
  Check,
  CreditCard,
  Loader2,
} from "lucide-react";
import { TIER } from "@/models/types/subscription";
import { ACTIVATION_PLANS, ACTIVATION_TIER_INFO, getActivationPlan } from "@/config/tier_limits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const tierIcons: Record<TIER, React.ReactNode> = {
  BASIC: <Zap className="h-6 w-6" />,
  ESSENTIAL: <Rocket className="h-6 w-6" />,
  PRO: <Crown className="h-6 w-6" />,
};

const tierColors: Record<TIER, string> = {
  BASIC: "from-gray-500 to-gray-600",
  ESSENTIAL: "from-blue-500 to-blue-600",
  PRO: "from-amber-500 to-amber-600",
};

/**
 * Gate that catches approved brokers whose activation payment is still
 * pending. Shows a full-screen payment card instead of the main app.
 *
 * This handles the "refresh" scenario: the profile was submitted (backend
 * returns "approved") but Razorpay was dismissed, so the subscription
 * exists with a non-active status in activation phase.
 */
export const ActivationPendingGate = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { brokerData } = useApp();
  const { subscription, isLoading } = useGetCurrentSubscription();
  const { purchaseActivation, isPending: purchasePending } = usePurchaseActivation();
  const { linkRazorpaySubscription, isPending: verifyPending } = useLinkRazorpaySubscription();
  const { setBrokerData } = useApp();

  // Still loading subscription data — show spinner
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center gap-4">
        <div className="relative flex items-center justify-center">
          <Loader size="5rem" className="absolute" />
          <Image
            src="/logo.webp"
            height={52}
            width={52}
            alt="Brokwise"
            className="rounded-full z-10"
          />
        </div>
      </div>
    );
  }

  // Determine if activation payment is pending
  const isPendingActivation =
    !!subscription &&
    subscription.phase === "activation" &&
    subscription.status !== "active";

  // If activation is not pending, render the app normally
  if (!isPendingActivation) {
    return <>{children}</>;
  }

  // ── Activation payment is pending — show payment screen ────────────────────
  const tier = subscription.tier;
  const plan = ACTIVATION_PLANS[tier];
  const info = ACTIVATION_TIER_INFO[tier];
  const isProcessing = purchasePending || verifyPending;

  const handleRetryPayment = async () => {
    if (!brokerData) return;

    try {
      const activationPlan = getActivationPlan(tier);
      const result = await purchaseActivation({ tier, razorpayPlanId: activationPlan.planId });
      const { subscriptionId, keyId } = result.razorpay;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: "Brokwise",
        description: `${tier} Activation Pack`,
        prefill: {
          name: `${brokerData.firstName} ${brokerData.lastName}`,
          email: brokerData.email,
          contact: brokerData.mobile,
        },
        theme: { color: "#3399cc" },
        handler: async function (response: {
          razorpay_subscription_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            await linkRazorpaySubscription({
              razorpaySubscriptionId: response.razorpay_subscription_id,
            });
            toast.success("Activation successful! Welcome to Brokwise.");
            // Force a full page reload to refresh all state
            window.location.reload();
          } catch {
            // Webhook will handle it
            setBrokerData({ ...brokerData });
            toast.info("Payment received. Verification in progress.");
            window.location.reload();
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Please complete the payment to start using the app.");
          },
        },
      });

      rzp.on("payment.failed", function (response: { error: { description: string } }) {
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch {
      // Error handled by the hook
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="h-screen w-full overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-lg space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div
                className={cn(
                  "w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-gradient-to-r text-white shadow-lg",
                  tierColors[tier]
                )}
              >
                {tierIcons[tier]}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Complete Your Activation
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Your profile is set up. Complete the activation payment to
                  start using Brokwise.
                </p>
              </div>
            </div>

            {/* Plan Summary Card */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r text-white",
                        tierColors[tier]
                      )}
                    >
                      {React.cloneElement(tierIcons[tier] as React.ReactElement, {
                        className: "h-4 w-4",
                      })}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {info.name} Activation Pack
                      </CardTitle>
                      <CardDescription className="text-xs">
                        1 Month Access
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">₹{plan.displayAmount}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Separator className="mb-3" />
                <ul className="space-y-1.5">
                  {info.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Payment status */}
            <div className="space-y-3">
              <Badge
                variant="secondary"
                className="w-full justify-center py-1.5 text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/30"
              >
                Payment Pending
              </Badge>

              <Button
                size="lg"
                className="w-full h-14 text-base bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white"
                onClick={handleRetryPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay ₹{plan.displayAmount} to Activate
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-slate-400">
                <CreditCard className="h-3 w-3 inline mr-1" />
                Secure payment via Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
