"use client";
import React, { useMemo, useState } from "react";
import { useGetMarketPlaceEnquiries } from "@/hooks/useEnquiry";
import { EnquiryCard } from "./_components/EnquiryCard";
import { EnquiryFilters, FilterState } from "./_components/EnquiryFilters";
import Fuse from "fuse.js";
import { Inbox, Plus, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getCityFromAddress } from "@/utils/helper";
import { Skeleton } from "@/components/ui/skeleton";

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
      marketPlaceEnquiries
        .map((e) => getCityFromAddress(e.address).toLowerCase())
        .filter(Boolean)
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
        (e) =>
          getCityFromAddress(e.address).toLowerCase() ===
          filters.city.toLowerCase()
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
          "address",
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

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Marketplace
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Discover and respond to verified property enquiries from our
            extensive network of brokers and clients.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/my-enquiries")}
            className="hidden sm:flex"
          >
            <MessageSquareText className="mr-2 h-4 w-4" />
            My Enquiries
          </Button>
          <Button onClick={() => router.push("/enquiries/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Enquiry
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <EnquiryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          cities={availableCities}
        />

        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <p className="text-red-500 font-medium">
              Unable to load enquiries at the moment.
            </p>
            <Button variant="link" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              No enquiries match your filters
            </h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
              Try adjusting your search terms or filters to find what
              you&apos;re looking for.
            </p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnquiries.map((enquiry) => (
              <EnquiryCard key={enquiry._id} enquiry={enquiry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryPage;
