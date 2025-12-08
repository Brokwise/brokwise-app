"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Plus, Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateEnquiry } from "@/hooks/useEnquiry";
import {
  PropertyCategory,
  PropertyType,
} from "@/models/types/property";
import { CreateEnquiryDTO } from "@/models/types/enquiry";
import { parseIntegerOrUndefined, parseIntegerWithMax } from "@/utils/helper";

// --- Zod Schema ---

const budgetRangeSchema = z
  .object({
    min: z
      .number({
        error: "Please enter a valid minimum budget.",
      })
      .min(500000, "Minimum budget must be at least ₹5 lakh.")
      .max(100000000000, "Budget cannot exceed ₹1000 crore."),
    max: z
      .number({
        error: "Please enter a valid maximum budget.",
      })
      .min(500000, "Maximum budget must be at least ₹5 lakh.")
      .max(100000000000, "Budget cannot exceed ₹1000 crore."),
  })
  .refine((data) => data.max >= data.min, {
    message: "Max budget must be greater than or equal to min budget.",
    path: ["max"],
  });

const sizeRangeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0),
    unit: z.enum([
      "SQ_FT",
      "SQ_METER",
      "SQ_YARDS",
      "ACRES",
      "HECTARE",
      "BIGHA",
    ] as [string, ...string[]]),
  })
  .refine((data) => data.max >= data.min, {
    message: "Max size must be greater than or equal to min size",
    path: ["max"],
  });

const rentalIncomeRangeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0),
  })
  .refine((data) => data.max >= data.min, {
    message: "Max income must be greater than or equal to min income",
    path: ["max"],
  });

const createEnquirySchema = z.object({
  city: z.string().min(1, "City is required"),
  localities: z
    .array(z.string())
    .min(1, "At least one locality is required")
    .max(10, "Maximum 10 localities allowed"),
  enquiryCategory: z.enum([
    "RESIDENTIAL",
    "COMMERCIAL",
    "INDUSTRIAL",
    "AGRICULTURAL",
    "RESORT",
    "FARM_HOUSE",
  ] as [string, ...string[]]),
  enquiryType: z.string().min(1, "Property Type is required"), // Narrowed down in UI based on Category
  budget: budgetRangeSchema,
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),

  // Optional Fields
  size: sizeRangeSchema.optional(),
  plotType: z.enum(["ROAD", "CORNER"] as [string, ...string[]]).optional(),
  facing: z
    .enum([
      "NORTH",
      "SOUTH",
      "EAST",
      "WEST",
      "NORTH_EAST",
      "NORTH_WEST",
      "SOUTH_EAST",
      "SOUTH_WEST",
    ] as [string, ...string[]])
    .optional(),
  frontRoadWidth: z
    .coerce.number({
      error: "Please enter a valid road width.",
    })
    .min(1, "Road width must be at least 1 ft.")
    .max(500, "Road width cannot exceed 500 ft.")
    .optional(),

  // Residential - Flat
  bhk: z
    .coerce.number({
      error: "Please enter a valid number of bedrooms.",
    })
    .int("Bedrooms must be a whole number.")
    .min(1, "Number of bedrooms must be at least 1.")
    .max(20, "Bedrooms cannot exceed 20.")
    .optional(),
  washrooms: z
    .coerce.number({
      error: "Please enter a valid number of washrooms.",
    })
    .int("Washrooms must be a whole number.")
    .min(1, "Number of washrooms must be at least 1.")
    .max(20, "Washrooms cannot exceed 20.")
    .optional(),
  preferredFloor: z.string().max(20).optional(),
  society: z.string().max(100).optional(),

  // Commercial - Hotel/Hostel
  rooms: z
    .coerce.number({
      error: "Please enter a valid number of rooms.",
    })
    .int("Rooms must be a whole number.")
    .min(1, "Number of rooms must be at least 1.")
    .max(1000, "Rooms cannot exceed 1000.")
    .optional(),
  beds: z
    .coerce.number({
      error: "Please enter a valid number of beds.",
    })
    .int("Beds must be a whole number.")
    .min(1, "Number of beds must be at least 1.")
    .max(5000, "Beds cannot exceed 5000.")
    .optional(),
  rentalIncome: rentalIncomeRangeSchema.optional(),

  // Industrial
  purpose: z.string().max(200).optional(),
  areaType: z
    .enum(["NEAR_RING_ROAD", "RIICO_AREA", "SEZ"] as [string, ...string[]])
    .optional(),
});

type CreateEnquiryFormValues = z.infer<typeof createEnquirySchema>;

// --- Constants ---

const CATEGORY_TYPE_MAP: Record<PropertyCategory, PropertyType[]> = {
  RESIDENTIAL: ["FLAT", "VILLA", "LAND"],
  COMMERCIAL: [
    "SHOWROOM",
    "HOTEL",
    "HOSTEL",
    "SHOP",
    "OFFICE_SPACE",
    "OTHER_SPACE",
  ],
  INDUSTRIAL: [
    "INDUSTRIAL_PARK",
    "INDUSTRIAL_LAND",
    "WAREHOUSE",
    "AGRICULTURAL_LAND",
  ],
  AGRICULTURAL: ["AGRICULTURAL_LAND"], // Assuming Agricultural maps to this type
  RESORT: ["RESORT"],
  FARM_HOUSE: ["FARM_HOUSE", "INDIVIDUAL"],
};

