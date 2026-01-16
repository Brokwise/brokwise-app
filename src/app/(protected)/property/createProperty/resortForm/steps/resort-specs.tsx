import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Enquiry } from "@/models/types/enquiry";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { Checkbox } from "@/components/ui/checkbox";
import { formatIndianNumber } from "@/utils/helper";

interface ResortSpecsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  enquiry?: Enquiry;
}

export const ResortSpecs: React.FC<ResortSpecsProps> = ({ form, enquiry }) => {
  const [lastEditedPriceField, setLastEditedPriceField] = useState<
    "rate" | "totalPrice"
  >("rate");

  const size = form.watch("size");
  const rate = form.watch("rate");
  const totalPrice = form.watch("totalPrice");

  React.useEffect(() => {
    if (!size || size <= 0) return;
    if (lastEditedPriceField === "rate" && rate && rate > 0) {
      const calculatedPrice = size * rate;
      form.setValue("totalPrice", calculatedPrice, { shouldValidate: true });
    } else if (
      lastEditedPriceField === "totalPrice" &&
      totalPrice &&
      totalPrice > 0
    ) {
      const calculatedRate = Math.round(totalPrice / size);
      form.setValue("rate", calculatedRate, { shouldValidate: true });
    }
  }, [size, rate, totalPrice, lastEditedPriceField, form]);

  return (
    <div className="space-y-6">
      {/* Size and Unit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Resort Area <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NumberInput
                  placeholder="Enter total area"
                  {...field}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
              {enquiry?.size &&
                field.value &&
                (field.value < enquiry.size.min ||
                  field.value > enquiry.size.max) && (
                  <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Enquiry size range: {enquiry.size.min} -{" "}
                      {enquiry.size.max}.
                    </span>
                  </div>
                )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sizeUnit"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>
                Area Unit <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div
                  className={cn(
                    "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                    fieldState.error &&
                      "bg-destructive/10 ring-1 ring-destructive"
                  )}
                  data-field="sizeUnit"
                >
                  {[
                    { value: "ACRES", label: "Acres" },
                    { value: "HECTARE", label: "Hectare" },
                    { value: "BIGHA", label: "Bigha" },
                    { value: "SQ_FT", label: "Square Feet" },
                    { value: "SQ_METER", label: "Square Meter" },
                    { value: "SQ_YARDS", label: "Square Yards" },
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

      <div className="pt-6 border-t space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-primary">Pricing Details</h3>
          <p className="text-sm text-muted-foreground">
            Enter either Rate per Unit or Total Price — the other will be
            calculated automatically based on the property size.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Rate per Unit (₹) <span className="text-destructive">*</span>
                  {lastEditedPriceField === "totalPrice" && size > 0 && (
                    <span className="text-xs font-normal text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                      Auto-calculated
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <NumberInput
                    placeholder="Enter rate per unit"
                    {...field}
                    onChange={(value) => {
                      setLastEditedPriceField("rate");
                      field.onChange(value);
                    }}
                    className={cn(
                      lastEditedPriceField === "totalPrice" && size > 0
                        ? "bg-muted/50"
                        : ""
                    )}
                  />
                </FormControl>
                <FormDescription>
                  {lastEditedPriceField === "rate"
                    ? "Total price will be calculated"
                    : "Calculated from total price ÷ size"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Total Price (₹)
                  {lastEditedPriceField === "rate" && size > 0 && (
                    <span className="text-xs font-normal text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                      Auto-calculated
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <NumberInput
                    placeholder="Enter total price"
                    {...field}
                    onChange={(value) => {
                      setLastEditedPriceField("totalPrice");
                      field.onChange(value);
                    }}
                    className={cn(
                      lastEditedPriceField === "rate" && size > 0
                        ? "bg-muted/50"
                        : ""
                    )}
                  />
                </FormControl>
                <FormDescription>
                  {lastEditedPriceField === "totalPrice"
                    ? "Rate per unit will be calculated"
                    : "Calculated from size × rate"}
                </FormDescription>
                <FormMessage />
                {enquiry?.budget &&
                  field.value &&
                  (field.value < enquiry.budget.min ||
                    field.value > enquiry.budget.max) && (
                    <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        Enquiry budget range:{" "}
                        {formatIndianNumber(enquiry.budget.min)} -{" "}
                        {formatIndianNumber(enquiry.budget.max)}.
                      </span>
                    </div>
                  )}
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isPriceNegotiable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Price Negotiable</FormLabel>
                <FormDescription>
                  Check if the price is open for negotiation
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
