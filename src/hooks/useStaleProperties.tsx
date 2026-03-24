"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface StaleProperty {
  _id: string;
  propertyId?: string;
  propertyType: string;
  propertyCategory: string;
  address?: { state?: string; city?: string; address?: string; pincode?: string };
  totalPrice?: number;
  staleNotifiedAt: string;
  featuredMedia?: string;
  images?: string[];
  daysUntilDeletion: number;
}

export const useGetStaleProperties = (options?: { enabled?: boolean }) => {
  const api = useAxios();
  const { data, isLoading, error, refetch } = useQuery<StaleProperty[]>({
    queryKey: ["stale-properties"],
    queryFn: async () => {
      const response = await api.get("/property/broker/stale");
      return response.data.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 10,
  });

  return {
    staleProperties: data || [],
    isLoading,
    error,
    refetch,
  };
};

export const useConfirmAvailability = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<
    { message: string },
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: async (propertyId: string) => {
      const response = await api.post("/property/confirm-availability", { propertyId });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stale-properties"] });
      toast.success("Property confirmed as available.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to confirm availability.");
    },
  });

  return { confirmAvailability: mutateAsync, isPending };
};

export const useMarkUnavailable = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<
    { message: string },
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: async (propertyId: string) => {
      const response = await api.post("/property/mark-unavailable", { propertyId });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stale-properties"] });
      queryClient.invalidateQueries({ queryKey: ["broker-properties"] });
      toast.success("Property has been removed.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove property.");
    },
  });

  return { markUnavailable: mutateAsync, isPending };
};
