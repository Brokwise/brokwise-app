"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AddressAutocomplete,
  type AddressSuggestion,
} from "@/components/ui/address-autocomplete";
import { Slider } from "@/components/ui/slider";
import { useCreateEnquiry } from "@/hooks/useEnquiry";
import { useCreateCompanyEnquiry } from "@/hooks/useCompany";
import { PropertyCategory, PropertyType } from "@/models/types/property";
import { CreateEnquiryDTO } from "@/models/types/enquiry";
import {
  parseIntegerOrUndefined,
  parseIntegerWithMax,
  sanitizeIntegerInput,
} from "@/utils/helper";
import { useApp } from "@/context/AppContext";

const BUDGET_MIN = 500000; // ₹5 lakh
const BUDGET_MAX = 10000000000; // ₹1000 crore

// Discrete steps so the slider is usable across a huge range.
const BUDGET_OPTIONS: number[] = [
  // Lakhs
  500000, 1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000,
  6000000, 7500000, 9000000,
  // Crores
  10000000, 12500000, 15000000, 17500000, 20000000, 25000000, 30000000,
  40000000, 50000000, 60000000, 75000000, 100000000, 125000000, 150000000,
  200000000, 250000000, 300000000, 400000000, 500000000, 600000000, 750000000,
  1000000000, 1250000000, 1500000000, 2000000000, 2500000000, 3000000000,
  4000000000, 5000000000, 6000000000, 7500000000, 10000000000,
];

const formatBudgetLabel = (amount: number) => {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    const crText = Number.isInteger(cr)
      ? String(cr)
      : cr < 10
      ? cr.toFixed(2)
      : cr.toFixed(1);
    return `₹${crText}Cr`;
  }
  const l = amount / 100000;
  const lText = Number.isInteger(l) ? String(l) : l.toFixed(1);
  return `₹${lText}L`;
};

const clampText = (value: string, maxLen: number) =>
  value.length > maxLen ? value.slice(0, maxLen) : value;

const deriveCityAndLocalities = (item: AddressSuggestion): {
  city: string;
  localities: string[];
} => {
  const ctx = item.context ?? [];
  const pickCtx = (prefixes: string[]) =>
    ctx.find((c) => prefixes.some((p) => c.id.startsWith(p)))?.text?.trim() ??
    "";

  const parts = item.place_name
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const cityFromCtx = pickCtx(["place"]);
  const localityFromCtx = pickCtx(["locality", "neighborhood"]);

  // Mapbox place_name usually ends with: "... , City(place), State(region), Country"
  const fallbackCity =
    (parts.length >= 3 ? parts[parts.length - 3] : "") || parts[1] || parts[0] || "";
  const fallbackLocality = (parts.length >= 4 ? parts[parts.length - 4] : "") || "";

  const cityRaw = cityFromCtx || fallbackCity;
  const localityRaw = localityFromCtx || fallbackLocality || cityRaw;

  const city = clampText(cityRaw || "Unknown", 50);
  const localities = [clampText(localityRaw || city, 100)];

  return { city, localities };
};

const findNearestBudgetIndex = (value: number) => {
  const exact = BUDGET_OPTIONS.indexOf(value);
  if (exact !== -1) return exact;
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < BUDGET_OPTIONS.length; i++) {
    const diff = Math.abs(BUDGET_OPTIONS[i] - value);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
};

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
  INDUSTRIAL: ["INDUSTRIAL_PARK", "INDUSTRIAL_LAND", "WAREHOUSE"],
  AGRICULTURAL: ["AGRICULTURAL_LAND"],
  RESORT: ["RESORT"],
  FARM_HOUSE: ["FARM_HOUSE", "INDIVIDUAL"],
};

const budgetRangeSchema = z
  .object({
    min: z
      .number({
        error: "Please enter a valid minimum budget.",
      })
      .min(500000, "Minimum budget must be at least ₹5 lakh.")
      .max(BUDGET_MAX, "Budget cannot exceed ₹1000 crore."),
    max: z
      .number({
        error: "Please enter a valid maximum budget.",
      })
      .min(500000, "Maximum budget must be at least ₹5 lakh.")
      .max(BUDGET_MAX, "Budget cannot exceed ₹1000 crore."),
  })
  .refine((data) => data.max >= data.min, {
    message: "Max budget must be greater than or equal to min budget.",
    path: ["max"],
  });

