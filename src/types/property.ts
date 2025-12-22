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

//  Embedded Object Interfaces

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface RentalIncome {
  min: number;
  max: number;
}

export interface Broker {
  _id: string;
  email: string;
  brokerId: string | null;
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface Address {
  state: string;
  city: string;
  address: string;
  pincode: string;
}

export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "final_pending"
  | "final_accepted"
  | "final_rejected";

export interface PropertyOffer {
  _id?: string;
  offerBy: string;
  rate: number;
  status: OfferStatus;
  rejectionReason?: string;
  isFinalOffer: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OfferDataDTO {
  propertyId: string;
  rate: number;
}

export interface SubmitFinalOfferDTO {
  propertyId: string;
  offerId: string;
  rate: number;
}

//  Main Property Interface

export interface Property {
  _id: string;
  propertyId: string | null; // Human-readable ID (PROP-000001)

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
  localities?: string[]; // "Add Localities (Select multiple)"

  // Media
  featuredMedia: string; // Featured (JPEG image or MP4 video)
  images: string[]; // Images List (JPEG image)
  floorPlans?: string[]; // Site Plan (PDF Doc or JPEG image)

  // Relational IDs
  listedBy: Broker; // Populated broker data from API
  companyId?: string; // Ref: 'Company'
  verifiedBy?: string; // Ref: 'Admin' | 'Manager'

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

  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletingStatus?: "pending" | "approved" | "rejected" | null;

  submittedForEnquiryId?: string;
  offers?: PropertyOffer[];
}

export interface PaginatedPropertyResponse {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}
