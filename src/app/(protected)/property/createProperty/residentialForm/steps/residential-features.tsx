import { AmenitiesSelector } from "@/components/property/amenities-selector";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FLAT_AMENITIES, VILLA_AMENITIES } from "@/constants";
import { coerceStringArray } from "@/utils/helper";
import React from "react";

interface ResidentialFeaturesProps {
  propertyType: "FLAT" | "VILLA" | "LAND";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}
export const ResidentialFeatures: React.FC<ResidentialFeaturesProps> = ({
  propertyType,
  form,
}) => {
  const getAmenitiesList = () => {
    if (propertyType === "FLAT") return FLAT_AMENITIES;
    if (propertyType === "VILLA") return VILLA_AMENITIES;
    return [];
  };
  return (
    <div className="space-y-6">
      {propertyType === "FLAT" && (
        <>
          <FormField
            control={form.control}
            name="isPenthouse"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Penthouse</FormLabel>
                  <FormDescription>
                    Check if this is a penthouse apartment
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="possessionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Possession Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().split("T")[0]
                        : field.value?.toString() || ""
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Select possession date or leave empty for immediate possession
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      <FormField
        control={form.control}
        name="amenities"
        render={({ field }) => (
          <AmenitiesSelector
            value={coerceStringArray(field.value)}
            onChange={field.onChange}
            options={getAmenitiesList()}
            label={
              propertyType === "FLAT"
                ? "Flat Amenities"
                : propertyType === "VILLA"
                ? "Villa Amenities"
                : "Property Amenities"
            }
          />
        )}
      />
    </div>
  );
};
