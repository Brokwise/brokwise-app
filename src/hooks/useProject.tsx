import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";
import {
  ProjectDetailsResponse,
  PaginatedPlotsResponse,
  PaginatedProjectsResponse,
} from "@/models/types/project";

export const useGetProjects = (
  filters?: {
    projectStatus?: string;
    projectUse?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  options?: { enabled?: boolean }
) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<PaginatedProjectsResponse>({
    queryKey: ["projects", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.projectStatus)
        params.append("projectStatus", filters.projectStatus);
      if (filters?.projectUse) params.append("projectUse", filters.projectUse);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      return (await api.get(`/projects/broker/list?${params.toString()}`)).data
        .data;
    },
    enabled: options?.enabled ?? true,
  });

  return {
    projects: data?.projects || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
};

export const useGetProject = (
  projectId: string,
  options?: { enabled?: boolean }
) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<ProjectDetailsResponse>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      return (await api.get(`/projects/${projectId}`)).data.data;
    },
    enabled: options?.enabled ?? true,
  });

  return { project: data?.project, stats: data?.plotStats, isLoading, error };
};

export const useGetProjectPlots = (
  projectId: string,
  filters?: {
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  },
  options?: { enabled?: boolean }
) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<PaginatedPlotsResponse>({
    queryKey: ["project-plots", projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.minPrice)
        params.append("minPrice", filters.minPrice.toString());
      if (filters?.maxPrice)
        params.append("maxPrice", filters.maxPrice.toString());
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      return (
        await api.get(`/projects/${projectId}/plots?${params.toString()}`)
      ).data.data;
    },
    enabled: options?.enabled ?? true,
  });

  return {
    plots: data?.plots || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
};

export const useProject = () => {
  return {};
};
