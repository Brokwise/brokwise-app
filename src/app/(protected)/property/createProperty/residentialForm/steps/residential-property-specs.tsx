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
import { Input } from "@/components/ui/input";

import { NumberInput } from "@/components/ui/number-input";
import { Checkbox } from "@/components/ui/checkbox";
import { formatIndianNumber, PROPERTY_LIMITS } from "@/utils/helper";
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
  const roadWidthUnit = form.watch("roadWidthUnit") || "METER";

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

  const roadWidthOptionsMeters = [3.75, 5.5, 7.0, 10.5, 14.0, 21.0];
  const roadWidthOptionsFeet = [12, 18, 23, 35, 46, 70];
  const roadWidthOptions = roadWidthUnit === "FEET" ? roadWidthOptionsFeet : roadWidthOptionsMeters;
  const roadWidthUnitLabel = roadWidthUnit === "FEET" ? "ft" : "m";
  // const facingOptions = [
  //   { value: "NORTH", label: "North" },
  //   { value: "SOUTH", label: "South" },
  //   { value: "EAST", label: "East" },
  //   { value: "WEST", label: "West" },
  //   { value: "NORTH_EAST", label: "North East" },
  //   { value: "NORTH_WEST", label: "North West" },
  //   { value: "SOUTH_EAST", label: "South East" },
  //   { value: "SOUTH_WEST", label: "South West" },
  // ];
  const parseRoadWidthMetersInput = (value: string) => {
    if (!value) return undefined;
    const sanitized = value.replace(/[^0-9.]/g, "");
    const normalized = sanitized.replace(/(\..*)\./g, "$1");
    if (!normalized || normalized === ".") return undefined;
    const num = Number(normalized);
    if (Number.isNaN(num)) return undefined;
    return Math.min(num, PROPERTY_LIMITS.MAX_FRONT_ROAD_WIDTH);
  };

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
      {propertyType === "FLAT" || propertyType == "VILLA" && (
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
                    <FormLabel>
                      Facing Direction{" "}
                      <span className="text-destructive">*</span>
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
                    <FormLabel className="flex items-center gap-2 justify-between md:justify-start">
                      <div>
                        Road Width <span className="text-destructive">*</span>
                      </div>
                      <FormField
                        control={form.control}
                        name="roadWidthUnit"
                        render={({ field }) => (
                          <FormItem className="">

                            <FormControl>
                              <div className="inline-flex rounded-full border bg-muted p-[0.5px]">
                                {[
                                  { value: "METER", label: "Meters" },
                                  { value: "FEET", label: "Feet" },
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
                                      "px-2 py-1 text-sm font-medium rounded-full transition-all",
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
                        <div className="flex items-center justify-start gap-2">
                          <div>
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="Custom width"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  parseRoadWidthMetersInput(e.target.value)
                                )
                              }
                              className="max-w-[140px]!"
                            />

                          </div>
                          <span className="text-sm text-muted-foreground">
                            {roadWidthUnitLabel}
                          </span>
                        </div>
                      </div>
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
                      <FormLabel>
                        Facing Direction{" "}
                        <span className="text-destructive">*</span>
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
                            <div>

                              <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="Custom width"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    parseRoadWidthMetersInput(e.target.value)
                                  )
                                }
                                className="max-w-[140px]!"
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {roadWidthUnitLabel}
                            </span>
                          </div>
                        </div>
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
