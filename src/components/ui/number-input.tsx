import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { formatIndianNumber } from "@/utils/helper";

interface NumberInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
    value: number | string | undefined;
    onChange: (value: number) => void;
    placeholder?: string;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ value, onChange, className, placeholder, ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState("");
        const [isFocused, setIsFocused] = useState(false);

        // Sync internal state with external value prop
        useEffect(() => {
            if (isFocused) return; // Don't update while user is typing/focused to avoid jumping
            
            // Show empty string (placeholder visible) when value is 0, undefined, null, or empty
            if (value === "" || value === undefined || value === null || value === 0) {
                setDisplayValue("");
                return;
            }

            const numVal = Number(value);
            if (!isNaN(numVal) && numVal !== 0) {
                // Format on blur/initial load (only for non-zero values)
                setDisplayValue(formatIndianNumber(numVal));
            } else {
                setDisplayValue("");
            }
        }, [value, isFocused]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            // Allow empty input - show placeholder
            if (inputValue === "") {
                setDisplayValue("");
                onChange(0);
                return;
            }

            // Strip all non-numeric characters (prevents negatives, letters, symbols)
            const numericString = inputValue.replace(/[^0-9]/g, "");
            
            // Strip leading zeros
            const sanitized = numericString.replace(/^0+(?=\d)/, "");
            
            if (sanitized === "" || sanitized === "0") {
                setDisplayValue("");
                onChange(0);
                return;
            }
            
            const numVal = Number(sanitized);

            // Format with Indian number system
            const formatted = formatIndianNumber(numVal);

            setDisplayValue(formatted);
            onChange(numVal);
        };

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            props.onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            props.onBlur?.(e);
        };

        return (
            <Input
                {...props}
                ref={ref}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={className}
                placeholder={placeholder}
            />
        );
    }
);

NumberInput.displayName = "NumberInput";
