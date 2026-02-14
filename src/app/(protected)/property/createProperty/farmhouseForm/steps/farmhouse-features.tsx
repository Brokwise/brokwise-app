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
import {
  AmenitiesSelector,
  AmenityOption,
} from "@/components/property/amenities-selector";
import {
  coerceStringArray,
  PROPERTY_LIMITS,
  parseRoadWidthInput,
} from "@/utils/helper";
import { UseFormReturn } from "react-hook-form";
import { FarmHousePropertyFormData } from "@/validators/property";
import { DirectionCompassField } from "@/components/property/direction-compass-field";

interface FarmhouseFeaturesProps {
  form: UseFormReturn<FarmHousePropertyFormData>;
}

const FARMHOUSE_AMENITIES: AmenityOption[] = [
  { label: "Garden" },
  { label: "Parking" },
  { label: "Security" },
  { label: "Water Tank" },
  { label: "Electricity" },
  { label: "Bore Well" },
  { label: "Swimming Pool" },
  { label: "Guest Rooms" },
  { label: "Kitchen" },
  { label: "Caretaker Room" },
  { label: "Boundary Wall" },
  { label: "Gate" },
  { label: "CCTV" },
  { label: "Generator" },
];

export const FarmhouseFeatures: React.FC<FarmhouseFeaturesProps> = ({
  form,
}) => {
  const plotType = form.watch("plotType");
  const showFrontDetails = plotType === "ROAD" || plotType === "CORNER";

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-primary">
          Location & Accessibility
        </h3>

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
                  <FormLabel>
                    Front Road Width (in feet){" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "rounded-lg transition-colors",
                        fieldState.error && "bg-destructive/10 ring-1 ring-destructive p-2"
                      )}
                      data-field="frontRoadWidth"
                    >
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder={`Enter road width (max ${PROPERTY_LIMITS.MAX_FRONT_ROAD_WIDTH} ft)`}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseRoadWidthInput(e.target.value))
                        }
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Width of the main access road to the farm house (max{" "}
                    {PROPERTY_LIMITS.MAX_FRONT_ROAD_WIDTH} ft)
                  </FormDescription>
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
                  <FormLabel>
                    Side Road Width (in feet){" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "rounded-lg transition-colors",
                        fieldState.error && "bg-destructive/10 ring-1 ring-destructive p-2"
                      )}
                      data-field="sideRoadWidth"
                    >
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder={`Enter side road width (max ${PROPERTY_LIMITS.MAX_FRONT_ROAD_WIDTH} ft)`}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseRoadWidthInput(e.target.value))
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      <div className="space-y-6 pt-6 border-t">
        <h3 className="text-lg font-semibold text-primary">
          Farm House Amenities
        </h3>
        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <AmenitiesSelector
              value={coerceStringArray(field.value)}
              onChange={field.onChange}
              options={FARMHOUSE_AMENITIES}
              label="Available Amenities"
            />
          )}
        />
      </div>
    </div>
  );
};
