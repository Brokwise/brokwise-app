"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import useAxios from "./useAxios";

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
  properties: any[];
  enquiries: any[];
};

export const useToggleBookmark = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync: toggleBookmarkAsync, isPending } = useMutation<
    ToggleBookmarkResponse,
    AxiosError<{ message: string }>,
    { itemType: BookmarkItemType; itemId: string }
  >({
    mutationFn: async ({ itemType, itemId }) => {
      return (await api.post("/broker/toggle-bookmark", { itemType, itemId })).data
        .data as ToggleBookmarkResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
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
  const { data, isLoading, error, refetch } = useQuery<BookmarksResponse>({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      return (await api.get("/broker/bookmarks")).data.data as BookmarksResponse;
    },
  });

  return { bookmarks: data, isLoading, error, refetch };
};


