"use client";

import { create } from "zustand";

interface MarketplaceFilterState {
  searchQuery: string;
  listingPurposeFilter: string;
}

interface MarketplaceFilterActions {
  setSearchQuery: (query: string) => void;
  setListingPurposeFilter: (purpose: string) => void;
  clearFilters: () => void;
}

type MarketplaceFilterStore = MarketplaceFilterState & MarketplaceFilterActions;

export const useMarketplaceFilterStore = create<MarketplaceFilterStore>()(
  (set) => ({
    searchQuery: "",
    listingPurposeFilter: "ALL",

    setSearchQuery: (query) => set({ searchQuery: query }),
    setListingPurposeFilter: (purpose) => set({ listingPurposeFilter: purpose }),
    clearFilters: () => set({ searchQuery: "", listingPurposeFilter: "ALL" }),
  })
);
