import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import {
  CreateEnquiryDTO,
  Enquiry,
  EnquirySubmission,
  MarketplaceEnquiry,
  EnquiryMessage,
} from "@/models/types/enquiry";

export type MarketplaceEnquiriesResponse = {
  enquiries: MarketplaceEnquiry[];
  total: number;
  page: number;
  totalPages: number;
};

export interface EnquiryMarketplaceFilters {
  enquiryPurpose?: "BUY" | "RENT";
  minRent?: number;
  maxRent?: number;
}

export const useGetMarketPlaceEnquiries = (
  page: number = 1,
  limit: number = 100,
  options?: { enabled?: boolean },
  filters?: EnquiryMarketplaceFilters
) => {
  const api = useAxios();

  const queryString = (() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (filters?.enquiryPurpose) {
      params.set("enquiryPurpose", filters.enquiryPurpose);
    }
    if (filters?.minRent !== undefined && filters.minRent > 0) {
      params.set("minRent", String(filters.minRent));
    }
    if (filters?.maxRent !== undefined) {
      params.set("maxRent", String(filters.maxRent));
    }
    return params.toString();
  })();

  const { data, isPending, error } = useQuery<MarketplaceEnquiriesResponse>({
    queryKey: ["market-place-enquiries", queryString],
    queryFn: async () => {
      return (
        await api.get(`/broker/enquiry/marketplace?${queryString}`)
      ).data.data as MarketplaceEnquiriesResponse;
    },
    enabled: options?.enabled ?? true,
  });
  return {
    marketPlaceEnquiries: data?.enquiries ?? [],
    pagination: {
      total: data?.total ?? 0,
      page: data?.page ?? page,
      totalPages: data?.totalPages ?? 1,
    },
    isPending,
    error,
  };
};

/**
 * Fetches ALL marketplace enquiries by paging through the backend (limit capped server-side).
 * Use sparingly (e.g., Unified Home toggle) to keep UX "show all" without manual pagination.
 */
export const useGetAllMarketPlaceEnquiries = (options?: {
  enabled?: boolean;
}) => {
  const api = useAxios();
  const { data, isPending, error } = useQuery<MarketplaceEnquiry[]>({
    queryKey: ["market-place-enquiries", "all"],
    queryFn: async () => {
      const limit = 100;
      const first = await api.get(
        `/broker/enquiry/marketplace?page=1&limit=${limit}`
      );
      const firstData = first.data.data as MarketplaceEnquiriesResponse;

      let all = [...(firstData.enquiries || [])];
      const totalPages = firstData.totalPages || 1;

      for (let p = 2; p <= totalPages; p++) {
        const resp = await api.get(
          `/broker/enquiry/marketplace?page=${p}&limit=${limit}`
        );
        const pageData = resp.data.data as MarketplaceEnquiriesResponse;
        all = all.concat(pageData.enquiries || []);
      }

      return all;
    },
    enabled: options?.enabled ?? true,
  });

  return { marketPlaceEnquiries: data ?? [], isPending, error };
};

export const useCreateEnquiry = () => {
  const api = useAxios();
  const { mutate, isPending, error } = useMutation<
    Enquiry,
    Error,
    CreateEnquiryDTO
  >({
    mutationFn: async (enquiry) => {
      return (await api.post("/broker/enquiry", enquiry)).data.data;
    },
  });
  return { createEnquiry: mutate, isPending, error };
};
export const useGetMyEnquiries = () => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<Enquiry[]>({
    queryKey: ["my-enquiries"],
    queryFn: async () => {
      return (await api.get("/broker/enquiry/my-requirements")).data.data
        .enquiries;
    },
  });
  return { myEnquiries: data, isLoading, error };
};
export const useGetEnquiryById = (id: string) => {
  const api = useAxios();
  const { data, isPending, error } = useQuery<Enquiry>({
    queryKey: ["enquiry", id],
    queryFn: async () => {
      return (await api.get(`/broker/enquiry/${id}`)).data.data;
    },
  });
  return { enquiry: data, isPending, error };
};
export const useSubmitPropertyToEnquiry = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    {
      enquiryId: string;
      propertyId: string;
      privateMessage?: string;
      bidCredits?: number;
      shouldUseCredits?: boolean;
      preferredLocationIndex?: number;
      enquiryDisclaimerAccepted?: boolean;
    }
  >({
    mutationFn: async ({
      enquiryId,
      propertyId,
      privateMessage,
      bidCredits,
      shouldUseCredits,
      preferredLocationIndex,
      enquiryDisclaimerAccepted,
    }) => {
      const payload: Record<string, unknown> = {
        propertyId,
        shouldUseCredits,
        enquiryDisclaimerAccepted,
      };
      const trimmedMessage = privateMessage?.trim();
      if (trimmedMessage) {
        payload.privateMessage = trimmedMessage;
      }
      if (bidCredits && bidCredits > 0) {
        payload.bidCredits = bidCredits;
      }
      if (preferredLocationIndex !== undefined) {
        payload.preferredLocationIndex = preferredLocationIndex;
      }
      return (await api.post(`/broker/enquiry/${enquiryId}/submit`, payload))
        .data.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate bid-related queries after submission with bid
      if (variables.bidCredits && variables.bidCredits > 0) {
        queryClient.invalidateQueries({
          queryKey: ["bid-leaderboard", variables.enquiryId],
        });
        queryClient.invalidateQueries({
          queryKey: ["my-bid", variables.enquiryId],
        });
        queryClient.invalidateQueries({
          queryKey: ["wallet-balance"],
        });
      }
    },
  });
  return { submitPropertyToEnquiry: mutate, isPending, error };
};

