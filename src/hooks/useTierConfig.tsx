"use client";

import { useQuery } from "@tanstack/react-query";
import {
    TIER,
    TierLimits,
    RegularDuration,
    RazorpayPlanConfig,
    ActivationPlanConfig,
} from "@/models/types/subscription";
import {
    REGULAR_LIMITS as DEFAULT_REGULAR_LIMITS,
    ACTIVATION_LIMITS as DEFAULT_ACTIVATION_LIMITS,
    ACTIVATION_PLANS as DEFAULT_ACTIVATION_PLANS,
    ACTIVATION_CREDITS as DEFAULT_ACTIVATION_CREDITS,
    REGULAR_CREDITS as DEFAULT_REGULAR_CREDITS,
    RAZORPAY_PLANS,
    DEFAULT_CREDIT_PRICES,
} from "@/config/tier_limits";

interface TierConfigApiResponse {
    tierLimits: Record<TIER, TierLimits>;
    activationLimits: Record<TIER, TierLimits>;
    creditsPrice: Record<string, number>;
    pricing: {
        activationPricing: Record<TIER, number>;
        monthlyPricing: Record<TIER, number>;
        quarterlyPricing: Record<TIER, number>;
    };
    credits: {
        activationCredits: Record<TIER, number>;
        monthlyCredits: Record<TIER, number>;
        quarterlyCredits: Record<TIER, number>;
    };
}

export type TierInfoItem = {
    name: string;
    description: string;
    features: string[];
    recommended?: boolean;
};

function buildTierInfo(limits: Record<TIER, TierLimits>): Record<TIER, TierInfoItem> {
    return {
        BASIC: {
            name: "Basic",
            description: "Perfect for individual brokers just getting started",
            features: [
                `Up to ${limits.BASIC.PROPERTY_LISTING} Property Listings/mo`,
                `Up to ${limits.BASIC.ENQUIRY_LISTING} Enquiry Listings/mo`,
                `Up to ${limits.BASIC.SUBMIT_PROPERTY_ENQUIRY} Property Submissions/mo`,
                "Basic Support",
            ],
        },
        ESSENTIAL: {
            name: "Essential",
            description: "Ideal for growing brokers with moderate needs",
            features: [
                `Up to ${limits.ESSENTIAL.PROPERTY_LISTING} Property Listings/mo`,
                `Up to ${limits.ESSENTIAL.ENQUIRY_LISTING} Enquiry Listings/mo`,
                `Up to ${limits.ESSENTIAL.SUBMIT_PROPERTY_ENQUIRY} Property Submissions/mo`,
                "Priority Support",
                "Analytics Dashboard",
            ],
            recommended: true,
        },
        PRO: {
            name: "Pro",
            description: "For power users and established agencies",
            features: [
                `Up to ${limits.PRO.PROPERTY_LISTING} Property Listings/mo`,
                `Up to ${limits.PRO.ENQUIRY_LISTING} Enquiry Listings/mo`,
                `Up to ${limits.PRO.SUBMIT_PROPERTY_ENQUIRY} Property Submissions/mo`,
                "Premium Support",
                "Advanced Analytics",
                "Team Collaboration",
            ],
        },
    };
}

function buildActivationTierInfo(
    limits: Record<TIER, TierLimits>,
    activationPlans: Record<TIER, ActivationPlanConfig>
): Record<TIER, TierInfoItem> {
    return {
        BASIC: {
            name: "Basic",
            description: "Get started with the essentials",
            features: [
                `${limits.BASIC.PROPERTY_LISTING} Property Listings`,
                `${limits.BASIC.ENQUIRY_LISTING} Enquiry Listings`,
                `${limits.BASIC.SUBMIT_PROPERTY_ENQUIRY} Property Submissions`,
                `${activationPlans.BASIC.credits} Credits`,
                "1 Month Activation",
            ],
        },
        ESSENTIAL: {
            name: "Essential",
            description: "The most popular choice for brokers",
            features: [
                `${limits.ESSENTIAL.PROPERTY_LISTING} Property Listings`,
                `${limits.ESSENTIAL.ENQUIRY_LISTING} Enquiry Listings`,
                `${limits.ESSENTIAL.SUBMIT_PROPERTY_ENQUIRY} Property Submissions`,
                `${activationPlans.ESSENTIAL.credits} Credits`,
                "1 Month Activation",
            ],
            recommended: true,
        },
        PRO: {
            name: "Pro",
            description: "Maximum power from day one",
            features: [
                `${limits.PRO.PROPERTY_LISTING} Property Listings`,
                `${limits.PRO.ENQUIRY_LISTING} Enquiry Listings`,
                `${limits.PRO.SUBMIT_PROPERTY_ENQUIRY} Property Submissions`,
                `${activationPlans.PRO.credits} Credits`,
                "1 Month Activation",
            ],
        },
    };
}

