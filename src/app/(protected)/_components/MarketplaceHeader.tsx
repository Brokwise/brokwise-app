"use client";

import React, { useState } from "react";
import {
    Search,
    X,
    Filter as FilterIcon,
    LayoutGridIcon,
    MapPin,
    Columns,
    Plus,
    MessageSquarePlus,
    Star,
    ChevronDown
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
import { Label } from "@/components/ui/label";
import { formatIndianNumber } from "@/utils/helper";
import { useApp } from "@/context/AppContext";

interface MarketplaceHeaderProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    categoryFilter: string;
    setCategoryFilter: (val: string) => void;
    sourceFilter: string;
    setSourceFilter: (val: string) => void;
    priceRange: number[] | null;
    setPriceRange: (val: number[] | null) => void;
    bhkFilter: string;
    setBhkFilter: (val: string) => void;
    view: "grid" | "map" | "split";
    setView: (val: "grid" | "map" | "split") => void;
    filteredCount: number;
    maxPropertyPrice: number;
    effectivePriceRange: number[];
    clearFilters: () => void;
    hasActiveFilters: boolean;
    onClearPropertySelection: () => void;
}

export const MarketplaceHeader = ({
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    sourceFilter,
    setSourceFilter,
    priceRange,
    setPriceRange,
    bhkFilter,
    setBhkFilter,
    view,
    setView,
    filteredCount,
    maxPropertyPrice,
    effectivePriceRange,
    clearFilters,
    hasActiveFilters,
    onClearPropertySelection,
}: MarketplaceHeaderProps) => {
    const { userData } = useApp();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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
        <div className="shrink-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 pb-4 pt-6 px-6 lg:px-8 space-y-6">

            {/* 1. Header Section: Title + Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl md:text-5xl font-instrument-serif text-foreground tracking-tight">
                            Marketplace
                        </h1>
                        {/* Date/Time Pill */}
                        <div className="hidden md:inline-flex items-center justify-center px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground uppercase tracking-wider backdrop-blur-sm self-center">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </div>

                    {/* Ticker Row */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/80 overflow-x-auto scrollbar-hide">
                        <span className="shrink-0 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-medium text-foreground">12 New</span> Listings from Jaipur
                        </span>
                        <span className="text-border/60">•</span>
                        <span className="shrink-0 font-medium text-foreground">5</span> Price Drops
                        <span className="text-border/60">•</span>
                        <span className="shrink-0 font-medium text-foreground">3</span> New Enquiries
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-9 gap-2 rounded-full border-dashed border-border/80 hover:bg-accent/5 hover:text-accent hover:border-accent/40 transition-all">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Property</span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 gap-2 rounded-full border-dashed border-border/80 hover:bg-accent/5 hover:text-accent hover:border-accent/40 transition-all">
                        <MessageSquarePlus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Enquiry</span>
                    </Button>
                </div>
            </div>

            {/* 2. Floating Search Bar & View Controls */}
            <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">

                {/* Search Input Group */}
                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none" />
                    <div className="relative flex items-center w-full shadow-sm hover:shadow-md transition-shadow duration-300 rounded-full bg-background border border-border/60 active:ring-1 active:ring-accent/20">
                        <Search className="absolute left-4 h-5 w-5 text-muted-foreground/60" />
                        <Input
                            placeholder="Search by location, society, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-20 h-12 text-base bg-transparent border-0 shadow-none rounded-full placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        {/* Save Search Button (Inside Input) */}
                        <div className="absolute right-2 flex items-center gap-1">
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSearchQuery("")}
                                    className="h-8 w-8 hover:bg-muted rounded-full"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-accent hover:bg-accent/10" title="Save this search">
                                <Star className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Controls: Filter Pills + View Toggle */}
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between xl:justify-end min-w-0">

                    {/* Category Pills (Scrollable) */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full xl:w-auto scrollbar-hide mask-linear-fade flex-1">
                        {categoryPills.map((pill) => (
                            <Button
                                key={pill.value}
                                variant={categoryFilter === pill.value ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setCategoryFilter(pill.value)}
                                className={`shrink-0 rounded-full px-5 h-9 font-medium border text-sm transition-all ${categoryFilter === pill.value
                                    ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                    }`}
                            >
                                {pill.label}
                            </Button>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-border/40 mx-2 hidden sm:block" />

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 shrink-0 ml-auto w-full sm:w-auto justify-end">

                        {/* Advanced Filters Trigger */}
                        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className={`relative gap-2 h-9 rounded-full border-border/60 hover:bg-muted/50 ${hasActiveFilters ? "text-accent border-accent/30 bg-accent/5" : "text-muted-foreground"}`}>
                                    <FilterIcon className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Filters</span>
                                    {hasActiveFilters && (
                                        <span className="flex h-1.5 w-1.5 rounded-full bg-accent" />
                                    )}
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Filter Properties</DialogTitle>
                                    <DialogDescription>
                                        Refine your search with specific criteria.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    {/* Price Range */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label>Price Range</Label>
                                            <div className="text-xs text-muted-foreground font-medium">
                                                {formatPriceShort(effectivePriceRange[0])} - {formatPriceShort(effectivePriceRange[1])}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Min</Label>
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
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Max</Label>
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
                                                        setPriceRange([
                                                            effectivePriceRange[0],
                                                            Math.min(maxPropertyPrice, Math.max(next, effectivePriceRange[0])),
                                                        ]);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <Slider
                                            min={0}
                                            max={maxPropertyPrice}
                                            step={100000}
                                            value={effectivePriceRange}
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
                                        Reset
                                    </Button>
                                    <Button onClick={() => setIsFilterOpen(false)}>
                                        View {filteredCount} Properties
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* View Toggles */}
                        <div className="flex items-center gap-0.5 bg-muted/40 p-0.5 rounded-full border border-border/40">
                            <Button
                                variant={view === "grid" ? "default" : "ghost"}
                                size="icon"
                                onClick={() => { setView("grid"); onClearPropertySelection(); }}
                                className={`h-8 w-8 rounded-full transition-all duration-300 ${view === 'grid' ? "shadow-sm" : "hover:bg-muted text-muted-foreground"}`}
                                title="Grid View"
                            >
                                <LayoutGridIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant={view === "map" ? "default" : "ghost"}
                                size="icon"
                                onClick={() => { setView("map"); onClearPropertySelection(); }}
                                className={`h-8 w-8 rounded-full transition-all duration-300 ${view === 'map' ? "shadow-sm" : "hover:bg-muted text-muted-foreground"}`}
                                title="Map View"
                            >
                                <MapPin className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant={view === "split" ? "default" : "ghost"}
                                size="icon"
                                onClick={() => { setView("split"); onClearPropertySelection(); }}
                                className={`h-8 w-8 rounded-full hidden md:flex transition-all duration-300 ${view === 'split' ? "shadow-sm" : "hover:bg-muted text-muted-foreground"}`}
                                title="Split View"
                            >
                                <Columns className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. Active Filters Quick Row (if filters active) */}
            {(hasActiveFilters || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">Active:</span>
                    {searchQuery && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSearchQuery("")}
                            className="h-6 text-xs rounded-full gap-1.5 px-2.5 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/10"
                        >
                            &quot;{searchQuery}&quot;
                            <X className="h-3 w-3 opacity-70" />
                        </Button>
                    )}

                    {priceRange !== null && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPriceRange(null)}
                            className="h-6 text-xs rounded-full gap-1.5 px-2.5 bg-muted text-foreground hover:bg-muted/80 border border-border/50"
                        >
                            Price: {formatPriceShort(effectivePriceRange[0])} - {formatPriceShort(effectivePriceRange[1])}
                            <X className="h-3 w-3 opacity-70" />
                        </Button>
                    )}

                    {bhkFilter !== "ALL" && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setBhkFilter("ALL")}
                            className="h-6 text-xs rounded-full gap-1.5 px-2.5 bg-muted text-foreground hover:bg-muted/80 border border-border/50"
                        >
                            {bhkFilter === "5+" ? "5+ BHK" : `${bhkFilter} BHK`}
                            <X className="h-3 w-3 opacity-70" />
                        </Button>
                    )}

                    {userData?.userType === "company" && sourceFilter !== "ALL" && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSourceFilter("ALL")}
                            className="h-6 text-xs rounded-full gap-1.5 px-2.5 bg-muted text-foreground hover:bg-muted/80 border border-border/50"
                        >
                            {sourceFilter === "BROKER" ? "Broker Listed" : "Company Listed"}
                            <X className="h-3 w-3 opacity-70" />
                        </Button>
                    )}

                    <Button
                        variant="link"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 text-xs px-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
};
