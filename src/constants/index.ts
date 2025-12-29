import { PropertyCategory, PropertyType } from "@/types/property";

// Property Types for filters
export const PROPERTY_TYPES: { label: string; value: PropertyType }[] = [
  { label: "Flat", value: "FLAT" },
  { label: "Villa", value: "VILLA" },
  { label: "Land", value: "LAND" },
  { label: "Showroom", value: "SHOWROOM" },
  { label: "Hotel", value: "HOTEL" },
  { label: "Hostel", value: "HOSTEL" },
  { label: "Shop", value: "SHOP" },
  { label: "Office Space", value: "OFFICE_SPACE" },
  { label: "Other Space", value: "OTHER_SPACE" },
  { label: "Industrial Park", value: "INDUSTRIAL_PARK" },
  { label: "Industrial Land", value: "INDUSTRIAL_LAND" },
  { label: "Warehouse", value: "WAREHOUSE" },
  { label: "Agricultural Land", value: "AGRICULTURAL_LAND" },
  { label: "Resort", value: "RESORT" },
  { label: "Farm House", value: "FARM_HOUSE" },
  { label: "Individual", value: "INDIVIDUAL" },
];

export const propertyCategories: {
  key: PropertyCategory;
  label: string;
  description: string;
  image: string;
}[] = [
  {
    key: "RESIDENTIAL",
    label: "Residential",
    description: "Flats, Villas, and Residential Land",
    image: "/images/propertyCategory/residential.jpg",
  },
  {
    key: "COMMERCIAL",
    label: "Commercial",
    description: "Shops, Offices, Hotels, and Commercial Spaces",
    image: "/images/propertyCategory/commercial.jpg",
  },
  {
    key: "INDUSTRIAL",
    label: "Industrial",
    description: "Industrial Parks, Warehouses, and Industrial Land",
    image: "/images/propertyCategory/industrial.jpg",
  },
  {
    key: "AGRICULTURAL",
    label: "Agricultural",
    description: "Agricultural Land and Farming Properties",
    image: "/images/propertyCategory/agricultural.jpg",
  },
  {
    key: "RESORT",
    label: "Resort",
    description: "Resort Properties and Hospitality Venues",
    image: "/images/propertyCategory/resort.jpg",
  },
  {
    key: "FARM_HOUSE",
    label: "Farm House",
    description: "Farm Houses and Individual Properties",
    image: "/images/propertyCategory/farmhouse.jpg",
  },
];
