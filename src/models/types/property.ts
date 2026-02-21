// Enums & Types (aligned with UI flows) -> will discuss this with pradeep regarding frontend implementation

export type PropertyCategory =
  | "RESIDENTIAL"
  | "COMMERCIAL"
  | "INDUSTRIAL"
  | "AGRICULTURAL"
  | "RESORT"
  | "FARM_HOUSE";

export type PropertyType =
  // Residential
  | "FLAT"
  | "VILLA"
  | "LAND"
  // Commercial
  | "SHOWROOM"
  | "HOTEL"
  | "HOSTEL"
  | "SHOP"
  | "OFFICE_SPACE"
  | "OTHER_SPACE"
  // Industrial
  | "INDUSTRIAL_PARK"
  | "INDUSTRIAL_LAND"
  | "WAREHOUSE"
  | "AGRICULTURAL_LAND" // Also a category
  // Other
  | "RESORT"
  | "FARM_HOUSE"
  | "INDIVIDUAL"; // From Farm House screen

export type SizeUnit =
  | "SQ_FT"
  | "SQ_METER"
  | "SQ_YARDS"
  | "ACRES"
  | "HECTARE"
  | "BIGHA";

export type PlotType = "ROAD" | "CORNER";

export type Facing =
  | "NORTH"
  | "SOUTH"
  | "EAST"
  | "WEST"
  | "NORTH_EAST"
  | "NORTH_WEST"
  | "SOUTH_EAST"
  | "SOUTH_WEST";

export type AreaType = "NEAR_RING_ROAD" | "RIICO_AREA" | "SEZ";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "REJECTED"
  | "SOLD"
  | "RENTED"
  | "EXPIRED"
  | "DELISTED"
  | "ENQUIRY_ONLY"
  | "DELETED_BY_COMPANY";

export type PossessionStatus = "READY_TO_MOVE" | "UNDER_CONSTRUCTION";

export type ListingPurpose = "SALE" | "RENT";

export type TenantType =
  | "FAMILY"
  | "BACHELORS_MEN"
  | "BACHELORS_WOMEN"
  | "COMPANY_LEASE";

export type CommercialFurnishing =
  | "BARE_SHELL"
  | "WARM_SHELL"
  | "FULLY_FURNISHED";

//  Embedded Object Interfaces

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  state: string;
  city: string;
  address: string;
  pincode: string;
}

export interface RentalIncome {
  min?: number;
  max?: number;
}

//  Main Property Interface

export interface Property {
  _id: string;
  propertyId?: string; // Human-readable ID (PROP-000001)

  listingPurpose?: ListingPurpose;

  // Core & Common
  propertyCategory: PropertyCategory;
  propertyType: PropertyType;
  address: Address;
  rate: number;
  totalPrice: number;
  listingStatus: ListingStatus;
  description: string; // "About Property"

  // Location
  location: GeoLocation; // For the map

  // Media
  featuredMedia: string; // Featured (JPEG image or MP4 video)
  images: string[]; // Images List (JPEG image)
  floorPlans?: string[]; // Site Plan (PDF Doc or JPEG image)

  // Relational IDs
  listedBy: string; // Ref: 'Broker'
  companyId: string; // Ref: 'Company'
  verifiedBy?: string; // Ref: 'Admin' | 'Manager'
  adminId?: string; // Ref: 'Admin'

  // Metadata
  isFeatured: boolean;
  isVerified: boolean;
  isPriceNegotiable: boolean;

  // --- Conditional & Optional Fields ---

  // Size (common but unit-based)
  size?: number;
  sizeUnit?: SizeUnit;

  // Agricultural
  propertyTitle?: string; // The "Title" dropdown

  // Industrial
  purpose?: string;
  areaType?: AreaType;

  // Land / Legal Docs (Industrial, Agricultural)
  jamabandiUrl?: string;
  khasraPlanUrl?: string;

  // Resort, Farm House
  propertyStatus?: string;

  // Villa, Land, Shop, Farm House, Resort, Agricultural
  facing?: Facing;
  plotType?: PlotType;
  frontRoadWidth?: number;

  // Residential - Flat
  isPenthouse?: boolean;
  bhk?: number;
  washrooms?: number;
  society?: string;
  projectArea?: number; // Also in "Other Space"
  possessionDate?: Date;

  // Commercial
  floor?: string;
  rentalIncome?: RentalIncome;

  // Commercial - Hotel
  rooms?: number;
  beds?: number;

  // Commercial - Hostel
  // beds?: number; // Duplicate in source, removed

  // Amenities
  amenities?: string[];

  // Rental-specific fields
  monthlyRent?: number;
  securityDeposit?: number;
  agreementDuration?: string;
  lockInPeriod?: number;
  noticePeriod?: number;
  tenantType?: TenantType[];
  petsAllowed?: boolean;
  nonVegAllowed?: boolean;
  furnishing?: CommercialFurnishing;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletingStatus?: "pending" | "approved" | "rejected" | null;

  submittedForEnquiryId?: string;
  // added responses field here but commented out as we use submissionCount in Enquiry,
  // this is Property interface.
}

export interface PropertyDeleteRequest {
  propertyId: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  brokerName: string;
  brokerId: string;
}

export interface PaginatedPropertyResponse {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}
