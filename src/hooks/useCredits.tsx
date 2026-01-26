"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
    CreditPack,
    CreditTransactionType,
    WalletBalanceResponse,
    CreatePurchaseOrderResponse,
    TransactionHistoryResponse,
    CheckCreditBalanceResponse,
    CreditPrices,
    CreditPricesResponse,
} from "@/models/types/credit";
import { DEFAULT_CREDIT_PRICES } from "@/config/tier_limits";

/**
 * Hook to get credit prices for all actions (public endpoint, no auth required)
 */
export const useGetCreditPrices = () => {
    const { data, isLoading, error } = useQuery<CreditPricesResponse>({
        queryKey: ["credit-prices"],
        queryFn: async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/credits/prices`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch credit prices");
            }
            const result = await response.json();
            return result.data;
        },
        staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
        gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    });

    // Return prices with fallback to default values
    const prices: CreditPrices = data?.prices ?? DEFAULT_CREDIT_PRICES;

    return {
        prices,
        actions: data?.actions,
        isLoading,
        error,
    };
};

/**
 * Hook to get available credit packs
 */
export const useGetCreditPacks = () => {
    const api = useAxios();
    const { data, isLoading, error } = useQuery<CreditPack[]>({
        queryKey: ["credit-packs"],
        queryFn: async () => {
            const response = await api.get("/credits/packs");
            return response.data.data.packs;
        },
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
    });

    const sortedActivePacks = (data || [])
        .filter((pack) => pack.isActive)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return { creditPacks: sortedActivePacks, isLoading, error };
};

/**
 * Hook to get wallet balance
 */
export const useGetWalletBalance = (options?: { enabled?: boolean }) => {
    const api = useAxios();
    const { data, isLoading, error, refetch } = useQuery<WalletBalanceResponse>({
        queryKey: ["wallet-balance"],
        queryFn: async () => {
            const response = await api.get("/credits/balance");
            return response.data.data;
        },
        enabled: options?.enabled ?? true,
    });

    return {
        balance: data?.balance ?? 0,
        walletId: data?.walletId,
        isLoading,
        error,
        refetch,
    };
};

/**
 * Hook to create a purchase order for credits
 */
export const useCreateCreditPurchaseOrder = () => {
    const api = useAxios();
    const { mutateAsync, isPending, error } = useMutation<
        CreatePurchaseOrderResponse,
        AxiosError<{ message: string }>,
        { packId: string }
    >({
        mutationFn: async ({ packId }) => {
            const response = await api.post("/credits/purchase", { packId });
            return response.data.data;
        },
        onError: (error) => {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to create purchase order";
            toast.error(errorMessage);
        },
    });

    return { createPurchaseOrder: mutateAsync, isPending, error };
};

/**
 * Hook to get credit transaction history
 */
export const useGetCreditHistory = (
    options: {
        page?: number;
        limit?: number;
        type?: CreditTransactionType;
        enabled?: boolean;
    } = {}
) => {
    const api = useAxios();
    const { page = 1, limit = 20, type, enabled = true } = options;

    const { data, isLoading, error, refetch } = useQuery<TransactionHistoryResponse>({
        queryKey: ["credit-history", page, limit, type],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", limit.toString());
            if (type) {
                params.append("type", type);
            }
            const response = await api.get(`/credits/history?${params.toString()}`);
            return response.data.data;
        },
        enabled,
    });

    return {
        transactions: data?.transactions || [],
        total: data?.total || 0,
        page: data?.page || page,
        totalPages: data?.totalPages || 1,
        isLoading,
        error,
        refetch,
    };
};

/**
 * Hook to check if broker has enough credits
 */
export const useCheckCreditBalance = () => {
    const api = useAxios();
    const { mutateAsync, isPending, error } = useMutation<
        CheckCreditBalanceResponse,
        AxiosError<{ message: string }>,
        { amount: number }
    >({
        mutationFn: async ({ amount }) => {
            const response = await api.get(`/credits/check?amount=${amount}`);
            return response.data.data;
        },
    });

    return { checkBalance: mutateAsync, isPending, error };
};

/**
 * Hook to deduct credits (for internal use)
 */
export const useDeductCredits = () => {
    const api = useAxios();
    const queryClient = useQueryClient();
    const { mutateAsync, isPending, error } = useMutation<
        { balance: number; transactionId: string },
        AxiosError<{ message: string }>,
        { amount: number; description: string }
    >({
        mutationFn: async ({ amount, description }) => {
            const response = await api.post("/credits/deduct", { amount, description });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
            queryClient.invalidateQueries({ queryKey: ["credit-history"] });
        },
        onError: (error) => {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to deduct credits";
            toast.error(errorMessage);
        },
    });

    return { deductCredits: mutateAsync, isPending, error };
};

/**
 * Combined hook for credit operations with Razorpay integration
 */
export const useCredits = () => {
    const { creditPacks, isLoading: packsLoading } = useGetCreditPacks();
    const {
        balance,
        walletId,
        isLoading: balanceLoading,
        refetch: refetchBalance,
    } = useGetWalletBalance();
    const { createPurchaseOrder, isPending: purchasePending } =
        useCreateCreditPurchaseOrder();
    const queryClient = useQueryClient();

    const handlePurchaseSuccess = () => {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
        queryClient.invalidateQueries({ queryKey: ["credit-history"] });
        toast.success("Credits added successfully!");
    };

    const handlePurchaseFailure = (errorDescription: string) => {
        toast.error(`Payment failed: ${errorDescription}`);
    };

    const initiatePurchase = async (
        packId: string,
        userInfo: { name: string; email: string; phone: string }
    ) => {
        try {
            const orderData = await createPurchaseOrder({ packId });

            const options = {
                key: orderData.key_id,
                amount: orderData.amount.toString(),
                currency: orderData.currency,
                name: "Brokwise",
                description: `${orderData.pack.name} - ${orderData.pack.credits} Credits`,
                order_id: orderData.order.id,
                handler: function () {
                    handlePurchaseSuccess();
                },
                prefill: {
                    name: userInfo.name,
                    email: userInfo.email,
                    contact: userInfo.phone,
                },
                theme: {
                    color: "#3399cc",
                },
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rzp = new (window as any).Razorpay(options);
            rzp.on(
                "payment.failed",
                function (response: { error: { description: string } }) {
                    handlePurchaseFailure(response.error.description);
                }
            );
            rzp.open();
        } catch {
            // Error is already handled in the mutation
        }
    };

    return {
        balance,
        walletId,
        creditPacks,
        isLoading: packsLoading || balanceLoading,
        purchasePending,
        initiatePurchase,
        refetchBalance,
    };
};

export default useCredits;
