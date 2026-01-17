"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { NewsArticle, NewsFilters, NewsPagination } from "@/models/types/news";

interface UseGetNewsResult {
  news: NewsArticle[];
  pagination: NewsPagination;
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
}

/**
 * Hook to fetch paginated news with filters
 */
export const useGetNews = (filters: NewsFilters = {}): UseGetNewsResult => {
  const api = useAxios();
  const {
    page = 1,
    limit = 10,
    category,
    featured,
    search,
    fromDate,
    toDate,
  } = filters;

  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  if (category) queryParams.append("category", category);
  if (featured !== undefined)
    queryParams.append("featured", featured.toString());
  if (search) queryParams.append("search", search);
  if (fromDate) queryParams.append("fromDate", fromDate);
  if (toDate) queryParams.append("toDate", toDate);

  const { data, isLoading, error, isFetching } = useQuery<{
    data: NewsArticle[];
    pagination: NewsPagination;
  }>({
    queryKey: [
      "news",
      page,
      limit,
      category,
      featured,
      search,
      fromDate,
      toDate,
    ],
    queryFn: async () => {
      const response = await api.get(`/news?${queryParams.toString()}`);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    news: data?.data || [],
    pagination: data?.pagination || {
      total: 0,
      page: 1,
      totalPages: 1,
      limit: 10,
    },
    isLoading,
    error: error as Error | null,
    isFetching,
  };
};

/**
 * Hook to fetch featured news
 */
export const useGetFeaturedNews = (limit: number = 5) => {
  const api = useAxios();

  const { data, isLoading, error } = useQuery<NewsArticle[]>({
    queryKey: ["news", "featured", limit],
    queryFn: async () => {
      const response = await api.get(`/news/featured?limit=${limit}`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    featuredNews: data || [],
    isLoading,
    error: error as Error | null,
  };
};

/**
 * Hook to fetch latest news
 */
export const useGetLatestNews = (limit: number = 10) => {
  const api = useAxios();

  const { data, isLoading, error } = useQuery<NewsArticle[]>({
    queryKey: ["news", "latest", limit],
    queryFn: async () => {
      const response = await api.get(`/news/latest?limit=${limit}`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    latestNews: data || [],
    isLoading,
    error: error as Error | null,
  };
};

/**
 * Hook to fetch a single news article by ID
 */
export const useGetNewsById = (id: string, options?: { enabled?: boolean }) => {
  const api = useAxios();

  const { data, isLoading, error } = useQuery<NewsArticle>({
    queryKey: ["news", id],
    queryFn: async () => {
      const response = await api.get(`/news/${id}`);
      return response.data.data;
    },
    enabled: options?.enabled ?? !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for single articles
  });

  return {
    article: data,
    isLoading,
    error: error as Error | null,
  };
};
