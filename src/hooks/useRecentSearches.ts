"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import useAxios from "./useAxios";

export const useRecentSearches = (options?: { enabled?: boolean }) => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const {
    data: recentSearches,
    isLoading,
    error,
    refetch,
  } = useQuery<string[]>({
    queryKey: ["recent-searches"],
    queryFn: async () => {
      return (await api.get("/broker/recent-searches")).data.data as string[];
    },
    enabled: options?.enabled ?? false,
  });

  const { mutateAsync: addRecentSearch, isPending: isAdding } = useMutation<
    string[],
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: async (term: string) => {
      return (await api.post("/broker/recent-searches", { term })).data.data as string[];
    },
    onSuccess: (next) => {
      queryClient.setQueryData(["recent-searches"], next);
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


