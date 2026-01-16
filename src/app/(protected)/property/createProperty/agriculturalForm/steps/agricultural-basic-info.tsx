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

interface AgriculturalBasicInfoProps {
  //
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

export const AgriculturalBasicInfo: React.FC<AgriculturalBasicInfoProps> = ({
  form,
}) => {
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
        // Fallback: if pincode wasn't directly provided, try from context
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

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="propertyTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter property title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Address Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Property Address</h3>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
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
              <FormItem>
                <FormLabel>
                  Full Address <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter complete property address"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Right Column: Map */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Locate on Map</h3>
          <FormField
            control={form.control}
            name="location.coordinates"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <LocationPicker
                    value={field.value as [number, number]}
                    onChange={field.onChange}
                    onLocationSelect={handleLocationSelect}
                    className="h-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
