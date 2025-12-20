import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { ListingStatus, Property } from "@/types/property";
import {
  CreateEnquiryDTO,
  Enquiry,
  EnquiryStatus,
} from "@/models/types/enquiry";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { PropertyFormData } from "@/validators/property";
import { Broker } from "@/stores/authStore";

export interface GetCompanyPropertiesDTO {
  page?: string;
  limit?: string;
  listingStatus?: ListingStatus;
  brokerId?: string;
}

export interface GetCompanyEnquiriesDTO {
  page?: string;
  limit?: string;
  status?: EnquiryStatus;
  brokerId?: string;
}

export interface CompanyPropertiesResponse {
  properties: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CompanyEnquiriesResponse {
  enquiries: (Enquiry & {
    creator: {
      _id: string;
      email: string;
      name?: string;
      firstName?: string;
      lastName?: string;
      brokerId?: string;
    };
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface GetBrokerDetails {
  properties: Property[];
  enquiries: Enquiry[];
}

export const useGetCompanyProperties = (
  filters?: GetCompanyPropertiesDTO,
  options?: { enabled?: boolean }
) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<CompanyPropertiesResponse>({
    queryKey: ["company-properties", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page);
      if (filters?.limit) params.append("limit", filters.limit);
      if (filters?.listingStatus)
        params.append("listingStatus", filters.listingStatus);
      if (filters?.brokerId) params.append("brokerId", filters.brokerId);

      return (await api.get(`/company/properties?${params.toString()}`)).data
        .data;
    },
    enabled: options?.enabled ?? true,
  });
  return { data, isLoading, error };
};

export const useGetCompanyEnquiries = (filters?: GetCompanyEnquiriesDTO) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<CompanyEnquiriesResponse>({
    queryKey: ["company-enquiries", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page);
      if (filters?.limit) params.append("limit", filters.limit);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.brokerId) params.append("brokerId", filters.brokerId);

      return (await api.get(`/company/enquiries?${params.toString()}`)).data
        .data;
    },
  });
  return { data, isLoading, error };
};

export const useSoftDeleteCompanyProperty = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation<
    unknown,
    AxiosError<{ message: string }>,
    { propertyId: string; reason?: string }
  >({
    mutationFn: async ({ propertyId, reason }) => {
      return (
        await api.delete(`/company/properties/${propertyId}`, {
          data: { reason },
        })
      ).data;
    },
    onSuccess: () => {
      toast.success("Property deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["company-properties"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while deleting the property.";
      toast.error(errorMessage);
    },
  });
  return { softDeleteProperty: mutate, isPending, error };
};

export const useGetCompanyBrokers = (status?: string) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<Broker[]>({
    queryKey: ["company-brokers", status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : "";
      return (await api.get(`/company/brokers${params}`)).data.data;
    },
  });
  return { data, isLoading, error };
};

export const useCreateCompanyEnquiry = () => {
  const api = useAxios();
  const { mutate, isPending, error } = useMutation<
    Enquiry,
    Error,
    CreateEnquiryDTO
  >({
    mutationFn: async (enquiry) => {
      return (await api.post("/company/enquiries", enquiry)).data.data;
    },
  });
  return { createEnquiry: mutate, isPending, error };
};

export const useCreateCompanyProperty = () => {
  const api = useAxios();
  const {
    mutate: addProperty,
    mutateAsync: addPropertyAsync,
    isPending: isLoading,
    error,
  } = useMutation<
    unknown,
    AxiosError<{ message: string }>,
    PropertyFormData & { brokerId?: string }
  >({
    mutationFn: async (property) => {
      return (await api.post("/company/properties/create", property)).data.data;
    },
    onSuccess: () => {
      toast.success("Property created successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while creating the property.";
      toast.error(errorMessage);
    },
  });
  return { addProperty, addPropertyAsync, isLoading, error };
};

export const useSaveCompanyPropertyDraft = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    Property,
    AxiosError<{ message: string }>,
    PropertyFormData & { brokerId?: string }
  >({
    mutationFn: async (property) => {
      return (await api.post(`/company/properties/draft`, property)).data.data;
    },
    onSuccess: () => {
      toast.success("Property saved as draft successfully");
      queryClient.invalidateQueries({ queryKey: ["company-properties"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while saving the property as draft.";
      toast.error(errorMessage);
    },
  });
  return { savePropertyAsDraft: mutateAsync, isPending, error };
};

export const useSoftDeleteBrokerEnquiry = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation<
    unknown,
    AxiosError<{ message: string }>,
    { enquiryId: string; reason?: string }
  >({
    mutationFn: async ({ enquiryId, reason }) => {
      return (
        await api.delete(`/company/enquiries/broker/${enquiryId}`, {
          data: { reason },
        })
      ).data;
    },
    onSuccess: () => {
      toast.success("Enquiry deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["company-enquiries"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while deleting the enquiry.";
      toast.error(errorMessage);
    },
  });
  return { softDeleteBrokerEnquiry: mutate, isPending, error };
};

export const useHardDeleteCompanyEnquiry = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation<
    unknown,
    AxiosError<{ message: string }>,
    { enquiryId: string }
  >({
    mutationFn: async ({ enquiryId }) => {
      return (await api.delete(`/company/enquiries/company/${enquiryId}`)).data;
    },
    onSuccess: () => {
      toast.success("Enquiry permanently deleted");
      queryClient.invalidateQueries({ queryKey: ["company-enquiries"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while deleting the enquiry.";
      toast.error(errorMessage);
    },
  });
  return { hardDeleteCompanyEnquiry: mutate, isPending, error };
};

export const useGetBrokerDetails = (id: string) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<GetBrokerDetails>({
    queryKey: ["brokerDetaills", id],
    queryFn: async () => {
      return (await api.get(`/company/brokerDetails?brokerId=${id}`)).data.data;
    },
  });
  return { data, isLoading, error };
};
