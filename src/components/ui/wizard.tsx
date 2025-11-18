"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onSubmit: () => void;
  isSubmitting?: boolean;
  canProceed?: boolean;
  isLoading?: boolean;
}

export const Wizard: React.FC<WizardProps> = ({
  steps,
  currentStep,
  onNext,
  onPrevious,
  onStepClick,
  onCancel,
  onSubmit,
  isSubmitting = false,
  canProceed = true,
  isLoading = false,
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
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

      {/* Current Step Content */}
      <Card>
        <CardHeader>
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
        <CardContent>{steps[currentStep]?.component}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {!isFirstStep && (
            <Button type="button" variant="outline" onClick={onPrevious}>
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {!isLastStep ? (
            <Button type="button" onClick={onNext} disabled={!canProceed}>
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || !canProceed || isLoading}
            >
              {isSubmitting || isLoading
                ? "Creating Property..."
                : "Create Property"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
