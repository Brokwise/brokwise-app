import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import useAxios from "./useAxios";
import { PropertyFormData } from "@/validators/property";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Property,
  ListingStatus,
  PaginatedPropertyResponse,
  OfferDataDTO,
  SubmitFinalOfferDTO,
  PropertyOffer,
} from "@/types/property";

export const useAddProperty = () => {
  const api = useAxios();
  const {
    mutate: addProperty,
    mutateAsync,
    isPending: isLoading,
    error,
  } = useMutation<unknown, AxiosError<{ message: string }>, PropertyFormData>({
    mutationFn: async (property: PropertyFormData) => {
      return (await api.post("/property/create", property)).data.data;
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
  return { addProperty, addPropertyAsync: mutateAsync, isLoading, error };
};

export const useGetProperty = (
  id: string,
  options?: {
    enabled?: boolean;
  }
) => {
  const api = useAxios();
  const {
    data: property,
    isLoading,
    error,
  } = useQuery<Property>({
    queryKey: ["property", id],
    queryFn: async () => {
      return (await api.get(`/property/details/${id}`)).data.data;
    },
    enabled: options?.enabled ?? true,
  });
  return { property, isLoading, error };
};

export const useGetAllProperties = (page = 1, limit = 100) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<PaginatedPropertyResponse>({
    queryKey: ["properties", page, limit],
    queryFn: async () => {
      return (await api.get(`/property/list?page=${page}&limit=${limit}`)).data
        .data;
    },
    placeholderData: keepPreviousData,
  });

  return {
    properties: data?.properties || [],
    pagination: {
      total: data?.total || 0,
      page: data?.page || 1,
      totalPages: data?.totalPages || 1,
    },
    isLoading,
    error,
  };
};

export const useGetMyListings = (options?: { enabled?: boolean }) => {
  const api = useAxios();
  const {
    data: myListings,
    isLoading,
    error,
  } = useQuery<Property[]>({
    queryKey: ["my-listings"],
    queryFn: async () => {
      return (await api.get("/property/broker/properties")).data.data
        .properties;
    },
    enabled: options?.enabled ?? true,
  });
  return { myListings, isLoading, error };
};

export const useUpdatePropertyStatus = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation<
    unknown,
    AxiosError<{ message: string }>,
    { propertyId: string; status: ListingStatus }
  >({
    mutationFn: async ({ propertyId, status }) => {
      return (
        await api.patch(`/property/update-status/${propertyId}`, { status })
      ).data;
    },
    onSuccess: () => {
      toast.success("Property status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while updating the property status.";
      toast.error(errorMessage);
    },
  });
  return { mutate, isPending, error };
};

import { useApp } from "@/context/AppContext";

export const useRequestDeleteProperty = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { brokerData } = useApp();

  const { mutate, isPending, error } = useMutation<
    unknown,
    AxiosError<{ message: string }>,
    { propertyId: string; reason: string }
  >({
    mutationFn: async ({ propertyId, reason }) => {
      if (!brokerData) {
        throw new Error("Broker data not available");
      }

      const payload = {
        propertyId,
        reason,
        brokerName: `${brokerData.firstName} ${brokerData.lastName}`,
        brokerId: brokerData.uid,
      };

      return (await api.delete(`/property/delete`, { data: payload })).data;
    },
    onSuccess: () => {
      toast.success("Property deletion request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while submitting deletion request.";
      toast.error(errorMessage);
    },
  });
  return { requestDelete: mutate, isPending, error };
};
export const useSavePropertyAsDraft = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    Property,
    AxiosError<{ message: string }>,
    PropertyFormData
  >({
    mutationFn: async (property: PropertyFormData) => {
      return (await api.post(`/property/draft`, property)).data.data;
    },
    onSuccess: () => {
      toast.success("Property saved as draft successfully");
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
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

export const useOfferPrice = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    PropertyOffer,
    AxiosError<{ message: string }>,
    OfferDataDTO
  >({
    mutationFn: async (data: OfferDataDTO) => {
      return (await api.post("/property/offerPrice", data)).data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Offer submitted successfully");
      queryClient.invalidateQueries({
        queryKey: ["property", variables.propertyId],
      });
      queryClient.invalidateQueries({ queryKey: ["broker-offers"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while submitting offer.";
      toast.error(errorMessage);
    },
  });
  return { offerPrice: mutateAsync, isPending, error };
};

export const useSubmitFinalOffer = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    PropertyOffer,
    AxiosError<{ message: string }>,
    SubmitFinalOfferDTO
  >({
    mutationFn: async (data: SubmitFinalOfferDTO) => {
      return (await api.post("/property/submitFinalOffer", data)).data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Final offer submitted successfully");
      queryClient.invalidateQueries({
        queryKey: ["property", variables.propertyId],
      });
      queryClient.invalidateQueries({ queryKey: ["broker-offers"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while submitting final offer.";
      toast.error(errorMessage);
    },
  });
  return { submitFinalOffer: mutateAsync, isPending, error };
};

export const useGetBrokerOffers = (options?: { enabled?: boolean }) => {
  const api = useAxios();
  const {
    data: offers,
    isLoading,
    error,
  } = useQuery<{ property: Property; offer: PropertyOffer }[]>({
    queryKey: ["broker-offers"],
    queryFn: async () => {
      return (await api.get("/property/broker/offers")).data.data;
    },
    enabled: options?.enabled ?? true,
  });
  return { offers, isLoading, error };
};

export const useSharePropertyContact = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation<
    void,
    Error,
    { propertyId: string; offerId: string; availability: string }
  >({
    mutationFn: async ({ propertyId, offerId, availability }) => {
      return (
        await api.post(`/property/share-contact`, {
          propertyId,
          offerId,
          availability,
        })
      ).data.data;
    },
    onSuccess: (_data, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["property", propertyId],
      });
      toast.success("Contact shared successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "An unknown error occurred while sharing contact.";
      toast.error(errorMessage);
    },
  });
  return { sharePropertyContact: mutate, isPending, error };
};
