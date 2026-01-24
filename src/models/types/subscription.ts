// Subscription Tier Types
export type TIER = "STARTER" | "ESSENTIAL" | "ELITE";

// Subscription Status Types
export type SubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "paused"
  | "cancelled"
  | "expired"
  | "pending";

// Subscription Duration Types
export type SubscriptionDuration = "3_MONTHS" | "6_MONTHS" | "1_YEAR";

// Duration in days for each subscription type
export const SUBSCRIPTION_DURATION_DAYS: Record<SubscriptionDuration, number> = {
  "3_MONTHS": 90,
  "6_MONTHS": 180,
  "1_YEAR": 365,
};

// Duration labels for display
export const SUBSCRIPTION_DURATION_LABELS: Record<SubscriptionDuration, string> = {
  "3_MONTHS": "3 Months",
  "6_MONTHS": "6 Months",
  "1_YEAR": "1 Year",
};

// Subscription Interface
export interface Subscription {
  _id?: string;
  brokerId: string;
  tier: TIER;
  duration: SubscriptionDuration;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  razorpayPlanId?: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  cancelledAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Tier Limits Interface
export interface TierLimits {
  PROPERTY_LISTING: number;
  ENQUIRY_LISTING: number;
  SUBMIT_PROPERTY_ENQUIRY: number;
}

// Usage Types
export type UsageType =
  | "property_listing"
  | "enquiry_listing"
  | "submit_property_enquiry";

// Usage Count Interface
export interface UsageCount {
  property_listing: number;
  enquiry_listing: number;
  submit_property_enquiry: number;
}

// Usage Interface
export interface Usage {
  _id?: string;
  brokerId: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  usage: UsageCount;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Usage with Limits (for display)
export interface UsageWithLimits {
  usage: UsageCount;
  limits: {
    property_listing: number;
    enquiry_listing: number;
    submit_property_enquiry: number;
  };
  tier: TIER;
  periodStart: Date | string;
  periodEnd: Date | string;
}

// API Response Types
export interface SubscriptionResponse {
  tier: TIER;
  duration: SubscriptionDuration;
  status: SubscriptionStatus;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  razorpaySubscriptionId?: string;
}

export interface SubscriptionWithLimitsResponse {
  subscription: SubscriptionResponse;
  limits: TierLimits;
}

export interface RemainingQuotaResponse {
  remaining: {
    property_listing: number;
    enquiry_listing: number;
    submit_property_enquiry: number;
  };
  tier: TIER;
}

export interface PlansResponse {
  plans: Array<{
    tier: TIER;
    limits: TierLimits;
  }>;
  durations: Array<{
    duration: SubscriptionDuration;
    days: number;
    label: string;
  }>;
}

export interface UsageHistoryResponse {
  usageRecords: Usage[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateSubscriptionPayload {
  tier: TIER;
  duration?: SubscriptionDuration;
  razorpayPlanId: string;
}

export interface LinkRazorpayPayload {
  razorpaySubscriptionId: string;
  razorpayCustomerId?: string;
}

// Razorpay Plan Configuration
export interface RazorpayPlanConfig {
  planId: string;
  tier: TIER;
  duration: SubscriptionDuration;
  amount: number;
  currency: string;
}
