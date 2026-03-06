import React from "react";
import { Check, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TIER } from "@/models/types/subscription";
import {
  ACTIVATION_PLANS,
  ACTIVATION_TIER_INFO,
  ACTIVATION_LIMITS,
} from "@/config/tier_limits";
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
}

export const Step4Plan: React.FC<Step4PlanProps> = ({ selectedTier, onSelect }) => {
  const { t } = useTranslation();
  const tiers: TIER[] = ["BASIC", "ESSENTIAL", "PRO"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {tiers.map((tier) => {
          const info = ACTIVATION_TIER_INFO[tier];
          const plan = ACTIVATION_PLANS[tier];
          const isSelected = selectedTier === tier;
          const limits = ACTIVATION_LIMITS[tier];

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
