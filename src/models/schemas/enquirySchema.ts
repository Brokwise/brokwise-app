
import { z } from "zod";
import { PropertyCategory, PropertyType } from "@/models/types/property";

const BUDGET_MIN = 500000; // ₹5 lakh
const BUDGET_MAX = 10000000000; // ₹1000 crore
const RENT_MIN = 1000; // ₹1,000
const RENT_MAX = 50000000; // ₹5 Crore

// --- Constants ---

export const CATEGORY_TYPE_MAP: Record<PropertyCategory, PropertyType[]> = {
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
      .number()
      .min(BUDGET_MIN, "Minimum budget must be at least ₹5 lakh.")
      .max(BUDGET_MAX, "Budget cannot exceed ₹1000 crore."),
    max: z
      .number()
      .min(BUDGET_MIN, "Maximum budget must be at least ₹5 lakh.")
      .max(BUDGET_MAX, "Budget cannot exceed ₹1000 crore."),
  })
  .refine((data) => data.max >= data.min, {
    message: "Max budget must be greater than or equal to min budget.",
    path: ["max"],
  });

const monthlyRentBudgetSchema = z
  .object({
    min: z
      .number()
      .min(RENT_MIN, "Minimum rent must be at least ₹1,000.")
      .max(RENT_MAX, "Rent cannot exceed ₹5 Crore."),
    max: z
      .number()
      .min(RENT_MIN, "Maximum rent must be at least ₹1,000.")
      .max(RENT_MAX, "Rent cannot exceed ₹5 Crore."),
  })
  .refine((data) => data.max >= data.min, {
    message: "Max rent must be greater than or equal to min rent.",
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
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      if (typeof data.min === "number" && typeof data.max === "number") {
        return data.max >= data.min;
      }
      return true;
    },
    {
      message: "Max income must be greater than or equal to min income",
      path: ["max"],
    }
  );

// Preferred location schema for form
const preferredLocationFormSchema = z.object({
  address: z.string().default(""),
  placeId: z.string().default(""),
  city: z.string().default(""),
  locality: z.string().default(""),
});

export const createEnquirySchema = z
  .object({
    // Internal flags (not sent to API)
    locationMode: z.enum(["search", "manual"]),
    isCompany: z.boolean(),

    enquiryPurpose: z.enum(["BUY", "RENT"]).optional(),

    // Preferred locations (1 required, up to 3)
    preferredLocations: z
      .array(preferredLocationFormSchema)
      .min(1)
      .max(3),

    // Legacy fields kept for backward compat
    address: z.string().optional(),
    addressPlaceId: z.string().optional(),
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
      { message: "Please select a category" }
    ),
    enquiryType: z.string({ message: "Please select a property type" }).min(1, "Please select a property type"),
    budget: budgetRangeSchema.optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description cannot exceed 2000 characters"),

    // Optional Fields
    size: optionalSizeRangeSchema,
    plotType: z.enum(["ROAD", "CORNER"] as [string, ...string[]]).optional(),

    // Corner Property Logic
    isCorner: z.boolean().optional(),
    roadFacingSides: z.coerce.number().min(1).max(4).optional(),
    roadWidths: z.array(z.coerce.number().positive()).optional(),

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
      .number()
      .min(1, "Road width must be at least 1 ft.")
      .max(500, "Road width cannot exceed 500 ft.")
      .optional(),

    // Residential - Flat
    bhk: z.coerce
      .number()
      .int("Bedrooms must be a whole number.")
      .min(1, "Number of bedrooms must be at least 1.")
      .max(20, "Bedrooms cannot exceed 20.")
      .optional(),
    washrooms: z.coerce
      .number()
      .int("Washrooms must be a whole number.")
      .min(1, "Number of washrooms must be at least 1.")
      .max(20, "Washrooms cannot exceed 20.")
      .optional(),
    preferredFloor: z.string().max(20).optional(),
    society: z.string().max(100).optional(),

    // Commercial - Hotel/Hostel
    rooms: z.coerce
      .number()
      .int("Rooms must be a whole number.")
      .min(1, "Number of rooms must be at least 1.")
      .max(1000, "Rooms cannot exceed 1000.")
      .optional(),
    beds: z.coerce
      .number()
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
    urgent: z.boolean().optional(),

    // Rental-specific fields
    monthlyRentBudget: monthlyRentBudgetSchema.optional(),
    possessionType: z.enum(["IMMEDIATE", "SPECIFIC_DATE"] as [string, ...string[]]).optional(),
    possessionDate: z.union([z.string(), z.date()]).optional(),
    tenantDetails: z.enum(
      ["FAMILY", "BACHELORS_MEN", "BACHELORS_WOMEN", "COMPANY_LEASE"] as [string, ...string[]]
    ).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate preferred locations
    const locations = data.preferredLocations ?? [];
    if (locations.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["preferredLocations"],
        message: "At least one preferred location is required",
      });
    } else {
      // First location is mandatory
      const first = locations[0];
      if (!first?.address || first.address.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["preferredLocations", 0, "address"],
          message: "Please select a location",
        });
      }
      if (data.locationMode === "search" && (!first?.placeId || !first.placeId.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["preferredLocations", 0, "placeId"],
          message: "Please select an address from suggestions",
        });
      }
      // Validate optional locations (only if they have content)
      for (let i = 1; i < locations.length; i++) {
        const loc = locations[i];
        if (loc?.address && loc.address.trim().length > 0 && loc.address.trim().length < 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["preferredLocations", i, "address"],
            message: "Location address must be at least 3 characters",
          });
        }
      }
    }

    // Company-specific location requirements
    if (data.isCompany) {
      if (!data.city || data.city.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["city"],
          message: "City is required",
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

    // Corner Property Validation
    if (data.isCorner) {
      if (!data.roadFacingSides || data.roadFacingSides < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["roadFacingSides"],
          message: "Please specify number of road facing sides",
        });
      }
    }

    // Industrial requires purpose
    if (category === "INDUSTRIAL") {
      if (!data.purpose || data.purpose.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["purpose"],
          message: "Purpose is required for Industrial enquiries (min 5 characters)",
        });
      }
    }

    // Rental-specific validations
    const purpose = data.enquiryPurpose || "BUY";

    if (purpose === "RENT") {
      if (category && !["RESIDENTIAL", "COMMERCIAL"].includes(category)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["enquiryCategory"],
          message: "Rental enquiries are only allowed for Residential and Commercial categories",
        });
      }

      if (!data.monthlyRentBudget || !data.monthlyRentBudget.min || !data.monthlyRentBudget.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["monthlyRentBudget"],
          message: "Monthly rent budget is required for rental enquiries",
        });
      }

      if (data.possessionType === "SPECIFIC_DATE" && !data.possessionDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["possessionDate"],
          message: "Possession date is required when type is Specific Date",
        });
      }
    }

    if (purpose === "BUY") {
      if (!data.budget || !data.budget.min || !data.budget.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["budget"],
          message: "Budget is required for buy enquiries",
        });
      }
    }

  });

export type CreateEnquiryFormValues = z.infer<typeof createEnquirySchema>;

export { BUDGET_MIN, BUDGET_MAX, RENT_MIN, RENT_MAX };
