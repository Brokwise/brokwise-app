"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  TIER,
  RegularDuration,
  SubscriptionWithLimitsResponse,
  UsageWithLimits,
  RemainingQuotaResponse,
  PlansResponse,
  UsageHistoryResponse,
  CreateSubscriptionPayload,
  LinkRazorpayPayload,
  SubscriptionResponse,
  PurchaseActivationPayload,
  VerifyActivationPayload,
  ActivationPurchaseResponse,
} from "@/models/types/subscription";
import { getRazorpayPlan, getActivationPlan } from "@/config/tier_limits";

interface CreateSubscriptionResponse {
  subscription: SubscriptionResponse;
  razorpay: {
    subscriptionId: string;
    shortUrl: string;
    keyId: string;
  };
  message: string;
}


export const useGetPlans = () => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<PlansResponse>({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await api.get("/subscription/plans");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 60,
  });

  return {
    plans: data?.plans || [],
    durations: data?.durations || [],
    activationPlans: data?.activationPlans || [],
    regularPlans: data?.regularPlans || [],
    isLoading,
    error,
  };
};


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
 * Hook to create/upgrade regular subscription (Phase 2)
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
 * Hook to purchase activation pack (Phase 1 - one-time Razorpay order)
 */
export const usePurchaseActivation = () => {
  const api = useAxios();

  const { mutateAsync, isPending, error } = useMutation<
    ActivationPurchaseResponse,
    AxiosError<{ message: string }>,
    PurchaseActivationPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post("/subscription/activate", payload);
      return response.data.data;
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to initiate activation purchase";
      toast.error(errorMessage);
    },
  });

  return { purchaseActivation: mutateAsync, isPending, error };
};

/**
 * Hook to verify activation payment after Razorpay checkout
 */
export const useVerifyActivation = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    { message: string; subscription: SubscriptionResponse },
    AxiosError<{ message: string }>,
    VerifyActivationPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post("/subscription/activate/verify", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
      queryClient.invalidateQueries({ queryKey: ["remaining-quota"] });
      toast.success("Activation pack purchased successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to verify activation payment";
      toast.error(errorMessage);
    },
  });

  return { verifyActivation: mutateAsync, isPending, error };
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
      toast.success("Subscription cancelled.");
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
  const { plans, durations, activationPlans, regularPlans, isLoading: plansLoading } = useGetPlans();
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
  const { purchaseActivation, isPending: activationPending } =
    usePurchaseActivation();
  const { verifyActivation, isPending: verifyPending } =
    useVerifyActivation();

  const queryClient = useQueryClient();

  // Determine current phase
  const currentPhase = subscription?.phase || null;
  const hasCompletedActivation = !!subscription?.activationCompletedAt;

  // Broker needs activation if:
  // - No subscription at all
  // - Subscription exists but has no phase set (legacy/incomplete)
  // - Subscription was cancelled/expired before completing activation
  const needsActivation =
    !subscription ||
    !subscription.phase ||
    (subscription.phase === "activation" &&
      !subscription.activationCompletedAt &&
      (subscription.status === "expired" || subscription.status === "cancelled"));

  /**
   * Initiate activation pack purchase (Phase 1 - one-time order)
   */
  const initiateActivation = async (
    selectedTier: TIER,
    userInfo: { name: string; email: string; phone: string }
  ): Promise<boolean> => {
    try {
      const activationPlan = getActivationPlan(selectedTier);
      if (!activationPlan?.planId) {
        toast.error("Invalid activation plan configuration");
        return false;
      }

      const result = await purchaseActivation({ plan_id: activationPlan.planId });

      const { orderId, amount, currency, keyId } = result.payment;

      return new Promise((resolve) => {
        const options = {
          key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount,
          currency: currency,
          order_id: orderId,
          name: "Brokwise",
          description: `${selectedTier} Activation Pack`,
          prefill: {
            name: userInfo.name,
            email: userInfo.email,
            contact: userInfo.phone,
          },
          theme: {
            color: "#3399cc",
          },
          handler: async function (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) {
            try {
              await verifyActivation({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
              queryClient.invalidateQueries({ queryKey: ["usage"] });
              queryClient.invalidateQueries({ queryKey: ["remaining-quota"] });
              resolve(true);
            } catch {
              toast.error("Payment successful but verification failed. Please contact support.");
              resolve(false);
            }
          },
          modal: {
            ondismiss: function () {
              toast.info("Activation purchase cancelled");
              resolve(false);
            },
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: { error: { description: string } }) {
          toast.error(`Payment failed: ${response.error.description}`);
          resolve(false);
        });
        rzp.open();
      });
    } catch {
      return false;
    }
  };

  /**
   * Initiate regular subscription purchase (Phase 2)
   */
  const initiateSubscription = async (
    selectedTier: TIER,
    selectedDuration: RegularDuration,
    userInfo: { name: string; email: string; phone: string }
  ) => {
    try {
      const razorpayPlan = getRazorpayPlan(selectedTier, selectedDuration);

      if (!razorpayPlan) {
        toast.error("Invalid plan configuration");
        return;
      }

      const result = await createSubscription({
        tier: selectedTier,
        duration: selectedDuration,
        razorpayPlanId: razorpayPlan.planId,
      });

      const { subscriptionId, keyId } = result.razorpay;

      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
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
          try {
            await linkRazorpaySubscription({
              razorpaySubscriptionId: response.razorpay_subscription_id,
            });
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
    activationPlans,
    regularPlans,

    // Phase info
    currentPhase,
    hasCompletedActivation,
    needsActivation,

    // Loading states
    isLoading: plansLoading || subscriptionLoading || usageLoading,
    createPending,
    linkPending,
    cancelPending,
    activationPending,
    verifyPending,

    // Actions
    initiateActivation,
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
