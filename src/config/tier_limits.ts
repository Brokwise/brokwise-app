import {
    TIER,
    TierLimits,
    RegularDuration,
    RazorpayPlanConfig,
    ActivationPlanConfig,
    SubscriptionPhase,
} from "@/models/types/subscription";

// ──────────────────────────────────────────────────────────
// Environment detection
// If your staging build also uses NODE_ENV=production, switch
// to a custom env var like NEXT_PUBLIC_APP_ENV instead.
// ──────────────────────────────────────────────────────────
const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENV === "production";

// ──────────────────────────────────────────────────────────
// Phase 1: Activation Pack Limits (lower – first month)
// ──────────────────────────────────────────────────────────
export const ACTIVATION_LIMITS: Record<TIER, TierLimits> = {
    BASIC: {
        PROPERTY_LISTING: 2,
        ENQUIRY_LISTING: 2,
        SUBMIT_PROPERTY_ENQUIRY: 2,
    },
    ESSENTIAL: {
        PROPERTY_LISTING: 6,
        ENQUIRY_LISTING: 6,
        SUBMIT_PROPERTY_ENQUIRY: 6,
    },
    PRO: {
        PROPERTY_LISTING: 12,
        ENQUIRY_LISTING: 12,
        SUBMIT_PROPERTY_ENQUIRY: 12,
    },
};

// ──────────────────────────────────────────────────────────
// Phase 2: Regular Plan Limits (higher – after activation)
// ──────────────────────────────────────────────────────────
export const REGULAR_LIMITS: Record<TIER, TierLimits> = {
    BASIC: {
        PROPERTY_LISTING: 12,
        ENQUIRY_LISTING: 12,
        SUBMIT_PROPERTY_ENQUIRY: 16,
    },
    ESSENTIAL: {
        PROPERTY_LISTING: 24,
        ENQUIRY_LISTING: 24,
        SUBMIT_PROPERTY_ENQUIRY: 32,
    },
    PRO: {
        PROPERTY_LISTING: 40,
        ENQUIRY_LISTING: 40,
        SUBMIT_PROPERTY_ENQUIRY: 64,
    },
};

/** @deprecated Use ACTIVATION_LIMITS or REGULAR_LIMITS based on phase */
export const PRICING = REGULAR_LIMITS;

// Helper: get limits by phase
export const getLimitsByPhase = (
    tier: TIER,
    phase: SubscriptionPhase
): TierLimits => {
    return phase === "activation" ? ACTIVATION_LIMITS[tier] : REGULAR_LIMITS[tier];
};

// ──────────────────────────────────────────────────────────
// Activation Plans (one-time Razorpay orders)
//
// amount        = GST-inclusive (charged by Razorpay)
// displayAmount = ex-GST (shown in UI)
// ──────────────────────────────────────────────────────────

const ACTIVATION_PLANS_STAGING: Record<TIER, ActivationPlanConfig> = {
    BASIC: {
        planId: "plan_SFw0GQfVdevBoR",      // TODO: replace with actual Razorpay plan ID
        tier: "BASIC",
        amount: 499,
        displayAmount: 499,
        currency: "INR",
        credits: 40,
    },
    ESSENTIAL: {
        planId: "plan_SFw0UppkIkY4Ae",   // TODO: replace with actual Razorpay plan ID
        tier: "ESSENTIAL",
        amount: 699,
        displayAmount: 699,
        currency: "INR",
        credits: 100,
    },
    PRO: {
        planId: "plan_SFw0i28ww5du9F",         // TODO: replace with actual Razorpay plan ID
        tier: "PRO",
        amount: 999,
        displayAmount: 999,
        currency: "INR",
        credits: 180,
    },
};

const ACTIVATION_PLANS_PRODUCTION: Record<TIER, ActivationPlanConfig> = {
    BASIC: {
        planId: "plan_SGD9Ca5rmMknL0",
        tier: "BASIC",
        amount: 589,            // GST-inclusive
        displayAmount: 499,     // ex-GST
        currency: "INR",
        credits: 40,
    },
    ESSENTIAL: {
        planId: "plan_SFt7MRewCPEs6K",      // TODO: replace with actual Razorpay plan ID
        tier: "ESSENTIAL",
        amount: 1179,           // GST-inclusive
        displayAmount: 999,     // ex-GST
        currency: "INR",
        credits: 100,
    },
    PRO: {
        planId: "plan_SFt873dHKP5Lgg",            // TODO: replace with actual Razorpay plan ID
        tier: "PRO",
        amount: 2123,           // GST-inclusive
        displayAmount: 1799,    // ex-GST
        currency: "INR",
        credits: 180,
    },
};

export const ACTIVATION_PLANS: Record<TIER, ActivationPlanConfig> =
    IS_PRODUCTION ? ACTIVATION_PLANS_PRODUCTION : ACTIVATION_PLANS_STAGING;

// ──────────────────────────────────────────────────────────
// Regular Plans (recurring Razorpay subscriptions)
//
// amount        = GST-inclusive (charged by Razorpay)
// displayAmount = ex-GST (shown in UI)
// ──────────────────────────────────────────────────────────

