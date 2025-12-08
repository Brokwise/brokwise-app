import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { PropertyFormData } from "@/validators/property";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Property, ListingStatus } from "@/types/property";

export const useAddProperty = () => {
  const api = useAxios();
  const {
    mutate: addProperty,
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
  return { addProperty, isLoading, error };
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

export const useGetAllProperties = () => {
  const api = useAxios();
  const {
    data: properties,
    isLoading,
    error,
  } = useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: async () => {
      return (await api.get("/property/list")).data.data.properties;
    },
  });
  return { properties, isLoading, error };
};

export const useGetMyListings = () => {
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
