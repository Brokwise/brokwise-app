import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  const isInvalid =
    props["aria-invalid"] === true || props["aria-invalid"] === "true";

  return (
    <div className="relative w-full">
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive aria-[invalid=true]:text-destructive aria-[invalid=true]:bg-destructive/5 aria-[invalid=true]:pr-10",
          className
        )}
        ref={ref}
        {...props}
      />
      {isInvalid && (
        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-destructive pointer-events-none" />
      )}
    </div>
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
