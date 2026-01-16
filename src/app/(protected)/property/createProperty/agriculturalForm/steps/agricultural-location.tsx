import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROPERTY_LIMITS, parseRoadWidthInput } from "@/utils/helper";

interface AgriculturalLocationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

export const AgriculturalLocation: React.FC<AgriculturalLocationProps> = ({
  form,
}) => {
  return (
    <div className="space-y-6">
      {/* Facing and Plot Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="facing"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Facing Direction</FormLabel>
              <FormControl>
                <div
                  className={cn(
                    "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                    fieldState.error &&
                      "bg-destructive/10 ring-1 ring-destructive"
                  )}
                  data-field="facing"
                >
                  {[
                    { value: "NORTH", label: "North" },
                    { value: "SOUTH", label: "South" },
                    { value: "EAST", label: "East" },
                    { value: "WEST", label: "West" },
                    { value: "NORTH_EAST", label: "North East" },
                    { value: "NORTH_WEST", label: "North West" },
                    { value: "SOUTH_EAST", label: "South East" },
                    { value: "SOUTH_WEST", label: "South West" },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      type="button"
                      variant="selection"
                      onClick={() => field.onChange(item.value)}
                      className={cn(
                        field.value === item.value
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plotType"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Plot Type</FormLabel>
              <FormControl>
                <div
                  className={cn(
                    "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                    fieldState.error &&
                      "bg-destructive/10 ring-1 ring-destructive"
                  )}
                  data-field="plotType"
                >
                  {[
                    { value: "ROAD", label: "Road Facing" },
                    { value: "CORNER", label: "Corner Plot" },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      type="button"
                      variant="selection"
                      onClick={() => field.onChange(item.value)}
                      className={cn(
                        field.value === item.value
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="frontRoadWidth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Front Road Width (in feet)</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="numeric"
                placeholder={`Enter road width (max ${PROPERTY_LIMITS.MAX_FRONT_ROAD_WIDTH} ft)`}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(parseRoadWidthInput(e.target.value))
                }
              />
            </FormControl>
            <FormDescription>
              Width of the road adjacent to the agricultural land (max{" "}
              {PROPERTY_LIMITS.MAX_FRONT_ROAD_WIDTH} ft)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
