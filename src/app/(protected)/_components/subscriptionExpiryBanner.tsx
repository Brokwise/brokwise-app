"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetExpiryStatus } from "@/hooks/useSubscription";
import { useApp } from "@/context/AppContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Clock, Crown } from "lucide-react";

const DISMISS_KEY = "bw_expiry_banner_dismissed";

function getDismissKey(daysLeft: number): string {
  const today = new Date().toISOString().split("T")[0];
  return `${DISMISS_KEY}_${today}_${daysLeft <= 1 ? "urgent" : "normal"}`;
}

export function SubscriptionExpiryBanner() {
  const router = useRouter();
  const { companyData } = useApp();
  const isBroker = !companyData;

  const { expiryStatus, isLoading } = useGetExpiryStatus({
    enabled: isBroker,
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoading || !expiryStatus?.expiringSoon || !expiryStatus.daysLeft) return;

    const key = getDismissKey(expiryStatus.daysLeft);
    const dismissed = sessionStorage.getItem(key);
    if (!dismissed) {
      setOpen(true);
    }
  }, [isLoading, expiryStatus]);

  if (!isBroker || isLoading || !expiryStatus?.expiringSoon || !expiryStatus.daysLeft) {
    return null;
  }

  const { daysLeft, tier } = expiryStatus;
  const isUrgent = daysLeft <= 1;
  const isWarning = daysLeft <= 3;

  const handleDismiss = () => {
    const key = getDismissKey(daysLeft);
    sessionStorage.setItem(key, "true");
    setOpen(false);
  };

  const handleUpgrade = () => {
    setOpen(false);
    router.push("/subscription");
  };

  const expiryLabel =
    daysLeft === 0
      ? "today"
      : daysLeft === 1
        ? "tomorrow"
        : `in ${daysLeft} days`;

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && handleDismiss()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${isUrgent
                ? "bg-destructive/10 text-destructive"
                : isWarning
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-blue-500/10 text-blue-500"
                }`}
            >
              {isUrgent ? (
                <AlertTriangle className="h-7 w-7" />
              ) : (
                <Clock className="h-7 w-7" />
              )}
            </div>
            <AlertDialogTitle className="text-lg">
              {isUrgent
                ? "Subscription Expiring!"
                : "Subscription Expiring Soon"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Your{" "}
              <span className="font-semibold text-foreground">{tier}</span> plan
              expires{" "}
              <span
                className={`font-semibold ${isUrgent
                  ? "text-destructive"
                  : isWarning
                    ? "text-amber-500"
                    : "text-blue-500"
                  }`}
              >
                {expiryLabel}
              </span>
              . After expiry, you will lose access to premium features including
              property listings, enquiry management, and contact requests.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <div
          className={`mx-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${isUrgent
            ? "bg-destructive/10 text-destructive"
            : isWarning
              ? "bg-amber-500/10 text-amber-500"
              : "bg-blue-500/10 text-blue-500"
            }`}
        >

          {daysLeft === 0
            ? "Expires today"
            : daysLeft === 1
              ? "1 day remaining"
              : `${daysLeft} days remaining`}
        </div>

        <AlertDialogFooter className="">
          <AlertDialogAction
            onClick={handleUpgrade}
            className="w-full"
          >
            Renew / Upgrade Now
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={handleDismiss}
            className="w-full"
          >
            Remind Me Later
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
