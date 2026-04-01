import React from "react";
import { Check, CreditCard, Crown, Loader2, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TIER } from "@/models/types/subscription";
import { useTierConfig } from "@/hooks/useTierConfig";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { tierColors, tierIcons } from "./tierVisuals";

interface Step5WelcomeProps {
  selectedTier: TIER;
  loading: boolean;
  freeProSelected?: boolean;
}

export const Step5Welcome: React.FC<Step5WelcomeProps> = ({ selectedTier, loading, freeProSelected }) => {
  const { t } = useTranslation();
  const { activationPlans, activationTierInfo, regularLimits } = useTierConfig();

  if (freeProSelected) {
    const proLimits = regularLimits.PRO;
    return (
      <div className="space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
            <Crown className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {t("onboarding_welcome_title", "Welcome to Brokwise!")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              You&apos;re one of our first users! Tap below to activate your free Pro plan.
            </p>
          </div>
        </div>

        <Card className="text-left border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                  <Crown className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-amber-900 dark:text-amber-100">Pro Plan — 3 Months Free</CardTitle>
                  <CardDescription className="text-xs text-amber-700 dark:text-amber-300">Early adopter offer</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">₹0</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Separator className="mb-3 bg-amber-200 dark:bg-amber-800" />
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="bg-white/60 dark:bg-white/5 rounded-md p-2">
                <p className="text-sm font-bold">{proLimits?.PROPERTY_LISTING ?? "—"}</p>
                <p className="text-[10px] text-slate-500">Listings</p>
              </div>
              <div className="bg-white/60 dark:bg-white/5 rounded-md p-2">
                <p className="text-sm font-bold">{proLimits?.ENQUIRY_LISTING ?? "—"}</p>
                <p className="text-[10px] text-slate-500">Enquiries</p>
              </div>
              <div className="bg-white/60 dark:bg-white/5 rounded-md p-2">
                <p className="text-sm font-bold">{proLimits?.SUBMIT_PROPERTY_ENQUIRY ?? "—"}</p>
                <p className="text-[10px] text-slate-500">Submissions</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">Full Pro tier access for 3 months</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">No payment or activation required</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">Pro credits included</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Shield className="h-3.5 w-3.5" />
            <span>No payment required — completely free</span>
          </div>
          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Activating your Pro plan...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const plan = activationPlans[selectedTier];
  const info = activationTierInfo[selectedTier];

  return (
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-r text-white shadow-lg",
            tierColors[selectedTier]
          )}
        >
          {tierIcons[selectedTier]}
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {t("onboarding_welcome_title", "Welcome to Brokwise!")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t("onboarding_welcome_desc", "You are almost done. Complete your activation to start using the platform.")}
          </p>
        </div>
      </div>

      <Card className="text-left border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r text-white",
                  tierColors[selectedTier]
                )}
              >
                {React.cloneElement(tierIcons[selectedTier] as React.ReactElement, {
                  className: "h-4 w-4",
                })}
              </div>
              <div>
                <CardTitle className="text-base">{info.name} {t("onboarding_activation_pack", "Activation Pack")}</CardTitle>
                <CardDescription className="text-xs">{t("onboarding_1_month_access", "1 Month Access")}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">₹{plan.displayAmount}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Separator className="mb-3" />
          <ul className="space-y-1.5">
            {info.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <CreditCard className="h-3.5 w-3.5" />
          <span>{t("onboarding_secure_razorpay", "Secure payment via Razorpay")}</span>
        </div>
        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("onboarding_processing", "Processing...")}</span>
          </div>
        )}
      </div>
    </div>
  );
};
