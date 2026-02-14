import React from "react";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  formatRoadWidthConversion,
  getRoadWidthUnitLabel,
  PROPERTY_LIMITS,
} from "@/utils/helper";

export type RoadWidthUnit = "FEET" | "METER";

interface RoadWidthFieldProps {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  unit: RoadWidthUnit;
  onUnitChange?: (unit: RoadWidthUnit) => void;
  required?: boolean;
  error?: boolean;
  dataField?: string;
  max?: number;
  description?: React.ReactNode;
  className?: string;
  showUnitToggle?: boolean;
  unitLabel?: string;
}

const ROAD_WIDTH_OPTIONS_FEET = [30, 40, 60, 80, 100, 120, 160, 180, 200, 250, 300];
const ROAD_WIDTH_OPTIONS_METERS = [9, 12, 18, 24, 30, 37, 49, 55, 61, 76, 91];

const parseRoadWidthValue = (value: string, max: number) => {
  if (!value) return undefined;
  const sanitized = value.replace(/[^0-9.]/g, "");
  const normalized = sanitized.replace(/(\..*)\./g, "$1");
  if (!normalized || normalized === ".") return undefined;
  const num = Number(normalized);
  if (Number.isNaN(num)) return undefined;
  return Math.min(num, max);
};

export const RoadWidthField: React.FC<RoadWidthFieldProps> = ({
  label,
  value,
  onChange,
  unit,
  onUnitChange,
  required = false,
  error = false,
  dataField,
  max = PROPERTY_LIMITS.MAX_FRONT_ROAD_WIDTH,
  description,
  className,
  showUnitToggle = true,
  unitLabel,
}) => {
  const options = unit === "FEET" ? ROAD_WIDTH_OPTIONS_FEET : ROAD_WIDTH_OPTIONS_METERS;
  const resolvedUnitLabel = unitLabel ?? getRoadWidthUnitLabel(unit);

  return (
    <div className={cn("space-y-3", className)}>
      <FormLabel className="flex items-center gap-2 justify-between md:justify-start">
        <div>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </div>
        {showUnitToggle && onUnitChange ? (
          <div className="inline-flex rounded-full border bg-muted p-[0.5px]">
            {[
              { value: "FEET", label: "Feet" },
              { value: "METER", label: "Metre" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onUnitChange(item.value as RoadWidthUnit)}
                className={cn(
                  "px-2 py-1 text-sm font-medium rounded-full transition-all",
                  unit === item.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </FormLabel>

      <div className="space-y-3">
        <div
          className={cn(
            "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
            error && "bg-destructive/10 ring-1 ring-destructive"
          )}
          data-field={dataField}
        >
          {options.map((width) => (
            <Button
              key={width}
              type="button"
              variant="selection"
              size="sm"
              onClick={() => onChange(width)}
              className={cn(
                "min-w-[70px]",
                value === width ? "bg-primary text-primary-foreground" : ""
              )}
            >
              {width} {resolvedUnitLabel}
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-start gap-2">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Custom width"
            value={value ?? ""}
            onChange={(e) => onChange(parseRoadWidthValue(e.target.value, max))}
            className="w-[150px] sm:w-[170px]"
          />

          <span className="text-sm text-muted-foreground">{resolvedUnitLabel}</span>

          {(() => {
            const conversion = formatRoadWidthConversion(value, unit);
            if (!conversion) return null;
            return (
              <span className="text-xs text-muted-foreground">({conversion})</span>
            );
          })()}
        </div>

        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
};
