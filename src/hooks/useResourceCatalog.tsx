"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import useAxios, { ApiResponse } from "./useAxios";
import {
  FALLBACK_RESOURCE_CATALOG,
  FALLBACK_STATE_RESOURCE_MAP,
} from "@/config/resourcesFallback";
import { ResourceCatalog } from "@/types/resource";

export const RESOURCE_STATE_STORAGE_KEY = "bw.resources.state";
export const DEFAULT_RESOURCE_STATE = "RJ";

export const getStoredResourceState = (): string => {
  if (typeof window === "undefined") return DEFAULT_RESOURCE_STATE;
  const value = window.localStorage.getItem(RESOURCE_STATE_STORAGE_KEY);
  return value || DEFAULT_RESOURCE_STATE;
};

export const setStoredResourceState = (stateCode: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESOURCE_STATE_STORAGE_KEY, stateCode);
};

const buildFallbackCatalog = (stateCode?: string): ResourceCatalog => {
  const selectedState = stateCode || FALLBACK_RESOURCE_CATALOG.selectedState || DEFAULT_RESOURCE_STATE;
  return {
    ...FALLBACK_RESOURCE_CATALOG,
    selectedState,
    stateResources:
      FALLBACK_STATE_RESOURCE_MAP[selectedState] || FALLBACK_RESOURCE_CATALOG.stateResources,
  };
};

export const useResourceCatalog = (stateCode?: string) => {
  const api = useAxios();
  const dynamicResourcesEnabled =
    process.env.NEXT_PUBLIC_DYNAMIC_RESOURCES_ENABLED !== "false";

  const query = useQuery({
    queryKey: ["resource-catalog", stateCode],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ResourceCatalog>>(
        `/broker/resources/catalog${stateCode ? `?state=${stateCode}` : ""}`
      );
      return response.data.data;
    },
    enabled: dynamicResourcesEnabled,
    retry: 1,
  });

  const catalog = useMemo(() => {
    if (query.data?.states?.length) {
      return query.data;
    }
    return buildFallbackCatalog(stateCode);
  }, [query.data, stateCode]);

  return {
    ...query,
    catalog,
  };
};
