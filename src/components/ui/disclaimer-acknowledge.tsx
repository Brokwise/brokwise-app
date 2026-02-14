"use client";

import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DisclaimerNotice } from "@/components/ui/disclaimer-notice";
import { cn } from "@/lib/utils";

interface DisclaimerAcknowledgeProps {
  text: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  checkboxLabel?: string;
  requiredMessage?: string;
  showRequiredMessage?: boolean;
  className?: string;
}

export const DisclaimerAcknowledge = ({
  text,
  checked,
  onCheckedChange,
  checkboxLabel = "I understand and agree to this disclaimer.",
  requiredMessage = "Disclaimer acknowledgment is required to continue.",
  showRequiredMessage = false,
  className,
}: DisclaimerAcknowledgeProps) => {
  const checkboxId = useId();

  return (
    <div className={cn("space-y-3", className)}>
      <DisclaimerNotice text={text} />
      <div className="flex items-start gap-2">
        <Checkbox
          id={checkboxId}
          checked={checked}
          onCheckedChange={(nextValue) => onCheckedChange(nextValue === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor={checkboxId}
          className="cursor-pointer text-sm leading-relaxed text-foreground"
        >
          {checkboxLabel}
        </Label>
      </div>
      {showRequiredMessage && !checked && (
        <p className="text-xs font-medium text-destructive">{requiredMessage}</p>
      )}
    </div>
  );
};

