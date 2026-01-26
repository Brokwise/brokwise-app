"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import useAxios from "./useAxios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  ContactRequestsListResponse,
  CreateContactRequestResponse,
  ListContactRequestsParams,
  PendingCountResponse,
  PopulatedContactRequest,
  RespondContactRequestResponse,
} from "@/types/contact-request";

/**
 * Hook to create a contact request for a property
 */
export const useCreateContactRequest = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation<
    CreateContactRequestResponse,
    AxiosError<{ message: string }>,
    { propertyId: string }
  >({
    mutationFn: async ({ propertyId }) => {
      const response = await api.post("/contact-requests", { propertyId });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Contact request sent successfully");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["credit-history"] });
      queryClient.invalidateQueries({ queryKey: ["contact-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["contact-request-status", variables.propertyId],
      });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send contact request";
      toast.error(errorMessage);
    },
  });

  return {
    createContactRequest: mutate,
    createContactRequestAsync: mutateAsync,
    isPending,
    error,
  };
};

/**
 * Hook to respond to a contact request (accept/reject)
 */
export const useRespondToContactRequest = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation<
    RespondContactRequestResponse,
    AxiosError<{ message: string }>,
    { requestId: string; action: "ACCEPT" | "REJECT" }
  >({
    mutationFn: async ({ requestId, action }) => {
      const response = await api.patch(`/contact-requests/${requestId}/respond`, {
        action,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      if (data.status === "ACCEPTED") {
        toast.success("Contact request accepted. Contact has been shared.");
      } else {
        toast.success("Contact request rejected. Credits have been refunded.");
      }
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["contact-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-contact-requests-count"] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to respond to contact request";
      toast.error(errorMessage);
    },
  });

  return {
    respondToContactRequest: mutate,
    respondToContactRequestAsync: mutateAsync,
    isPending,
    error,
  };
};

/**
 * Hook to get contact requests (sent and/or received)
 */
export const useGetContactRequests = (
  params: ListContactRequestsParams = {},
  options?: { enabled?: boolean }
) => {
  const api = useAxios();
  const { type, status, page = 1, limit = 20 } = params;

  const { data, isLoading, error, refetch } = useQuery<ContactRequestsListResponse>({
    queryKey: ["contact-requests", type, status, page, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (type) queryParams.append("type", type);
      if (status) queryParams.append("status", status);
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await api.get(`/contact-requests?${queryParams.toString()}`);
      return response.data.data;
    },
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });

  return {
    requests: data?.requests || [],
    total: data?.total || 0,
    page: data?.page || page,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to get a single contact request by ID
 */
export const useGetContactRequestById = (
  requestId: string,
  options?: { enabled?: boolean }
) => {
  const api = useAxios();

  const { data, isLoading, error, refetch } = useQuery<PopulatedContactRequest>({
    queryKey: ["contact-request", requestId],
    queryFn: async () => {
      const response = await api.get(`/contact-requests/${requestId}`);
      return response.data.data;
    },
    enabled: (options?.enabled ?? true) && !!requestId,
  });

  return {
    contactRequest: data,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to get count of pending received requests (for notification badge)
 */
export const useGetPendingContactRequestsCount = (options?: { enabled?: boolean }) => {
  const api = useAxios();

  const { data, isLoading, error, refetch } = useQuery<PendingCountResponse>({
    queryKey: ["pending-contact-requests-count"],
    queryFn: async () => {
      const response = await api.get("/contact-requests/pending-count");
      return response.data.data;
    },
    enabled: options?.enabled ?? true,
    // Refresh every minute to keep count updated
    refetchInterval: 60000,
  });

  return {
    pendingCount: data?.pendingCount || 0,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to check if a contact request exists for a property
 * This checks if the current user has already sent a request or has an accepted request
 */
export const useCheckContactRequestStatus = (
  propertyId: string,
  options?: { enabled?: boolean }
) => {
  const api = useAxios();

  const { data, isLoading, error, refetch } = useQuery<PopulatedContactRequest | null>({
    queryKey: ["contact-request-status", propertyId],
    queryFn: async () => {
      // Get contact requests for this property sent by the current user
      const response = await api.get(`/contact-requests?type=sent`);
      const requests: PopulatedContactRequest[] = response.data.data.requests || [];

      // Find a request for this specific property
      const existingRequest = requests.find((req) => {
        const reqPropertyId = typeof req.propertyId === "string"
          ? req.propertyId
          : req.propertyId._id;
        return reqPropertyId === propertyId;
      });

      return existingRequest || null;
    },
    enabled: (options?.enabled ?? true) && !!propertyId,
  });

  return {
    existingRequest: data,
    hasExistingRequest: !!data,
    isPending: data?.status === "PENDING",
    isAccepted: data?.status === "ACCEPTED",
    isRejected: data?.status === "REJECTED",
    isExpired: data?.status === "EXPIRED",
    isLoading,
    error,
    refetch,
  };
};

/**
 * Combined hook for contact request operations
 */
export const useContactRequests = () => {
  const { createContactRequest, createContactRequestAsync, isPending: isCreating } =
    useCreateContactRequest();
  const { respondToContactRequest, respondToContactRequestAsync, isPending: isResponding } =
    useRespondToContactRequest();
  const { pendingCount, isLoading: isLoadingCount } = useGetPendingContactRequestsCount();

  return {
    createContactRequest,
    createContactRequestAsync,
    respondToContactRequest,
    respondToContactRequestAsync,
    pendingCount,
    isCreating,
    isResponding,
    isLoadingCount,
  };
};

export default useContactRequests;
