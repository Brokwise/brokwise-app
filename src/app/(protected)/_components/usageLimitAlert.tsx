"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Rocket, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetRemainingQuota, useGetCurrentSubscription } from "@/hooks/useSubscription";
import { UsageType } from "@/models/types/subscription";

interface UsageLimitAlertProps {
  usageType: UsageType;
  showUpgradePrompt?: boolean;
}

const usageTypeLabels: Record<UsageType, string> = {
  property_listing: "property listings",
  enquiry_listing: "enquiry listings",
  submit_property_enquiry: "property submissions",
};

/**
 * Inline alert component to show usage limit warnings
 */
export const UsageLimitAlert: React.FC<UsageLimitAlertProps> = ({
  usageType,
  showUpgradePrompt = true,
}) => {
  const { remaining, tier, isLoading } = useGetRemainingQuota();

  if (isLoading || !remaining) return null;

  const remainingCount = remaining[usageType];
  const isAtLimit = remainingCount <= 0;
  const isNearLimit = remainingCount <= 2 && remainingCount > 0;

  if (!isAtLimit && !isNearLimit) return null;

  return (
    <Alert variant={isAtLimit ? "destructive" : "default"} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {isAtLimit ? "Limit Reached" : "Approaching Limit"}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {isAtLimit
            ? `You've reached your ${tier} plan limit for ${usageTypeLabels[usageType]}.`
            : `You have ${remainingCount} ${usageTypeLabels[usageType]} remaining.`}
        </span>
        {showUpgradePrompt && tier !== "PRO" && (
          <Button size="sm" variant={isAtLimit ? "default" : "outline"} asChild>
            <Link href="/subscription">
              <Rocket className="mr-2 h-4 w-4" />
              Upgrade
            </Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

interface UsageLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usageType: UsageType;
}

/**
 * Dialog component to show when user tries to perform action at limit
 */
export const UsageLimitDialog: React.FC<UsageLimitDialogProps> = ({
  open,
  onOpenChange,
  usageType,
}) => {
  const { tier } = useGetRemainingQuota();
  const { subscription } = useGetCurrentSubscription();

  const currentTier = subscription?.tier || tier || "BASIC";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            Usage Limit Reached
          </DialogTitle>
          <DialogDescription className="pt-2">
            You&apos;ve reached your <strong>{currentTier}</strong> plan limit for{" "}
            <strong>{usageTypeLabels[usageType]}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            {currentTier === "PRO"
              ? "You're on the highest plan. Your limits will reset at the start of your next billing period."
              : "Upgrade your subscription to get more capacity and continue using this feature."}
          </p>

          {currentTier !== "PRO" && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">
                Upgrade benefits include:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• More property listings</li>
                <li>• More enquiry listings</li>
                <li>• More property submissions</li>
                <li>• Priority support</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
          {currentTier !== "PRO" && (
            <Button asChild>
              <Link href="/subscription">
                <Rocket className="mr-2 h-4 w-4" />
                View Plans
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Hook to check if user can perform an action and show dialog if not
 */
export const useUsageLimitCheck = () => {
  const { remaining, isLoading } = useGetRemainingQuota();
  const [showDialog, setShowDialog] = React.useState(false);
  const [limitType, setLimitType] = React.useState<UsageType>("property_listing");

  const checkLimit = (usageType: UsageType): boolean => {
    if (isLoading || !remaining) return true; // Allow if loading

    const canProceed = remaining[usageType] > 0;

    if (!canProceed) {
      setLimitType(usageType);
      setShowDialog(true);
    }

    return canProceed;
  };

  const LimitDialog = () => (
    <UsageLimitDialog
      open={showDialog}
      onOpenChange={setShowDialog}
      usageType={limitType}
    />
  );

  return {
    checkLimit,
    showDialog,
    setShowDialog,
    LimitDialog,
    isLoading,
    remaining,
  };
};
