"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Typography } from "@/components/ui/typography";
import {
  Search,
  X,
  Filter as FilterIcon,
  LayoutGridIcon,
  MapPin,
  Columns,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { formatIndianNumber } from "@/utils/helper";
import { useApp } from "@/context/AppContext";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useTranslation } from "react-i18next";

// Property type options based on category
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

interface MarketplaceHeaderProps {
  viewMode: "PROPERTIES" | "ENQUIRIES";
  setViewMode: (val: "PROPERTIES" | "ENQUIRIES") => void;
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
  view: "grid" | "map" | "split";
  setView: (val: "grid" | "map" | "split") => void;
  filteredCount: number;
  filteredEnquiriesCount: number;
  maxPropertyPrice: number;
  effectivePriceRange: number[];
  clearFilters: () => void;
  hasActiveFilters: boolean;
  onClearPropertySelection: () => void;
}

export const MarketplaceHeader = ({
  viewMode,
  setViewMode,
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
  view,
  setView,
  filteredCount,
  filteredEnquiriesCount,
  maxPropertyPrice,
  effectivePriceRange,
  clearFilters,
  hasActiveFilters,
  onClearPropertySelection,
}: MarketplaceHeaderProps) => {
  // Get the appropriate count based on view mode
  const currentCount =
    viewMode === "PROPERTIES" ? filteredCount : filteredEnquiriesCount;
  const { userData } = useApp();
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const {
    recentSearches,
    isLoading: isRecentLoading,
    refetch: refetchRecentSearches,
    addRecentSearch,
  } = useRecentSearches({ enabled: false });

  // Category Pills Data
  const categoryPills = [
    { value: "ALL", label: t("label_all") },
    { value: "RESIDENTIAL", label: t("category_residential") },
    { value: "COMMERCIAL", label: t("category_commercial") },
    { value: "INDUSTRIAL", label: t("category_industrial") },
    { value: "AGRICULTURAL", label: t("category_agricultural") },
    { value: "RESORT", label: t("category_resort") },
    { value: "FARM_HOUSE", label: t("category_farmhouse") },
  ];

  // Get property type options based on selected category
  const propertyTypeOptions = useMemo(() => {
    if (categoryFilter === "ALL") {
      return [{ value: "ALL", label: "All Types" }];
    }
    return (
      PROPERTY_TYPE_OPTIONS[categoryFilter] || [
        { value: "ALL", label: "All Types" },
      ]
    );
  }, [categoryFilter]);

  // Check if BHK filter is relevant (only for Residential category)
  const showBhkFilter =
    categoryFilter === "ALL" || categoryFilter === "RESIDENTIAL";

  const formatPriceShort = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return `${formatIndianNumber(price)}`;
    }
  };

  return (
    <div className="shrink-0 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 pb-3 pt-2 px-3 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Title + Segmented Control */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0 flex-1">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="shrink-0"
          >
            <Typography variant="h1">
              Marketplace
            </Typography>
          </motion.div>

          {/* Segmented Control */}
          <div className="flex items-center gap-0.5 bg-muted/50 p-0.5 rounded-lg border border-border/40">
            <Button
              type="button"
              variant={viewMode === "PROPERTIES" ? "default" : "ghost"}
              onClick={() => setViewMode("PROPERTIES")}
              size="sm"
              className={`h-7 sm:h-8 rounded-md px-2 sm:px-3 md:px-4 text-xs sm:text-sm font-medium transition-all ${viewMode === "PROPERTIES"
                  ? "shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {t("nav_properties")}
            </Button>
            <Button
              type="button"
              variant={viewMode === "ENQUIRIES" ? "default" : "ghost"}
              onClick={() => setViewMode("ENQUIRIES")}
              size="sm"
              className={`h-7 sm:h-8 rounded-md px-2 sm:px-3 md:px-4 text-xs sm:text-sm font-medium transition-all ${viewMode === "ENQUIRIES"
                  ? "shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {t("nav_enquiries")}
            </Button>
          </div>
        </div>

        {/* Right: Dynamic Action Button */}
        <Button
          asChild
          size="sm"
          className="h-8 sm:h-9 gap-1.5 sm:gap-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all shrink-0 px-2.5 sm:px-3"
        >
          <Link
            href={
              viewMode === "PROPERTIES"
                ? "/property/createProperty"
                : "/enquiries/create"
            }
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">
              {viewMode === "PROPERTIES" ? t("nav_list_property") : t("action_post_enquiry")}
            </span>
            <span className="sm:hidden">New</span>
          </Link>
        </Button>
      </div>

      {/* 2. Full-Width Search Bar */}
      <div className="relative w-full">
        <Popover open={recentOpen} onOpenChange={setRecentOpen}>
          <PopoverAnchor asChild>
            <div className="relative flex items-center w-full rounded-xl bg-muted/40 border border-border/50 hover:border-border/80 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
              <Search className="absolute left-3 sm:left-4 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder={
                  viewMode === "PROPERTIES"
                    ? t("label_search_properties")
                    : t("label_search_enquiries")
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={async () => {
                  setRecentOpen(true);
                  await refetchRecentSearches();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setRecentOpen(false);
                    return;
                  }
                  if (e.key === "Enter") {
                    const term = searchQuery.trim();
                    if (term) {
                      void addRecentSearch(term);
                    }
                    setRecentOpen(false);
                  }
                }}
                className="pl-9 sm:pl-11 pr-9 sm:pr-10 h-10 sm:h-11 text-sm bg-transparent border-0 shadow-none rounded-xl placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1.5 sm:right-2 h-7 w-7 hover:bg-muted rounded-lg"
                  title="Clear"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
            </div>
          </PopoverAnchor>

          <PopoverContent
            className="w-[min(24rem,calc(100vw-1.5rem))] p-0 rounded-xl"
            align="start"
            sideOffset={8}
          >
            <div className="p-3 border-b border-border/50">
              <Typography variant="small" className="font-semibold">{t("label_recent_searches")}</Typography>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {isRecentLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : recentSearches.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No recent searches yet.
                  <br />
                  <span className="text-xs">
                    Press Enter to save a search term.
                  </span>
                </div>
              ) : (
                recentSearches.slice(0, 5).map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0"
                    onClick={() => {
                      setSearchQuery(term);
                      setRecentOpen(false);
                      void addRecentSearch(term);
                    }}
                  >
                    <span className="font-medium">{term}</span>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Controls: Filter Pills + View Toggle */}
      <div className="flex flex-col gap-3 sm:gap-4 w-full">
        {/* Category Pills (Scrollable) - Full width on mobile */}
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 w-full scrollbar-thin -mx-3 px-3 sm:mx-0 sm:px-0">
            {categoryPills.map((pill) => (
              <Button
                key={pill.value}
                variant={categoryFilter === pill.value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  setCategoryFilter(pill.value);
                  // Reset dependent filters when category changes via pills
                  setPropertyTypeFilter("ALL");
                  if (pill.value !== "ALL" && pill.value !== "RESIDENTIAL") {
                    setBhkFilter("ALL");
                  }
                }}
                className={`shrink-0 rounded-full px-2.5 sm:px-4 h-7 sm:h-8 font-medium border text-xs sm:text-sm transition-all ${categoryFilter === pill.value
                    ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                {pill.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 justify-end">
            {" "}
            {/* Advanced Filters Trigger */}{" "}
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              {" "}
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`relative gap-1.5 sm:gap-2 h-8 rounded-full border-border/60 hover:bg-secondary hover:border-border px-2.5 sm:px-3 ${hasActiveFilters
                      ? "text-accent border-accent/30 bg-accent/5"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <FilterIcon className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline sm:inline">{t("label_filters")}</span>
                  {hasActiveFilters && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DialogTrigger>{" "}
              <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[425px] max-h-[85vh] overflow-y-auto rounded-xl mx-auto">
                {" "}
                <DialogHeader>
                  {" "}
                  <DialogTitle>
                    {" "}
                    Filter{" "}
                    {viewMode === "PROPERTIES"
                      ? "Properties"
                      : "Enquiries"}{" "}
                  </DialogTitle>{" "}
                  <DialogDescription>
                    {" "}
                    Refine your search with specific criteria.{" "}
                  </DialogDescription>{" "}
                </DialogHeader>{" "}
                <div className="grid gap-6 py-4">
                  {" "}
                  {/* Category */}{" "}
                  <div className="space-y-2">
                    {" "}
                    <Label>
                      {" "}
                      {viewMode === "PROPERTIES" ? "Property" : "Enquiry"}{" "}
                      Category{" "}
                    </Label>{" "}
                    <Select
                      value={categoryFilter}
                      onValueChange={(val) => {
                        setCategoryFilter(val);
                        setPropertyTypeFilter("ALL");
                        if (val !== "ALL" && val !== "RESIDENTIAL") {
                          setBhkFilter("ALL");
                        }
                      }}
                    >
                      {" "}
                      <SelectTrigger>
                        {" "}
                        <SelectValue placeholder="Select Category" />{" "}
                      </SelectTrigger>{" "}
                      <SelectContent>
                        {" "}
                        {categoryPills.map((pill) => (
                          <SelectItem key={pill.value} value={pill.value}>
                            {" "}
                            {pill.label}{" "}
                          </SelectItem>
                        ))}{" "}
                      </SelectContent>{" "}
                    </Select>{" "}
                  </div>{" "}
                  {/* Property Type - Only for Properties view */}{" "}
                  {viewMode === "PROPERTIES" && categoryFilter !== "ALL" && (
                    <div className="space-y-2">
                      {" "}
                      <Label>Property Type</Label>{" "}
                      <Select
                        value={propertyTypeFilter}
                        onValueChange={setPropertyTypeFilter}
                      >
                        {" "}
                        <SelectTrigger>
                          {" "}
                          <SelectValue placeholder="Select Type" />{" "}
                        </SelectTrigger>{" "}
                        <SelectContent>
                          {" "}
                          {propertyTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {" "}
                              {option.label}{" "}
                            </SelectItem>
                          ))}{" "}
                        </SelectContent>{" "}
                      </Select>{" "}
                    </div>
                  )}{" "}
                  {/* Price/Budget Range */}{" "}
                  <div className="space-y-4">
                    {" "}
                    <div className="flex justify-between items-center">
                      {" "}
                      <Label>
                        {" "}
                        {viewMode === "PROPERTIES"
                          ? "Price"
                          : "Budget"} Range{" "}
                      </Label>{" "}
                      <div className="text-xs text-muted-foreground font-medium">
                        {" "}
                        {formatPriceShort(effectivePriceRange[0])} -{" "}
                        {formatPriceShort(effectivePriceRange[1])}{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="grid grid-cols-2 gap-3">
                      {" "}
                      <div className="space-y-1">
                        {" "}
                        <Label className="text-xs text-muted-foreground">
                          {" "}
                          Min{" "}
                        </Label>{" "}
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
                            setPriceRange([
                              Math.max(
                                0,
                                Math.min(next, effectivePriceRange[1])
                              ),
                              effectivePriceRange[1],
                            ]);
                          }}
                        />{" "}
                      </div>{" "}
                      <div className="space-y-1">
                        {" "}
                        <Label className="text-xs text-muted-foreground">
                          {" "}
                          Max{" "}
                        </Label>{" "}
                        <Input
                          inputMode="numeric"
                          type="number"
                          min={effectivePriceRange[0]}
                          max={maxPropertyPrice}
                          value={effectivePriceRange[1]}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const next =
                              raw === "" ? maxPropertyPrice : Number(raw);
                            if (!Number.isFinite(next)) return;
                            setPriceRange([
                              effectivePriceRange[0],
                              Math.min(
                                maxPropertyPrice,
                                Math.max(next, effectivePriceRange[0])
                              ),
                            ]);
                          }}
                        />{" "}
                      </div>{" "}
                    </div>{" "}
                    <Slider
                      min={0}
                      max={maxPropertyPrice}
                      step={100000}
                      value={effectivePriceRange}
                      onValueChange={(value) => setPriceRange(value)}
                      className="py-2"
                    />{" "}
                  </div>{" "}
                  {/* BHK - Only shown for Residential */}{" "}
                  {showBhkFilter && (
                    <div className="space-y-2">
                      {" "}
                      <Label>BHK (Bedrooms)</Label>{" "}
                      <Select value={bhkFilter} onValueChange={setBhkFilter}>
                        {" "}
                        <SelectTrigger>
                          {" "}
                          <SelectValue placeholder="BHK" />{" "}
                        </SelectTrigger>{" "}
                        <SelectContent>
                          {" "}
                          <SelectItem value="ALL">Any BHK</SelectItem>{" "}
                          <SelectItem value="1">1 BHK</SelectItem>{" "}
                          <SelectItem value="2">2 BHK</SelectItem>{" "}
                          <SelectItem value="3">3 BHK</SelectItem>{" "}
                          <SelectItem value="4">4 BHK</SelectItem>{" "}
                          <SelectItem value="5+">5+ BHK</SelectItem>{" "}
                        </SelectContent>{" "}
                      </Select>{" "}
                    </div>
                  )}{" "}
                  {/* Source Filter for Companies */}{" "}
                  {userData?.userType === "company" && (
                    <div className="space-y-2">
                      {" "}
                      <Label>Listed By</Label>{" "}
                      <Select
                        value={sourceFilter}
                        onValueChange={setSourceFilter}
                      >
                        {" "}
                        <SelectTrigger>
                          {" "}
                          <SelectValue placeholder="Source" />{" "}
                        </SelectTrigger>{" "}
                        <SelectContent>
                          {" "}
                          <SelectItem value="ALL">All Sources</SelectItem>{" "}
                          <SelectItem value="BROKER">Broker Listed</SelectItem>{" "}
                          <SelectItem value="COMPANY">
                            Company Listed
                          </SelectItem>{" "}
                        </SelectContent>{" "}
                      </Select>{" "}
                    </div>
                  )}{" "}
                </div>{" "}
                <DialogFooter className="gap-2 sm:gap-0">
                  {" "}
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters && searchQuery === ""}
                  >
                    {" "}
                    Reset{" "}
                  </Button>{" "}
                  <Button onClick={() => setIsFilterOpen(false)}>
                    {" "}
                    View {currentCount}{" "}
                    {viewMode === "PROPERTIES" ? "Properties" : "Enquiries"}{" "}
                  </Button>{" "}
                </DialogFooter>{" "}
              </DialogContent>{" "}
            </Dialog>{" "}
            {/* View Toggles - Only for Properties */}{" "}
            {viewMode === "PROPERTIES" && (
              <div className="flex items-center gap-0.5 bg-secondary/50 p-0.5 rounded-full border border-border/40">
                {" "}
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => {
                    setView("grid");
                    onClearPropertySelection();
                  }}
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full transition-all duration-300 ${view === "grid"
                      ? "shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  title="Grid View"
                >
                  {" "}
                  <LayoutGridIcon className="h-3.5 w-3.5" />{" "}
                </Button>{" "}
                <Button
                  variant={view === "map" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => {
                    setView("map");
                    onClearPropertySelection();
                  }}
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full transition-all duration-300 ${view === "map"
                      ? "shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  title="Map View"
                >
                  {" "}
                  <MapPin className="h-3.5 w-3.5" />{" "}
                </Button>{" "}
                <Button
                  variant={view === "split" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => {
                    setView("split");
                    onClearPropertySelection();
                  }}
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full hidden md:flex transition-all duration-300 ${view === "split"
                      ? "shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  title="Split View"
                >
                  {" "}
                  <Columns className="h-3.5 w-3.5" />{" "}
                </Button>{" "}
              </div>
            )}{" "}
          </div>
        </div>
        {/* Right Side Actions - Filter + View Toggle */}
      </div>

      {/* 3. Active Filters Quick Row (if filters active) */}
      {(searchQuery || hasActiveFilters) && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground mr-0.5 sm:mr-1">
            Active:
          </span>
          {searchQuery && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="h-5 sm:h-6 text-[10px] sm:text-xs rounded-full gap-1 sm:gap-1.5 px-2 sm:px-2.5 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/10"
            >
              <span className="max-w-[80px] sm:max-w-[120px] truncate">
                &quot;{searchQuery}&quot;
              </span>
              <X className="h-2.5 sm:h-3 w-2.5 sm:w-3 opacity-70 shrink-0" />
            </Button>
          )}

          {categoryFilter !== "ALL" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setCategoryFilter("ALL");
                setPropertyTypeFilter("ALL");
                setBhkFilter("ALL");
              }}
              className="h-5 sm:h-6 text-[10px] sm:text-xs rounded-full gap-1 sm:gap-1.5 px-2 sm:px-2.5 bg-muted text-foreground hover:bg-muted/80 border border-border/50"
            >
              {categoryPills.find((p) => p.value === categoryFilter)?.label ||
                categoryFilter}
              <X className="h-2.5 sm:h-3 w-2.5 sm:w-3 opacity-70 shrink-0" />
            </Button>
          )}

          {viewMode === "PROPERTIES" && propertyTypeFilter !== "ALL" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPropertyTypeFilter("ALL")}
              className="h-5 sm:h-6 text-[10px] sm:text-xs rounded-full gap-1 sm:gap-1.5 px-2 sm:px-2.5 bg-muted text-foreground hover:bg-muted/80 border border-border/50"
            >
              {propertyTypeOptions.find((o) => o.value === propertyTypeFilter)
                ?.label || propertyTypeFilter}
              <X className="h-2.5 sm:h-3 w-2.5 sm:w-3 opacity-70 shrink-0" />
            </Button>
          )}

          {priceRange !== null && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPriceRange(null)}
              className="h-5 sm:h-6 text-[10px] sm:text-xs rounded-full gap-1 sm:gap-1.5 px-2 sm:px-2.5 bg-muted text-foreground hover:bg-muted/80 border border-border/50"
            >
              <span className="hidden sm:inline">
                {viewMode === "PROPERTIES" ? "Price" : "Budget"}:{" "}
              </span>
              {formatPriceShort(effectivePriceRange[0])} -{" "}
              {formatPriceShort(effectivePriceRange[1])}
              <X className="h-2.5 sm:h-3 w-2.5 sm:w-3 opacity-70 shrink-0" />
            </Button>
          )}

          {bhkFilter !== "ALL" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setBhkFilter("ALL")}
              className="h-5 sm:h-6 text-[10px] sm:text-xs rounded-full gap-1 sm:gap-1.5 px-2 sm:px-2.5 bg-muted text-foreground hover:bg-muted/80 border border-border/50"
            >
              {bhkFilter === "5+" ? "5+ BHK" : `${bhkFilter} BHK`}
              <X className="h-2.5 sm:h-3 w-2.5 sm:w-3 opacity-70 shrink-0" />
            </Button>
          )}

          {userData?.userType === "company" && sourceFilter !== "ALL" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSourceFilter("ALL")}
              className="h-5 sm:h-6 text-[10px] sm:text-xs rounded-full gap-1 sm:gap-1.5 px-2 sm:px-2.5 bg-muted text-foreground hover:bg-muted/80 border border-border/50"
            >
              {sourceFilter === "BROKER" ? "Broker Listed" : "Company Listed"}
              <X className="h-2.5 sm:h-3 w-2.5 sm:w-3 opacity-70 shrink-0" />
            </Button>
          )}

          <Button
            variant="link"
            size="sm"
            onClick={clearFilters}
            className="h-5 sm:h-6 text-[10px] sm:text-xs px-1.5 sm:px-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            {t("action_clear_all")}
          </Button>
        </div>
      )}
    </div>
  );
};
