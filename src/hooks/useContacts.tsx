"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import {
  Contact,
  ContactsResponse,
  ContactStats,
  ContactFilters,
  ContactSource,
} from "@/models/types/contact";

/**
 * Get paginated contacts with optional filters
 */
export const useGetContacts = (
  filters: ContactFilters = {},
  options?: { enabled?: boolean }
) => {
  const api = useAxios();

  const { data, isLoading, error, refetch } = useQuery<ContactsResponse>({
    queryKey: ["contacts", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.source) params.append("source", filters.source);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const queryString = params.toString();
      const url = queryString ? `/contacts?${queryString}` : "/contacts";

      return (await api.get(url)).data.data as ContactsResponse;
    },
    enabled: options?.enabled ?? true,
  });

  return {
    contacts: data?.contacts ?? [],
    pagination: {
      total: data?.total ?? 0,
      page: data?.page ?? filters.page ?? 1,
      totalPages: data?.totalPages ?? 1,
    },
    isLoading,
    error,
    refetch,
  };
};

/**
 * Get all contacts (paginating through all pages)
 */
export const useGetAllContacts = (
  source?: ContactSource,
  options?: { enabled?: boolean }
) => {
  const api = useAxios();

  const { data, isPending, error } = useQuery<Contact[]>({
    queryKey: ["contacts", "all", source],
    queryFn: async () => {
      const limit = 100;
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", limit.toString());
      if (source) params.append("source", source);

      const first = await api.get(`/contacts?${params.toString()}`);
      const firstData = first.data.data as ContactsResponse;

      let all = [...(firstData.contacts || [])];
      const totalPages = firstData.totalPages || 1;

      for (let p = 2; p <= totalPages; p++) {
        params.set("page", p.toString());
        const resp = await api.get(`/contacts?${params.toString()}`);
        const pageData = resp.data.data as ContactsResponse;
        all = all.concat(pageData.contacts || []);
      }

      return all;
    },
    enabled: options?.enabled ?? true,
  });

  return { contacts: data ?? [], isPending, error };
};

/**
 * Get a specific contact by ID with full details
 */
export const useGetContactById = (
  id: string,
  options?: { enabled?: boolean }
) => {
  const api = useAxios();

  const { data, isPending, error } = useQuery<Contact>({
    queryKey: ["contact", id],
    queryFn: async () => {
      return (await api.get(`/contacts/${id}`)).data.data as Contact;
    },
    enabled: (options?.enabled ?? true) && !!id,
  });

  return { contact: data, isPending, error };
};

/**
 * Search contacts by name or company
 */
export const useSearchContacts = (
  searchQuery: string,
  options?: { enabled?: boolean }
) => {
  const api = useAxios();

  const { data, isPending, error } = useQuery<Contact[]>({
    queryKey: ["contacts", "search", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("q", searchQuery);
      return (await api.get(`/contacts/search?${params.toString()}`)).data
        .data as Contact[];
    },
    enabled:
      (options?.enabled ?? true) && !!searchQuery && searchQuery.length >= 2,
  });

  return { searchResults: data ?? [], isPending, error };
};

/**
 * Get contact statistics
 */
export const useGetContactStats = (options?: { enabled?: boolean }) => {
  const api = useAxios();

  const { data, isPending, error } = useQuery<ContactStats>({
    queryKey: ["contacts", "stats"],
    queryFn: async () => {
      return (await api.get("/contacts/stats")).data.data as ContactStats;
    },
    enabled: options?.enabled ?? true,
  });

  return { stats: data, isPending, error };
};

/**
 * Delete a contact
 */
export const useDeleteContact = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation<
    void,
    Error,
    string
  >({
    mutationFn: async (contactId) => {
      return (await api.delete(`/contacts/${contactId}`)).data.data;
    },
    onSuccess: () => {
      // Invalidate all contacts-related queries
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  return {
    deleteContact: mutate,
    deleteContactAsync: mutateAsync,
    isPending,
    error,
  };
};
