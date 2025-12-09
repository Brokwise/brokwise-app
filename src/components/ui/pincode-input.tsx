"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PincodeInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "maxLength" | "type"> {
  value: string | undefined;
  onChange: (value: string) => void;
}

/**
 * Pincode input component that enforces:
 * - Exactly 6 digits maximum
 * - Only numeric characters
 * - Prevents typing/pasting more than 6 characters
 */
export const PincodeInput = React.forwardRef<HTMLInputElement, PincodeInputProps>(
  ({ value, onChange, className, placeholder = "Enter 6-digit pincode", ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Strip all non-numeric characters
      const numericOnly = inputValue.replace(/\D/g, "");
      
      // Limit to 6 characters
      const truncated = numericOnly.slice(0, 6);
      
      onChange(truncated);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      
      // Strip non-numeric and take only first 6 digits
      const numericOnly = pastedText.replace(/\D/g, "").slice(0, 6);
      
      // Merge with current value respecting cursor position
      const input = e.currentTarget;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = value || "";
      
      // Calculate how many characters we can add
      const remainingSpace = 6 - (currentValue.length - (end - start));
      const charsToAdd = numericOnly.slice(0, Math.max(0, remainingSpace));
      
      const newValue = currentValue.slice(0, start) + charsToAdd + currentValue.slice(end);
      onChange(newValue.slice(0, 6));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, arrows
      const allowedKeys = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
      
      if (allowedKeys.includes(e.key)) {
        return;
      }
      
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
        return;
      }
      
      // Block non-numeric keys
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
        return;
      }
      
      // Block if already at 6 characters and no text is selected
      const input = e.currentTarget;
      const selectionLength = (input.selectionEnd || 0) - (input.selectionStart || 0);
      if ((value?.length || 0) >= 6 && selectionLength === 0) {
        e.preventDefault();
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={value || ""}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(className)}
      />
    );
  }
);

PincodeInput.displayName = "PincodeInput";
