import {
  PropertyCategory,
  PropertyType,
  SizeUnit,
  PlotType,
  Facing,
  AreaType,
} from "./property";
import { Property } from "@/types/property";

// === ENUMS ===
export type EnquiryStatus = "active" | "closed" | "expired";
export type EnquirySource = "broker" | "admin" | "company";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type MessageThreadType = "enquirer_admin" | "submitter_admin";

// === RANGE TYPES ===
export interface BudgetRange {
  min: number;
  max: number;
}

export interface SizeRange {
  min: number;
  max: number;
  unit: SizeUnit;
}

export interface RentalIncomeRange {
  min: number;
  max: number;
}

// === MAIN ENQUIRY INTERFACE ===
export interface Enquiry {
  _id: string;
  enquiryId: string; // FLAT-2511-0042 format

  // Source Tracking
  source: EnquirySource;
  createdBy: string; // Ref: 'Broker' | 'Admin'

  // Classification
  enquiryCategory: PropertyCategory;
  enquiryType: PropertyType;

  // Location (schema updated: address replaces city + localities)
  address: string;
  // Legacy fields (kept for backward compatibility with older records)
  city?: string;
  localities?: string[];

  // Budget Range
  budget: BudgetRange;

  // Description
  description: string;

  // --- Category Specific Optional/Required Fields ---
  // Size Range (for Land, Villa, Warehouse, Commercial)
  size?: SizeRange;

  // Land / Villa
  plotType?: PlotType;
  facing?: Facing;
  frontRoadWidth?: number;

  // Flat
  bhk?: number;
  washrooms?: number;
  preferredFloor?: string;
  society?: string;

  // Commercial (Hotel/Hostel)
  rooms?: number;
  beds?: number;
  rentalIncome?: RentalIncomeRange;

  // Industrial
  purpose?: string;
  areaType?: AreaType;

  // Status & Lifecycle
  status: EnquiryStatus;
  expiresAt?: Date;

  // Soft Delete
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  deletionReason?: string;

  // Forwarding Metadata (for priority/recommended marking)
  forwardedTo: string[];
  submissionCount: number;

  isInterested?: boolean;

  createdByCompanyId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceEnquiry
  extends Omit<Enquiry, "createdBy" | "forwardedTo" | "deletedBy"> {
  isRecommended: boolean;
  mySubmissionCount?: number;
  myLastSubmissionStatus?: string | null;
}

export interface EnquirySubmission {
  _id: string;
  submissionId: string;

  enquiryId: string;
  brokerId: string;

  propertyId: Property | string;

  privateMessage?: string;

  status: SubmissionStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminNote?: string;

  isForwardedToEnquirer: boolean;
  forwardedToEnquirerAt?: Date;
  enquirerMessage?: string;

  contactSharedWithSubmitter?: boolean;
  contactSharedAt?: string;

  createdAt: string;
  updatedAt: string;
}
export interface EnquiryMessage {
  _id: string;
  enquiryId: string;

  submissionId?: string;

  threadType: MessageThreadType;
  participantBrokerId: string;

  senderId: string;
  senderType: "broker" | "admin";

  message: string;
  isRead: boolean;

  createdAt: string;
}

// === THREAD SUMMARY (For Admin view) ===
export interface MessageThread {
  enquiryId: string;
  submissionId?: string | undefined;
  threadType: MessageThreadType;
  participantBrokerId: string;
  participantBrokerName?: string | undefined;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

// === FILTERS ===
export interface EnquiryFilters {
  source?: EnquirySource;
  status?: EnquiryStatus;
  category?: PropertyCategory;
  type?: PropertyType;
  city?: string;
  creatorId?: string;
  includeDeleted?: boolean;
}

export interface MarketplaceFilters {
  city?: string;
  category?: string;
  type?: string;
  minBudget?: number;
  maxBudget?: number;
}

export interface CreateEnquiryDTO {
  address: string;
  // Legacy fields required by company create-enquiry endpoint (backend still expects these)
  city?: string;
  localities?: string[];
  enquiryCategory: PropertyCategory;
  enquiryType: PropertyType;
  budget: BudgetRange;
  description: string;
  size?: SizeRange;
  plotType?: PlotType;
  facing?: Facing;
  frontRoadWidth?: number;
  bhk?: number;
  washrooms?: number;
  preferredFloor?: string;
  society?: string;
  rooms?: number;
  beds?: number;
  rentalIncome?: RentalIncomeRange;
  purpose?: string;
  areaType?: AreaType;
}
