import { z } from "zod";
import {
  PropertyCategory,
  PropertyType,
  SizeUnit,
  PlotType,
  Facing,
  AreaType,
  ListingStatus,
  PossessionStatus,
} from "@/types/property";

// Base schema with common fields
const basePropertySchema = z.object({
  address: z.string().min(1, "Address is required"),
  rate: z.number().min(1, "Rate must be greater than 0"),
  totalPrice: z.number().min(1, "Total price must be greater than 0"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  isPriceNegotiable: z.boolean(),
  isFeatured: z.boolean(),
});

// Common optional fields
const commonOptionalSchema = z.object({
  size: z.number().min(1).optional(),
  sizeUnit: z
    .enum(["SQ_FT", "SQ_METER", "SQ_YARDS", "ACRES", "HECTARE", "BIGHA"])
    .optional(),
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
    ])
    .optional(),
  plotType: z.enum(["ROAD", "CORNER"]).optional(),
  frontRoadWidth: z.number().min(1).max(300).optional(),
  sideFacing: z.enum(["NORTH", "SOUTH", "EAST", "WEST"]).optional(),
  sideRoadWidth: z.number().min(1).max(300).optional(),
  localities: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  propertyStatus: z.string().optional(),
});

// Residential Property Schema
export const residentialPropertySchema = basePropertySchema
  .merge(commonOptionalSchema)
  .extend({
    propertyCategory: z.literal("RESIDENTIAL"),
    propertyType: z.enum(["FLAT", "VILLA", "LAND"]),
    // Flat specific fields
    isPenthouse: z.boolean().optional(),
    bhk: z.number().min(1).max(10).optional(),
    washrooms: z.number().min(1).max(20).optional(),
    society: z.string().optional(),
    projectArea: z.number().min(1).optional(),
    possessionDate: z.date().optional(),
    floor: z.string().optional(),
  });

// Commercial Property Schema
export const commercialPropertySchema = basePropertySchema
  .merge(commonOptionalSchema)
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
    rentalIncome: z
      .object({
        min: z.number().min(0),
        max: z.number().min(0),
      })
      .optional(),
    // Hotel specific
    rooms: z.number().min(1).optional(),
    // Hostel specific
    beds: z.number().min(1).optional(),
    // Other space specific
    projectArea: z.number().min(1).optional(),
    purpose: z.string().optional(),
  });

// Industrial Property Schema
export const industrialPropertySchema = basePropertySchema
  .merge(commonOptionalSchema)
  .extend({
    propertyCategory: z.literal("INDUSTRIAL"),
    propertyType: z.enum(["INDUSTRIAL_PARK", "INDUSTRIAL_LAND", "WAREHOUSE"]),
    purpose: z.string().optional(),
    areaType: z.enum(["NEAR_RING_ROAD", "RIICO_AREA", "SEZ"]).optional(),
    jamabandiUrl: z.string().url().optional(),
    khasraPlanUrl: z.string().url().optional(),
  });

// Agricultural Property Schema
export const agriculturalPropertySchema = basePropertySchema
  .merge(commonOptionalSchema)
  .extend({
    propertyCategory: z.literal("AGRICULTURAL"),
    propertyType: z.literal("AGRICULTURAL_LAND"),
    propertyTitle: z.string().optional(),
    jamabandiUrl: z.string().url().optional(),
    khasraPlanUrl: z.string().url().optional(),
  });

// Resort Property Schema
export const resortPropertySchema = basePropertySchema
  .merge(commonOptionalSchema)
  .extend({
    propertyCategory: z.literal("RESORT"),
    propertyType: z.literal("RESORT"),
    propertyStatus: z.string().optional(),
  });

// Farm House Property Schema
export const farmHousePropertySchema = basePropertySchema
  .merge(commonOptionalSchema)
  .extend({
    propertyCategory: z.literal("FARM_HOUSE"),
    propertyType: z.enum(["FARM_HOUSE", "INDIVIDUAL"]),
    propertyStatus: z.string().optional(),
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
