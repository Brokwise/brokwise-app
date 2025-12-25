import { Company } from "./company";

export type CreateUserRequest = {
  email: string;
  uid: string;
};
export type CreateUserResponse = Record<PropertyKey, never>;
export type AddUserMetadataRequest = {
  metadata: Record<string, string>;
  uid: string;
};
export type AddUserMetadataResponse = Record<PropertyKey, never>;
export type GetUserPlanRequest = Record<string, never>;
export type GetUserPlanResponse = {
  stripeRole: "free" | "pro";
  billingCycle: "monthly" | "yearly" | "months_6";
  metadata: Record<string, unknown>;
};

export type SendWelcomeEmailRequest = {
  email: string;
  fullName: string;
};
export type SendWelcomeEmailResponse = Record<PropertyKey, never>;

export type SubmitUserDetailsRequest = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
  mobile: string;
  companyName?: string;
  gstin?: string;
  yearsOfExperience: number;
  city: string;
  officeAddress?: string;
  reraNumber?: string;
};
export type SubmitUserDetailsResponse = Record<PropertyKey, never>;

export type UpdateProfileDetailsRequest = {
  _id: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  companyName?: string;
  gstin?: string;
  yearsOfExperience?: number;
  city?: string;
  officeAddress?: string;
  reraNumber?: string;
};
export type UpdateProfileDetailsResponse = Record<PropertyKey, never>;

export type GetBrokerDetailsRequest = {
  uid: string;
};

export type GetBrokerDetailsResponse = {
  data: {
    firstName: string;
    lastName: string;
    email: string;
    _id: string;
    uid: string;
    mobile: string;
    companyName: string;
    gstin: string;
    yearsOfExperience: number;
    city: string;
    officeAddress: string;
    reraNumber: string;
    status: "approved" | "pending" | "incomplete" | "blacklisted";
    companyId?: string | Company;
    recentSearches?: string[];
    bookmarkedPropertyIds?: string[];
    bookmarkedEnquiryIds?: string[];
    createdAt: string;
    brokerId: string;
  };
};
