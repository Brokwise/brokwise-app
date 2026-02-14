"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";
import { DISCLAIMER_TEXT } from "@/constants/disclaimers";

interface DisclaimerNoticeProps {
  text: string;
  title?: string;
  className?: string;
}

export const DisclaimerNotice = ({
  text,
  title = DISCLAIMER_TEXT.title,
  className,
}: DisclaimerNoticeProps) => {
  return (
    <Alert
      className={cn(
        "border-amber-300/70 bg-amber-50/40 dark:border-amber-700/50 dark:bg-amber-950/30",
        className
      )}
    >
      <ShieldAlert className="h-4 w-4 text-amber-700 dark:text-amber-300" />
      <AlertTitle className="text-amber-800 dark:text-amber-100">
        {title}
      </AlertTitle>
      <AlertDescription className="text-amber-800/90 dark:text-amber-200/90">
        {text}
      </AlertDescription>
    </Alert>
  );
};
