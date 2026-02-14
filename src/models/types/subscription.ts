
export type TIER = "BASIC" | "ESSENTIAL" | "PRO";

export type SubscriptionPhase = "activation" | "regular";

export type SubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "paused"
  | "cancelled"
  | "expired"
  | "pending";

export type SubscriptionDuration = "ACTIVATION" | "1_MONTH" | "3_MONTHS";

export type RegularDuration = "1_MONTH" | "3_MONTHS";

export const SUBSCRIPTION_DURATION_DAYS: Record<SubscriptionDuration, number> = {
  "ACTIVATION": 30,
  "3_MONTHS": 90,
  "1_MONTH": 30,
};

export const SUBSCRIPTION_DURATION_LABELS: Record<SubscriptionDuration, string> = {
  "ACTIVATION": "Activation (1 Month)",
  "3_MONTHS": "3 Months",
  "1_MONTH": "1 Month",
};

export const REGULAR_DURATION_LABELS: Record<RegularDuration, string> = {
  "3_MONTHS": "3 Months",
  "1_MONTH": "1 Month",
};

export interface Subscription {
  _id?: string;
  brokerId: string;
  tier: TIER;
  duration: SubscriptionDuration;
  phase: SubscriptionPhase;
  razorpaySubscriptionId?: string;
  razorpayOrderId?: string;
  razorpayCustomerId?: string;
  razorpayPlanId?: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  activationCompletedAt?: Date | string;
  cancelledAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface TierLimits {
  PROPERTY_LISTING: number;
  ENQUIRY_LISTING: number;
  SUBMIT_PROPERTY_ENQUIRY: number;
}

export type UsageType =
  | "property_listing"
  | "enquiry_listing"
  | "submit_property_enquiry";

export interface UsageCount {
  property_listing: number;
  enquiry_listing: number;
  submit_property_enquiry: number;
}

export interface Usage {
  _id?: string;
  brokerId: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  usage: UsageCount;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

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

export interface SubscriptionResponse {
  tier: TIER;
  duration: SubscriptionDuration;
  phase: SubscriptionPhase;
  status: SubscriptionStatus;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  activationCompletedAt?: Date | string;
  razorpaySubscriptionId?: string;
  razorpayOrderId?: string;
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
  activationPlans?: Array<{
    tier: TIER;
    limits: TierLimits;
    price: number;
    credits: number;
  }>;
  regularPlans?: Array<{
    tier: TIER;
    limits: TierLimits;
    durations: Array<{
      duration: RegularDuration;
      price: number;
      credits: number;
    }>;
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

export interface PurchaseActivationPayload {
  tier: TIER;
  razorpayPlanId: string;
}

export interface VerifyActivationPayload {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface ActivationPurchaseResponse {
  subscription: {
    tier: TIER;
    phase: SubscriptionPhase;
    duration: SubscriptionDuration;
    status: SubscriptionStatus;
    razorpayPlanId: string;
    razorpaySubscriptionId: string;
  };
  razorpay: {
    subscriptionId: string;
    shortUrl: string;
    keyId: string;
  };
  activationDetails: {
    credits: number;
    limits: TierLimits;
    durationDays: number;
  };
  message: string;
}

export interface LinkRazorpayPayload {
  razorpaySubscriptionId: string;
  razorpayCustomerId?: string;
}

export interface RazorpayPlanConfig {
  planId: string;
  tier: TIER;
  duration: RegularDuration;
  /** GST-inclusive amount charged via Razorpay */
  amount: number;
  /** Ex-GST amount shown in the UI */
  displayAmount: number;
  currency: string;
  credits: number;
}

export interface ActivationPlanConfig {
  planId: string;
  tier: TIER;
  /** GST-inclusive amount charged via Razorpay */
  amount: number;
  /** Ex-GST amount shown in the UI */
  displayAmount: number;
  currency: string;
  credits: number;
}
