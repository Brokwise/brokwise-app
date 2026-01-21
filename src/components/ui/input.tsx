import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const isInvalid =
      props["aria-invalid"] === true || props["aria-invalid"] === "true";

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-[8px] border border-input px-3 py-1.5 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-muted",
            "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive aria-[invalid=true]:text-destructive aria-[invalid=true]:bg-destructive/5 aria-[invalid=true]:pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {isInvalid && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive pointer-events-none" />
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
