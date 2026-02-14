import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Facing } from "@/types/property";

interface DirectionCompassFieldProps {
  label: string;
  value?: Facing;
  onChange: (value: Facing) => void;
  required?: boolean;
  error?: boolean;
  dataField?: string;
  className?: string;
  disabled?: boolean;
}

const DIRECTION_ROWS: Array<Array<Facing | null>> = [
  ["NORTH_WEST", "NORTH", "NORTH_EAST"],
  ["WEST", null, "EAST"],
  ["SOUTH_WEST", "SOUTH", "SOUTH_EAST"],
];

const DIRECTION_LABELS: Record<Facing, string> = {
  NORTH: "N",
  SOUTH: "S",
  EAST: "E",
  WEST: "W",
  NORTH_EAST: "NE",
  NORTH_WEST: "NW",
  SOUTH_EAST: "SE",
  SOUTH_WEST: "SW",
};

export const DirectionCompassField: React.FC<DirectionCompassFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  error = false,
  dataField,
  className,
  disabled = false,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </p>
      <div
        className={cn(
          "p-3 rounded-lg transition-colors",
          error && "bg-destructive/10 ring-1 ring-destructive"
        )}
        data-field={dataField}
      >
        <div className="flex flex-col items-start gap-1">
          {DIRECTION_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-1">
              {row.map((direction) => {
                if (!direction) {
                  return (
                    <div
                      key={`center-${rowIndex}`}
                      className="w-12 h-9 rounded-md border-2 border-muted-foreground/20 flex items-center justify-center"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                  );
                }

                return (
                  <Button
                    key={direction}
                    type="button"
                    variant="selection"
                    size="sm"
                    disabled={disabled}
                    onClick={() => onChange(direction)}
                    className={cn(
                      "w-12 h-9 text-xs",
                      value === direction
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                        : ""
                    )}
                  >
                    {DIRECTION_LABELS[direction]}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
