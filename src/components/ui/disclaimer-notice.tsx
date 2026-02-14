"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

interface DisclaimerNoticeProps {
  text: string;
  title?: string;
  className?: string;
}

export const DisclaimerNotice = ({
  text,
  title = "Disclaimer",
  className,
}: DisclaimerNoticeProps) => {
  return (
    <Alert className={cn("border-amber-300/70 bg-amber-50/40", className)}>
      <ShieldAlert className="h-4 w-4 text-amber-700" />
      <AlertTitle className="text-amber-800">{title}</AlertTitle>
      <AlertDescription className="text-amber-800/90">{text}</AlertDescription>
    </Alert>
  );
};

