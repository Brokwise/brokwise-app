import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import { DirectionCompassField } from "@/components/property/direction-compass-field";
import { RoadWidthField } from "@/components/property/road-width-field";

interface AgriculturalLocationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

export const AgriculturalLocation: React.FC<AgriculturalLocationProps> = ({
  form,
}) => {
  const plotType = form.watch("plotType");
  const roadWidthUnit = form.watch("roadWidthUnit") || "FEET";
  const showFrontDetails = plotType === "ROAD" || plotType === "CORNER";

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="plotType"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>
              Plot Type <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div
                className={cn(
                  "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                  fieldState.error && "bg-destructive/10 ring-1 ring-destructive"
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
                    onClick={() => {
                      field.onChange(item.value);
                      if (item.value === "ROAD") {
                        form.setValue("sideFacing", undefined);
                        form.setValue("sideRoadWidth", undefined);
                      }
                    }}
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

      {showFrontDetails && (
        <div className="space-y-4 p-4 rounded-xl bg-muted/30 border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full" />
            Front Details
          </h3>

          <FormField
            control={form.control}
            name="facing"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <DirectionCompassField
                    label="Facing Direction"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    error={!!fieldState.error}
                    dataField="facing"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frontRoadWidth"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <RoadWidthField
                    label="Front Road Width"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    unit={roadWidthUnit}
                    onUnitChange={(value) => {
                      form.setValue("roadWidthUnit", value);
                      form.setValue("frontRoadWidth", undefined);
                      form.setValue("sideRoadWidth", undefined);
                    }}
                    error={!!fieldState.error}
                    dataField="frontRoadWidth"
                    description="Width of the road adjacent to the agricultural land (max 300 ft)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {plotType === "CORNER" && (
        <div className="space-y-4 p-4 rounded-xl bg-muted/30 border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full" />
            Side Details
          </h3>

          <FormField
            control={form.control}
            name="sideFacing"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <DirectionCompassField
                    label="Side Facing Direction"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    error={!!fieldState.error}
                    dataField="sideFacing"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sideRoadWidth"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <RoadWidthField
                    label="Side Road Width"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    unit={roadWidthUnit}
                    error={!!fieldState.error}
                    dataField="sideRoadWidth"
                    showUnitToggle={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
