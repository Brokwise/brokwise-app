"use client";

import React, { useMemo } from "react";
import {
  Search,
  X,
  RotateCcw,
  Home,
  Building2,
  Factory,
  Wheat,
  Trees,
  Hotel,
  BedDouble,
  Crown,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatIndianNumber } from "@/utils/helper";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "react-i18next";

const PROPERTY_TYPE_OPTIONS: Record<
  string,
  { value: string; label: string }[]
> = {
  RESIDENTIAL: [
    { value: "ALL", label: "All Types" },
    { value: "FLAT", label: "Flat / Apartment" },
    { value: "VILLA", label: "Villa" },
    { value: "LAND", label: "Residential Land" },
  ],
  COMMERCIAL: [
    { value: "ALL", label: "All Types" },
    { value: "SHOWROOM", label: "Showroom" },
    { value: "HOTEL", label: "Hotel" },
    { value: "HOSTEL", label: "Hostel" },
    { value: "SHOP", label: "Shop" },
    { value: "OFFICE_SPACE", label: "Office Space" },
    { value: "OTHER_SPACE", label: "Other Space" },
  ],
  INDUSTRIAL: [
    { value: "ALL", label: "All Types" },
    { value: "INDUSTRIAL_PARK", label: "Industrial Park" },
    { value: "INDUSTRIAL_LAND", label: "Industrial Land" },
    { value: "WAREHOUSE", label: "Warehouse" },
  ],
  AGRICULTURAL: [
    { value: "ALL", label: "All Types" },
    { value: "AGRICULTURAL_LAND", label: "Agricultural Land" },
  ],
  RESORT: [
    { value: "ALL", label: "All Types" },
    { value: "RESORT", label: "Resort" },
  ],
  FARM_HOUSE: [
    { value: "ALL", label: "All Types" },
    { value: "FARM_HOUSE", label: "Farm House" },
    { value: "INDIVIDUAL", label: "Individual" },
  ],
};

interface FilterSidebarProps {
  viewMode: "PROPERTIES" | "ENQUIRIES";
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  propertyTypeFilter: string;
  setPropertyTypeFilter: (val: string) => void;
  sourceFilter: string;
  setSourceFilter: (val: string) => void;
  priceRange: number[] | null;
  setPriceRange: (val: number[] | null) => void;
  bhkFilter: string;
  setBhkFilter: (val: string) => void;
  featuredFilter: string;
  setFeaturedFilter: (val: string) => void;
  listingPurposeFilter: string;
  setListingPurposeFilter: (val: string) => void;
  enquiryPurposeFilter: string;
  setEnquiryPurposeFilter: (val: string) => void;
  rentRange: number[] | null;
  setRentRange: (val: number[] | null) => void;
  maxRentPrice: number;
  effectiveRentRange: number[];
  maxPropertyPrice: number;
  effectivePriceRange: number[];
  clearFilters: () => void;
  hasActiveFilters: boolean;
  filteredCount: number;
  filteredEnquiriesCount: number;
}

const categoryIcons: Record<string, React.ElementType> = {
  RESIDENTIAL: Home,
  COMMERCIAL: Building2,
  INDUSTRIAL: Factory,
  AGRICULTURAL: Wheat,
  RESORT: Hotel,
  FARM_HOUSE: Trees,
};

