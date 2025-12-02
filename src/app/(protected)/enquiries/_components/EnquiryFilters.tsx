"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface FilterState {
  search: string;
  category: string;
  type: string;
  city: string;
  minBudget: string;
  maxBudget: string;
  bhk: string;
}

interface EnquiryFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
  cities?: string[]; // Optional list of cities available in data
}

export const EnquiryFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  cities = ["pune", "mumbai", "bangalore", "delhi"],
}: EnquiryFiltersProps) => {
  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.city ||
    filters.type ||
    filters.minBudget ||
    filters.maxBudget ||
    filters.bhk;

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, Locality, or Description..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Select
            value={filters.category}
            onValueChange={(val) => onFilterChange("category", val)}
          >
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="RESIDENTIAL">Residential</SelectItem>
              <SelectItem value="COMMERCIAL">Commercial</SelectItem>
              <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
              <SelectItem value="LAND">Land</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.city}
            onValueChange={(val) => onFilterChange("city", val)}
          >
            <SelectTrigger className="w-[130px] bg-background">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  <span className="capitalize">{city}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced Filters Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-background">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {(filters.minBudget || filters.maxBudget || filters.bhk) && (
                  <span className="flex h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Budget Range</h4>
                  <p className="text-sm text-muted-foreground">
                    Set your budget range
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minBudget}
                      onChange={(e) =>
                        onFilterChange("minBudget", e.target.value)
                      }
                      className="h-8"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxBudget}
                      onChange={(e) =>
                        onFilterChange("maxBudget", e.target.value)
                      }
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">BHK</h4>
                  <div className="flex flex-wrap gap-2">
                    {["1", "2", "3", "4", "4+"].map((bhk) => (
                      <Button
                        key={bhk}
                        variant={filters.bhk === bhk ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          onFilterChange("bhk", filters.bhk === bhk ? "" : bhk)
                        }
                      >
                        {bhk}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground shrink-0"
              title="Clear Filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
