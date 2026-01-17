import { Enquiry } from "@/models/types/enquiry";

export type PropertyCategory =
  | "RESIDENTIAL"
  | "COMMERCIAL"
  | "INDUSTRIAL"
  | "AGRICULTURAL"
  | "RESORT"
  | "FARM_HOUSE";

export type PropertyType =
  | "FLAT"
  | "VILLA"
  | "LAND"
  | "SHOWROOM"
  | "HOTEL"
  | "HOSTEL"
  | "SHOP"
  | "OFFICE_SPACE"
  | "OTHER_SPACE"
  | "INDUSTRIAL_PARK"
  | "INDUSTRIAL_LAND"
  | "WAREHOUSE"
  | "AGRICULTURAL_LAND"
  | "RESORT"
  | "FARM_HOUSE"
  | "INDIVIDUAL";

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
  coordinates: [number, number];
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
  isContactShared?: boolean;
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
  propertyId: string | null;

  propertyCategory: PropertyCategory;
  propertyType: PropertyType;
  address: Address;
  rate: number;
  totalPrice: number;
  listingStatus: ListingStatus;
  description: string;

  location: GeoLocation;
  localities?: string[];

  featuredMedia: string;
  images: string[];
  floorPlans?: string[];

  listedBy: Broker;
  companyId?: string;
  verifiedBy?: string;

  isFeatured: boolean;
  isVerified: boolean;
  isPriceNegotiable: boolean;

  size?: number;
  sizeUnit?: SizeUnit;

  propertyTitle?: string;

  purpose?: string;
  areaType?: AreaType;

  jamabandiUrl?: string;
  khasraPlanUrl?: string;

  propertyStatus?: string;

  facing?: Facing;
  plotType?: PlotType;
  frontRoadWidth?: number;

  isPenthouse?: boolean;
  bhk?: number;
  washrooms?: number;
  society?: string;
  projectArea?: number;
  possessionDate?: Date;

  floor?: string;
  rentalIncome?: RentalIncome;

  rooms?: number;
  beds?: number;

  amenities?: string[];

  createdAt: string;
  updatedAt: string;
  deletingStatus?: "pending" | "approved" | "rejected" | null;

  submittedForEnquiryId?: Enquiry;
  offers?: PropertyOffer[];
}

export interface PaginatedPropertyResponse {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}
