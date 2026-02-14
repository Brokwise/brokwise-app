"use client";
import React, { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  formatIndianNumber,
  formatRoadWidthConversion,
  getRoadWidthUnitLabel,
  parseIntegerWithMax,
  parseRoadWidthInput,
} from "@/utils/helper";
import { Enquiry } from "@/models/types/enquiry";
import { UseFormReturn } from "react-hook-form";
import { CommercialPropertyFormData } from "@/validators/property";

type CommercialPropertyType =
  | "SHOWROOM"
  | "HOTEL"
  | "HOSTEL"
  | "SHOP"
  | "OFFICE_SPACE"
  | "OTHER_SPACE";

interface CommercialPropertySpecsProps {
  form: UseFormReturn<CommercialPropertyFormData>;
  enquiry?: Enquiry;
  propertyType: CommercialPropertyType;
}

export const CommercialPropertySpecs: React.FC<
  CommercialPropertySpecsProps
> = ({ form, enquiry, propertyType }) => {
  const [lastEditedPriceField, setLastEditedPriceField] = useState<
    "rate" | "totalPrice"
  >("rate");

  const size = form.watch("size");
  const rate = form.watch("rate");
  const totalPrice = form.watch("totalPrice");
  const plotType = form.watch("plotType");
  const roadWidthUnit = form.watch("roadWidthUnit") || "FEET";

  const roadWidthOptionsFeet = [30, 40, 60, 80, 100, 120, 160, 180, 200, 250, 300];
  const roadWidthOptionsMeters = [9, 12, 18, 24, 30, 37, 49, 55, 61, 76, 91];
  const roadWidthOptions = roadWidthUnit === "FEET" ? roadWidthOptionsFeet : roadWidthOptionsMeters;
  const roadWidthUnitLabel = getRoadWidthUnitLabel(roadWidthUnit);

  const effectiveSize = size && size > 0 ? size : 0;

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
                  {[
                    { value: "SQ_FT", label: "Square Feet" },
                    { value: "SQ_METER", label: "Square Meter" },
                    { value: "SQ_YARDS", label: "Square Yards" },
                    { value: "GAJ", label: "Gaj" },
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

      {/* Floor for Showroom/Hotel */}
      {(propertyType === "SHOWROOM" || propertyType === "HOTEL") && (
        <FormField
          control={form.control}
          name="floor"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>
                Floor <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div
                  className={cn(
                    "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                    fieldState.error &&
                    "bg-destructive/10 ring-1 ring-destructive"
                  )}
                  data-field="floor"
                >
                  {[
                    { value: "Ground", label: "Ground Floor" },
                    { value: "1", label: "1st Floor" },
                    { value: "2", label: "2nd Floor" },
                    { value: "3", label: "3rd Floor" },
                    { value: "4", label: "4th Floor" },
                    { value: "5", label: "5th Floor" },
                    { value: "Custom", label: "Custom" },
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
      )}

      {/* Hotel specific - Rooms */}
      {propertyType === "HOTEL" && (
        <FormField
          control={form.control}
          name="rooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Number of Rooms <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="1-1000"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(parseIntegerWithMax(e.target.value, 1000))
                  }
                />
              </FormControl>
              <FormDescription>
                Required for hotel listings (minimum 1)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Hostel specific - Beds and Rooms */}
      {propertyType === "HOSTEL" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="beds"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  Number of Beds <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div
                    className={cn(
                      "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                      fieldState.error &&
                      "bg-destructive/10 ring-1 ring-destructive"
                    )}
                    data-field="beds"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50].map(
                      (num) => (
                        <Button
                          key={num}
                          type="button"
                          variant="selection"
                          onClick={() => field.onChange(num)}
                          className={cn(
                            field.value === num
                              ? "bg-primary text-primary-foreground"
                              : "w-12"
                          )}
                        >
                          {num}
                        </Button>
                      )
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Number of Rooms <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="1-1000"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(parseIntegerWithMax(e.target.value, 1000))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Shop specific - Property Status */}
      {propertyType === "SHOP" && (
        <FormField
          control={form.control}
          name="propertyStatus"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>
                Property Status <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div
                  className={cn(
                    "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                    fieldState.error &&
                    "bg-destructive/10 ring-1 ring-destructive"
                  )}
                  data-field="propertyStatus"
                >
                  {[
                    { value: "Land", label: "Land" },
                    { value: "Constructed", label: "Constructed" },
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
      )}

      {/* Office Space - Project Area */}
      {propertyType === "OFFICE_SPACE" && (
        <FormField
          control={form.control}
          name="projectArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Project Area (sq ft) <span className="text-destructive">*</span>
              </FormLabel>
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
      )}

      {/* Shop specific plot details */}
      {propertyType === "SHOP" && (
        <>
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

          {/* Road Width Unit Toggle - Inline */}
          <FormField
            defaultValue={roadWidthUnit}
            control={form.control}
            name="roadWidthUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Road Width Unit <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="inline-flex rounded-full border bg-muted p-1">
                    {[
                      { value: "FEET", label: "Feet" },
                      { value: "METER", label: "Metre" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          field.onChange(item.value);
                          form.setValue("frontRoadWidth", undefined);
                          form.setValue("sideRoadWidth", undefined);
                        }}
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-full transition-all",
                          field.value === item.value
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Front Road Details Card */}
          <div className="space-y-4 p-4 rounded-xl bg-muted/30 border">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full" />
              Front Road Details
            </h3>

            <FormField
              control={form.control}
              name="facing"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Facing Direction <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "p-3 rounded-lg transition-colors",
                        fieldState.error &&
                        "bg-destructive/10 ring-1 ring-destructive"
                      )}
                      data-field="facing"
                    >
                      {/* Compass Visual Selector */}
                      <div className="flex flex-col items-start gap-1">
                        {/* North row */}
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="selection"
                            size="sm"
                            onClick={() => field.onChange("NORTH_WEST")}
                            className={cn(
                              "w-12 h-9 text-xs",
                              field.value === "NORTH_WEST"
                                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                : ""
                            )}
                          >
                            NW
                          </Button>
                          <Button
                            type="button"
                            variant="selection"
                            size="sm"
                            onClick={() => field.onChange("NORTH")}
                            className={cn(
                              "w-12 h-9 text-xs",
                              field.value === "NORTH"
                                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                : ""
                            )}
                          >
                            N
                          </Button>
                          <Button
                            type="button"
                            variant="selection"
                            size="sm"
                            onClick={() => field.onChange("NORTH_EAST")}
                            className={cn(
                              "w-12 h-9 text-xs",
                              field.value === "NORTH_EAST"
                                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                : ""
                            )}
                          >
                            NE
                          </Button>
                        </div>

                        {/* Middle row */}
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="selection"
                            size="sm"
                            onClick={() => field.onChange("WEST")}
                            className={cn(
                              "w-12 h-9 text-xs",
                              field.value === "WEST"
                                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                : ""
                            )}
                          >
                            W
                          </Button>

                          {/* Compass center indicator */}
                          <div className="w-12 h-9 rounded-md border-2 border-muted-foreground/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>

                          <Button
                            type="button"
                            variant="selection"
                            size="sm"
                            onClick={() => field.onChange("EAST")}
                            className={cn(
                              "w-12 h-9 text-xs",
                              field.value === "EAST"
                                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                : ""
                            )}
                          >
                            E
                          </Button>
                        </div>

                        {/* South row */}
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="selection"
                            size="sm"
                            onClick={() => field.onChange("SOUTH_WEST")}
                            className={cn(
                              "w-12 h-9 text-xs",
                              field.value === "SOUTH_WEST"
                                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                : ""
                            )}
                          >
                            SW
                          </Button>
                          <Button
                            type="button"
                            variant="selection"
                            size="sm"
                            onClick={() => field.onChange("SOUTH")}
                            className={cn(
                              "w-12 h-9 text-xs",
                              field.value === "SOUTH"
                                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                : ""
                            )}
                          >
                            S
                          </Button>
                          <Button
                            type="button"
                            variant="selection"
                            size="sm"
                            onClick={() => field.onChange("SOUTH_EAST")}
                            className={cn(
                              "w-12 h-9 text-xs",
                              field.value === "SOUTH_EAST"
                                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                : ""
                            )}
                          >
                            SE
                          </Button>
                        </div>
                      </div>
                    </div>
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
                    Road Width <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div
                        className={cn(
                          "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                          fieldState.error &&
                          "bg-destructive/10 ring-1 ring-destructive"
                        )}
                        data-field="frontRoadWidth"
                      >
                        {roadWidthOptions.map((width) => (
                          <Button
                            key={width}
                            type="button"
                            variant="selection"
                            size="sm"
                            onClick={() => field.onChange(width)}
                            className={cn(
                              "min-w-[70px]",
                              field.value === width
                                ? "bg-primary text-primary-foreground"
                                : ""
                            )}
                          >
                            {width} {roadWidthUnitLabel}
                          </Button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Custom width"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(parseRoadWidthInput(e.target.value))
                          }
                          className="max-w-[140px]"
                        />
                        <span className="text-sm text-muted-foreground">
                          {roadWidthUnitLabel}
                        </span>
                        {(() => {
                          const conversion = formatRoadWidthConversion(
                            field.value,
                            roadWidthUnit
                          );
                          if (!conversion) return null;
                          return (
                            <span className="text-xs text-muted-foreground">
                              ({conversion})
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {plotType === "CORNER" && (
            <div className="space-y-4 p-4 rounded-xl bg-muted/30 border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                Side Road Details
              </h3>

              <FormField
                control={form.control}
                name="sideFacing"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Facing Direction <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div
                        className={cn(
                          "p-3 rounded-lg transition-colors",
                          fieldState.error &&
                          "bg-destructive/10 ring-1 ring-destructive"
                        )}
                        data-field="sideFacing"
                      >
                        {/* Compass Visual Selector */}
                        <div className="flex flex-col items-start justify-start gap-1">
                          {/* North row */}
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="selection"
                              size="sm"
                              onClick={() => field.onChange("NORTH_WEST")}
                              className={cn(
                                "w-12 h-9 text-xs",
                                field.value === "NORTH_WEST"
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                  : ""
                              )}
                            >
                              NW
                            </Button>
                            <Button
                              type="button"
                              variant="selection"
                              size="sm"
                              onClick={() => field.onChange("NORTH")}
                              className={cn(
                                "w-12 h-9 text-xs",
                                field.value === "NORTH"
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                  : ""
                              )}
                            >
                              N
                            </Button>
                            <Button
                              type="button"
                              variant="selection"
                              size="sm"
                              onClick={() => field.onChange("NORTH_EAST")}
                              className={cn(
                                "w-12 h-9 text-xs",
                                field.value === "NORTH_EAST"
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                  : ""
                              )}
                            >
                              NE
                            </Button>
                          </div>

                          {/* Middle row */}
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="selection"
                              size="sm"
                              onClick={() => field.onChange("WEST")}
                              className={cn(
                                "w-12 h-9 text-xs",
                                field.value === "WEST"
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                  : ""
                              )}
                            >
                              W
                            </Button>
                            <div className="w-12 h-9 rounded-md border-2 border-muted-foreground/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <Button
                              type="button"
                              variant="selection"
                              size="sm"
                              onClick={() => field.onChange("EAST")}
                              className={cn(
                                "w-12 h-9 text-xs",
                                field.value === "EAST"
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                  : ""
                              )}
                            >
                              E
                            </Button>
                          </div>

                          {/* South row */}
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="selection"
                              size="sm"
                              onClick={() => field.onChange("SOUTH_WEST")}
                              className={cn(
                                "w-12 h-9 text-xs",
                                field.value === "SOUTH_WEST"
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                  : ""
                              )}
                            >
                              SW
                            </Button>
                            <Button
                              type="button"
                              variant="selection"
                              size="sm"
                              onClick={() => field.onChange("SOUTH")}
                              className={cn(
                                "w-12 h-9 text-xs",
                                field.value === "SOUTH"
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                  : ""
                              )}
                            >
                              S
                            </Button>
                            <Button
                              type="button"
                              variant="selection"
                              size="sm"
                              onClick={() => field.onChange("SOUTH_EAST")}
                              className={cn(
                                "w-12 h-9 text-xs",
                                field.value === "SOUTH_EAST"
                                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                                  : ""
                              )}
                            >
                              SE
                            </Button>
                          </div>
                        </div>
                      </div>
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
                      Road Width <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div
                          className={cn(
                            "flex flex-wrap gap-2 p-2 rounded-lg transition-colors",
                            fieldState.error &&
                            "bg-destructive/10 ring-1 ring-destructive"
                          )}
                          data-field="sideRoadWidth"
                        >
                          {roadWidthOptions.map((width) => (
                            <Button
                              key={width}
                              type="button"
                              variant="selection"
                              size="sm"
                              onClick={() => field.onChange(width)}
                              className={cn(
                                "min-w-[70px]",
                                field.value === width
                                  ? "bg-primary text-primary-foreground"
                                  : ""
                              )}
                            >
                              {width} {roadWidthUnitLabel}
                            </Button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Custom width"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(parseRoadWidthInput(e.target.value))
                            }
                            className="max-w-[140px]"
                          />
                          <span className="text-sm text-muted-foreground">
                            {roadWidthUnitLabel}
                          </span>
                          {(() => {
                            const conversion = formatRoadWidthConversion(
                              field.value,
                              roadWidthUnit
                            );
                            if (!conversion) return null;
                            return (
                              <span className="text-xs text-muted-foreground">
                                ({conversion})
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </>
      )}

      {/* Purpose */}
      <FormField
        control={form.control}
        name="purpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Purpose <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder={
                  propertyType === "SHOWROOM"
                    ? "e.g., Retail, Display, Sales"
                    : propertyType === "HOTEL"
                      ? "e.g., Hospitality, Tourism, Business"
                      : "Enter purpose"
                }
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Pricing Details */}
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

        {/* Rental Income for Showroom/Hotel/Hostel */}
        {(propertyType === "SHOWROOM" ||
          propertyType === "HOTEL" ||
          propertyType === "HOSTEL") && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Rental Income (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rentalIncome.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Rental Income (₹)</FormLabel>
                      <FormControl>
                        <NumberInput
                          placeholder="0"
                          {...field}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>Range: 0 to 25L</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rentalIncome.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Rental Income (₹)</FormLabel>
                      <FormControl>
                        <NumberInput
                          placeholder="2500000"
                          {...field}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>Range: 0 to 25L</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

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