const sizeRangeSchema = z
  .object({
    min: z.number().min(1, "Minimum size must be at least 1"),
    max: z.number().min(1, "Maximum size must be at least 1"),
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

// react-hook-form can materialize nested objects for registered fields even when "empty".
// Treat an empty size object as undefined so the form doesn't become invalid unexpectedly.
const optionalSizeRangeSchema = z.preprocess((val) => {
  if (!val || typeof val !== "object") return undefined;
  const v = val as Record<string, unknown>;
  const min = v.min as unknown;
  const max = v.max as unknown;
  const unit = v.unit as unknown;

  const isEmpty =
    (min === undefined || min === null || min === 0 || min === "") &&
    (max === undefined || max === null || max === 0 || max === "") &&
    (unit === undefined || unit === null || unit === "");

  return isEmpty ? undefined : val;
}, sizeRangeSchema.optional());

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
  // Internal flags (not sent to API)
  locationMode: z.enum(["search", "manual"]),
  isCompany: z.boolean(),

  address: z.string().min(3, "Address is required"),
  addressPlaceId: z.string().optional(),

  // Company endpoint requires these; brokers can submit without them.
  city: z.string().max(50, "City is too long").optional(),
  localities: z.array(z.string().min(2).max(100)).max(10).optional(),
  enquiryCategory: z.enum(
    [
      "RESIDENTIAL",
      "COMMERCIAL",
      "INDUSTRIAL",
      "AGRICULTURAL",
      "RESORT",
      "FARM_HOUSE",
    ] as [string, ...string[]],
    { error: "Please select a valid category" }
  ),
  enquiryType: z.string().min(1, "Property Type is required"), // Narrowed down in UI based on Category
  budget: budgetRangeSchema,
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),

  // Optional Fields
  size: optionalSizeRangeSchema,
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
  frontRoadWidth: z.coerce
    .number({
      error: "Please enter a valid road width.",
    })
    .min(1, "Road width must be at least 1 ft.")
    .max(500, "Road width cannot exceed 500 ft.")
    .optional(),

  // Residential - Flat
  bhk: z.coerce
    .number({
      error: "Please enter a valid number of bedrooms.",
    })
    .int("Bedrooms must be a whole number.")
    .min(1, "Number of bedrooms must be at least 1.")
    .max(20, "Bedrooms cannot exceed 20.")
    .optional(),
  washrooms: z.coerce
    .number({
      error: "Please enter a valid number of washrooms.",
    })
    .int("Washrooms must be a whole number.")
    .min(1, "Number of washrooms must be at least 1.")
    .max(20, "Washrooms cannot exceed 20.")
    .optional(),
  preferredFloor: z.string().max(20).optional(),
  society: z.string().max(100).optional(),

  // Commercial - Hotel/Hostel
  rooms: z.coerce
    .number({
      error: "Please enter a valid number of rooms.",
    })
    .int("Rooms must be a whole number.")
    .min(1, "Number of rooms must be at least 1.")
    .max(1000, "Rooms cannot exceed 1000.")
    .optional(),
  beds: z.coerce
    .number({
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
}).superRefine((data, ctx) => {
  // Location requirements
  if (data.locationMode === "search") {
    if (!data.addressPlaceId || !data.addressPlaceId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["addressPlaceId"],
        message: "Please select an address from suggestions",
      });
    }
  }

  if (data.isCompany) {
    if (!data.city || data.city.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["city"],
        message: "City is required",
      });
    }

    const locs = Array.isArray(data.localities)
      ? data.localities
          .map((l) => l.trim())
          .filter((l) => l.length >= 2)
      : [];

    if (locs.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["localities"],
        message: "At least one locality is required",
      });
    }
  }

  // Category ↔ Type compatibility
  const category = data.enquiryCategory as PropertyCategory | undefined;
  const type = data.enquiryType as PropertyType | string | undefined;

  if (category && type) {
    const validTypes = CATEGORY_TYPE_MAP[category] || [];
    if (!validTypes.includes(type as PropertyType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["enquiryType"],
        message: "Enquiry type does not match the selected category",
      });
    }
  }

  // Backend parity: required fields per type/category
  if (category === "RESIDENTIAL" && type === "FLAT") {
    if (
      typeof data.bhk !== "number" ||
      Number.isNaN(data.bhk) ||
      data.bhk < 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bhk"],
        message: "BHK is required for Flat enquiries",
      });
    }
  }

  if (category === "COMMERCIAL" && type === "HOTEL") {
    if (
      typeof data.rooms !== "number" ||
      Number.isNaN(data.rooms) ||
      data.rooms < 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rooms"],
        message: "Number of rooms is required for Hotel enquiries",
      });
    }
  }

  if (category === "COMMERCIAL" && type === "HOSTEL") {
    if (
      typeof data.beds !== "number" ||
      Number.isNaN(data.beds) ||
      data.beds < 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["beds"],
        message: "Number of beds is required for Hostel enquiries",
      });
    }
  }

  const typesRequiringSize = new Set<string>([
    "LAND",
    "VILLA",
    "WAREHOUSE",
    "INDUSTRIAL_LAND",
    "AGRICULTURAL_LAND",
    "SHOWROOM",
    "SHOP",
    "OFFICE_SPACE",
  ]);

  if (type && typesRequiringSize.has(String(type)) && !data.size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["size"],
      message: "Size range is required for this enquiry type",
    });
  }

  if (category === "INDUSTRIAL") {
    const p = (data.purpose ?? "").toString().trim();
    if (p.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["purpose"],
        message: "Purpose is required for Industrial enquiries (min 5 chars)",
      });
    }
  }
});

