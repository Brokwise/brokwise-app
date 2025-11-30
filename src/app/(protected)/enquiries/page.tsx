"use client";
import React, { useMemo, useState } from "react";
import { useGetMarketPlaceEnquiries } from "@/hooks/useEnquiry";
import { EnquiryCard } from "./_components/EnquiryCard";
import { EnquiryFilters, FilterState } from "./_components/EnquiryFilters";
import Fuse from "fuse.js";
import { Loader2, Inbox, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
const EnquiryPage = () => {
  const { marketPlaceEnquiries, isPending, error } =
    useGetMarketPlaceEnquiries();
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    type: "",
    city: "",
    minBudget: "",
    maxBudget: "",
    bhk: "",
  });

  // Extract unique cities from data for the filter dropdown
  const availableCities = useMemo(() => {
    if (!marketPlaceEnquiries) return [];
    const cities = new Set(
      marketPlaceEnquiries.map((e) => e.city.toLowerCase())
    );
    return Array.from(cities);
  }, [marketPlaceEnquiries]);

  // Filter Logic
  const filteredEnquiries = useMemo(() => {
    if (!marketPlaceEnquiries) return [];

    let result = marketPlaceEnquiries;

    // 1. Exact Matches (Category, Type, City)
    if (filters.category && filters.category !== "all") {
      result = result.filter((e) => e.enquiryCategory === filters.category);
    }
    if (filters.type && filters.type !== "all") {
      result = result.filter((e) => e.enquiryType === filters.type);
    }
    if (filters.city && filters.city !== "all") {
      result = result.filter(
        (e) => e.city.toLowerCase() === filters.city.toLowerCase()
      );
    }

    // 2. BHK Filter
    if (filters.bhk) {
      if (filters.bhk === "4+") {
        result = result.filter((e) => (e.bhk || 0) >= 4);
      } else {
        result = result.filter((e) => e.bhk === parseInt(filters.bhk));
      }
    }

    // 3. Budget Filter (Intersection)
    if (filters.minBudget || filters.maxBudget) {
      const minFilter = filters.minBudget ? parseFloat(filters.minBudget) : 0;
      const maxFilter = filters.maxBudget
        ? parseFloat(filters.maxBudget)
        : Infinity;

      result = result.filter((e) => {
        const eMin = e.budget?.min || 0;
        const eMax = e.budget?.max || Infinity;
        // Check for intersection: (StartA <= EndB) and (EndA >= StartB)
        return eMin <= maxFilter && eMax >= minFilter;
      });
    }

    // 4. Fuzzy Search (if search text exists)
    if (filters.search) {
      const fuse = new Fuse(result, {
        keys: [
          "enquiryId",
          "description",
          "localities",
          "city",
          // Add weight to certain fields if needed
        ],
        threshold: 0.3, // Lower is stricter
      });
      result = fuse.search(filters.search).map((res) => res.item);
    }

    return result;
  }, [marketPlaceEnquiries, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "",
      type: "",
      city: "",
      minBudget: "",
      maxBudget: "",
      bhk: "",
    });
  };

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-500">
        Error loading enquiries. Please try again later.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Marketplace Enquiries
          </h1>
          <p className="text-muted-foreground">
            Browse and respond to property enquiries from across the network.
          </p>
        </div>
        <Button onClick={() => router.push("/enquiry/create")}>
          <Plus className="h-4 w-4" />
          Create Enquiry
        </Button>
      </div>

      <EnquiryFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        cities={availableCities}
      />

      {filteredEnquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/20 border-dashed">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No enquiries found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            We couldn't find any enquiries matching your filters. Try adjusting
            your search terms.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 text-primary hover:underline font-medium text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnquiries.map((enquiry) => (
            <EnquiryCard key={enquiry._id} enquiry={enquiry} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EnquiryPage;