const RAZORPAY_PLANS_STAGING: RazorpayPlanConfig[] = [
    // Basic
    {
        planId: "plan_SFw0xVKtHYJWB3",
        tier: "BASIC",
        duration: "1_MONTH",
        amount: 2599,
        displayAmount: 2599,
        currency: "INR",
        credits: 200,
    },
    {
        planId: "plan_SFw1FJwo9TfHQl",
        tier: "BASIC",
        duration: "3_MONTHS",
        amount: 5899,
        displayAmount: 5899,
        currency: "INR",
        credits: 600,
    },
    // Essential
    {
        planId: "plan_SFw1VNvWfIREmM",
        tier: "ESSENTIAL",
        duration: "1_MONTH",
        amount: 4699,
        displayAmount: 4699,
        currency: "INR",
        credits: 400,
    },
    {
        planId: "plan_SFw1lbdWbw0Gi8",
        tier: "ESSENTIAL",
        duration: "3_MONTHS",
        amount: 8999,
        displayAmount: 8999,
        currency: "INR",
        credits: 1200,
    },
    // Pro
    {
        planId: "plan_SFw21agsQavKeI",
        tier: "PRO",
        duration: "1_MONTH",
        amount: 5499,
        displayAmount: 5499,
        currency: "INR",
        credits: 1000,
    },
    {
        planId: "plan_SFw2FFXz3zBYQS",
        tier: "PRO",
        duration: "3_MONTHS",
        amount: 8999,
        displayAmount: 8999,
        currency: "INR",
        credits: 3000,
    },
];

const RAZORPAY_PLANS_PRODUCTION: RazorpayPlanConfig[] = [
    // Basic
    {
        planId: "plan_SFt8z04RX7Fudz",
        tier: "BASIC",
        duration: "1_MONTH",
        amount: 4720,           // GST-inclusive
        displayAmount: 3999,    // ex-GST
        currency: "INR",
        credits: 200,
    },
    {
        planId: "plan_SFtEhdMnSJAIBU",
        tier: "BASIC",
        duration: "3_MONTHS",
        amount: 12980,          // GST-inclusive
        displayAmount: 10999,   // ex-GST
        currency: "INR",
        credits: 600,
    },
    // Essential
    {
        planId: "plan_SFt9jdfu6JegZV",
        tier: "ESSENTIAL",
        duration: "1_MONTH",
        amount: 5900,           // GST-inclusive
        displayAmount: 4999,    // ex-GST
        currency: "INR",
        credits: 400,
    },
    {
        planId: "plan_SFtFpGE24iyD3h",
        tier: "ESSENTIAL",
        duration: "3_MONTHS",
        amount: 16520,          // GST-inclusive
        displayAmount: 13999,   // ex-GST
        currency: "INR",
        credits: 1200,
    },
    // Pro
    {
        planId: "plan_SFtAGuuFyWf0GJ",
        tier: "PRO",
        duration: "1_MONTH",
        amount: 7670,           // GST-inclusive
        displayAmount: 6499,    // ex-GST
        currency: "INR",
        credits: 1000,
    },
    {
        planId: "plan_SFtGrBjCbM3iBK",
        tier: "PRO",
        duration: "3_MONTHS",
        amount: 21240,          // GST-inclusive
        displayAmount: 17999,   // ex-GST
        currency: "INR",
        credits: 3000,
    },
];

export const RAZORPAY_PLANS: RazorpayPlanConfig[] =
    IS_PRODUCTION ? RAZORPAY_PLANS_PRODUCTION : RAZORPAY_PLANS_STAGING;

// ──────────────────────────────────────────────────────────
// Plan Lookup Helpers
// ──────────────────────────────────────────────────────────
export const getRazorpayPlan = (
    tier: TIER,
    duration: RegularDuration
): RazorpayPlanConfig | undefined => {
    return RAZORPAY_PLANS.find(
        (plan) => plan.tier === tier && plan.duration === duration
    );
};

export const getPlansByTier = (tier: TIER): RazorpayPlanConfig[] => {
    return RAZORPAY_PLANS.filter((plan) => plan.tier === tier);
};

export const getPlanById = (planId: string): RazorpayPlanConfig | undefined => {
    return RAZORPAY_PLANS.find((plan) => plan.planId === planId);
};

export const getActivationPlan = (tier: TIER): ActivationPlanConfig => {
    return ACTIVATION_PLANS[tier];
};

// ──────────────────────────────────────────────────────────
// Tier Display Information
// ──────────────────────────────────────────────────────────
export const TIER_INFO: Record<
    TIER,
    {
        name: string;
        description: string;
        features: string[];
        recommended?: boolean;
    }
