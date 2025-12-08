"use client";
import React, { useState, useMemo } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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

const ProtectedPage = () => {
  const { properties, isLoading, error } = useGetAllProperties();
  const [view, setView] = useState<"grid" | "map" | "split">("grid");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
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
        matchesCategory && matchesMinPrice && matchesMaxPrice && matchesBhk
      );
    });
  }, [
    properties,
    debouncedSearchQuery,
    categoryFilter,
    debouncedPriceRange,
    bhkFilter,
    fuse,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
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
    priceRange[0] !== 0 ||
    priceRange[1] !== maxPropertyPrice;

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

  return (
    <div
      className={`container mx-auto p-6 px-80 space-y-6 ${view === "split" ? "h-[calc(100vh-100px)] overflow-hidden" : ""
        }`}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage your listed properties
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => {
              setView("grid");
              setSelectedPropertyId(null);
            }}
            title="Grid View"
          >
            <LayoutGridIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "map" ? "default" : "outline"}
            size="icon"
            onClick={() => {
              setView("map");
              setSelectedPropertyId(null);
            }}
            title="Map View"
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "split" ? "default" : "outline"}
            size="icon"
            onClick={() => {
              setView("split");
              setSelectedPropertyId(null);
            }}
            title="Split View"
          >
            <Columns className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-card p-4 rounded-lg border shadow-sm flex gap-4 items-center flex-col sm:flex-row">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search address, society, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto relative">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filters</DialogTitle>
                <DialogDescription>
                  Refine your property search results.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                      <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                      <SelectItem value="AGRICULTURAL">Agricultural</SelectItem>
                      <SelectItem value="RESORT">Resort</SelectItem>
                      <SelectItem value="FARM_HOUSE">Farm House</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Price Range</Label>
                    <div className="text-xs text-muted-foreground font-medium">
                      {formatPriceShort(priceRange[0])} -{" "}
                      {formatPriceShort(priceRange[1])}
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
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    clearFilters();
                    // setIsFilterOpen(false); // Optional: close on clear? Usually keep open to re-select.
                  }}
                  disabled={!hasActiveFilters && searchQuery === ""}
                >
                  Clear Filters
                </Button>
                <Button onClick={() => setIsFilterOpen(false)}>
                  Show Results
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery("")}
              title="Clear Search"
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : view === "map" ? (
        <div className="h-[calc(100vh-200px)] relative">
          {selectedProperty ? (
            <div className="absolute left-4 top-4 z-10 w-[400px] h-[calc(100%-2rem)] bg-background rounded-lg shadow-xl overflow-hidden border">
              <PropertyDetails
                property={selectedProperty}
                onClose={() => setSelectedPropertyId(null)}
              />
            </div>
          ) : null}
          <MapBox
            properties={filteredProperties}
            onSelectProperty={setSelectedPropertyId}
          />
        </div>
      ) : view === "split" ? (
        <div className="flex h-full gap-6">
          <div className="w-1/2 h-full">
            {selectedProperty ? (
              <div className="h-[calc(100vh-200px)] border rounded-lg overflow-hidden">
                <PropertyDetails
                  property={selectedProperty}
                  onClose={() => setSelectedPropertyId(null)}
                />
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pr-4 pb-4">
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((property) => (
                      <PropertyCard key={property._id} property={property} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                      <h3 className="text-lg font-semibold">
                        No properties found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your filters to find what you&apos;re
                        looking for.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
          <div className="w-1/2 h-full">
            <MapBox
              properties={filteredProperties}
              onSelectProperty={setSelectedPropertyId}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-muted/20 rounded-lg border border-dashed">
              <h3 className="text-lg font-semibold">No properties found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to find what you&apos;re looking for.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProtectedPage;