type CreateEnquiryFormValues = z.infer<typeof createEnquirySchema>;

const CreateEnquiryPage = () => {
  const router = useRouter();
  const { companyData } = useApp();
  const { createEnquiry, isPending: isBrokerPending } = useCreateEnquiry();
  const { createEnquiry: createCompanyEnquiry, isPending: isCompanyPending } =
    useCreateCompanyEnquiry();

  const isPending = companyData ? isCompanyPending : isBrokerPending;

  const form = useForm<CreateEnquiryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createEnquirySchema) as any,
    mode: "onChange",
    defaultValues: {
      locationMode: "search",
      isCompany: false,
      address: "",
      addressPlaceId: "",
      city: "",
      localities: [],
      budget: { min: BUDGET_MIN, max: BUDGET_MAX },
      description: "",
    },
  });

  const { watch, setValue, control, trigger, register } = form;
  const locationMode = watch("locationMode");
  const selectedCategory = watch("enquiryCategory");
  const selectedType = watch("enquiryType");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("enquiryType", "" as any, { shouldValidate: true, shouldDirty: true });

    // Clear type-specific fields when category changes to avoid stale values failing backend rules.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("size", undefined as any, { shouldValidate: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("plotType", undefined as any, { shouldValidate: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("facing", undefined as any, { shouldValidate: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("frontRoadWidth", undefined as any, { shouldValidate: true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("bhk", undefined as any, { shouldValidate: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("washrooms", undefined as any, { shouldValidate: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("preferredFloor", undefined as any, { shouldValidate: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("society", undefined as any, { shouldValidate: true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("rooms", undefined as any, { shouldValidate: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("beds", undefined as any, { shouldValidate: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("rentalIncome", undefined as any, { shouldValidate: true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("purpose", undefined as any, { shouldValidate: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("areaType", undefined as any, { shouldValidate: true });
  }, [selectedCategory, setValue]);

  useEffect(() => {
    setValue("isCompany", !!companyData, { shouldValidate: true });
  }, [companyData, setValue]);

  const onSubmit = (data: CreateEnquiryFormValues) => {
    // We only send the final address string today; placeId is used to enforce "selected from suggestions"
    // and can be stored later if backend supports it.
    const payload: Record<string, unknown> = { ...(data as unknown as Record<string, unknown>) };
    delete payload.addressPlaceId;
    delete payload.locationMode;
    delete payload.isCompany;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalPayload = payload as unknown as CreateEnquiryDTO;

    if (companyData) {
      createCompanyEnquiry(finalPayload, {
        onSuccess: () => {
          toast.success("Enquiry created successfully!");
          form.reset();
          router.replace("/enquiries/create/success");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to create enquiry"
          );
        },
      });
    } else {
      createEnquiry(finalPayload, {
        onSuccess: () => {
          toast.success("Enquiry created successfully!");
          form.reset();
          router.replace("/enquiries/create/success");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to create enquiry"
          );
        },
      });
    }
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
                <NumberInput {...field} onChange={field.onChange} />
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
                <NumberInput {...field} onChange={field.onChange} />
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
              {/* Internal form flags for conditional validation */}
              <input type="hidden" {...register("locationMode")} />
              <input type="hidden" {...register("isCompany")} />

              {/* --- Location --- */}
              <div className="space-y-4">
                {locationMode === "search" ? (
                  <FormField
                    control={control}
                    name="addressPlaceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <AddressAutocomplete
                            valueLabel={watch("address")}
                            valueId={field.value ?? ""}
                            disabled={isPending}
                            onSearchError={(msg) => {
                              toast.error(msg);
                              setValue("locationMode", "manual", {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              setValue("addressPlaceId", "", {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                            onSelect={(item) => {
                              const derived = deriveCityAndLocalities(item);
                              setValue("address", item.place_name, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              setValue("city", derived.city, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              setValue("localities", derived.localities, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              field.onChange(item.id);
                            }}
                            onClear={() => {
                              setValue("address", "", {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              setValue("city", "", {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              setValue("localities", [], {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              field.onChange("");
                            }}
                          />
                        </FormControl>
                        <div className="flex justify-end pt-1">
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs"
                            onClick={() => {
                              setValue("locationMode", "manual", {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              setValue("addressPlaceId", "", {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                          >
                            Enter address manually
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter full address…"
                            className="min-h-[90px]"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-end pt-1">
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs"
                            onClick={() => {
                              setValue("locationMode", "search", {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                          >
                            Use address search
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {companyData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            City <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Jaipur"
                              disabled={isPending}
                              {...field}
                            />
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
                            Localities <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Comma-separated (max 10)"
                              disabled={isPending}
                              value={(field.value || []).join(", ")}
                              onChange={(e) => {
                                const next = e.target.value
                                  .split(",")
                                  .map((p) => p.trim())
                                  .filter(Boolean)
                                  .slice(0, 10);
                                field.onChange(next);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
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
                {(() => {
                  const currentMin = watch("budget.min");
                  const currentMax = watch("budget.max");
                  const minIdx = findNearestBudgetIndex(currentMin);
                  const maxIdx = findNearestBudgetIndex(currentMax);
                  const safeMinIdx = Math.min(minIdx, maxIdx);
                  const safeMaxIdx = Math.max(minIdx, maxIdx);

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Min Budget
                          </p>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Min (₹5L)"
                            value={String(currentMin ?? BUDGET_MIN)}
                            onChange={(e) => {
                              const raw = sanitizeIntegerInput(e.target.value);
                              if (raw === "") return;
                              // Allow typing freely; clamp/fix on blur.
                              const nextMin = Math.min(Number(raw), BUDGET_MAX);
                              setValue("budget.min", nextMin, {
                                shouldDirty: true,
                                shouldValidate: false,
                              });
                            }}
                            onBlur={() => {
                              const minVal = watch("budget.min");
                              const maxVal = watch("budget.max");
                              const clampedMin = Math.max(
                                BUDGET_MIN,
                                Math.min(minVal ?? BUDGET_MIN, BUDGET_MAX)
                              );
                              const clampedMax = Math.max(
                                clampedMin,
                                Math.min(maxVal ?? clampedMin, BUDGET_MAX)
                              );
                              setValue("budget.min", clampedMin, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              setValue("budget.max", clampedMax, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              void trigger(["budget.min", "budget.max"]);
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Max Budget
                          </p>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Max (₹1000Cr)"
                            value={String(currentMax ?? BUDGET_MAX)}
                            onChange={(e) => {
                              const raw = sanitizeIntegerInput(e.target.value);
                              if (raw === "") return;
                              // Allow typing freely; clamp/fix on blur.
                              const nextMax = Math.min(Number(raw), BUDGET_MAX);
                              setValue("budget.max", nextMax, {
                                shouldDirty: true,
                                shouldValidate: false,
                              });
                            }}
                            onBlur={() => {
                              const minVal = watch("budget.min");
                              const maxVal = watch("budget.max");
                              const clampedMin = Math.max(
                                BUDGET_MIN,
                                Math.min(minVal ?? BUDGET_MIN, BUDGET_MAX)
                              );
                              const clampedMax = Math.max(
                                clampedMin,
                                Math.min(maxVal ?? clampedMin, BUDGET_MAX)
                              );
                              setValue("budget.min", clampedMin, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              setValue("budget.max", clampedMax, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              void trigger(["budget.min", "budget.max"]);
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="rounded-md bg-muted px-2 py-1 font-medium">
                            {formatBudgetLabel(currentMin ?? BUDGET_MIN)}
                          </span>
                          <span className="rounded-md bg-muted px-2 py-1 font-medium">
                            {formatBudgetLabel(currentMax ?? BUDGET_MAX)}
                          </span>
                        </div>

                        <Slider
                          value={[safeMinIdx, safeMaxIdx]}
                          min={0}
                          max={BUDGET_OPTIONS.length - 1}
                          step={1}
                          onValueChange={(vals) => {
                            const a = vals?.[0] ?? 0;
                            const b = vals?.[1] ?? 0;
                            const nextMinIdx = Math.min(a, b);
                            const nextMaxIdx = Math.max(a, b);
                            const nextMin = BUDGET_OPTIONS[nextMinIdx];
                            const nextMax = BUDGET_OPTIONS[nextMaxIdx];
                            setValue("budget.min", nextMin, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                            setValue("budget.max", nextMax, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                          onValueCommit={() =>
                            void trigger(["budget.min", "budget.max"])
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={control}
                          name="budget.min"
                          render={() => (
                            <FormItem>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="budget.max"
                          render={() => (
                            <FormItem>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  );
                })()}
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

              <Button
                type="button"
                className="w-full"
                disabled={isPending}
                onClick={async () => {
                  const valid = await trigger();
                  if (!valid) {
                    toast.error("Please fill in all required fields.");
                    return;
                  }
                  form.handleSubmit(onSubmit)();
                }}
              >
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
