import React from "react";
import { Check, Sparkles, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TIER } from "@/models/types/subscription";
import { useTierConfig } from "@/hooks/useTierConfig";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { tierColors, tierIcons } from "./tierVisuals";

interface Step4PlanProps {
  selectedTier: TIER | null;
  onSelect: (tier: TIER) => void;
  freeProEligible?: boolean;
  freeProSpotsRemaining?: number;
  freeProSelected?: boolean;
  onSelectFreePro?: () => void;
}

export const Step4Plan: React.FC<Step4PlanProps> = ({
  selectedTier,
  onSelect,
  freeProEligible,
  freeProSpotsRemaining,
  freeProSelected,
  onSelectFreePro,
}) => {
  const { t } = useTranslation();
  const { activationTierInfo, activationPlans, activationLimits, regularLimits } = useTierConfig();
  const tiers: TIER[] = ["BASIC", "ESSENTIAL", "PRO"];

  return (
    <div className="space-y-6">
      {/* Free Pro Offer */}
      {freeProEligible && onSelectFreePro && (
        <>
          <Card
            className={cn(
              "relative cursor-pointer transition-all duration-200 hover:shadow-md border-2",
              freeProSelected
                ? "ring-2 ring-amber-500 shadow-lg border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/20"
                : "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10"
            )}
            onClick={onSelectFreePro}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-amber-500 text-white flex items-center gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                Free for Early Adopters
              </Badge>
            </div>

            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 text-white shrink-0">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base text-amber-900 dark:text-amber-100">Pro Plan — 3 Months Free</CardTitle>
                  <CardDescription className="text-xs text-amber-700 dark:text-amber-300">
                    {freeProSpotsRemaining} spot{freeProSpotsRemaining === 1 ? "" : "s"} remaining — no payment needed
                  </CardDescription>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-300">₹0</div>
                  <div className="text-xs text-amber-600/70">for 3 months</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 pb-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/60 dark:bg-white/5 rounded-md p-2">
                  <p className="text-sm font-bold">{regularLimits.PRO?.PROPERTY_LISTING ?? "—"}</p>
                  <p className="text-[10px] text-slate-500">{t("onboarding_listings") || "Listings"}</p>
                </div>
                <div className="bg-white/60 dark:bg-white/5 rounded-md p-2">
                  <p className="text-sm font-bold">{regularLimits.PRO?.ENQUIRY_LISTING ?? "—"}</p>
                  <p className="text-[10px] text-slate-500">{t("onboarding_enquiries") || "Enquiries"}</p>
                </div>
                <div className="bg-white/60 dark:bg-white/5 rounded-md p-2">
                  <p className="text-sm font-bold">PRO</p>
                  <p className="text-[10px] text-slate-500">Full access</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0 pb-4">
              <div className="w-full flex items-center justify-center">
                {freeProSelected ? (
                  <Badge className="bg-amber-500 text-white">
                    <Check className="h-3 w-3 mr-1" /> {t("onboarding_selected") || "Selected"}
                  </Badge>
                ) : (
                  <span className="text-xs text-amber-600/70">Tap to select</span>
                )}
              </div>
            </CardFooter>
          </Card>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span>or choose a paid activation pack</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-4">
        {tiers.map((tier) => {
          const info = activationTierInfo[tier];
          const plan = activationPlans[tier];
          const isSelected = selectedTier === tier;
          const limits = activationLimits[tier];

          return (
            <Card
              key={tier}
              className={cn(
                "relative cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-primary shadow-lg border-primary",
                info.recommended && !isSelected && "border-blue-200 dark:border-blue-800"
              )}
              onClick={() => onSelect(tier)}
            >
              {info.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground flex items-center gap-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    {t("onboarding_recommended") || "Popular"}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r text-white shrink-0",
                      tierColors[tier]
                    )}
                  >
                    {tierIcons[tier]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{info.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {info.description}
                    </CardDescription>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-50">
                      ₹{plan.displayAmount}
                    </div>
                    <div className="text-xs text-slate-500">{t("onboarding_per_month") || "for 1 month"}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-2">
                    <p className="text-sm font-bold">{limits.PROPERTY_LISTING}</p>
                    <p className="text-[10px] text-slate-500">{t("onboarding_listings") || "Listings"}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-2">
                    <p className="text-sm font-bold">{limits.ENQUIRY_LISTING}</p>
                    <p className="text-[10px] text-slate-500">{t("onboarding_enquiries") || "Enquiries"}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-2">
                    <p className="text-sm font-bold">{plan.credits}</p>
                    <p className="text-[10px] text-slate-500">{t("onboarding_credits") || "Credits"}</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 pb-4">
                <div className="w-full flex items-center justify-center">
                  {isSelected ? (
                    <Badge className="bg-primary text-primary-foreground">
                      <Check className="h-3 w-3 mr-1" /> {t("onboarding_selected") || "Selected"}
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-400">{t("onboarding_tap_to_select") || "Tap to select"}</span>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