function mergeActivationPlans(
    staticPlans: Record<TIER, ActivationPlanConfig>,
    apiPricing?: Record<TIER, number>,
    apiCredits?: Record<TIER, number>
): Record<TIER, ActivationPlanConfig> {
    const tiers: TIER[] = ["BASIC", "ESSENTIAL", "PRO"];
    const result = {} as Record<TIER, ActivationPlanConfig>;

    for (const tier of tiers) {
        result[tier] = {
            ...staticPlans[tier],
            displayAmount: apiPricing?.[tier] ?? staticPlans[tier].displayAmount,
            credits: apiCredits?.[tier] ?? staticPlans[tier].credits,
        };
    }

    return result;
}

function mergeRegularCredits(
    monthlyCredits?: Record<TIER, number>,
    quarterlyCredits?: Record<TIER, number>
): Record<TIER, Record<RegularDuration, number>> {
    const tiers: TIER[] = ["BASIC", "ESSENTIAL", "PRO"];
    const result = {} as Record<TIER, Record<RegularDuration, number>>;

    for (const tier of tiers) {
        result[tier] = {
            "1_MONTH": monthlyCredits?.[tier] ?? DEFAULT_REGULAR_CREDITS[tier]["1_MONTH"],
            "3_MONTHS": quarterlyCredits?.[tier] ?? DEFAULT_REGULAR_CREDITS[tier]["3_MONTHS"],
        };
    }

    return result;
}

export const useTierConfig = () => {
    const { data, isLoading } = useQuery<TierConfigApiResponse>({
        queryKey: ["tier-config"],
        queryFn: async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/tier-config`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch tier config");
            }
            const result = await response.json();
            return result.data ?? result;
        },
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 24,
    });

    const regularLimits: Record<TIER, TierLimits> =
        data?.tierLimits ?? DEFAULT_REGULAR_LIMITS;

    const activationLimits: Record<TIER, TierLimits> =
        data?.activationLimits ?? DEFAULT_ACTIVATION_LIMITS;

    const activationPlans = mergeActivationPlans(
        DEFAULT_ACTIVATION_PLANS,
        data?.pricing?.activationPricing,
        data?.credits?.activationCredits
    );

    const activationCredits: Record<TIER, number> = {
        BASIC: data?.credits?.activationCredits?.BASIC ?? DEFAULT_ACTIVATION_CREDITS.BASIC,
        ESSENTIAL: data?.credits?.activationCredits?.ESSENTIAL ?? DEFAULT_ACTIVATION_CREDITS.ESSENTIAL,
        PRO: data?.credits?.activationCredits?.PRO ?? DEFAULT_ACTIVATION_CREDITS.PRO,
    };

    const regularCredits = mergeRegularCredits(
        data?.credits?.monthlyCredits,
        data?.credits?.quarterlyCredits
    );

    const tierInfo = buildTierInfo(regularLimits);
    const activationTierInfo = buildActivationTierInfo(activationLimits, activationPlans);

    const getRazorpayPlan = (
        tier: TIER,
        duration: RegularDuration
    ): RazorpayPlanConfig | undefined => {
        const staticPlan = RAZORPAY_PLANS.find(
            (p) => p.tier === tier && p.duration === duration
        );
        if (!staticPlan) return undefined;

        const apiPricing =
            duration === "1_MONTH"
                ? data?.pricing?.monthlyPricing
                : data?.pricing?.quarterlyPricing;
        const apiCredits =
            duration === "1_MONTH"
                ? data?.credits?.monthlyCredits
                : data?.credits?.quarterlyCredits;

        return {
            ...staticPlan,
            displayAmount: apiPricing?.[tier] ?? staticPlan.displayAmount,
            credits: apiCredits?.[tier] ?? staticPlan.credits,
        };
    };

    const creditPrices = (data?.creditsPrice ?? DEFAULT_CREDIT_PRICES) as typeof DEFAULT_CREDIT_PRICES;

    return {
        regularLimits,
        activationLimits,
        activationPlans,
        activationCredits,
        regularCredits,
        tierInfo,
        activationTierInfo,
        getRazorpayPlan,
        creditPrices,
        isConfigLoading: isLoading,
    };
};

export default useTierConfig;
