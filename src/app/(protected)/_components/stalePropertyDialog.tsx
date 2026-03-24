"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  useGetStaleProperties,
  useConfirmAvailability,
  useMarkUnavailable,
  StaleProperty,
} from "@/hooks/useStaleProperties";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const DISMISS_KEY = "bw_stale_dialog_dismissed";

export function StalePropertyDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyData } = useApp();
  const isBroker = !companyData;

  const { staleProperties, isLoading } = useGetStaleProperties({ enabled: isBroker });
  const { confirmAvailability, isPending: confirming } = useConfirmAvailability();
  const { markUnavailable, isPending: removing } = useMarkUnavailable();

  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const staleCheckId = searchParams.get("staleCheck");

  useEffect(() => {
    if (isLoading || staleProperties.length === 0) return;

    if (staleCheckId) {
      const idx = staleProperties.findIndex((p) => p._id === staleCheckId);
      if (idx >= 0) {
        setCurrentIndex(idx);
        setOpen(true);
        return;
      }
    }

    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    const today = new Date().toISOString().split("T")[0];
    if (dismissed === today) return;

    setCurrentIndex(0);
    setOpen(true);
  }, [isLoading, staleProperties, staleCheckId]);

  const currentProperty: StaleProperty | undefined = staleProperties[currentIndex];

  const handleConfirm = useCallback(async () => {
    if (!currentProperty) return;
    await confirmAvailability(currentProperty._id);

    if (staleProperties.length <= 1) {
      setOpen(false);
    } else if (currentIndex >= staleProperties.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  }, [currentProperty, confirmAvailability, staleProperties.length, currentIndex]);

  const handleRemove = useCallback(async () => {
    if (!currentProperty) return;
    await markUnavailable(currentProperty._id);

    if (staleProperties.length <= 1) {
      setOpen(false);
    } else if (currentIndex >= staleProperties.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  }, [currentProperty, markUnavailable, staleProperties.length, currentIndex]);

  const handleDismiss = () => {
    const today = new Date().toISOString().split("T")[0];
    sessionStorage.setItem(DISMISS_KEY, today);
    setOpen(false);

    if (staleCheckId) {
      router.replace("/my-listings");
    }
  };

  if (!isBroker || isLoading || staleProperties.length === 0 || !currentProperty) {
    return null;
  }

  const propLabel =
    currentProperty.propertyId ||
    `${currentProperty.propertyCategory} ${currentProperty.propertyType}`;
  const cityLabel = currentProperty.address?.city || "";
  const displayName = cityLabel ? `${propLabel} in ${cityLabel}` : propLabel;
  const thumbnail = currentProperty.featuredMedia || currentProperty.images?.[0];
  const isUrgent = currentProperty.daysUntilDeletion <= 2;
  const busy = confirming || removing;

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && handleDismiss()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${isUrgent
                ? "bg-destructive/10 text-destructive"
                : "bg-amber-500/10 text-amber-500"
                }`}
            >
              <AlertTriangle className="h-7 w-7" />
            </div>
            <AlertDialogTitle className="text-lg">
              Is this property still available?
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        <div className="space-y-3">
          {thumbnail && (
            <div className="overflow-hidden rounded-lg">
              <Image
                width={100}
                height={100}
                src={thumbnail as string}
                alt={displayName}
                className="h-32 w-full object-cover"
              />
            </div>
          )}

          <div className="text-center">
            <p className="font-semibold text-foreground">{displayName}</p>
            {currentProperty.totalPrice && (
              <p className="text-sm text-muted-foreground">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(currentProperty.totalPrice)}
              </p>
            )}
          </div>

          <AlertDialogDescription className="text-center text-sm text-muted-foreground">
            This property has had no activity recently. If not confirmed within{" "}
            <span className={`font-semibold ${isUrgent ? "text-destructive" : "text-amber-500"}`}>
              {currentProperty.daysUntilDeletion === 0
                ? "today"
                : currentProperty.daysUntilDeletion === 1
                  ? "1 day"
                  : `${currentProperty.daysUntilDeletion} days`}
            </span>
            , it will be automatically removed.
          </AlertDialogDescription>

          {staleProperties.length > 1 && (
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>
                {currentIndex + 1} of {staleProperties.length} properties
              </span>
              <button
                disabled={currentIndex >= staleProperties.length - 1}
                onClick={() => setCurrentIndex((i) => Math.min(staleProperties.length - 1, i + 1))}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <AlertDialogFooter className="">
          <Button
            variant="default"
            className="w-full gap-2"
            onClick={handleConfirm}
            disabled={busy}
          >
            <CheckCircle2 className="h-4 w-4" />
            {confirming ? "Confirming..." : "Yes, Still Available"}
          </Button>
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleRemove}
            disabled={busy}
          >
            <Trash2 className="h-4 w-4" />
            {removing ? "Removing..." : "No, Remove It"}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={handleDismiss}
            disabled={busy}
          >
            Decide Later
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
