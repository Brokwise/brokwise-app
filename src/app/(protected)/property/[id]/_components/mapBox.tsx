"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Property } from "@/types/property";
import { Loader2, MapPin } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { formatAddress } from "@/utils/helper";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface MapBoxProps {
  property: Property;
  variant?: "default" | "minimal";
  className?: string;
  height?: string;
}

export const MapBox = ({
  property,
  variant = "default",
  className,
  height = "400px"
}: MapBoxProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Initialize Mapbox
  useEffect(() => {
    if (!property?.location?.coordinates || !mapContainerRef.current) return;

    // Set your Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    const [lng, lat] = property.location.coordinates;
    const initialStyle = isDarkMode
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";

    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [lng, lat],
      zoom: 14,
      attributionControl: false, // Minimal look
      interactive: variant === "default", // Disable interaction on minimal (sidebar) if desired, but user might want to pan
    });

    // Add interactions back if variant is minimal but we want it
    if (variant === "minimal") {
      mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    } else {
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }


    // Create custom marker element
    const el = document.createElement("div");
    el.className = "custom-marker";
    el.innerHTML = `
      <div style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px hsl(var(--foreground) / 0.3); border: 3px solid hsl(var(--background));">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `;

    const popupHTML = `
      <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
        <strong style="color: hsl(var(--foreground)); font-size: 14px;">${property.propertyCategory}</strong>
        <br/>
        <span style="color: hsl(var(--muted-foreground)); font-size: 12px;">${formatAddress(property.address)}</span>
      </div>
    `;

    // Add marker with theme-aware popup (styled via globals.css)
    new mapboxgl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ className: 'theme-aware-popup' }).setHTML(popupHTML)
      )
      .addTo(mapRef.current);

    mapRef.current.on("load", () => {
      setMapLoaded(true);
      mapRef.current?.resize();
    });

    // Cleanup
    return () => {
      mapRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property]);

  // Update map style when theme changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const style = isDarkMode
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";
    map.setStyle(style);
  }, [isDarkMode]);

  const MapContent = (
    <div
      className={cn("relative w-full rounded-lg overflow-hidden border bg-muted", className)}
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  )

  if (variant === "minimal") {
    return MapContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        {MapContent}
      </CardContent>
    </Card>
  );
};