export const useSubmitFreshProperty = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    { enquiryId: string; payload: Record<string, unknown>; bidCredits?: number }
  >({
    mutationFn: async ({ enquiryId, payload, bidCredits }) => {
      const finalPayload = { ...payload };
      if (bidCredits && bidCredits > 0) {
        finalPayload.bidCredits = bidCredits;
      }
      return (
        await api.post(`/broker/enquiry/${enquiryId}/submit-fresh`, finalPayload)
      ).data.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate bid-related queries after submission with bid
      if (variables.bidCredits && variables.bidCredits > 0) {
        queryClient.invalidateQueries({
          queryKey: ["bid-leaderboard", variables.enquiryId],
        });
        queryClient.invalidateQueries({
          queryKey: ["my-bid", variables.enquiryId],
        });
        queryClient.invalidateQueries({
          queryKey: ["wallet-balance"],
        });
      }
    },
  });
  return { submitFreshProperty: mutate, isPending, error };
};

export const useGetEnquirySubmissions = (enquiryId: string) => {
  const api = useAxios();
  const { data, isPending, error } = useQuery<EnquirySubmission[]>({
    queryKey: ["enquiry-submissions", enquiryId],
    queryFn: async () => {
      return (await api.get(`/broker/enquiry/${enquiryId}/my-submissions`)).data
        .data;
    },
  });
  return { enquirySubmissions: data, isPending, error };
};

export const useCloseEnquiry = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation<
    void,
    Error,
    string
  >({
    mutationFn: async (enquiryId) => {
      return (await api.patch(`/broker/enquiry/${enquiryId}/close`)).data.data;
    },
    onSuccess: (_data, enquiryId) => {
      queryClient.invalidateQueries({ queryKey: ["my-enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["enquiry", enquiryId] });
    },
  });
  return {
    closeEnquiry: mutate,
    closeEnquiryAsync: mutateAsync,
    isPending,
    error,
  };
};

export const useGetReceivedProperties = (
  enquiryId: string,
  isMyEnquiry: boolean
) => {
  const api = useAxios();
  const { data, isPending, error } = useQuery<EnquirySubmission[]>({
    queryKey: ["received-properties", enquiryId],
    queryFn: async () => {
      return (await api.get(`/broker/enquiry/${enquiryId}/received-properties`))
        .data.data;
    },
    enabled: !!isMyEnquiry,
  });

  if (!isMyEnquiry) {
    return { receivedProperties: [], isPending: false, error: null };
  }
  return { receivedProperties: data, isPending, error };
};

export const useGetAdminMessages = (enquiryId: string) => {
  const api = useAxios();
  const { data, isPending, error } = useQuery<EnquiryMessage[]>({
    queryKey: ["admin-messages", enquiryId],
    queryFn: async () => {
      return (await api.get(`/broker/enquiry/${enquiryId}/messages`)).data.data;
    },
  });
  return { adminMessages: data, isPending, error };
};

export const useSendAdminMessage = (enquiryId: string) => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    { enquiryId: string; message: string }
  >({
    mutationFn: async ({ enquiryId, message }) => {
      return (
        await api.post(`/broker/enquiry/${enquiryId}/message`, { message })
      ).data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-messages", enquiryId],
      });
    },
  });
  return { sendAdminMessage: mutate, isPending, error };
};

export const useMarkAsInterested = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation<void, Error, string>({
    mutationFn: async (enquiryId) => {
      return (await api.put(`/broker/enquiry/${enquiryId}/markAsInterested`))
        .data.data;
    },
    onSuccess: (_data, enquiryId) => {
      queryClient.invalidateQueries({ queryKey: ["enquiry", enquiryId] });
      queryClient.invalidateQueries({ queryKey: ["market-place-enquiries"] });
    },
  });
  return { markAsInterested: mutate, isPending, error };
};

export const useShareContactDetails = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    { enquiryId: string; submissionId: string; availability: string }
  >({
    mutationFn: async ({ enquiryId, submissionId, availability }) => {
      return (
        await api.post(`/broker/enquiry/${enquiryId}/share-contact`, {
          submissionId,
          availability,
        })
      ).data.data;
    },
    onSuccess: (_data, { enquiryId }) => {
      queryClient.invalidateQueries({
        queryKey: ["received-properties", enquiryId],
      });
    },
  });
  return { shareContactDetails: mutate, isPending, error };
};

export const useMarkSubmissionViewed = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    { enquiryId: string; submissionId: string }
  >({
    mutationFn: async ({ enquiryId, submissionId }) => {
      return (
        await api.patch(
          `/broker/enquiry/${enquiryId}/submission/${submissionId}/viewed`
        )
      ).data.data;
    },
    onSuccess: (_data, { enquiryId }) => {
      queryClient.invalidateQueries({
        queryKey: ["received-properties", enquiryId],
      });
      queryClient.invalidateQueries({
        queryKey: ["enquiry-submissions", enquiryId],
      });
    },
  });
  return { markSubmissionViewed: mutate, isPending, error };
};
