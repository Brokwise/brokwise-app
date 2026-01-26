import {
    TIER,
    TierLimits,
    SubscriptionDuration,
    RazorpayPlanConfig,
} from "@/models/types/subscription";

export const PRICING: Record<TIER, TierLimits> = {
    STARTER: {
        PROPERTY_LISTING: 5,
        ENQUIRY_LISTING: 3,
        SUBMIT_PROPERTY_ENQUIRY: 5,
    },
    ESSENTIAL: {
        PROPERTY_LISTING: 25,
        ENQUIRY_LISTING: 15,
        SUBMIT_PROPERTY_ENQUIRY: 25,
    },
    ELITE: {
        PROPERTY_LISTING: 1,
        ENQUIRY_LISTING: 50,
        SUBMIT_PROPERTY_ENQUIRY: 100,
    },
};

export const RAZORPAY_PLANS: RazorpayPlanConfig[] = [
    {
        planId: "plan_S7d5i2B8h5gUQe",
        tier: "ESSENTIAL",
        duration: "3_MONTHS",
        amount: 18000,
        currency: "INR",
    },
    {
        planId: "plan_S7d6kRtvIe7Pci",
        tier: "ESSENTIAL",
        duration: "6_MONTHS",
        amount: 34000,
        currency: "INR",
    },
    {
        planId: "plan_S7d7lQMeWsyaFG",
        tier: "ESSENTIAL",
        duration: "1_YEAR",
        amount: 65000,
        currency: "INR",
    },
    {
        planId: "plan_S7d8f8kjAawy3p",
        tier: "ELITE",
        duration: "3_MONTHS",
        amount: 30000,
        currency: "INR",
    },
    {
        planId: "plan_S7d9FA417qGWUV",
        tier: "ELITE",
        duration: "6_MONTHS",
        amount: 50000,
        currency: "INR",
    },
    {
        planId: "plan_S7dA3Cs52bMse4",
        tier: "ELITE",
        duration: "1_YEAR",
        amount: 90000,
        currency: "INR",
    },
];

export const getRazorpayPlan = (
    tier: TIER,
    duration: SubscriptionDuration
): RazorpayPlanConfig | undefined => {
    return RAZORPAY_PLANS.find(
        (plan) => plan.tier === tier && plan.duration === duration
    );
};

// Helper function to get all plans for a specific tier
export const getPlansByTier = (tier: TIER): RazorpayPlanConfig[] => {
    return RAZORPAY_PLANS.filter((plan) => plan.tier === tier);
};

// Helper function to get plan by Razorpay plan ID
export const getPlanById = (planId: string): RazorpayPlanConfig | undefined => {
    return RAZORPAY_PLANS.find((plan) => plan.planId === planId);
};

// Tier display information
export const TIER_INFO: Record<
    TIER,
    {
        name: string;
        description: string;
        features: string[];
        recommended?: boolean;
    }
> = {
    STARTER: {
        name: "Starter",
        description: "Perfect for individual brokers just getting started",
        features: [
            `${PRICING.STARTER.PROPERTY_LISTING} Property Listings`,
            `${PRICING.STARTER.ENQUIRY_LISTING} Enquiry Listings`,
            `${PRICING.STARTER.SUBMIT_PROPERTY_ENQUIRY} Property Submissions`,
            "Basic Support",
        ],
    },
    ESSENTIAL: {
        name: "Essential",
        description: "Ideal for growing brokers with moderate needs",
        features: [
            `${PRICING.ESSENTIAL.PROPERTY_LISTING} Property Listings`,
            `${PRICING.ESSENTIAL.ENQUIRY_LISTING} Enquiry Listings`,
            `${PRICING.ESSENTIAL.SUBMIT_PROPERTY_ENQUIRY} Property Submissions`,
            "Priority Support",
            "Analytics Dashboard",
        ],
        recommended: true,
    },
    ELITE: {
        name: "Elite",
        description: "For power users and established agencies",
        features: [
            `${PRICING.ELITE.PROPERTY_LISTING} Property Listings`,
            `${PRICING.ELITE.ENQUIRY_LISTING} Enquiry Listings`,
            `${PRICING.ELITE.SUBMIT_PROPERTY_ENQUIRY} Property Submissions`,
            "Premium Support",
            "Advanced Analytics",
            "Team Collaboration",
        ],
    },
};

// Duration pricing display (for showing savings)
export const DURATION_SAVINGS: Record<SubscriptionDuration, { label: string; savingsPercent?: number }> = {
    "3_MONTHS": {
        label: "3 Months",
    },
    "6_MONTHS": {
        label: "6 Months",
        savingsPercent: 10,
    },
    "1_YEAR": {
        label: "1 Year",
        savingsPercent: 25,
    },
};

export const CREDITS_PRICE = {
    REQUEST_CONTACT: 10,
    MARK_PROPERTY_AS_FEATURED: 10,
    MARK_ENQUIRY_AS_URGENT: 10,
    LIST_PROPERTY: 10
}