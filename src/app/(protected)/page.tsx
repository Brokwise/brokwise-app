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
  Columns,
  Search,
  X,
  Filter as FilterIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Fuse from "fuse.js";
import { formatIndianNumber } from "@/utils/helper";
import { useApp } from "@/context/AppContext";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ProtectedPage = () => {
  const { userData } = useApp();
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
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000000]);
  const [bhkFilter, setBhkFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedPriceRange = useDebounce(priceRange, 300);

  const selectedProperty = properties?.find(
    (p) => p._id === selectedPropertyId
  );

  const maxPropertyPrice = useMemo(() => {
    if (!properties || properties.length === 0) return 100000000;
    const max = Math.max(...properties.map((p) => p.totalPrice));
    return max > 0 ? max : 100000000;
  }, [properties]);

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
    setPriceRange([0, maxPropertyPrice]);
    setBhkFilter("ALL");
  };

  const formatPriceShort = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return `${formatIndianNumber(price)}`;
    }
  };

  const hasActiveFilters =
    categoryFilter !== "ALL" ||
    bhkFilter !== "ALL" ||
    sourceFilter !== "ALL" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== maxPropertyPrice;

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

  // Category Pills Data
  const categoryPills = [
    { value: "ALL", label: "All" },
    { value: "RESIDENTIAL", label: "Residential" },
    { value: "COMMERCIAL", label: "Commercial" },
    { value: "INDUSTRIAL", label: "Industrial" },
    { value: "AGRICULTURAL", label: "Agricultural" },
    { value: "RESORT", label: "Resort" },
    { value: "FARM_HOUSE", label: "Farmhouse" },
  ];

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
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden relative">

      {/* 1. TOP CONTROL BAR (Always Visible) */}
      <div className="shrink-0 z-30 bg-background border-b border-border/40">
        <div className="px-4 py-3 space-y-3">

          {/* Hero Section (Compact) */}
          <div className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg p-3 border border-border/50 relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  Welcome back{userData?.fullName ? `, ${userData.fullName.split(' ')[0]}` : ''} 👋
                </h1>
              </div>

              {/* Search Input */}
              <div className="relative flex-1 lg:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm bg-background/80 backdrop-blur border-border/60 shadow-sm rounded-lg"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-background/50 rounded-md"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Bar (Moved Here) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Category Pills - Horizontal Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full scrollbar-hide mask-linear-fade">
              {categoryPills.map((pill) => (
                <Button
                  key={pill.value}
                  variant={categoryFilter === pill.value ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setCategoryFilter(pill.value)}
                  className={`shrink-0 rounded-full px-4 font-medium transition-all ${categoryFilter === pill.value
                    ? "bg-accent/10 text-accent hover:bg-accent/20 border-accent/20 border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {pill.label}
                </Button>
              ))}
            </div>

            {/* View Toggle & Advanced Filters */}
            <div className="flex items-center gap-2 shrink-0 ml-auto w-full sm:w-auto justify-end">
              {/* Results Count (Mobile Only) */}
              <span className="text-xs text-muted-foreground sm:hidden mr-auto">
                {filteredProperties.length} results
              </span>

              {/* Advanced Filters Button */}
              <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="relative gap-2 rounded-full border-border/60">
                    <FilterIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Filters</span>
                    {hasActiveFilters && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-background" />
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Advanced Filters</DialogTitle>
                    <DialogDescription>
                      Refine your property search results.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    {/* Price Range */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Price Range</Label>
                        <div className="text-xs text-muted-foreground font-medium">
                          {formatPriceShort(priceRange[0])} - {formatPriceShort(priceRange[1])}
                        </div>
                      </div>
                      <Slider
                        min={0}
                        max={maxPropertyPrice}
                        step={100000}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value)}
                        className="py-2"
                      />
                    </div>

                    {/* BHK */}
                    <div className="space-y-2">
                      <Label>BHK (Residential)</Label>
                      <Select value={bhkFilter} onValueChange={setBhkFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="BHK" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Any BHK</SelectItem>
                          <SelectItem value="1">1 BHK</SelectItem>
                          <SelectItem value="2">2 BHK</SelectItem>
                          <SelectItem value="3">3 BHK</SelectItem>
                          <SelectItem value="4">4 BHK</SelectItem>
                          <SelectItem value="5+">5+ BHK</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Source Filter for Companies */}
                    {userData?.userType === "company" && (
                      <div className="space-y-2">
                        <Label>Listed By</Label>
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Sources</SelectItem>
                            <SelectItem value="BROKER">Broker Listed</SelectItem>
                            <SelectItem value="COMPANY">Company Listed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters && searchQuery === ""}
                    >
                      Clear All
                    </Button>
                    <Button onClick={() => setIsFilterOpen(false)}>
                      Apply Filters
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="w-px h-6 bg-border/60 mx-1 hidden sm:block" />

              {/* View Toggle Buttons */}
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/40">
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => { setView("grid"); setSelectedPropertyId(null); }}
                  className={`h-7 w-7 rounded-full transition-all duration-300 ${view === 'grid' ? 'shadow-md scale-105 ring-1 ring-background' : 'hover:bg-background/50'}`}
                  title="Grid View"
                >
                  <LayoutGridIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={view === "map" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => { setView("map"); setSelectedPropertyId(null); }}
                  className={`h-7 w-7 rounded-full transition-all duration-300 ${view === 'map' ? 'shadow-md scale-105 ring-1 ring-background' : 'hover:bg-background/50'}`}
                  title="Map View"
                >
                  <MapPin className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={view === "split" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => { setView("split"); setSelectedPropertyId(null); }}
                  className={`h-7 w-7 rounded-full hidden md:flex transition-all duration-300 ${view === 'split' ? 'shadow-md scale-105 ring-1 ring-background' : 'hover:bg-background/50'}`}
                  title="Split View"
                >
                  <Columns className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          <div className="p-4 space-y-4 pb-24">

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
                        ref={(el) => (propertyRefs.current[property._id] = el) as any}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden filter drop-shadow-xl">
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

// Empty State Component
const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed">
    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
      <Search className="h-8 w-8 text-muted-foreground/50" />
    </div>
    <h3 className="text-lg font-semibold text-foreground">No properties found</h3>
    <p className="text-muted-foreground text-center mt-1 max-w-sm">
      Try adjusting your filters or search terms to find what you're looking for.
    </p>
  </div>
);

export default ProtectedPage;

