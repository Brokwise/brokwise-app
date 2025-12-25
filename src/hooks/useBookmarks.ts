"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import useAxios from "./useAxios";
import { useApp } from "@/context/AppContext";
import type { Property } from "@/types/property";
import type { Enquiry } from "@/models/types/enquiry";

export type BookmarkItemType = "PROPERTY" | "ENQUIRY";

export type ToggleBookmarkResponse = {
  itemType: BookmarkItemType;
  itemId: string;
  isBookmarked: boolean;
  bookmarkedPropertyIds: string[];
  bookmarkedEnquiryIds: string[];
};

export type BookmarksResponse = {
  bookmarkedPropertyIds: string[];
  bookmarkedEnquiryIds: string[];
  properties: Property[];
  enquiries: Enquiry[];
};

export const useToggleBookmark = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { userData } = useApp();

  const isCompany = userData?.userType === "company";
  const baseUrl = isCompany ? "/company" : "/broker";

  const { mutateAsync: toggleBookmarkAsync, isPending } = useMutation<
    ToggleBookmarkResponse,
    AxiosError<{ message: string }>,
    { itemType: BookmarkItemType; itemId: string }
  >({
    mutationFn: async ({ itemType, itemId }) => {
      return (await api.post(`${baseUrl}/toggle-bookmark`, { itemType, itemId })).data
        .data as ToggleBookmarkResponse;
    },
    onSuccess: () => {
      // Match the exact query key used by useGetBookmarks
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userData?.userType] });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update bookmark";
      toast.error(msg);
    },
  });

  return { toggleBookmarkAsync, isPending };
};

export const useGetBookmarks = () => {
  const api = useAxios();
  const { userData } = useApp();
  const isCompany = userData?.userType === "company";
  const baseUrl = isCompany ? "/company" : "/broker";

  const { data, isLoading, error, refetch } = useQuery<BookmarksResponse>({
    queryKey: ["bookmarks", userData?.userType],
    queryFn: async () => {
      return (await api.get(`${baseUrl}/bookmarks`)).data.data as BookmarksResponse;
    },
  });

  return { bookmarks: data, isLoading, error, refetch };
};


