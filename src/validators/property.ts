import { z } from "zod";

export const PROPERTY_VALIDATION_LIMITS = {
  PINCODE_LENGTH: 6,
  MAX_FLOOR: 20,
  MAX_FRONT_ROAD_WIDTH: 300,
} as const;

const geoLocationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

const rentalIncomeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0),
  })
  .refine((data) => data.max >= data.min, {
    message: "Maximum rental income must be >= minimum",
    path: ["max"],
  });

const SizeUnitEnum = z.enum([
  "SQ_FT",
  "SQ_METER",
  "SQ_YARDS",
  "ACRES",
  "HECTARE",
  "BIGHA",
  "GAJ",
]);

const FacingEnum = z.enum([
  "NORTH",
  "SOUTH",
  "EAST",
  "WEST",
  "NORTH_EAST",
  "NORTH_WEST",
  "SOUTH_EAST",
  "SOUTH_WEST",
]);

const PlotTypeEnum = z.enum(["ROAD", "CORNER"]);

const RoadWidthUnitEnum = z.enum(["METER", "FEET"]);

const AreaTypeEnum = z.enum(["NEAR_RING_ROAD", "RIICO_AREA", "SEZ"]);

const addressSchema = z.object({
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  pincode: z
    .string()
    .length(6, "Pincode must be 6 digits")
    .regex(/^\d+$/, "Pincode must be numeric"),
});

// Base fields required for all properties
const basePropertySchema = z.object({
  _id: z.string().optional(),
  address: addressSchema,
  rate: z.number().min(0, "Rate must be >= 0"),
  totalPrice: z.number().min(0, "Total price must be >= 0"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: geoLocationSchema,
  featuredMedia: z.string().url("Featured media must be a valid URL"),
  images: z.array(z.string().url()).optional(),

  // Required common fields
  floorPlans: z
    .array(z.string().url())
    .min(1, "At least one layout plan/site plan/map is mandatory"),
  isFeatured: z.boolean().optional(),
  isPriceNegotiable: z.boolean().optional(),
  size: z.number().min(0).optional(),
  sizeUnit: SizeUnitEnum.optional(),
  amenities: z.array(z.string()).optional(),
});

// Residential Property Schema
export const residentialPropertySchema = basePropertySchema
  .extend({
    propertyCategory: z.literal("RESIDENTIAL"),
    propertyType: z.enum(["FLAT", "VILLA", "LAND"]),

    // Flat specific
    isPenthouse: z.boolean().optional(),
    bhk: z
      .number({
        error: "Please enter a valid number of bedrooms.",
      })
      .int("Bedrooms must be a whole number.")
      .min(1, "Number of bedrooms must be at least 1.")
      .max(20, "Bedrooms cannot exceed 20.")
      .optional(),
    washrooms: z
      .number({
        error: "Please enter a valid number of washrooms.",
      })
      .int("Washrooms must be a whole number.")
      .min(1, "Number of washrooms must be at least 1.")
      .max(20, "Washrooms cannot exceed 20.")
      .optional(),
    society: z.string().optional(),
    projectArea: z.number().min(0).optional(),
    possessionDate: z.union([z.string(), z.date()]).optional(),

    // Villa/Land specific
    facing: FacingEnum.optional(),
    plotType: PlotTypeEnum.optional(),
    frontRoadWidth: z
      .number()
      .min(0)
      .max(
        PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH,
        `Front road width cannot exceed ${PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH}`
      )
      .optional(),
    roadWidthUnit: RoadWidthUnitEnum.optional(),

    sideFacing: FacingEnum.optional(),
    sideRoadWidth: z.number().min(0).optional(),

    floor: z
      .string()
      .refine(
        (val) => {
          if (!val) return true;
          const numericVal = parseInt(val, 10);
          if (isNaN(numericVal)) return true;
          return (
            numericVal >= 0 &&
            numericVal <= PROPERTY_VALIDATION_LIMITS.MAX_FLOOR
          );
        },
        {
          message: `Floor number cannot exceed ${PROPERTY_VALIDATION_LIMITS.MAX_FLOOR}`,
        }
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.propertyType === "FLAT") {
        return !!data.bhk;
      }
      return true;
    },
    {
      message: "BHK is required for residential flats",
      path: ["bhk"],
    }
  )
  .refine((data) => {
    if (data.propertyType === "FLAT" || data.propertyType === "VILLA") {
      // Check for industrial fields if needed, but type enforcement handles most.
      return true;
    }
    return true;
  });

// Commercial Property Schema
export const commercialPropertySchema = basePropertySchema
  .extend({
    propertyCategory: z.literal("COMMERCIAL"),
    propertyType: z.enum([
      "SHOWROOM",
      "HOTEL",
      "HOSTEL",
      "SHOP",
      "OFFICE_SPACE",
      "OTHER_SPACE",
    ]),
    floor: z.string().optional(),
    rentalIncome: rentalIncomeSchema.optional(),
    rooms: z
      .number({
        error: "Please enter a valid number of rooms.",
      })
      .int("Rooms must be a whole number.")
      .min(1, "Number of rooms must be at least 1.")
      .max(1000, "Rooms cannot exceed 1000.")
      .optional(),
    beds: z
      .number({
        error: "Please enter a valid number of beds.",
      })
      .int("Beds must be a whole number.")
      .min(1, "Number of beds must be at least 1.")
      .max(5000, "Beds cannot exceed 5000.")
      .optional(),
    facing: FacingEnum.optional(),
    plotType: PlotTypeEnum.optional(),
    frontRoadWidth: z
      .number()
      .min(0)
      .max(
        PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH,
        `Front road width cannot exceed ${PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH}`
      )
      .optional(),
    roadWidthUnit: RoadWidthUnitEnum.optional(),
    // Fields used in form:
    purpose: z.string().optional(),
    projectArea: z.number().min(0).optional(),
    propertyStatus: z.string().optional(),
    sideFacing: FacingEnum.optional(),
    sideRoadWidth: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.propertyType === "HOTEL") return !!data.rooms;
      return true;
    },
    {
      message: "Number of rooms is required for hotels",
      path: ["rooms"],
    }
  )
  .refine(
    (data) => {
      if (data.propertyType === "HOSTEL") return !!data.beds;
      return true;
    },
    {
      message: "Number of beds is required for hostels",
      path: ["beds"],
    }
  );

