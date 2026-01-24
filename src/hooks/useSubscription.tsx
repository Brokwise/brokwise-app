"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  TIER,
  SubscriptionDuration,
  SubscriptionWithLimitsResponse,
  UsageWithLimits,
  RemainingQuotaResponse,
  PlansResponse,
  UsageHistoryResponse,
  CreateSubscriptionPayload,
  LinkRazorpayPayload,
  SubscriptionResponse,
} from "@/models/types/subscription";
import { getRazorpayPlan } from "@/config/tier_limits";

// Response type for createSubscription endpoint
interface CreateSubscriptionResponse {
  subscription: SubscriptionResponse;
  razorpay: {
    subscriptionId: string; // sub_xxx - use this for checkout
    shortUrl: string;
    keyId: string;
  };
  message: string;
}

/**
 * Hook to get all available subscription plans
 */
export const useGetPlans = () => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<PlansResponse>({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await api.get("/subscription/plans");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  return {
    plans: data?.plans || [],
    durations: data?.durations || [],
    isLoading,
    error,
  };
};

/**
 * Hook to get current subscription details
 */
export const useGetCurrentSubscription = (options?: { enabled?: boolean }) => {
  const api = useAxios();
  const { data, isLoading, error, refetch } =
    useQuery<SubscriptionWithLimitsResponse>({
      queryKey: ["current-subscription"],
      queryFn: async () => {
        const response = await api.get("/subscription");
        return response.data.data;
      },
      enabled: options?.enabled ?? true,
    });

  return {
    subscription: data?.subscription,
    limits: data?.limits,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to get current usage and limits
 */
export const useGetUsage = (options?: { enabled?: boolean }) => {
  const api = useAxios();
  const { data, isLoading, error, refetch } = useQuery<UsageWithLimits>({
    queryKey: ["usage"],
    queryFn: async () => {
      const response = await api.get("/usage");
      return response.data.data;
    },
    enabled: options?.enabled ?? true,
  });

  return {
    usage: data?.usage,
    limits: data?.limits,
    tier: data?.tier,
    periodStart: data?.periodStart,
    periodEnd: data?.periodEnd,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to get remaining quota
 */
export const useGetRemainingQuota = (options?: { enabled?: boolean }) => {
  const api = useAxios();
  const { data, isLoading, error, refetch } = useQuery<RemainingQuotaResponse>({
    queryKey: ["remaining-quota"],
    queryFn: async () => {
      const response = await api.get("/usage/remaining");
      return response.data.data;
    },
    enabled: options?.enabled ?? true,
  });

  return {
    remaining: data?.remaining,
    tier: data?.tier,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to get usage history
 */
export const useGetUsageHistory = (
  options: {
    page?: number;
    limit?: number;
    enabled?: boolean;
  } = {}
) => {
  const api = useAxios();
  const { page = 1, limit = 10, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery<UsageHistoryResponse>({
    queryKey: ["usage-history", page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      const response = await api.get(`/usage/history?${params.toString()}`);
      return response.data.data;
    },
    enabled,
  });

  return {
    usageRecords: data?.usageRecords || [],
    total: data?.total || 0,
    page: data?.page || page,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to create/upgrade subscription
 */
export const useCreateSubscription = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    CreateSubscriptionResponse,
    AxiosError<{ message: string }>,
    CreateSubscriptionPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post("/subscription/create", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
      queryClient.invalidateQueries({ queryKey: ["remaining-quota"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create subscription";
      toast.error(errorMessage);
    },
  });

  return { createSubscription: mutateAsync, isPending, error };
};

/**
 * Hook to link Razorpay subscription after payment
 */
export const useLinkRazorpaySubscription = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    { message: string; subscription: SubscriptionResponse },
    AxiosError<{ message: string }>,
    LinkRazorpayPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post("/subscription/link", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
      queryClient.invalidateQueries({ queryKey: ["remaining-quota"] });
      toast.success("Subscription activated successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to link subscription";
      toast.error(errorMessage);
    },
  });

  return { linkRazorpaySubscription: mutateAsync, isPending, error };
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    { message: string; subscription: SubscriptionResponse },
    AxiosError<{ message: string }>,
    void
  >({
    mutationFn: async () => {
      const response = await api.post("/subscription/cancel");
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
      queryClient.invalidateQueries({ queryKey: ["remaining-quota"] });
      toast.success("Subscription cancelled. You are now on the Starter plan.");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to cancel subscription";
      toast.error(errorMessage);
    },
  });

  return { cancelSubscription: mutateAsync, isPending, error };
};

/**
 * Combined hook for subscription management with Razorpay integration
 */
export const useSubscription = () => {
  const { plans, durations, isLoading: plansLoading } = useGetPlans();
  const {
    subscription,
    limits,
    isLoading: subscriptionLoading,
    refetch: refetchSubscription,
  } = useGetCurrentSubscription();
  const {
    usage,
    limits: usageLimits,
    tier,
    periodStart,
    periodEnd,
    isLoading: usageLoading,
    refetch: refetchUsage,
  } = useGetUsage();
  const { remaining, refetch: refetchRemaining } = useGetRemainingQuota();

  const { createSubscription, isPending: createPending } =
    useCreateSubscription();
  const { linkRazorpaySubscription, isPending: linkPending } =
    useLinkRazorpaySubscription();
  const { cancelSubscription, isPending: cancelPending } =
    useCancelSubscription();

  const queryClient = useQueryClient();

  /**
   * Initiate subscription purchase with Razorpay
   */
  const initiateSubscription = async (
    selectedTier: TIER,
    selectedDuration: SubscriptionDuration,
    userInfo: { name: string; email: string; phone: string }
  ) => {
    try {
      // Get the Razorpay plan configuration
      const razorpayPlan = getRazorpayPlan(selectedTier, selectedDuration);

      if (!razorpayPlan) {
        toast.error("Invalid plan configuration");
        return;
      }

      // Create the subscription on our backend - this creates a Razorpay subscription
      // and returns the subscription_id (sub_xxx) to use for checkout
      const result = await createSubscription({
        tier: selectedTier,
        duration: selectedDuration,
        razorpayPlanId: razorpayPlan.planId,
      });

      // Use the subscription_id from the backend response, NOT the plan_id
      const { subscriptionId, keyId } = result.razorpay;

      // Open Razorpay checkout for subscription
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId, // Use sub_xxx from backend, NOT plan_xxx
        name: "Brokwise",
        description: `${selectedTier} Plan - ${selectedDuration.replace("_", " ")}`,
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone,
        },
        theme: {
          color: "#3399cc",
        },
        handler: async function (response: {
          razorpay_subscription_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          // Link the subscription after successful payment
          try {
            await linkRazorpaySubscription({
              razorpaySubscriptionId: response.razorpay_subscription_id,
            });
            // Invalidate all related queries
            queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
            queryClient.invalidateQueries({ queryKey: ["usage"] });
            queryClient.invalidateQueries({ queryKey: ["remaining-quota"] });
          } catch {
            toast.error("Payment successful but failed to activate subscription. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Subscription process cancelled");
          },
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: { error: { description: string } }) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch {
      // Error is already handled in the mutation
    }
  };

  /**
   * Check if user can perform an action based on usage limits
   */
  const canPerformAction = (
    actionType: "property_listing" | "enquiry_listing" | "submit_property_enquiry"
  ): boolean => {
    if (!remaining) return false;
    return remaining[actionType] > 0;
  };

  /**
   * Get usage percentage for a specific action
   */
  const getUsagePercentage = (
    actionType: "property_listing" | "enquiry_listing" | "submit_property_enquiry"
  ): number => {
    if (!usage || !usageLimits) return 0;
    const used = usage[actionType];
    const limit = usageLimits[actionType];
    if (limit === 0) return 100;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  return {
    // Data
    subscription,
    limits,
    usage,
    usageLimits,
    tier,
    remaining,
    periodStart,
    periodEnd,
    plans,
    durations,

    // Loading states
    isLoading: plansLoading || subscriptionLoading || usageLoading,
    createPending,
    linkPending,
    cancelPending,

    // Actions
    initiateSubscription,
    cancelSubscription,
    refetchSubscription,
    refetchUsage,
    refetchRemaining,

    // Helpers
    canPerformAction,
    getUsagePercentage,
  };
};

export default useSubscription;
