import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  useGetAllProperties,
  PropertyListFilters,
} from "@/hooks/useProperty";
import { useGetAllMarketPlaceEnquiries } from "@/hooks/useEnquiry";
import { PropertyCard } from "@/./app/(protected)/_components/propertyCard";
import { MapBox } from "@/./app/(protected)/_components/mapBox";
import { PropertyDetails } from "@/./app/(protected)/_components/propertyDetails";
import { EnquiryCard } from "@/./app/(protected)/enquiries/_components/EnquiryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useApp } from "@/context/AppContext";
import Fuse from "fuse.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { brokerData, companyData, userData } = useApp();
  const userCity =
    userData?.userType === "company" ? companyData?.city : brokerData?.city;

  const viewMode = useMemo<"PROPERTIES" | "ENQUIRIES">(() => {
    const mode = searchParams.get("mode")?.toLowerCase();
    return mode === "enquiries" ? "ENQUIRIES" : "PROPERTIES";
  }, [searchParams]);

  const handleViewModeChange = useCallback(
    (mode: "PROPERTIES" | "ENQUIRIES") => {
      const expectedMode = mode === "ENQUIRIES" ? "enquiries" : "properties";
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", expectedMode);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(12);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [priceRange, setPriceRange] = useState<number[] | null>(null);
  const [bhkFilter, setBhkFilter] = useState<string>("ALL");
  const [featuredFilter, setFeaturedFilter] = useState<string>("ALL");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedPriceRange = useDebounce(priceRange, 300);

  // Build server-side filters object
  const serverFilters = useMemo((): PropertyListFilters => {
    const filters: PropertyListFilters = {};
    if (categoryFilter !== "ALL") filters.propertyCategory = categoryFilter;
    if (propertyTypeFilter !== "ALL") filters.propertyType = propertyTypeFilter;
    if (sourceFilter !== "ALL") filters.source = sourceFilter;
    if (bhkFilter !== "ALL") filters.bhk = bhkFilter;
    if (featuredFilter === "YES") filters.featured = true;
    if (debouncedSearchQuery) filters.search = debouncedSearchQuery;
    if (debouncedPriceRange) {
      filters.minPrice = debouncedPriceRange[0];
      filters.maxPrice = debouncedPriceRange[1];
    }
    if (userCity) filters.userCity = userCity;
    return filters;
  }, [
    categoryFilter,
    propertyTypeFilter,
    sourceFilter,
    bhkFilter,
    featuredFilter,
    debouncedSearchQuery,
    debouncedPriceRange,
    userCity,
  ]);

  const { properties, pagination, isLoading, error } = useGetAllProperties(
    currentPage,
    cardsPerPage,
    serverFilters
  );
  const {
    marketPlaceEnquiries,
    isPending: isEnquiriesLoading,
    error: enquiriesError,
  } = useGetAllMarketPlaceEnquiries({ enabled: viewMode === "ENQUIRIES" });

  // Reset to page 1 when any filter or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    categoryFilter,
    propertyTypeFilter,
    sourceFilter,
    bhkFilter,
    featuredFilter,
    debouncedSearchQuery,
    debouncedPriceRange,
    cardsPerPage,
  ]);
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
  const propertiesScrollRef = useRef<HTMLDivElement | null>(null);
  const enquiriesScrollRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setShowScrollTop(scrollTop > 300);
  }, []);

  const scrollToTop = useCallback(() => {
    if (viewMode === "PROPERTIES" && propertiesScrollRef.current) {
      propertiesScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else if (viewMode === "ENQUIRIES" && enquiriesScrollRef.current) {
      enquiriesScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [viewMode]);

  const selectedProperty = properties?.find(
    (p) => p._id === selectedPropertyId
  );

  const maxPropertyPrice = 1_000_000_000; // 100 Crore fixed max for price slider

  const effectivePriceRange = useMemo(
    () => priceRange ?? [0, maxPropertyPrice],
    [priceRange, maxPropertyPrice]
  );
  const debouncedEnquiryPriceRange = useDebounce(priceRange, 300);

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

  // Scroll to top when page changes
  useEffect(() => {
    if (propertiesScrollRef.current) {
      propertiesScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  // Properties are now filtered and sorted server-side
  const filteredProperties = properties;

  const filteredEnquiries = useMemo(() => {
    let baseEnquiries = marketPlaceEnquiries || [];

    if (debouncedSearchQuery) {
      if (enquiryFuse) {
        const searchResults = enquiryFuse.search(debouncedSearchQuery);
        baseEnquiries = searchResults.map((res) => res.item);
      }
    }

    const filtered = baseEnquiries.filter((enquiry) => {
      const matchesSource =
        sourceFilter === "ALL" ||
        (sourceFilter === "BROKER" && enquiry.source === "broker") ||
        (sourceFilter === "COMPANY" && enquiry.source === "company");

      const matchesCategory =
        categoryFilter === "ALL" || enquiry.enquiryCategory === categoryFilter;

      let matchesPrice = true;
      if (debouncedEnquiryPriceRange && enquiry.budget) {
        const [minFilter, maxFilter] = debouncedEnquiryPriceRange;
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

    // Sort same-city enquiries first
    if (userCity) {
      const normalizedUserCity = userCity.toLowerCase().trim();
      return filtered.sort((a, b) => {
        // Check city field first, then address for city match
        const aCity = a.city?.toLowerCase().trim() || "";
        const bCity = b.city?.toLowerCase().trim() || "";
        const aAddress = a.address?.toLowerCase() || "";
        const bAddress = b.address?.toLowerCase() || "";

        const aIsSameCity =
          aCity === normalizedUserCity || aAddress.includes(normalizedUserCity);
        const bIsSameCity =
          bCity === normalizedUserCity || bAddress.includes(normalizedUserCity);

        if (aIsSameCity && !bIsSameCity) return -1;
        if (!aIsSameCity && bIsSameCity) return 1;
        return 0;
      });
    }

    return filtered;
  }, [
    marketPlaceEnquiries,
    debouncedSearchQuery,
    enquiryFuse,
    sourceFilter,
    categoryFilter,
    debouncedEnquiryPriceRange,
    bhkFilter,
    userCity,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setPropertyTypeFilter("ALL");
    setSourceFilter("ALL");
    setPriceRange(null);
    setBhkFilter("ALL");
    setFeaturedFilter("ALL");
  };

  const hasActiveFilters =
    categoryFilter !== "ALL" ||
    bhkFilter !== "ALL" ||
    sourceFilter !== "ALL" ||
    propertyTypeFilter !== "ALL" ||
    featuredFilter !== "ALL" ||
    priceRange !== null;

  const renderPagination = () => {
    const { totalPages } = pagination;
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
      <Pagination className="">
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
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden relative w-full">
      <MarketplaceHeader
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
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
        featuredFilter={featuredFilter}
        setFeaturedFilter={setFeaturedFilter}
        view={view}
        setView={setView}
        filteredCount={pagination.total}
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
              ref={propertiesScrollRef}
              onScroll={handleScroll}
              className={`
            flex-col h-full overflow-y-auto scrollbar-hide transition-all duration-300
            ${view === "map" ? "hidden" : "flex"}
            ${view === "grid"
                  ? "w-full"
                  : "w-full lg:w-[60%] xl:w-[55%] 2xl:w-[50%]"
                }
            ${isMapOverlayActive ? "hidden lg:flex" : ""}
          `}
            >
              <div className="pt-3 px-6 md:px-8 space-y-3 pb-24">
                {!isLoading && (
                  <div className="hidden sm:flex items-center justify-between px-1">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                          {filteredProperties.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                          {pagination.total}
                        </span>{" "}
                        properties
                        {categoryFilter !== "ALL" && (
                          <span className="text-accent">
                            {" "}
                            in {categoryFilter.toLowerCase().replace("_", " ")}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          Per page:
                        </span>
                        <Select
                          value={String(cardsPerPage)}
                          onValueChange={(val) =>
                            setCardsPerPage(Number(val))
                          }
                        >
                          <SelectTrigger className="w-16 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                            <SelectItem value="48">48</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {pagination.totalPages > 1 && (
                      <p className="text-sm text-muted-foreground">
                        Page{" "}
                        <span className="font-medium text-foreground">
                          {currentPage}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                          {pagination.totalPages}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {isLoading ? (
                  <div
                    className={`grid gap-6 ${view === "split"
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
                      className={`grid gap-6 ${view === "split"
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3"
                        : "xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4"
                        }`}
                    >
                      {filteredProperties.length > 0 ? (
                        filteredProperties.map((property) => {
                          const isSameCity = userCity
                            ? property.address?.city?.toLowerCase().trim() ===
                            userCity.toLowerCase().trim()
                            : false;
                          return (
                            <motion.div
                              key={property._id}
                              variants={itemVariants}
                              ref={(el: HTMLDivElement | null) => {
                                propertyRefs.current[property._id] = el;
                              }}
                              className={`rounded-3xl transition-all duration-300 ${selectedPropertyId === property._id
                                ? "ring-2 ring-accent ring-offset-2 ring-offset-background shadow-lg scale-[1.02]"
                                : ""
                                }`}
                            >
                              <PropertyCard
                                property={property}
                                showMapButton={true}
                                onShowOnMap={handleShowOnMap}
                                isSameCity={isSameCity}
                              />
                            </motion.div>
                          );
                        })
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
          ${view === "split" && !isMapOverlayActive
                  ? "hidden lg:block lg:w-[40%] xl:w-[45%] 2xl:w-[50%] lg:sticky lg:top-0 lg:self-start"
                  : ""
                }
          ${isMapOverlayActive
                  ? "block w-full fixed inset-0 top-[120px] z-40"
                  : ""
                }
        `}
            >
              {selectedProperty && (
                <div className="absolute right-4 top-4 bottom-4 z-30 w-[calc(100%-2rem)] sm:w-[420px] lg:w-[450px] bg-background rounded-xl shadow-2xl overflow-hidden border-2 border-border/50">
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
        <div
          ref={enquiriesScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-hide"
        >
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
                  filteredEnquiries.map((enquiry) => {
                    const normalizedUserCity =
                      userCity?.toLowerCase().trim() || "";
                    const enquiryCity =
                      enquiry.city?.toLowerCase().trim() || "";
                    const enquiryAddress = enquiry.address?.toLowerCase() || "";
                    // Check if any preferred location matches user's city
                    const preferredLocationsMatch = enquiry.preferredLocations?.some(
                      (loc) =>
                        loc.city?.toLowerCase().trim() === normalizedUserCity ||
                        loc.address?.toLowerCase().includes(normalizedUserCity)
                    ) ?? false;
                    const isSameCity = normalizedUserCity
                      ? enquiryCity === normalizedUserCity ||
                      enquiryAddress.includes(normalizedUserCity) ||
                      preferredLocationsMatch
                      : false;
                    return (
                      <motion.div key={enquiry._id} variants={itemVariants}>
                        <EnquiryCard
                          enquiry={enquiry}
                          isSameCity={isSameCity}
                        />
                      </motion.div>
                    );
                  })
                ) : (
                  <EmptyEnquiriesState />
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-36 md:bottom-24 right-6 md:right-8 z-[9999]"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};
