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
import { Textarea } from "@/components/ui/textarea";
import {
  PROPERTY_LIMITS,
  coerceStringArray,
  parseRoadWidthInput,
} from "@/utils/helper";

interface ResortFeaturesProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

export const ResortFeatures: React.FC<ResortFeaturesProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      {/* Facing and Plot Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="facing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facing Direction</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plot Type</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
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
              Width of the main access road to the resort (max{" "}
              {PROPERTY_LIMITS.MAX_FRONT_ROAD_WIDTH} ft)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="pt-6 border-t">
        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resort Amenities</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List amenities separated by commas (e.g., Swimming Pool, Spa, Restaurant, Conference Hall, Garden, Parking, Room Service, Adventure Sports, Nature Trails, Banquet Hall, Kids Play Area, Gym, Wi-Fi, 24/7 Security)"
                  className="min-h-[100px]"
                  {...field}
                  value={coerceStringArray(field.value).join(", ")}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </FormControl>
              <FormDescription>
                Enter amenities separated by commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
