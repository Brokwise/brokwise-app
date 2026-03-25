import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React from "react";
import { Building2, House, LandPlot } from "lucide-react";
import { Enquiry } from "@/models/types/enquiry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PincodeInput } from "@/components/ui/pincode-input";
import { Textarea } from "@/components/ui/textarea";
import { LocationPicker } from "../../_components/locationPicker";
interface ResidentialBasicInfoProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  enquiry?: Enquiry;
}
export const ResidentialBasicInfo: React.FC<ResidentialBasicInfoProps> = ({
  form,
  enquiry,
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
      <FormField
        control={form.control}
        name="propertyType"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>
              Property Type <span className="text-destructive">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <div
                  className={cn(
                    "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                    fieldState.error &&
                    "bg-destructive/10 ring-1 ring-destructive"
                  )}
                  data-field="propertyType"
                >
                  {[
                    { value: "FLAT", label: "Flat/Apartment", icon: House },
                    { value: "VILLA", label: "Villa", icon: Building2 },
                    { value: "LAND", label: "Land", icon: LandPlot },
                  ].map((item) => {
                    const isDisabled =
                      enquiry && enquiry.enquiryType !== item.value;
                    return (
                      <Button
                        key={item.value}
                        type="button"
                        variant="selection"
                        disabled={isDisabled}
                        onClick={() => field.onChange(item.value)}
                        className={cn(
                          field.value === item.value
                            ? "bg-primary text-primary-foreground"
                            : "",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </FormControl>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

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
                      placeholder="Enter complete property address"
                      className="min-h-[80px]"
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
