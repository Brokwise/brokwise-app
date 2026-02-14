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
import { DirectionCompassField } from "@/components/property/direction-compass-field";
import { RoadWidthField } from "@/components/property/road-width-field";
import { Input } from "@/components/ui/input";

import { NumberInput } from "@/components/ui/number-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  formatIndianNumber,
} from "@/utils/helper";
interface ResidentialProperySpecsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  enquiry?: Enquiry;
  propertyType: "FLAT" | "VILLA" | "LAND";
}
export const ResidentialProperySpecs: React.FC<
  ResidentialProperySpecsProps
> = ({ form, enquiry, propertyType }) => {
  const [lastEditedPriceField, setLastEditedPriceField] = useState<
    "rate" | "totalPrice"
  >("rate");
  const size = form.watch("size");
  const projectArea = form.watch("projectArea");
  const rate = form.watch("rate");
  const totalPrice = form.watch("totalPrice");
  const plotType = form.watch("plotType");
  const roadWidthUnit = form.watch("roadWidthUnit") || "FEET";

  const effectiveSize =
    size && size > 0 ? size : projectArea && projectArea > 0 ? projectArea : 0;

  React.useEffect(() => {
    if (!effectiveSize || effectiveSize <= 0) return;
    if (lastEditedPriceField === "rate" && rate && rate > 0) {
      const calculatedPrice = effectiveSize * rate;
      form.setValue("totalPrice", calculatedPrice, { shouldValidate: true });
    } else if (
      lastEditedPriceField === "totalPrice" &&
      totalPrice &&
      totalPrice > 0
    ) {
      const calculatedRate = Math.round(totalPrice / effectiveSize);
      form.setValue("rate", calculatedRate, { shouldValidate: true });
    }
  }, [effectiveSize, rate, totalPrice, lastEditedPriceField, form]);

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
                Property Size <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NumberInput
                  placeholder="Enter size"
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
                Size Unit <span className="text-destructive">*</span>
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
                  {(propertyType === "FLAT"
                    ? [
                      { value: "SQ_FT", label: "Square Feet" },
                      { value: "SQ_METER", label: "Square Meter" },
                      { value: "SQ_YARDS", label: "Square Yards" },
                      { value: "GAJ", label: "GAJ" },
                    ]
                    : [
                      { value: "GAJ", label: "Gaj" },
                      { value: "SQ_FT", label: "Square Feet" },
                      { value: "SQ_YARDS", label: "Square Yards" },
                      { value: "ACRES", label: "Acres" },
                      { value: "BIGHA", label: "Bigha" },
                      { value: "SQ_METER", label: "Square Meter" },
                      { value: "HECTARE", label: "Hectare" },
                    ]
                  ).map((item) => (
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

      {/* FLAT Specific */}
      {(propertyType === "FLAT" || propertyType == "VILLA") && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bhk"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    BHK <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                        fieldState.error &&
                        "bg-destructive/10 ring-1 ring-destructive"
                      )}
                      data-field="bhk"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Button
                          key={num}
                          type="button"
                          variant="selection"
                          onClick={() => field.onChange(num)}
                          className={cn(
                            field.value === num
                              ? "bg-primary text-primary-foreground"
                              : ""
                          )}
                        >
                          {num} BHK
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {enquiry?.bhk &&
                    field.value &&
                    field.value !== enquiry.bhk && (
                      <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          Enquiry requirement is {enquiry.bhk} BHK. You selected{" "}
                          {field.value} BHK.
                        </span>
                      </div>
                    )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="washrooms"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Washrooms <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                        fieldState.error &&
                        "bg-destructive/10 ring-1 ring-destructive"
                      )}
                      data-field="washrooms"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <Button
                          key={num}
                          type="button"
                          variant="selection"
                          onClick={() => field.onChange(num)}
                          className={cn(
                            field.value === num
                              ? "bg-primary text-primary-foreground"
                              : "w-10"
                          )}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {enquiry?.washrooms &&
                    field.value &&
                    field.value !== enquiry.washrooms && (
                      <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          Enquiry requirement is {enquiry.washrooms} Washrooms.
                          You selected {field.value} Washrooms.
                        </span>
                      </div>
                    )}
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="society"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Society Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter society name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Area (sq ft)</FormLabel>
                <FormControl>
                  <NumberInput
                    placeholder="Enter project area"
                    {...field}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {(propertyType === "LAND") && (
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
                    fieldState.error &&
                    "bg-destructive/10 ring-1 ring-destructive"
                  )}
                  data-field="plotType"
                >
                  {[
                    { value: "ROAD", label: "Road Facing" },
                    { value: "CORNER", label: "Corner Plot" },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant="selection"
                      onClick={() => field.onChange(type.value)}
                      className={cn(
                        field.value === type.value
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
              {enquiry?.plotType &&
                field.value &&
                field.value !== enquiry.plotType && (
                  <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Enquiry requires {enquiry.plotType}. You selected{" "}
                      {field.value}.
                    </span>
                  </div>
                )}
            </FormItem>
          )}
        />
      )}

      {/* LAND Specific - Width and Direction */}
      {propertyType === "LAND" &&
        (plotType === "ROAD" || plotType === "CORNER") && (
          <div className="space-y-6">
            {/* Road Width Unit Toggle - Inline */}


            {/* Front Road Details */}
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
                        label="Road Width"
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Corner Side Road Details */}
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
                          label="Facing Direction"
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
                          label="Road Width"
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
        )}

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
                  {lastEditedPriceField === "totalPrice" &&
                    effectiveSize > 0 && (
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
                      lastEditedPriceField === "totalPrice" && effectiveSize > 0
                        ? "bg-muted/50"
                        : ""
                    )}
                  />
                </FormControl>
                <FormDescription>
                  {lastEditedPriceField === "rate"
                    ? "Total price will be calculated"
                    : `Calculated from total price ÷ ${size && size > 0 ? "size" : "project area"
                    }`}
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
                  {lastEditedPriceField === "rate" && effectiveSize > 0 && (
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
                      lastEditedPriceField === "rate" && effectiveSize > 0
                        ? "bg-muted/50"
                        : ""
                    )}
                  />
                </FormControl>
                <FormDescription>
                  {lastEditedPriceField === "totalPrice"
                    ? "Rate per unit will be calculated"
                    : `Calculated from ${size && size > 0 ? "size" : "project area"
                    } × rate`}
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
