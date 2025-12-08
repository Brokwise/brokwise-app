import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { formatIndianNumber } from "@/utils/helper";

interface NumberInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
    value: number | string | undefined;
    onChange: (value: number) => void;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ value, onChange, className, ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState("");
        const [isFocused, setIsFocused] = useState(false);

        // Sync internal state with external value prop
        useEffect(() => {
            if (isFocused) return; // Don't update while user is typing/focused to avoid jumping
            if (value === "" || value === undefined || value === null) {
                setDisplayValue("");
                return;
            }

            const numVal = Number(value);
            if (!isNaN(numVal)) {
                // Format on blur/initial load
                setDisplayValue(formatIndianNumber(numVal));
            } else {
                setDisplayValue("");
            }
        }, [value, isFocused]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            // Allow empty input
            if (inputValue === "") {
                setDisplayValue("");
                onChange(0);
                return;
            }

            // Regex to allow only numbers
            const numericString = inputValue.replace(/[^0-9]/g, "");
            const numVal = Number(numericString);

            // Format immediately
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
                type="text" // Keep as text to control formatting
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={className}
            />
        );
    }
);

NumberInput.displayName = "NumberInput";
