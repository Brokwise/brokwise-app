import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import {
  CreateEnquiryDTO,
  Enquiry,
  EnquirySubmission,
  MarketplaceEnquiry,
  EnquiryMessage,
} from "@/models/types/enquiry";

export const useGetMarketPlaceEnquiries = () => {
  const api = useAxios();
  const { data, isPending, error } = useQuery<MarketplaceEnquiry[]>({
    queryKey: ["market-place-enquiries"],
    queryFn: async () => {
      return (await api.get("/broker/enquiry/marketplace")).data.data.enquiries;
    },
  });
  return { marketPlaceEnquiries: data, isPending, error };
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
  const { data, isPending, error } = useQuery<Enquiry[]>({
    queryKey: ["my-enquiries"],
    queryFn: async () => {
      return (await api.get("/broker/enquiry/my-requirements")).data.data
        .enquiries;
    },
  });
  return { myEnquiries: data, isPending, error };
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
  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    { enquiryId: string; propertyId: string; privateMessage: string }
  >({
    mutationFn: async ({ enquiryId, propertyId, privateMessage }) => {
      return (
        await api.post(`/broker/enquiry/${enquiryId}/submit`, {
          propertyId,
          privateMessage,
        })
      ).data.data;
    },
  });
  return { submitPropertyToEnquiry: mutate, isPending, error };
};

export const useSubmitFreshProperty = () => {
  const api = useAxios();
  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    { enquiryId: string; payload: Record<string, string> }
  >({
    mutationFn: async ({ enquiryId, payload }) => {
      return (
        await api.post(`/broker/enquiry/${enquiryId}/submit-fresh`, payload)
      ).data.data;
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
  const { mutate, isPending, error } = useMutation<void, Error, string>({
    mutationFn: async (enquiryId) => {
      return (await api.patch(`/broker/enquiry/${enquiryId}/close`)).data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-enquiries"] });
    },
  });
  return { closeEnquiry: mutate, isPending, error };
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
