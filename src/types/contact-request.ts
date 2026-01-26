import { Broker, Property } from "./property";

export type ContactRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
export type ContactRequestType = "sent" | "received";

// Extended broker type for populated contact requests (includes additional populated fields)
export interface PopulatedBroker extends Broker {
  companyName?: string;
  profilePhoto?: string;
}

export interface ContactRequest {
  _id: string;
  requesterId: string | Broker;
  propertyId: string | Property;
  propertyListerId: string | Broker;
  status: ContactRequestStatus;
  creditsDeducted: number;
  creditsRefunded: boolean;
  refundedAt?: string;
  respondedAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  requestType?: ContactRequestType;
}

// Populated contact request with broker and property details
export interface PopulatedContactRequest extends Omit<ContactRequest, "requesterId" | "propertyId" | "propertyListerId"> {
  requesterId: PopulatedBroker;
  propertyId: Pick<Property, "_id" | "propertyId" | "propertyCategory" | "propertyType" | "address" | "featuredMedia" | "totalPrice">;
  propertyListerId: PopulatedBroker;
  requestType: ContactRequestType;
}

// API Response types
export interface CreateContactRequestResponse {
  message: string;
  requestId: string;
  creditsDeducted: number;
  expiresAt: string;
}

export interface RespondContactRequestResponse {
  message: string;
  status: ContactRequestStatus;
  creditsRefunded?: number;
}

export interface ContactRequestsListResponse {
  requests: PopulatedContactRequest[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PendingCountResponse {
  pendingCount: number;
}

export interface ProcessExpiredResponse {
  processed: number;
  refunded: number;
  errors: string[];
}

// Request DTOs
export interface CreateContactRequestDTO {
  propertyId: string;
}

export interface RespondContactRequestDTO {
  action: "ACCEPT" | "REJECT";
}

export interface ListContactRequestsParams {
  type?: ContactRequestType;
  status?: ContactRequestStatus;
  page?: number;
  limit?: number;
}

// Check if contact request exists for a property
export interface ContactRequestStatusForProperty {
  hasRequest: boolean;
  request?: ContactRequest;
  status?: ContactRequestStatus;
}
