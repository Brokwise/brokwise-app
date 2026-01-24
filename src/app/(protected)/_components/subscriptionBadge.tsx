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

const tierIcons: Record<TIER, React.ReactNode> = {
  STARTER: <Zap className="h-4 w-4" />,
  ESSENTIAL: <Rocket className="h-4 w-4" />,
  ELITE: <Crown className="h-4 w-4" />,
};

const tierColors: Record<TIER, string> = {
  STARTER: "text-gray-500",
  ESSENTIAL: "text-blue-500",
  ELITE: "text-amber-500",
};

const tierBgColors: Record<TIER, string> = {
  STARTER: "bg-gray-100",
  ESSENTIAL: "bg-blue-100",
  ELITE: "bg-amber-100",
};

export const SubscriptionBadge = () => {
  const { subscription, isLoading: subscriptionLoading } = useGetCurrentSubscription();
  const { remaining, isLoading: quotaLoading } = useGetRemainingQuota();

  const isLoading = subscriptionLoading || quotaLoading;
  const tier: TIER = subscription?.tier || "STARTER";

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
                  {tier.toLowerCase()}
                </span>
              )}
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          <div className="space-y-2">
            <p className="font-medium">
              {tier} Plan
              {subscription?.status === "active" && (
                <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                  Active
                </Badge>
              )}
            </p>
            {remaining && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Remaining this period:</p>
                <ul className="list-disc list-inside">
                  <li>{remaining.property_listing} property listings</li>
                  <li>{remaining.enquiry_listing} enquiry listings</li>
                  <li>{remaining.submit_property_enquiry} submissions</li>
                </ul>
              </div>
            )}
            {tier !== "ELITE" && (
              <p className="text-xs text-primary">Click to upgrade</p>
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
  const tier: TIER = subscription?.tier || "STARTER";

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
            <span className="capitalize">{tier.toLowerCase()}</span>
          </>
        )}
      </Badge>
    </Link>
  );
};
