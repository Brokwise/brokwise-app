"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyCreateUseCredits } from "./property-create-use-credits";
import { useGetRemainingQuota } from "@/hooks/useSubscription";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ReactNode;
  isValid?: boolean;
  isCompleted?: boolean;
}

interface WizardProps {
  steps: WizardStep[];
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onStepClick: (stepIndex: number) => void;
  onCancel: () => void;
  onSubmit: (shouldUseCredits: boolean) => void;
  onSaveDraft?: () => void;
  submitLabel?: string;
  isSavingDraft?: boolean;
  isSubmitting?: boolean;
  canProceed?: boolean;
  isLoading?: boolean;
  draftCount?: number;
  maxDrafts?: number;
  isEditingDraft?: boolean;
}

export const Wizard: React.FC<WizardProps> = ({
  steps,
  currentStep,
  onNext,
  onPrevious,
  onStepClick,
  onCancel,
  onSubmit,
  onSaveDraft,
  submitLabel,
  isSavingDraft = false,
  isSubmitting = false,
  canProceed = true,
  isLoading = false,
  draftCount = 0,
  maxDrafts = 5,
  isEditingDraft = false,
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const isDraftLimitReached = !isEditingDraft && draftCount >= maxDrafts;
  const canSaveDraft = !isDraftLimitReached;
  const [shouldUseCredits, setShouldUseCredits] = useState(false)
  const { remaining, isLoading: isQuotaLoading } = useGetRemainingQuota()

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onStepClick(index)}
            disabled={index > currentStep && !step.isCompleted}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              index === currentStep
                ? "bg-primary text-primary-foreground"
                : step.isCompleted
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : index < currentStep
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {step.isCompleted ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{step.title}</span>
            <span className="sm:hidden">{index + 1}</span>
          </button>
        ))}
      </div>

      <Card className="relative overflow-hidden">
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {currentStep + 1}
            </span>
            {steps[currentStep]?.title}
          </CardTitle>
          {steps[currentStep]?.description && (
            <p className="text-muted-foreground">
              {steps[currentStep].description}
            </p>
          )}
        </CardHeader>
        <CardContent className="relative">
          {steps[currentStep]?.component}
        </CardContent>
      </Card>

      <div className="relative flex flex-col items-center pt-2 pb-8 md:pb-2 md:pt-4 space-y-4">
        <PropertyCreateUseCredits shouldUseCredits={shouldUseCredits} setShouldUseCredits={setShouldUseCredits} />

        <div className="flex items-center justify-center w-full relative">
          {/* Left Side - Save Draft */}
          {onSaveDraft && (
            <div className="absolute left-0 hidden md:flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onSaveDraft}
                disabled={
                  isSavingDraft || isLoading || isSubmitting || !canSaveDraft
                }
                title={
                  !canSaveDraft
                    ? `Draft limit reached (${maxDrafts}/${maxDrafts})`
                    : undefined
                }
              >
                {isSavingDraft ? "Saving Draft..." : "Save as Draft"}
              </Button>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-md",
                  isDraftLimitReached
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {draftCount}/{maxDrafts}
              </span>
            </div>
          )}

          {/* Center - Action Buttons Pill */}
          <div className="inline-flex items-center bg-background/95 backdrop-blur-xl backdrop-saturate-150 border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full p-1.5 gap-2 ring-1 ring-black/5 dark:ring-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-muted-foreground hover:bg-muted/50 rounded-full px-4 h-9 text-sm font-medium"
            >
              Cancel
            </Button>

            {!isFirstStep && (
              <Button
                type="button"
                variant="ghost"
                onClick={onPrevious}
                className="text-muted-foreground hover:bg-muted/50 rounded-full px-4 h-9 text-sm font-medium"
              >
                Previous
              </Button>
            )}

            {!isLastStep ? (
              <Button
                type="button"
                onClick={onNext}
                disabled={!canProceed || isQuotaLoading || (remaining?.property_listing === 0 && !shouldUseCredits)}
                className="rounded-full px-6 h-9 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 bg-primary"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => { onSubmit(shouldUseCredits) }}
                disabled={isSubmitting || isLoading || isQuotaLoading || !canProceed || (remaining?.property_listing === 0 && !shouldUseCredits)}
                className="rounded-full px-6 h-9 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 bg-primary"
              >
                {isSubmitting || isLoading
                  ? "Processing..."
                  : submitLabel || "Create Property"}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Save Draft fallback */}
        {onSaveDraft && (
          <div className="md:hidden flex items-center gap-2 justify-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onSaveDraft}
              disabled={
                isSavingDraft || isLoading || isSubmitting || !canSaveDraft
              }
            >
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {draftCount}/{maxDrafts}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
