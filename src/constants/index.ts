import { PropertyCategory, PropertyType } from "@/types/property";
import {
  Wind,
  Bath,
  Archive,
  Fan,
  Snowflake,
  Coffee,
  CarFront,
  Users,
  Video,
  Utensils,
  BatteryCharging,
  Shield,
  Sofa,
  Waves,
  Gamepad2,
  Martini,
  Armchair,
  Bell,
  Dumbbell,
  Film,
  Droplets,
  Flower2,
  ShieldCheck,
  Sun,
  Wifi,
  User,
  Dog,
  Flame,
} from "lucide-react";
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

export const FLAT_AMENITIES = [
  { label: "Balcony", icon: Wind },
  { label: "Attached Washroom", icon: Bath },
  { label: "Cupboard", icon: Archive },
  { label: "Desert Cooler", icon: Fan },
  { label: "Air Conditioning", icon: Snowflake },
  { label: "Cafeteria", icon: Coffee },
  { label: "Car Parking", icon: CarFront },
  { label: "Club House", icon: Users },
  { label: "High Security (CCTV)", icon: Video },
  { label: "Modular Kitchen", icon: Utensils },
  { label: "Power Backup", icon: BatteryCharging },
  { label: "Security Guard", icon: Shield },
  { label: "Semi Furnished", icon: Sofa },
  { label: "Swimming Pool", icon: Waves },
  { label: "Wooden Wardroom", icon: Archive },
  { label: "Children Play Area", icon: Gamepad2 },
  { label: "CLUB & LOUNGE", icon: Martini },
  { label: "Fully Furnished", icon: Armchair },
  { label: "Fire Alarm System", icon: Bell },
  { label: "Gym", icon: Dumbbell },
  { label: "MULTIPLEX", icon: Film },
  { label: "Rain Water Harvesting", icon: Droplets },
];

export const VILLA_AMENITIES = [
  { label: "Private Swimming Pool", icon: Waves },
  { label: "Garden Lawn", icon: Flower2 },
  { label: "Private Parking", icon: CarFront },
  { label: "Fully Equipped Kitchen", icon: Utensils },
  { label: "Barbecue Area", icon: Flame }, // Flame/FirePit
  { label: "Security System", icon: ShieldCheck },
  { label: "Terrace Balcony", icon: Sun },
  { label: "Furnished Interiors", icon: Sofa },
  { label: "Air Conditioning", icon: Snowflake },
  { label: "Wi Fi", icon: Wifi },
  { label: "Power Backup", icon: BatteryCharging },
  { label: "Staff Quarters", icon: User },
  { label: "Pet Friendly", icon: Dog },
  { label: "Jacuzzi Spa", icon: Bath },
  { label: "Fire Pit", icon: Flame },
];

export const LG_BREAKPOINT_PX = 1350;

// Country codes for mobile number input
export const COUNTRY_CODES = [
  { label: "+91 India", value: "+91", code: "IN" },
  { label: "+1 United States", value: "+1", code: "US" },
  { label: "+44 United Kingdom", value: "+44", code: "UK" },
  { label: "+971 UAE", value: "+971", code: "AE" },
  { label: "+65 Singapore", value: "+65", code: "SG" },
  { label: "+61 Australia", value: "+61", code: "AU" },
  { label: "+1 Canada", value: "+1-CA", code: "CA" },
  { label: "+49 Germany", value: "+49", code: "DE" },
  { label: "+33 France", value: "+33", code: "FR" },
  { label: "+966 Saudi Arabia", value: "+966", code: "SA" },
];

// Property deletion reasons
export const PROPERTY_DELETION_REASONS = [
  { value: "SOLD", labelKey: "deletion_reason_sold" },
  { value: "NOT_FOR_SALE", labelKey: "deletion_reason_not_for_sale" },
  { value: "LISTED_ELSEWHERE", labelKey: "deletion_reason_listed_elsewhere" },
  { value: "INCORRECT_DETAILS", labelKey: "deletion_reason_incorrect_details" },
  { value: "DUPLICATE", labelKey: "deletion_reason_duplicate" },
  { value: "OWNER_REQUEST", labelKey: "deletion_reason_owner_request" },
  { value: "OTHER", labelKey: "deletion_reason_other" },
];