export const FilterSidebar = ({
  viewMode,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  propertyTypeFilter,
  setPropertyTypeFilter,
  sourceFilter,
  setSourceFilter,
  priceRange,
  setPriceRange,
  bhkFilter,
  setBhkFilter,
  featuredFilter,
  setFeaturedFilter,
  enquiryPurposeFilter,
  rentRange,
  setRentRange,
  maxRentPrice,
  effectiveRentRange,
  maxPropertyPrice,
  effectivePriceRange,
  clearFilters,
  hasActiveFilters,
  filteredCount,
  filteredEnquiriesCount,
}: FilterSidebarProps) => {
  const { userData } = useApp();
  const { t } = useTranslation();

  const categories = [
    { value: "ALL", label: t("label_all") },
    { value: "RESIDENTIAL", label: t("category_residential") },
    { value: "COMMERCIAL", label: t("category_commercial") },
    { value: "INDUSTRIAL", label: t("category_industrial") },
    { value: "AGRICULTURAL", label: t("category_agricultural") },
    { value: "RESORT", label: t("category_resort") },
    { value: "FARM_HOUSE", label: t("category_farmhouse") },
  ];

  const propertyTypeOptions = useMemo(() => {
    if (categoryFilter === "ALL") return [{ value: "ALL", label: "All Types" }];
    return PROPERTY_TYPE_OPTIONS[categoryFilter] || [{ value: "ALL", label: "All Types" }];
  }, [categoryFilter]);

  const showBhkFilter = categoryFilter === "ALL" || categoryFilter === "RESIDENTIAL";

  const formatPriceShort = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `${formatIndianNumber(price)}`;
  };

  const currentCount = viewMode === "PROPERTIES" ? filteredCount : filteredEnquiriesCount;

  return (
    <div className="hidden lg:flex flex-col h-full w-[280px] shrink-0 border-r border-border/50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Filter</h2>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium">
            {currentCount}
          </Badge>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="px-5 py-4 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                placeholder={viewMode === "PROPERTIES" ? "Search properties..." : "Search enquiries..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 text-sm bg-muted/30 border-border/40 rounded-lg placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* Property Category */}
          <div className="space-y-2.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {viewMode === "PROPERTIES" ? "Property" : "Enquiry"} Category
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.value];
                const isSelected = categoryFilter === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setCategoryFilter(cat.value);
                      setPropertyTypeFilter("ALL");
                      if (cat.value !== "ALL" && cat.value !== "RESIDENTIAL") {
                        setBhkFilter("ALL");
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${isSelected
                      ? "bg-primary/10 text-primary border-primary/25 shadow-sm"
                      : "bg-background text-muted-foreground border-border/40 hover:border-border hover:text-foreground"
                      }`}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Featured Filter */}
          {viewMode === "PROPERTIES" && (
            <>
              <Separator className="bg-border/30" />
              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Featured
                </Label>
                <div className="flex gap-1.5">
                  {[
                    { value: "ALL", label: "All" },
                    { value: "YES", label: "Featured Only" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFeaturedFilter(opt.value)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${featuredFilter === opt.value
                        ? "bg-primary/10 text-primary border-primary/25 shadow-sm"
                        : "bg-background text-muted-foreground border-border/40 hover:border-border hover:text-foreground"
                        }`}
                    >
                      {opt.value === "YES" && <Crown className="h-3 w-3" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {/* Property Type (when category is selected) */}
          {viewMode === "PROPERTIES" && categoryFilter !== "ALL" && (
            <div className="space-y-2.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Property Type
              </Label>
              <Select
                value={propertyTypeFilter}
                onValueChange={setPropertyTypeFilter}
              >
                <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/40 rounded-lg">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator className="bg-border/30" />

          {/* Price / Budget Range */}
          {viewMode === "ENQUIRIES" && enquiryPurposeFilter === "RENT" ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Monthly Rent
                </Label>
                {rentRange && (
                  <button
                    onClick={() => setRentRange(null)}
                    className="text-[10px] text-primary hover:text-primary/80"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="px-1">
                <Slider
                  min={0}
                  max={maxRentPrice}
                  step={1000}
                  value={effectiveRentRange}
                  onValueChange={(value) => setRentRange(value)}
                  className="py-2"
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground font-medium px-1">
                <span>{formatPriceShort(effectiveRentRange[0])}</span>
                <span>{formatPriceShort(effectiveRentRange[1])}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  inputMode="numeric"
                  type="number"
                  min={0}
                  max={effectiveRentRange[1]}
                  value={effectiveRentRange[0]}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const next = raw === "" ? 0 : Number(raw);
                    if (!Number.isFinite(next)) return;
                    setRentRange([Math.max(0, Math.min(next, effectiveRentRange[1])), effectiveRentRange[1]]);
                  }}
                  className="h-8 text-xs bg-muted/30 border-border/40 rounded-lg"
                  placeholder="Min"
                />
                <Input
                  inputMode="numeric"
                  type="number"
                  min={effectiveRentRange[0]}
                  max={maxRentPrice}
                  value={effectiveRentRange[1]}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const next = raw === "" ? maxRentPrice : Number(raw);
                    if (!Number.isFinite(next)) return;
                    setRentRange([effectiveRentRange[0], Math.min(maxRentPrice, Math.max(next, effectiveRentRange[0]))]);
                  }}
                  className="h-8 text-xs bg-muted/30 border-border/40 rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {viewMode === "PROPERTIES" ? "Price Range" : "Budget Range"}
                </Label>
                {priceRange && (
                  <button
                    onClick={() => setPriceRange(null)}
                    className="text-[10px] text-primary hover:text-primary/80"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="px-1">
                <Slider
                  min={0}
                  max={maxPropertyPrice}
                  step={100000}
                  value={effectivePriceRange}
                  onValueChange={(value) => setPriceRange(value)}
                  className="py-2"
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground font-medium px-1">
                <span>{formatPriceShort(effectivePriceRange[0])}</span>
                <span>{formatPriceShort(effectivePriceRange[1])}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  inputMode="numeric"
                  type="number"
                  min={0}
                  max={effectivePriceRange[1]}
                  value={effectivePriceRange[0]}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const next = raw === "" ? 0 : Number(raw);
                    if (!Number.isFinite(next)) return;
                    setPriceRange([Math.max(0, Math.min(next, effectivePriceRange[1])), effectivePriceRange[1]]);
                  }}
                  className="h-8 text-xs bg-muted/30 border-border/40 rounded-lg"
                  placeholder="Min"
                />
                <Input
                  inputMode="numeric"
                  type="number"
                  min={effectivePriceRange[0]}
                  max={maxPropertyPrice}
                  value={effectivePriceRange[1]}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const next = raw === "" ? maxPropertyPrice : Number(raw);
                    if (!Number.isFinite(next)) return;
                    setPriceRange([effectivePriceRange[0], Math.min(maxPropertyPrice, Math.max(next, effectivePriceRange[0]))]);
                  }}
                  className="h-8 text-xs bg-muted/30 border-border/40 rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>
          )}

          <Separator className="bg-border/30" />

          {/* BHK (Room) */}
          {showBhkFilter && (
            <div className="space-y-2.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Bedrooms
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "ALL", label: "Any" },
                  { value: "1", label: "1 BHK" },
                  { value: "2", label: "2 BHK" },
                  { value: "3", label: "3 BHK" },
                  { value: "4", label: "4 BHK" },
                  { value: "5+", label: "5+" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBhkFilter(opt.value)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${bhkFilter === opt.value
                      ? "bg-primary/10 text-primary border-primary/25 shadow-sm"
                      : "bg-background text-muted-foreground border-border/40 hover:border-border hover:text-foreground"
                      }`}
                  >
                    <BedDouble className="h-3 w-3" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Source Filter (Companies) */}
          {userData?.userType === "company" && (
            <>
              <Separator className="bg-border/30" />
              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Listed By
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "ALL", label: "All Sources", icon: Home },
                    { value: "BROKER", label: "Broker", icon: Users },
                    { value: "COMPANY", label: "Company", icon: Building2 },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSourceFilter(opt.value)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${sourceFilter === opt.value
                        ? "bg-primary/10 text-primary border-primary/25 shadow-sm"
                        : "bg-background text-muted-foreground border-border/40 hover:border-border hover:text-foreground"
                        }`}
                    >
                      <opt.icon className="h-3 w-3" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}


        </div>
      </ScrollArea>
    </div>
  );
};