// Industrial Property Schema
export const industrialPropertySchema = basePropertySchema.extend({
  propertyCategory: z.literal("INDUSTRIAL"),
  propertyType: z.enum(["INDUSTRIAL_PARK", "INDUSTRIAL_LAND", "WAREHOUSE"]),
  purpose: z.string().optional(),
  areaType: AreaTypeEnum.optional(),
  jamabandiUrl: z.string().url().optional(),
  khasraPlanUrl: z.string().url().optional(),
  // Fields used in form:
  facing: FacingEnum.optional(),
  plotType: PlotTypeEnum.optional(),
  frontRoadWidth: z
    .number()
    .min(0)
    .max(
      PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH,
      `Front road width cannot exceed ${PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH}`
    )
    .optional(),
  roadWidthUnit: RoadWidthUnitEnum.optional(),
});

// Agricultural Property Schema
export const agriculturalPropertySchema = basePropertySchema.extend({
  propertyCategory: z.literal("AGRICULTURAL"),
  propertyType: z.literal("AGRICULTURAL_LAND"),
  propertyTitle: z.string().optional(),
  jamabandiUrl: z.string().url().optional(),
  khasraPlanUrl: z.string().url().optional(),
  facing: FacingEnum.optional(),
  plotType: PlotTypeEnum.optional(),
  frontRoadWidth: z
    .number()
    .min(0)
    .max(
      PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH,
      `Front road width cannot exceed ${PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH}`
    )
    .optional(),
  roadWidthUnit: RoadWidthUnitEnum.optional(),
});

// Resort Property Schema
export const resortPropertySchema = basePropertySchema.extend({
  propertyCategory: z.literal("RESORT"),
  propertyType: z.literal("RESORT"),
  propertyStatus: z.string().optional(),
  facing: FacingEnum.optional(),
  plotType: PlotTypeEnum.optional(),
  frontRoadWidth: z
    .number()
    .min(0)
    .max(
      PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH,
      `Front road width cannot exceed ${PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH}`
    )
    .optional(),
  roadWidthUnit: RoadWidthUnitEnum.optional(),
});

// Farm House Property Schema
export const farmHousePropertySchema = basePropertySchema.extend({
  propertyCategory: z.literal("FARM_HOUSE"),
  propertyType: z.enum(["FARM_HOUSE", "INDIVIDUAL"]),
  propertyStatus: z.string().optional(),
  facing: FacingEnum.optional(),
  plotType: PlotTypeEnum.optional(),
  frontRoadWidth: z
    .number()
    .min(0)
    .max(
      PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH,
      `Front road width cannot exceed ${PROPERTY_VALIDATION_LIMITS.MAX_FRONT_ROAD_WIDTH}`
    )
    .optional(),
  roadWidthUnit: RoadWidthUnitEnum.optional(),
});

// Union type for all property schemas
export const propertySchema = z.discriminatedUnion("propertyCategory", [
  residentialPropertySchema,
  commercialPropertySchema,
  industrialPropertySchema,
  agriculturalPropertySchema,
  resortPropertySchema,
  farmHousePropertySchema,
]);

// Type inference
export type ResidentialPropertyFormData = z.infer<
  typeof residentialPropertySchema
>;
export type CommercialPropertyFormData = z.infer<
  typeof commercialPropertySchema
>;
export type IndustrialPropertyFormData = z.infer<
  typeof industrialPropertySchema
>;
export type AgriculturalPropertyFormData = z.infer<
  typeof agriculturalPropertySchema
>;
export type ResortPropertyFormData = z.infer<typeof resortPropertySchema>;
export type FarmHousePropertyFormData = z.infer<typeof farmHousePropertySchema>;
export type PropertyFormData = z.infer<typeof propertySchema>;

// Property category selection schema
export const propertyCategorySchema = z.object({
  propertyCategory: z.enum([
    "RESIDENTIAL",
    "COMMERCIAL",
    "INDUSTRIAL",
    "AGRICULTURAL",
    "RESORT",
    "FARM_HOUSE",
  ]),
});

export type PropertyCategoryFormData = z.infer<typeof propertyCategorySchema>;
