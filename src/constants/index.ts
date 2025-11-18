import { PropertyCategory } from "@/types/property";

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