const CreateEnquiryPage = () => {
  const router = useRouter();
  const { createEnquiry, isPending } = useCreateEnquiry();
  const [localityInput, setLocalityInput] = useState("");

  const form = useForm<CreateEnquiryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createEnquirySchema) as any,
    defaultValues: {
      city: "",
      localities: [],
      budget: { min: 0, max: 0 },
      description: "",
    },
  });

  const { watch, setValue, control } = form;
  const selectedCategory = watch("enquiryCategory");
  const selectedType = watch("enquiryType");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("enquiryType", "" as any);
  }, [selectedCategory, setValue]);

  const onSubmit = (data: CreateEnquiryFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createEnquiry(data as unknown as CreateEnquiryDTO, {
      onSuccess: () => {
        toast.success("Enquiry created successfully!");
        router.push("/my-enquiries");
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to create enquiry"
        );
      },
    });
  };

  const availableTypes = selectedCategory
    ? CATEGORY_TYPE_MAP[selectedCategory as PropertyCategory] || []
    : [];

  // --- Render Helpers ---

  const renderSizeFields = () => (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="font-medium">Size Requirement</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="size.min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Size</FormLabel>
              <FormControl>
                <NumberInput
                  {...field}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="size.max"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Size</FormLabel>
              <FormControl>
                <NumberInput
                  {...field}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="size.unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[
                    "SQ_FT",
                    "SQ_METER",
                    "SQ_YARDS",
                    "ACRES",
                    "HECTARE",
                    "BIGHA",
                  ].map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Enquiry</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* --- Location --- */}
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        City <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Pune" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="localities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Localities <span className="text-red-500">*</span> (Max
                        10)
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={localityInput}
                              onChange={(e) => setLocalityInput(e.target.value)}
                              placeholder="Add a locality and press Enter or Add"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const val = localityInput.trim();
                                  if (val && !field.value?.includes(val)) {
                                    if ((field.value?.length || 0) >= 10) {
                                      toast.error(
                                        "Maximum 10 localities allowed"
                                      );
                                      return;
                                    }
                                    field.onChange([
                                      ...(field.value || []),
                                      val,
                                    ]);
                                    setLocalityInput("");
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                const val = localityInput.trim();
                                if (val && !field.value?.includes(val)) {
                                  if ((field.value?.length || 0) >= 10) {
                                    toast.error(
                                      "Maximum 10 localities allowed"
                                    );
                                    return;
                                  }
                                  field.onChange([...(field.value || []), val]);
                                  setLocalityInput("");
                                }
                              }}
                              variant="secondary"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(field.value || []).map((loc) => (
                              <Badge
                                key={loc}
                                variant="secondary"
                                className="pl-2 pr-1 py-1"
                              >
                                {loc}
                                <button
                                  type="button"
                                  onClick={() => {
                                    field.onChange(
                                      (field.value || []).filter((l) => l !== loc)
                                    );
                                  }}
                                  className="ml-2 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Category & Type --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="enquiryCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(CATEGORY_TYPE_MAP).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="enquiryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Property Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedCategory}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Budget --- */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-medium">Budget Range</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="budget.min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Budget</FormLabel>
                        <FormControl>
                          <NumberInput
                            {...field}
                          placeholder="Minimum budget is ₹5 lakh"
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="budget.max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Budget</FormLabel>
                        <FormControl>
                          <NumberInput
                            {...field}
                          placeholder="Maximum budget is ₹1000 crore"
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* --- Conditional Fields --- */}

              {/* Size: For Land, Villa, Warehouse, Commercial, Industrial */}
              {([
                "LAND",
                "VILLA",
                "WAREHOUSE",
                "INDUSTRIAL_LAND",
                "AGRICULTURAL_LAND",
                "SHOWROOM",
                "OFFICE_SPACE",
                "OTHER_SPACE",
                "SHOP",
              ].includes(selectedType) ||
                selectedCategory === "COMMERCIAL" ||
                selectedCategory === "INDUSTRIAL") &&
                renderSizeFields()}

              {/* Flat Specifics */}
              {selectedType === "FLAT" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="bhk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BHK</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="1-20"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                parseIntegerWithMax(e.target.value, 20)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="washrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Washrooms</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="1-20"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                parseIntegerWithMax(e.target.value, 20)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="society"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Society</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="preferredFloor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Floor</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Land / Villa Specifics */}
              {(selectedType === "LAND" ||
                selectedType === "VILLA" ||
                selectedType === "INDUSTRIAL_LAND" ||
                selectedType === "AGRICULTURAL_LAND") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="plotType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plot Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Plot Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ROAD">Road</SelectItem>
                              <SelectItem value="CORNER">Corner</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="facing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facing</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Facing" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                "NORTH",
                                "SOUTH",
                                "EAST",
                                "WEST",
                                "NORTH_EAST",
                                "NORTH_WEST",
                                "SOUTH_EAST",
                                "SOUTH_WEST",
                              ].map((f) => (
                                <SelectItem key={f} value={f}>
                                  {f.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="frontRoadWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Front Road Width (ft)</FormLabel>
                          <FormControl>
                            <Input
                        type="text"
                        inputMode="numeric"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            parseIntegerOrUndefined(e.target.value)
                          )
                        }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

              {/* Commercial (Hotel/Hostel) */}
              {(selectedType === "HOTEL" || selectedType === "HOSTEL") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="rooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rooms</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="1-1000"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                parseIntegerWithMax(e.target.value, 1000)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedType === "HOSTEL" && (
                    <FormField
                      control={control}
                      name="beds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beds</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="1-5000"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  parseIntegerWithMax(e.target.value, 5000)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {/* Industrial */}
              {selectedCategory === "INDUSTRIAL" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Manufacturing, Warehousing"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="areaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Area Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NEAR_RING_ROAD">
                              Near Ring Road
                            </SelectItem>
                            <SelectItem value="RIICO_AREA">
                              RIICO Area
                            </SelectItem>
                            <SelectItem value="SEZ">SEZ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* --- Description --- */}
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your requirements in detail..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Enquiry
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEnquiryPage;
