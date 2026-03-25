import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React from "react";
import { Input } from "@/components/ui/input";
import { PincodeInput } from "@/components/ui/pincode-input";
import { Textarea } from "@/components/ui/textarea";
import { LocationPicker } from "../../_components/locationPicker";

interface ResortBasicInfoProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

export const ResortBasicInfo: React.FC<ResortBasicInfoProps> = ({ form }) => {
  const handleLocationSelect = (details: {
    coordinates: [number, number];
    placeName: string;
    pincode?: string;
    context?: { id: string; text: string }[];
  }) => {
    form.setValue("location.coordinates", details.coordinates, {
      shouldValidate: true,
    });
    form.setValue("address.address", details.placeName, {
      shouldValidate: true,
    });

    if (details.pincode) {
      form.setValue("address.pincode", details.pincode, {
        shouldValidate: true,
      });
    }

    if (details.context) {
      details.context.forEach((item: { id: string; text: string }) => {
        if (item.id.startsWith("region")) {
          form.setValue("address.state", item.text, { shouldValidate: true });
        }
        if (item.id.startsWith("place")) {
          form.setValue("address.city", item.text, { shouldValidate: true });
        }
        if (!details.pincode && item.id.startsWith("postcode")) {
          const numericPincode = item.text.replace(/\D/g, "").slice(0, 6);
          if (numericPincode.length === 6) {
            form.setValue("address.pincode", numericPincode, {
              shouldValidate: true,
            });
          }
        }
      });
    }
  };

  const handleLocationClear = () => {
    form.setValue("location.coordinates", [0, 0]);
    form.setValue("address.address", "");
    form.setValue("address.state", "");
    form.setValue("address.city", "");
    form.setValue("address.pincode", "");
  };

  const coordinates = form.watch("location.coordinates");
  const hasLocation = coordinates?.[0] !== 0 || coordinates?.[1] !== 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Property Location <span className="text-destructive">*</span></h3>
        <FormField
          control={form.control}
          name="location.coordinates"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <LocationPicker
                  value={field.value as [number, number]}
                  onChange={field.onChange}
                  onLocationSelect={handleLocationSelect}
                  onLocationClear={handleLocationClear}
                  hasError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {hasLocation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pincode <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <PincodeInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter 6-digit pincode"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    Full Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter complete resort address"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="propertyStatus"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    Property Status <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Operational, Under Construction"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};
