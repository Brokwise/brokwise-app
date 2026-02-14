"use client";

import React from "react";
import Link from "next/link";
import { Crown, Zap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetCurrentSubscription, useGetRemainingQuota } from "@/hooks/useSubscription";
import { TIER } from "@/models/types/subscription";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const tierIcons: Record<TIER, React.ReactNode> = {
  BASIC: <Zap className="h-4 w-4" />,
  ESSENTIAL: <Rocket className="h-4 w-4" />,
  PRO: <Crown className="h-4 w-4" />,
};

const tierColors: Record<TIER, string> = {
  BASIC: "text-gray-500",
  ESSENTIAL: "text-blue-500",
  PRO: "text-amber-500",
};

const tierBgColors: Record<TIER, string> = {
  BASIC: "bg-gray-100",
  ESSENTIAL: "bg-blue-100",
  PRO: "bg-amber-100",
};

export const SubscriptionBadge = () => {
  const { subscription, isLoading: subscriptionLoading } = useGetCurrentSubscription();
  const { remaining, isLoading: quotaLoading } = useGetRemainingQuota();
  const { t } = useTranslation();

  const isLoading = subscriptionLoading || quotaLoading;
  const tier: TIER = subscription?.tier || "BASIC";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2 h-9 px-3", tierBgColors[tier])}
            asChild
          >
            <Link href="/subscription">
              <span className={cn(tierColors[tier])}>{tierIcons[tier]}</span>
              {isLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span className="font-semibold capitalize">
                  {t(`page_subscription_tier_${tier.toLowerCase()}_name`)}
                </span>
              )}
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          <div className="space-y-2">
            <p className="font-medium">
              {t(`page_subscription_tier_${tier.toLowerCase()}_name`)} {t("page_subscription_plan")}
              {subscription?.status === "active" && (
                <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                  {t("page_subscription_status_active")}
                </Badge>
              )}
            </p>
            {remaining && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{t("page_subscription_remaining_period")}</p>
                <ul className="list-disc list-inside">
                  <li>{remaining.property_listing} {t("page_subscription_feature_property_listing").toLowerCase()}</li>
                  <li>{remaining.enquiry_listing} {t("page_subscription_feature_enquiry_listing").toLowerCase()}</li>
                  <li>{remaining.submit_property_enquiry} {t("page_subscription_submissions").toLowerCase()}</li>
                </ul>
              </div>
            )}
            {tier !== "PRO" && (
              <p className="text-xs text-primary">{t("page_subscription_click_upgrade")}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Compact version for mobile or tight spaces
export const SubscriptionBadgeCompact = () => {
  const { subscription, isLoading } = useGetCurrentSubscription();
  const tier: TIER = subscription?.tier || "BASIC";

  return (
    <Link href="/subscription">
      <Badge
        className={cn(
          "gap-1 cursor-pointer hover:opacity-80 transition-opacity",
          tierBgColors[tier],
          tierColors[tier]
        )}
      >
        {isLoading ? (
          <Skeleton className="h-3 w-12" />
        ) : (
          <>
            {tierIcons[tier]}
            {/* Note: SubscriptionBadgeCompact might need its own t() call if it's a separate component instance, 
                assuming it can use the same hook call if refactored, but here I'll just add the hook to the component */}
            <CompactLabel tier={tier} />
          </>
        )}
      </Badge>
    </Link>
  );
};

const CompactLabel = ({ tier }: { tier: TIER }) => {
  const { t } = useTranslation();
  return <span className="capitalize">{t(`page_subscription_tier_${tier.toLowerCase()}_name`)}</span>;
};
