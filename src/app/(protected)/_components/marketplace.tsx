import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import { useGetAllProperties } from "@/hooks/useProperty";
import { useGetAllMarketPlaceEnquiries } from "@/hooks/useEnquiry";
import { PropertyCard } from "@/./app/(protected)/_components/propertyCard";
import { MapBox } from "@/./app/(protected)/_components/mapBox";
import { PropertyDetails } from "@/./app/(protected)/_components/propertyDetails";
import { EnquiryCard } from "@/./app/(protected)/enquiries/_components/EnquiryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
import { MarketplaceHeader } from "@/./app/(protected)/_components/MarketplaceHeader";
import { LG_BREAKPOINT_PX } from "@/constants";
import {
  EmptyEnquiriesState,
  EmptyState,
} from "@/./app/(protected)/_components/empty-state";

export const MarketPlace = () => {
  console.log("first");
  const [viewMode, setViewMode] = useState<"PROPERTIES" | "ENQUIRIES">(
    "PROPERTIES"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const { properties, pagination, isLoading, error } = useGetAllProperties(
    currentPage,
    12
  );
  const {
    marketPlaceEnquiries,
    isPending: isEnquiriesLoading,
    error: enquiriesError,
  } = useGetAllMarketPlaceEnquiries({ enabled: viewMode === "ENQUIRIES" });
  const { totalPages } = pagination;
  const [isMobileMapOpen, setIsMobileMapOpen] = useState(false);
  const [view, setView] = useState<"grid" | "map" | "split">("grid"); // Default to grid property-only view
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<
    string | null
  >(null);
  const [highlightRequestId, setHighlightRequestId] = useState(0);

  const [isBelowLg, setIsBelowLg] = useState(false);
  const isMapOverlayActive = isBelowLg && isMobileMapOpen;

  useEffect(() => {
    if (viewMode === "ENQUIRIES") {
      setView("grid");
      setSelectedPropertyId(null);
      setHighlightedPropertyId(null);
      setIsMobileMapOpen(false);
    }
  }, [viewMode]);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT_PX - 1}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsBelowLg(e.matches);
    setIsBelowLg(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isBelowLg) {
      setIsMobileMapOpen(false);
    }
  }, [isBelowLg]);

  const handleShowOnMap = useCallback(
    (propertyId: string) => {
      setView("split");
      setHighlightedPropertyId(propertyId);
      setHighlightRequestId((n) => n + 1);
      setIsMobileMapOpen(isBelowLg);
    },
    [isBelowLg]
  );

  const handleHighlightComplete = useCallback(() => {
    setHighlightedPropertyId(null);
  }, []);

  const propertyRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [priceRange, setPriceRange] = useState<number[] | null>(null);
  const [bhkFilter, setBhkFilter] = useState<string>("ALL");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const selectedProperty = properties?.find(
    (p) => p._id === selectedPropertyId
  );

  const maxPropertyPrice = useMemo(() => {
    if (!properties || properties.length === 0) return 100000000;
    const max = Math.max(...properties.map((p) => p.totalPrice));
    return max > 0 ? max : 100000000;
  }, [properties]);

  const effectivePriceRange = useMemo(
    () => priceRange ?? [0, maxPropertyPrice],
    [priceRange, maxPropertyPrice]
  );
  const debouncedPriceRange = useDebounce(effectivePriceRange, 300);

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

  const enquiryFuse = useMemo(() => {
    if (!marketPlaceEnquiries || marketPlaceEnquiries.length === 0) return null;
    return new Fuse(marketPlaceEnquiries, {
      keys: [
        { name: "address", weight: 0.7 },
        { name: "society", weight: 0.4 },
        { name: "description", weight: 0.8 },
        { name: "enquiryType", weight: 0.35 },
        { name: "enquiryCategory", weight: 0.25 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
  }, [marketPlaceEnquiries]);

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

    if (debouncedSearchQuery) {
      if (fuse) {
        const searchResults = fuse.search(debouncedSearchQuery);
        baseProperties = searchResults.map((res) => res.item);
      }
    }

    return baseProperties.filter((property) => {
      const isNotEnquiryProperty = property.listingStatus !== "ENQUIRY_ONLY";
      const isNotUnderDeletion = !property.deletingStatus;
      const matchesSource =
        sourceFilter === "ALL" ||
        (sourceFilter === "BROKER" && property.listedBy) ||
        (sourceFilter === "COMPANY" && !property.listedBy);

      const matchesCategory =
        categoryFilter === "ALL" ||
        property.propertyCategory === categoryFilter;

      const matchesPropertyType =
        propertyTypeFilter === "ALL" ||
        property.propertyType === propertyTypeFilter;

      const price = property.totalPrice;
      const matchesMinPrice = price >= debouncedPriceRange[0];
      const matchesMaxPrice =
        debouncedPriceRange.length > 1 ? price <= debouncedPriceRange[1] : true;

      const matchesBhk =
        bhkFilter === "ALL" ||
        (bhkFilter === "5+"
          ? (property.bhk || 0) >= 5
          : property.bhk === Number(bhkFilter));

      return (
        isNotEnquiryProperty &&
        matchesSource &&
        matchesCategory &&
        matchesPropertyType &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesBhk &&
        isNotUnderDeletion
      );
    });
  }, [
    properties,
    debouncedSearchQuery,
    sourceFilter,
    categoryFilter,
    propertyTypeFilter,
    debouncedPriceRange,
    bhkFilter,
    fuse,
    ,
  ]);

  const filteredEnquiries = useMemo(() => {
    let baseEnquiries = marketPlaceEnquiries || [];

    if (debouncedSearchQuery) {
      if (enquiryFuse) {
        const searchResults = enquiryFuse.search(debouncedSearchQuery);
        baseEnquiries = searchResults.map((res) => res.item);
      }
    }

    return baseEnquiries.filter((enquiry) => {
      const matchesSource =
        sourceFilter === "ALL" ||
        (sourceFilter === "BROKER" && enquiry.source === "broker") ||
        (sourceFilter === "COMPANY" && enquiry.source === "company");

      const matchesCategory =
        categoryFilter === "ALL" || enquiry.enquiryCategory === categoryFilter;

      let matchesPrice = true;
      if (debouncedPriceRange && enquiry.budget) {
        const [minFilter, maxFilter] = debouncedPriceRange;
        const eMin = enquiry.budget.min || 0;
        const eMax = enquiry.budget.max || Number.MAX_SAFE_INTEGER;
        matchesPrice = eMin <= maxFilter && eMax >= minFilter;
      }

      let matchesBhk = true;
      if (bhkFilter !== "ALL") {
        if (enquiry.bhk) {
          if (bhkFilter === "5+") {
            matchesBhk = enquiry.bhk >= 5;
          } else {
            matchesBhk = enquiry.bhk === Number(bhkFilter);
          }
        } else {
          matchesBhk = false;
        }
      }

      return matchesSource && matchesCategory && matchesPrice && matchesBhk;
    });
  }, [
    marketPlaceEnquiries,
    debouncedSearchQuery,
    enquiryFuse,
    sourceFilter,
    categoryFilter,
    debouncedPriceRange,
    bhkFilter,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setPropertyTypeFilter("ALL");
    setSourceFilter("ALL");
    setPriceRange(null);
    setBhkFilter("ALL");
  };

  const hasActiveFilters =
    categoryFilter !== "ALL" ||
    bhkFilter !== "ALL" ||
    sourceFilter !== "ALL" ||
    propertyTypeFilter !== "ALL" ||
    priceRange !== null;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisiblePages = 5;

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

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

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

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

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

  if (viewMode === "PROPERTIES" && error) {
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

  if (viewMode === "ENQUIRIES" && enquiriesError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load enquiries. Please try again later.
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
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="-m-4 -mt-[3px] -mb-24 md:-mb-[3px] flex flex-col h-[calc(100vh-4rem)] overflow-hidden relative">
      <MarketplaceHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        propertyTypeFilter={propertyTypeFilter}
        setPropertyTypeFilter={setPropertyTypeFilter}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        bhkFilter={bhkFilter}
        setBhkFilter={setBhkFilter}
        view={view}
        setView={setView}
        filteredCount={filteredProperties.length}
        filteredEnquiriesCount={filteredEnquiries.length}
        maxPropertyPrice={maxPropertyPrice}
        effectivePriceRange={effectivePriceRange}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        onClearPropertySelection={() => setSelectedPropertyId(null)}
      />

      {viewMode === "PROPERTIES" ? (
        <>
          <div className="flex-1 flex overflow-hidden relative">
            <div
              className={`
            flex-col h-full overflow-y-auto scrollbar-hide transition-all duration-300
            ${view === "map" ? "hidden" : "flex"}
            ${
              view === "grid"
                ? "w-full"
                : "w-full lg:w-[60%] xl:w-[55%] 2xl:w-[50%]"
            }
            ${isMapOverlayActive ? "hidden lg:flex" : ""}
          `}
            >
              <div className="p-6 md:p-8 space-y-4 pb-24">
                {!isLoading && (
                  <div className="hidden sm:flex items-center justify-between px-1">
                    <p className="text-sm text-muted-foreground">
                      Showing{" "}
                      <span className="font-medium text-foreground">
                        {filteredProperties.length}
                      </span>{" "}
                      properties
                      {categoryFilter !== "ALL" && (
                        <span className="text-accent">
                          {" "}
                          in {categoryFilter.toLowerCase().replace("_", " ")}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {isLoading ? (
                  <div
                    className={`grid gap-6 ${
                      view === "split"
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                  >
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
                      className={`grid gap-6 ${
                        view === "split"
                          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3"
                          : "xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4"
                      }`}
                    >
                      {filteredProperties.length > 0 ? (
                        filteredProperties.map((property) => (
                          <motion.div
                            key={property._id}
                            variants={itemVariants}
                            ref={(el: HTMLDivElement | null) => {
                              propertyRefs.current[property._id] = el;
                            }}
                            className={`rounded-3xl transition-all duration-300 ${
                              selectedPropertyId === property._id
                                ? "ring-2 ring-accent ring-offset-2 ring-offset-background shadow-lg scale-[1.02]"
                                : ""
                            }`}
                          >
                            <PropertyCard
                              property={property}
                              showMapButton={true}
                              onShowOnMap={handleShowOnMap}
                            />
                          </motion.div>
                        ))
                      ) : (
                        <EmptyState onClearFilters={clearFilters} />
                      )}
                    </motion.div>
                    {renderPagination()}
                  </>
                )}
              </div>
            </div>

            <div
              className={`
          h-full bg-muted border-l border-border/50
          transition-all duration-300 relative
          ${view === "grid" ? "hidden" : ""}
          ${view === "map" ? "block w-full" : ""}
          ${
            view === "split" && !isMapOverlayActive
              ? "hidden lg:block lg:w-[40%] xl:w-[45%] 2xl:w-[50%] lg:sticky lg:top-0 lg:self-start"
              : ""
          }
          ${
            isMapOverlayActive
              ? "block w-full fixed inset-0 top-[120px] z-40"
              : ""
          }
        `}
            >
              {selectedProperty && (
                <div className="absolute left-4 top-14 z-20 w-[calc(100%-2rem)] sm:w-[340px] lg:w-[380px] max-h-[calc(100%-4.5rem)] bg-background rounded-xl shadow-xl overflow-hidden border">
                  <PropertyDetails
                    property={selectedProperty}
                    onClose={() => setSelectedPropertyId(null)}
                  />
                </div>
              )}
              <MapBox
                properties={filteredProperties}
                onSelectProperty={setSelectedPropertyId}
                highlightedPropertyId={highlightedPropertyId}
                highlightRequestId={highlightRequestId}
                onHighlightComplete={handleHighlightComplete}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-6 md:p-8 space-y-4 pb-24">
            {!isEnquiriesLoading && (
              <div className="hidden sm:flex items-center justify-between px-1">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {filteredEnquiries.length}
                  </span>{" "}
                  enquiries
                </p>
              </div>
            )}

            {isEnquiriesLoading ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-[220px] w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredEnquiries.length > 0 ? (
                  filteredEnquiries.map((enquiry) => (
                    <motion.div key={enquiry._id} variants={itemVariants}>
                      <EnquiryCard enquiry={enquiry} />
                    </motion.div>
                  ))
                ) : (
                  <EmptyEnquiriesState />
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
