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
  EditPropertyDTO,
} from "@/types/property";
import i18n from "@/i18n";

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
      toast.success(i18n.t("toast_property_created"));
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        i18n.t("toast_error_property_create");
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
      toast.success(i18n.t("toast_property_status_updated"));
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        i18n.t("toast_error_property_submit");
      toast.error(errorMessage);
    },
  });
  return { mutate, isPending, error };
};

import { useApp } from "@/context/AppContext";

/**
 * Soft delete property - immediate deletion, no admin approval needed
 * Returns the deleted property
 */
export const useSoftDeleteProperty = () => {
  const api = useAxios();

  const { mutate, mutateAsync, isPending, error } = useMutation<
    Property,
    AxiosError<{ message: string }>,
    { propertyId: string; reason: string }
  >({
    mutationFn: async ({ propertyId, reason }) => {
      return (
        await api.delete(`/property/soft-delete`, {
          data: { propertyId, reason },
        })
      ).data.data;
    },
    onSuccess: () => {
      toast.success(i18n.t("toast_property_deleted"));
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        i18n.t("toast_error_property_delete");
      toast.error(errorMessage);
    },
  });
  return { softDelete: mutate, softDeleteAsync: mutateAsync, isPending, error };
};

/**
 * Undo soft delete - restore property to ACTIVE status
 */
export const useUndoDeleteProperty = () => {
  const api = useAxios();

  const { mutate, mutateAsync, isPending, error } = useMutation<
    Property,
    AxiosError<{ message: string }>,
    { propertyId: string }
  >({
    mutationFn: async ({ propertyId }) => {
      return (
        await api.post(`/property/undo-delete`, { propertyId })
      ).data.data;
    },
    onSuccess: () => {
      toast.success(i18n.t("toast_property_restored") || "Property restored");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to restore property";
      toast.error(errorMessage);
    },
  });
  return { undoDelete: mutate, undoDeleteAsync: mutateAsync, isPending, error };
};

/**
 * Get deleted properties for the current broker
 */
export const useGetDeletedProperties = (options?: { enabled?: boolean }) => {
  const api = useAxios();
  const {
    data: deletedProperties,
    isLoading,
    error,
  } = useQuery<Property[]>({
    queryKey: ["deleted-properties"],
    queryFn: async () => {
      return (await api.get("/property/broker/deleted")).data.data;
    },
    enabled: options?.enabled ?? true,
  });
  return { deletedProperties, isLoading, error };
};

/**
 * @deprecated Use useSoftDeleteProperty instead
 * Legacy hook - kept for backwards compatibility
 */
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
      toast.success(i18n.t("toast_property_deleted"));
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        i18n.t("toast_error_property_delete");
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
      toast.success(i18n.t("toast_property_saved_draft"));
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        i18n.t("toast_error_property_draft");
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
      toast.success(i18n.t("toast_offer_sent"));
      queryClient.invalidateQueries({
        queryKey: ["property", variables.propertyId],
      });
      queryClient.invalidateQueries({ queryKey: ["broker-offers"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        i18n.t("toast_error_invalid_rate");
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
      toast.success(i18n.t("toast_offer_sent"));
      queryClient.invalidateQueries({
        queryKey: ["property", variables.propertyId],
      });
      queryClient.invalidateQueries({ queryKey: ["broker-offers"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        i18n.t("toast_error_invalid_rate");
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
      toast.success(i18n.t("toast_contact_shared"));
    },
    onError: (error) => {
      const errorMessage =
        error.message || i18n.t("toast_error_contact_share");
      toast.error(errorMessage);
    },
  });
  return { sharePropertyContact: mutate, isPending, error };
};

export const useEditProperty = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    Property,
    AxiosError<{ message: string }>,
    EditPropertyDTO
  >({
    mutationFn: async (data: EditPropertyDTO) => {
      return (await api.patch("/property/edit", data)).data.data;
    },
    onSuccess: (_, variables) => {
      toast.success(i18n.t("toast_property_updated"));
      queryClient.invalidateQueries({
        queryKey: ["property", variables.propertyId],
      });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        i18n.t("toast_error_property_update");
      toast.error(errorMessage);
    },
  });
  return { editProperty: mutateAsync, isPending, error };
};
