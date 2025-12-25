"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useGetAllProperties } from "@/hooks/useProperty";
import { PropertyCard } from "./_components/propertyCard";
import { MapBox } from "./_components/mapBox";
import { PropertyDetails } from "./_components/propertyDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  LayoutGridIcon,
  MapPin,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import Fuse from "fuse.js";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MarketplaceHeader } from "./_components/MarketplaceHeader";

// Empty State Component
const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed">
    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
      <Search className="h-8 w-8 text-muted-foreground/50" />
    </div>
    <h3 className="text-lg font-semibold text-foreground">No properties found</h3>
    <p className="text-muted-foreground text-center mt-1 max-w-sm">
      Try adjusting your filters or search terms to find what you&apos;re looking for.
    </p>
  </div>
);

const ProtectedPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { properties, pagination, isLoading, error } = useGetAllProperties(
    currentPage,
    12
  );
  const { totalPages } = pagination;
  /* State for Mobile Map Toggle */
  const [isMobileMapOpen, setIsMobileMapOpen] = useState(false);
  const [view, setView] = useState<"grid" | "map" | "split">("grid"); // Default to grid property-only view
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  /* Scroll Refs - Using Record type for cleaner typing */
  const propertyRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* Filter States */
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [priceRange, setPriceRange] = useState<number[] | null>(null); // null means "use full range"
  const [bhkFilter, setBhkFilter] = useState<string>("ALL");

  // Removed local isFilterOpen state as it's now handled in the header or needs to be lifted if controlled externally
  // Keeping it simple: Header manages its own dialog state or we can lift it if needed.
  // The MarketplaceHeader component handles the Dialog state internally.

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const selectedProperty = properties?.find(
    (p) => p._id === selectedPropertyId
  );

  const maxPropertyPrice = useMemo(() => {
    if (!properties || properties.length === 0) return 100000000;
    const max = Math.max(...properties.map((p) => p.totalPrice));
    return max > 0 ? max : 100000000;
  }, [properties]);

  // Effective price range: use full range if user hasn't set a custom one.
  // Important: memoize the array so `useDebounce` doesn't fire forever due to new array identity.
  const effectivePriceRange = useMemo(
    () => priceRange ?? [0, maxPropertyPrice],
    [priceRange, maxPropertyPrice]
  );
  const debouncedPriceRange = useDebounce(effectivePriceRange, 300);

  // Initialize Fuse instance
  const fuse = useMemo(() => {
    if (!properties) return null;
    return new Fuse(properties, {
      keys: [
        { name: "address.address", weight: 0.7 },
        { name: "address.city", weight: 0.6 },
        { name: "address.state", weight: 0.4 },
        { name: "society", weight: 0.5 },
        { name: "description", weight: 0.3 },
        { name: "propertyType", weight: 0.4 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
  }, [properties]);

  /* Scroll to Selected Property Interaction */
  useEffect(() => {
    if (selectedPropertyId && propertyRefs.current[selectedPropertyId]) {
      propertyRefs.current[selectedPropertyId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedPropertyId]);

  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    let baseProperties = properties;

    // Fuzzy Search
    if (debouncedSearchQuery) {
      if (fuse) {
        const searchResults = fuse.search(debouncedSearchQuery);
        baseProperties = searchResults.map((res) => res.item);
      }
    }

    return baseProperties.filter((property) => {
      // Source Filter
      const matchesSource =
        sourceFilter === "ALL" ||
        (sourceFilter === "BROKER" && property.listedBy) ||
        (sourceFilter === "COMPANY" && !property.listedBy);

      // Category Filter
      const matchesCategory =
        categoryFilter === "ALL" ||
        property.propertyCategory === categoryFilter;

      // Price Filter
      const price = property.totalPrice;
      const matchesMinPrice = price >= debouncedPriceRange[0];
      const matchesMaxPrice =
        debouncedPriceRange.length > 1 ? price <= debouncedPriceRange[1] : true;

      // BHK Filter
      const matchesBhk =
        bhkFilter === "ALL" ||
        (bhkFilter === "5+"
          ? (property.bhk || 0) >= 5
          : property.bhk === Number(bhkFilter));

      return (
        matchesSource &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesBhk
      );
    });
  }, [
    properties,
    debouncedSearchQuery,
    sourceFilter,
    categoryFilter,
    debouncedPriceRange,
    bhkFilter,
    fuse,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setSourceFilter("ALL");
    setPriceRange(null); // Reset to full range
    setBhkFilter("ALL");
  };

  const hasActiveFilters =
    bhkFilter !== "ALL" ||
    sourceFilter !== "ALL" ||
    priceRange !== null; // Only true if user explicitly set a price range

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisiblePages = 5;

    // Previous Button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className={
            currentPage === 1
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // First Page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Ellipsis start
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Current and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Ellipsis end
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Last Page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next Button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className={
            currentPage === totalPages
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    return (
      <Pagination className="mt-8 pb-8">
        <PaginationContent>{items}</PaginationContent>
      </Pagination>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load properties. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    // Main Container - Viewport minus Header (approx 64px/4rem)
    <div className="flex flex-col h-full min-h-0 overflow-hidden relative">

      {/* 1. TOP CONTROL BAR (Replaced with Component) */}
      <MarketplaceHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        bhkFilter={bhkFilter}
        setBhkFilter={setBhkFilter}
        view={view}
        setView={setView}
        filteredCount={filteredProperties.length}
        maxPropertyPrice={maxPropertyPrice}
        effectivePriceRange={effectivePriceRange}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        onClearPropertySelection={() => setSelectedPropertyId(null)}
      />

      {/* 2. MAIN SPLIT CONTENT */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left Panel - Property List Only */}
        <div
          className={`
            flex-col h-full overflow-y-auto scrollbar-hide transition-all duration-300
            ${view === "map" ? "hidden" : "flex"}
            ${view === "grid" ? "w-full" : "w-full lg:w-[60%] xl:w-[55%] 2xl:w-[50%]"}
            ${isMobileMapOpen && view === "split" ? 'hidden lg:flex' : ''}
          `}
        >
          {/* Increased top padding for better breathing room */}
          <div className="p-6 md:p-8 space-y-4 pb-24">

            {/* Results Count (Desktop) */}
            {!isLoading && (
              <div className="hidden sm:flex items-center justify-between px-1">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredProperties.length}</span> properties
                  {categoryFilter !== "ALL" && <span className="text-accent"> in {categoryFilter.toLowerCase().replace('_', ' ')}</span>}
                </p>
              </div>
            )}

            {/* Property Grid */}
            {isLoading ? (
              <div className={`grid gap-6 ${view === 'split'
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                    <div className="space-y-2 px-1">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className={`grid gap-6 ${view === 'split'
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                >
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((property) => (
                      <motion.div
                        key={property._id}
                        variants={itemVariants}
                        ref={(el: HTMLDivElement | null) => { propertyRefs.current[property._id] = el; }}
                        className={`rounded-xl transition-all duration-300 ${selectedPropertyId === property._id
                          ? "ring-2 ring-accent ring-offset-2 ring-offset-background shadow-lg scale-[1.02]"
                          : ""
                          }`}
                      >
                        <PropertyCard property={property} />
                      </motion.div>
                    ))
                  ) : (
                    <EmptyState />
                  )}
                </motion.div>
                {renderPagination()}
              </>
            )}

          </div>
        </div>

        {/* Right Panel - Map */}
        <div
          className={`
          flex-1 h-full bg-muted border-l border-border/50
          transition-all duration-300 relative
          ${view === "grid" ? "hidden" : ""}
          ${view === "map" ? "block w-full" : "hidden lg:block"}
          ${isMobileMapOpen && view === "split" ? 'block w-full fixed inset-0 top-[120px] z-40' : ''}
        `}
        >
          {selectedProperty && (
            <div className="absolute left-4 top-4 z-10 w-[380px] max-h-[calc(100%-2rem)] bg-background rounded-xl shadow-xl overflow-hidden border">
              <PropertyDetails
                property={selectedProperty}
                onClose={() => setSelectedPropertyId(null)}
              />
            </div>
          )}
          <MapBox
            properties={filteredProperties}
            onSelectProperty={setSelectedPropertyId}
          />
        </div>

        {/* Floating Mobile Toggle Button */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden filter drop-shadow-xl animate-bounce-in">
          <Button
            onClick={() => setIsMobileMapOpen(!isMobileMapOpen)}
            className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-6 py-6 h-auto shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {isMobileMapOpen ? (
              <>
                <LayoutGridIcon className="h-5 w-5" />
                <span className="font-semibold">Show List</span>
              </>
            ) : (
              <>
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Show Map</span>
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ProtectedPage;
