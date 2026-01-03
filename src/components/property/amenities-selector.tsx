"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export interface AmenityOption {
  label: string;
  icon?: LucideIcon;
}

interface AmenitiesSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: AmenityOption[];
  label?: string;
  placeholder?: string;
  description?: string;
  errorMessage?: string;
}

export function AmenitiesSelector({
  value = [],
  onChange,
  options,
  label = "Amenities",
  placeholder = "Search amenities...",
  description = "Select from the list or add your own amenities.",
  errorMessage,
}: AmenitiesSelectorProps) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [customAmenity, setCustomAmenity] = useState("");

  const filteredOptions = options.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const displayedOptions =
    showAll || search.length > 0
      ? filteredOptions
      : filteredOptions.slice(0, 6);

  const toggleAmenity = (amenity: string) => {
    if (value.includes(amenity)) {
      onChange(value.filter((a) => a !== amenity));
    } else {
      onChange([...value, amenity]);
    }
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed) return;

    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setCustomAmenity("");
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-4">
          {options.length > 0 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayedOptions.map((item) => {
                  const isSelected = value.includes(item.label);
                  return (
                    <Button
                      key={item.label}
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-start h-auto py-3 px-4 w-full border-muted hover:border-primary/50 transition-all group",
                        isSelected
                          ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"
                          : "bg-background text-foreground hover:bg-accent/50"
                      )}
                      onClick={() => toggleAmenity(item.label)}
                    >
                      {item.icon && (
                        <div
                          className={cn(
                            "p-2 rounded-full mr-3 transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </div>
                      )}
                      <span className="font-normal text-base">
                        {item.label}
                      </span>
                      {isSelected && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                      )}
                    </Button>
                  );
                })}
              </div>

              {!search && filteredOptions.length > 6 && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAll(!showAll)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showAll ? (
                      <>
                        Show Less <ChevronUp className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Show More <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {filteredOptions.length === 0 && search && (
                <div className="text-center py-8 text-muted-foreground">
                  No amenities found matching &quot;{search}&quot;
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Add custom amenity..."
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomAmenity();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddCustomAmenity}
              variant="secondary"
            >
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {value
              .filter(
                (amenity) => !options.some((opt) => opt.label === amenity)
              )
              .map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                >
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage>{errorMessage}</FormMessage>
    </FormItem>
  );
}