> = {
    BASIC: {
        name: "Basic",
        description: "Perfect for individual brokers just getting started",
        features: [
            `Up to ${REGULAR_LIMITS.BASIC.PROPERTY_LISTING} Property Listings/mo`,
            `Up to ${REGULAR_LIMITS.BASIC.ENQUIRY_LISTING} Enquiry Listings/mo`,
            `Up to ${REGULAR_LIMITS.BASIC.SUBMIT_PROPERTY_ENQUIRY} Property Submissions/mo`,
            "Basic Support",
        ],
    },
    ESSENTIAL: {
        name: "Essential",
        description: "Ideal for growing brokers with moderate needs",
        features: [
            `Up to ${REGULAR_LIMITS.ESSENTIAL.PROPERTY_LISTING} Property Listings/mo`,
            `Up to ${REGULAR_LIMITS.ESSENTIAL.ENQUIRY_LISTING} Enquiry Listings/mo`,
            `Up to ${REGULAR_LIMITS.ESSENTIAL.SUBMIT_PROPERTY_ENQUIRY} Property Submissions/mo`,
            "Priority Support",
            "Analytics Dashboard",
        ],
        recommended: true,
    },
    PRO: {
        name: "Pro",
        description: "For power users and established agencies",
        features: [
            `Up to ${REGULAR_LIMITS.PRO.PROPERTY_LISTING} Property Listings/mo`,
            `Up to ${REGULAR_LIMITS.PRO.ENQUIRY_LISTING} Enquiry Listings/mo`,
            `Up to ${REGULAR_LIMITS.PRO.SUBMIT_PROPERTY_ENQUIRY} Property Submissions/mo`,
            "Premium Support",
            "Advanced Analytics",
            "Team Collaboration",
        ],
    },
};

// Activation-specific tier info (shown during onboarding)
export const ACTIVATION_TIER_INFO: Record<
    TIER,
    {
        name: string;
        description: string;
        features: string[];
        recommended?: boolean;
    }
> = {
    BASIC: {
        name: "Basic",
        description: "Get started with the essentials",
        features: [
            `${ACTIVATION_LIMITS.BASIC.PROPERTY_LISTING} Property Listings`,
            `${ACTIVATION_LIMITS.BASIC.ENQUIRY_LISTING} Enquiry Listings`,
            `${ACTIVATION_LIMITS.BASIC.SUBMIT_PROPERTY_ENQUIRY} Property Submissions`,
            `${ACTIVATION_PLANS.BASIC.credits} Credits`,
            "1 Month Activation",
        ],
    },
    ESSENTIAL: {
        name: "Essential",
        description: "The most popular choice for brokers",
        features: [
            `${ACTIVATION_LIMITS.ESSENTIAL.PROPERTY_LISTING} Property Listings`,
            `${ACTIVATION_LIMITS.ESSENTIAL.ENQUIRY_LISTING} Enquiry Listings`,
            `${ACTIVATION_LIMITS.ESSENTIAL.SUBMIT_PROPERTY_ENQUIRY} Property Submissions`,
            `${ACTIVATION_PLANS.ESSENTIAL.credits} Credits`,
            "1 Month Activation",
        ],
        recommended: true,
    },
    PRO: {
        name: "Pro",
        description: "Maximum power from day one",
        features: [
            `${ACTIVATION_LIMITS.PRO.PROPERTY_LISTING} Property Listings`,
            `${ACTIVATION_LIMITS.PRO.ENQUIRY_LISTING} Enquiry Listings`,
            `${ACTIVATION_LIMITS.PRO.SUBMIT_PROPERTY_ENQUIRY} Property Submissions`,
            `${ACTIVATION_PLANS.PRO.credits} Credits`,
            "1 Month Activation",
        ],
    },
};

// ──────────────────────────────────────────────────────────
// Duration Savings (for regular plans display)
// ──────────────────────────────────────────────────────────
export const DURATION_SAVINGS: Record<RegularDuration, { label: string; savingsPercent?: number }> = {
    "3_MONTHS": {
        label: "3 Months",
    },
    "1_MONTH": {
        label: "1 Month",
        savingsPercent: 10,
    },
};

// ──────────────────────────────────────────────────────────
// Credits Configuration
// ──────────────────────────────────────────────────────────
export const ACTIVATION_CREDITS: Record<TIER, number> = {
    BASIC: 40,
    ESSENTIAL: 100,
    PRO: 180,
};

export const REGULAR_CREDITS: Record<TIER, Record<RegularDuration, number>> = {
    BASIC: { "1_MONTH": 200, "3_MONTHS": 600 },
    ESSENTIAL: { "1_MONTH": 400, "3_MONTHS": 1200 },
    PRO: { "1_MONTH": 1000, "3_MONTHS": 3000 },
};

// ──────────────────────────────────────────────────────────
// Default Credit Prices (fallback when API unavailable)
// ──────────────────────────────────────────────────────────
export const DEFAULT_CREDIT_PRICES = {
    REQUEST_CONTACT: 10,
    MARK_PROPERTY_AS_FEATURED: 10,
    MARK_ENQUIRY_AS_URGENT: 10,
    PROPERTY_LISTING: 10,
    ENQUIRY_LISTING: 10,
    SUBMIT_PROPERTY_ENQUIRY: 10,
};

/** @deprecated Use useGetCreditPrices hook instead to get dynamic prices from API */
export const CREDITS_PRICE = DEFAULT_CREDIT_PRICES;
