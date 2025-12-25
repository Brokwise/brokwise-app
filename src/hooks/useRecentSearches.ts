"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import useAxios from "./useAxios";
import { useApp } from "@/context/AppContext";

export const useRecentSearches = (options?: { enabled?: boolean }) => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { userData } = useApp();

  const isCompany = userData?.userType === "company";
  const baseUrl = isCompany ? "/company" : "/broker";

  const {
    data: recentSearches,
    isLoading,
    error,
    refetch,
  } = useQuery<string[]>({
    queryKey: ["recent-searches", userData?.userType],
    queryFn: async () => {
      return (await api.get(`${baseUrl}/recent-searches`)).data.data as string[];
    },
    enabled: options?.enabled ?? false,
  });

  const { mutateAsync: addRecentSearch, isPending: isAdding } = useMutation<
    string[],
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: async (term: string) => {
      return (await api.post(`${baseUrl}/recent-searches`, { term })).data.data as string[];
    },
    onSuccess: (next) => {
      queryClient.setQueryData(["recent-searches", userData?.userType], next);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to save recent search";
      toast.error(msg);
    },
  });

  return {
    recentSearches: recentSearches ?? [],
    isLoading,
    error,
    refetch,
    addRecentSearch,
    isAdding,
  };
};


