"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, MapPin, Search, X, Navigation } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
  onLocationClear?: () => void;
  className?: string;
  inputValue?: string;
  hasError?: boolean;
}

interface SearchResult {
  id: string;
  place_name: string;
  center?: [number, number];
  context?: { id: string; text: string }[];
}

const normalizeAddressSeparators = (placeName: string): string =>
  placeName
    .replace(/[،﹐﹑，]/g, ",")
    .replace(/[·•]/g, ",")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

function hasContextField(
  context: { id: string; text: string }[] | undefined,
  prefix: string
): boolean {
  return !!context?.some((item) => item.id.startsWith(prefix));
}

function mergeContext(
  primary: { id: string; text: string }[] | undefined,
  fallback: { id: string; text: string }[] | undefined
): { id: string; text: string }[] {
  if (!primary && !fallback) return [];
  if (!primary) return fallback || [];
  if (!fallback) return primary;

  const merged = [...primary];
  const existingPrefixes = new Set(
    primary.map((item) => item.id.split(".")[0])
  );

  for (const item of fallback) {
    const prefix = item.id.split(".")[0];
    if (!existingPrefixes.has(prefix)) {
      merged.push(item);
    }
  }

  return merged;
}

export const LocationPicker = ({
  value,
  onChange,
  onLocationSelect,
  onLocationClear,
  className,
  inputValue,
  hasError,
}: LocationPickerProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const [showCoordInput, setShowCoordInput] = useState(false);
  const [coordLat, setCoordLat] = useState("");
  const [coordLng, setCoordLng] = useState("");
  const [isResolvingCoords, setIsResolvingCoords] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const api = useAxios();
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

  const hasLocation = value[0] !== 0 || value[1] !== 0;

  useEffect(() => {
    if (inputValue && !selectedPlaceName) {
      setSelectedPlaceName(inputValue);
    }
  }, [inputValue, selectedPlaceName]);

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
        const data = await response.data;
        const normalizedResults = (data.features || []).map(
          (result: SearchResult) => ({
            ...result,
            place_name: normalizeAddressSeparators(result.place_name),
          })
        );
        setSearchResults(normalizedResults);
      } catch (error) {
        console.error("Error searching location:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchLocation, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, api]);

  const extractPincode = useCallback(
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

  const reverseGeocode = useCallback(
    async (lng: number, lat: number) => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1&types=address,postcode,place,locality,region`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const pincode = extractPincode(feature.context, feature.place_name);
          return {
            place_name: normalizeAddressSeparators(feature.place_name),
            context: feature.context as { id: string; text: string }[],
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
    if (!hasLocation || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const [lng, lat] = value;

    const initialStyle = isDarkMode
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [lng, lat],
      zoom: 14,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

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

    const el = document.createElement("div");
    el.className = "custom-marker cursor-move";
    el.innerHTML = `
      <div style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px hsl(var(--foreground) / 0.4); border: 3px solid hsl(var(--background)); transition: transform 0.2s;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `;

    markerRef.current = new mapboxgl.Marker({
      element: el,
      draggable: true,
    })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    el.addEventListener("mouseenter", () => {
      el.style.transform = "scale(1.1)";
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "scale(1)";
    });

    markerRef.current.on("dragend", async () => {
      const newLngLat = markerRef.current?.getLngLat();
      if (newLngLat) {
        onChange([newLngLat.lng, newLngLat.lat]);

        if (onLocationSelect) {
          const result = await reverseGeocode(newLngLat.lng, newLngLat.lat);
          if (result) {
            setSelectedPlaceName(result.place_name);
            onLocationSelect({
              coordinates: [newLngLat.lng, newLngLat.lat],
              placeName: result.place_name,
              pincode: result.pincode,
              context: result.context,
            });
          }
        }
      }
    });

    mapRef.current.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current?.setLngLat([lng, lat]);
      onChange([lng, lat]);

      mapRef.current?.flyTo({
        center: [lng, lat],
        essential: true,
        zoom: 14,
      });

      if (onLocationSelect) {
        const result = await reverseGeocode(lng, lat);
        if (result) {
          setSelectedPlaceName(result.place_name);
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
      setMapLoaded(false);
    };
  }, [hasLocation, token, onChange, onLocationSelect, reverseGeocode, isDarkMode, value]);

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

    onChange([lng, lat]);
    setSelectedPlaceName(normalizeAddressSeparators(result.place_name));

    if (onLocationSelect) {
      let finalContext = result.context;
      let finalPincode =
        fetchedPincode || extractPincode(result.context, result.place_name);
      let finalPlaceName = normalizeAddressSeparators(result.place_name);

      const needsRegion = !hasContextField(result.context, "region");
      const needsPlace = !hasContextField(result.context, "place");

      if (needsRegion || needsPlace || !finalPincode) {
        const reverseResult = await reverseGeocode(lng, lat);
        if (reverseResult) {
          finalContext = mergeContext(result.context, reverseResult.context);
          if (!finalPincode && reverseResult.pincode) {
            finalPincode = reverseResult.pincode;
          }
          if (!finalPlaceName || finalPlaceName.split(",").length < 2) {
            finalPlaceName = reverseResult.place_name;
            setSelectedPlaceName(reverseResult.place_name);
          }
        }
      }

      onLocationSelect({
        coordinates: [lng, lat],
        placeName: finalPlaceName,
        pincode: finalPincode,
        context: finalContext,
      });
    }

    setOpen(false);
    setSearchQuery("");

    requestAnimationFrame(() => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 14,
          essential: true,
        });
        markerRef.current?.setLngLat([lng, lat]);
      }
    });
  };

  const handleClearLocation = () => {
    setSelectedPlaceName("");
    setShowCoordInput(false);
    setCoordLat("");
    setCoordLng("");
    onChange([0, 0]);
    onLocationClear?.();

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
      setMapLoaded(false);
    }
  };

  const handleCoordinateSubmit = async () => {
    const lat = parseFloat(coordLat);
    const lng = parseFloat(coordLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return;
    }

    setIsResolvingCoords(true);
    onChange([lng, lat]);

    if (onLocationSelect) {
      const result = await reverseGeocode(lng, lat);
      if (result) {
        setSelectedPlaceName(result.place_name);
        onLocationSelect({
          coordinates: [lng, lat],
          placeName: result.place_name,
          pincode: result.pincode,
          context: result.context,
        });
      } else {
        setSelectedPlaceName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        onLocationSelect({
          coordinates: [lng, lat],
          placeName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      }
    }

    setShowCoordInput(false);
    setCoordLat("");
    setCoordLng("");
    setIsResolvingCoords(false);
  };

  const isValidCoords =
    coordLat !== "" &&
    coordLng !== "" &&
    !isNaN(parseFloat(coordLat)) &&
    !isNaN(parseFloat(coordLng)) &&
    parseFloat(coordLat) >= -90 &&
    parseFloat(coordLat) <= 90 &&
    parseFloat(coordLng) >= -180 &&
    parseFloat(coordLng) <= 180;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        {hasLocation && selectedPlaceName ? (
          <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm flex-1 truncate">{selectedPlaceName}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleClearLocation}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : showCoordInput ? (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enter Coordinates</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowCoordInput(false)}
              >
                Back to search
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g. 26.9124"
                  value={coordLat}
                  onChange={(e) => setCoordLat(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValidCoords) {
                      e.preventDefault();
                      handleCoordinateSubmit();
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g. 75.7873"
                  value={coordLng}
                  onChange={(e) => setCoordLng(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValidCoords) {
                      e.preventDefault();
                      handleCoordinateSubmit();
                    }
                  }}
                />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="w-full"
              disabled={!isValidCoords || isResolvingCoords}
              onClick={handleCoordinateSubmit}
            >
              {isResolvingCoords ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Locating...
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-3.5 w-3.5" />
                  Go to Location
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  data-field="location.coordinates"
                  className={cn(
                    "w-full justify-between",
                    hasError && "border-destructive ring-1 ring-destructive text-destructive"
                  )}
                >
                  {inputValue || "Search for a location..."}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              onClick={() => setShowCoordInput(true)}
            >
              Have coordinates? Enter manually
            </button>
          </div>
        )}
      </div>

      {hasLocation && (
        <>
          <div className="relative border rounded-lg overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-[400px] bg-muted" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            You can click on the map or drag the pin to adjust the location.
          </p>
        </>
      )}
    </div>
  );
};
