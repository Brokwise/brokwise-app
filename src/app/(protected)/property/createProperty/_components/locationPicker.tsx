"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, MapPin, Search } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useAxios from "@/hooks/useAxios";

interface LocationPickerProps {
  value: [number, number];
  onChange: (coordinates: [number, number]) => void;
  onLocationSelect?: (details: {
    coordinates: [number, number];
    placeName: string;
    pincode?: string;
    context?: { id: string; text: string }[];
  }) => void;
  className?: string;
  inputValue?: string;
}

interface SearchResult {
  id: string;
  place_name: string;
  center?: [number, number];
  context?: { id: string; text: string }[];
}

export const LocationPicker = ({
  value,
  onChange,
  onLocationSelect,
  className,
  inputValue,
}: LocationPickerProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const api = useAxios()
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

  useEffect(() => {
    const searchLocation = async () => {
      if (!searchQuery || searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get(
          `/utils/places?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.data
        setSearchResults(data.features || []);
      } catch (error) {
        console.error("Error searching location:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchLocation, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, api]);

  const extractPincode = React.useCallback(
    (
      context?: { id: string; text: string }[],
      placeName?: string
    ): string | undefined => {
      if (context) {
        for (const item of context) {
          if (item.id.startsWith("postcode")) {
            const numericPincode = item.text.replace(/\D/g, "");
            if (numericPincode.length === 6) {
              return numericPincode;
            }
            if (numericPincode.length > 0) {
              return numericPincode.slice(0, 6);
            }
          }
        }
      }

      if (placeName) {
        const pincodeMatch = placeName.match(/\b(\d{6})\b/);
        if (pincodeMatch) {
          return pincodeMatch[1];
        }
      }

      return undefined;
    },
    []
  );

  const reverseGeocode = React.useCallback(
    async (lng: number, lat: number) => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1&types=address,postcode,place,locality`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const pincode = extractPincode(feature.context, feature.place_name);
          return {
            place_name: feature.place_name,
            context: feature.context,
            pincode,
          };
        }
      } catch (error) {
        console.error("Error reverse geocoding:", error);
      }
      return null;
    },
    [token, extractPincode]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const [lng, lat] =
      value[0] === 0 && value[1] === 0 ? [75.7873, 26.9124] : value;

    const initialStyle = isDarkMode
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [lng, lat],
      zoom: value[0] === 0 && value[1] === 0 ? 11 : 14,
    });

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add geolocate control
    mapRef.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right"
    );

    // Create custom marker element
    const el = document.createElement("div");
    el.className = "custom-marker cursor-move"; // cursor-move to indicate draggable
    el.innerHTML = `
      <div style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px hsl(var(--foreground) / 0.4); border: 3px solid hsl(var(--background)); transition: transform 0.2s;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `;

    // Add draggable marker
    markerRef.current = new mapboxgl.Marker({
      element: el,
      draggable: true,
    })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    // Add hover effect via JS since it's a DOM element
    el.addEventListener("mouseenter", () => {
      el.style.transform = "scale(1.1)";
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "scale(1)";
    });

    // Handle marker drag
    markerRef.current.on("dragend", () => {
      const newLngLat = markerRef.current?.getLngLat();
      if (newLngLat) {
        onChange([newLngLat.lng, newLngLat.lat]);
      }
    });

    // Handle map click
    mapRef.current.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current?.setLngLat([lng, lat]);
      onChange([lng, lat]);

      // Fly to location
      mapRef.current?.flyTo({
        center: [lng, lat],
        essential: true,
        zoom: 14,
      });

      if (onLocationSelect) {
        const result = await reverseGeocode(lng, lat);
        if (result) {
          onLocationSelect({
            coordinates: [lng, lat],
            placeName: result.place_name,
            pincode: result.pincode,
            context: result.context,
          });
        }
      }
    });

    mapRef.current.on("load", () => {
      setMapLoaded(true);
      mapRef.current?.resize();
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };

  }, [token, onChange, onLocationSelect, reverseGeocode, isDarkMode, value]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const style = isDarkMode
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";
    map.setStyle(style);
  }, [isDarkMode]);

  const handleSelectLocation = async (result: SearchResult) => {
    let lng: number;
    let lat: number;
    let fetchedPincode: string | undefined;

    if (result.center) {
      [lng, lat] = result.center;
    } else {
      try {
        const response = await api(`/utils/places?placeId=${result.id}`);
        const data = await response.data;
        if (data.center) {
          [lng, lat] = data.center;
          fetchedPincode = data.pincode;
        } else {
          console.error("Could not get coordinates for place");
          return;
        }
      } catch (e) {
        console.error("Error fetching place details:", e);
        return;
      }
    }

    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 14,
      essential: true,
    });

    // Update marker
    markerRef.current?.setLngLat([lng, lat]);

    // Update form
    onChange([lng, lat]);

    if (onLocationSelect) {
      const pincode =
        fetchedPincode || extractPincode(result.context, result.place_name);
      onLocationSelect({
        coordinates: [lng, lat],
        placeName: result.place_name,
        pincode,
        context: result.context,
      });
    }

    setOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {searchQuery ? searchQuery : (inputValue || "Search for a location...")}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search address..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isSearching && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <Loader2 className="mx-auto h-4 w-4 animate-spin mb-2" />
                    Searching...
                  </div>
                )}
                {!isSearching &&
                  searchResults.length === 0 &&
                  searchQuery.length > 2 && (
                    <CommandEmpty>No results found.</CommandEmpty>
                  )}
                <CommandGroup>
                  {searchResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.place_name}
                      onSelect={() => handleSelectLocation(result)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {result.place_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative border rounded-lg overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-[400px] bg-muted" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground flex gap-4">
        <div>Latitude: {value[1].toFixed(6)}</div>
        <div>Longitude: {value[0].toFixed(6)}</div>
      </div>
    </div>
  );
};
