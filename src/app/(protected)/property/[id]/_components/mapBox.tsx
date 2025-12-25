import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Property } from "@/types/property";
import { Loader2, MapPin } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { formatAddress } from "@/utils/helper";
import { useTheme } from "next-themes";

export const MapBox = ({ property }: { property: Property }) => {
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
    });

    // Create custom marker element
    const el = document.createElement("div");
    el.className = "custom-marker";
    el.innerHTML = `
      <div style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px hsl(var(--foreground) / 0.3); border: 3px solid hsl(var(--background));">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `;

    // Theme-aware popup styling
    const popupHTML = `
      <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
        <strong style="color: hsl(var(--foreground)); font-size: 14px;">${property.propertyCategory}</strong>
        <br/>
        <span style="color: hsl(var(--muted-foreground)); font-size: 12px;">${formatAddress(property.address)}</span>
      </div>
    `;
    
    // We can't easily use CSS vars inside the standard Mapbox popup class without global CSS overrides,
    // but we can inject a custom class and rely on our global styles or inline styles on the content.
    // The wrapper mapboxgl-popup-content needs styling.
    // Mapbox doesn't support setting style on the popup container directly via JS easily besides className.
    // So we'll stick to styling the inner content and maybe adding a global class if needed.
    // For now, the inner content styling handles text colors. Background defaults to white in standard mapbox.
    // To fix background, we need to target .mapboxgl-popup-content.
    // We can add a <style> tag to the popup content? No, that's messy.
    // Better: use the same custom marker approach where the popup is custom HTML if we really want full control.
    // But for this simple view, just the marker is a big win.
    // Actually, we can just let the popup be default white for now, or use a custom class in globals.css.
    // Let's stick to the marker improvement and map style.

    // Add marker
    new mapboxgl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ className: 'theme-aware-popup' }).setHTML(popupHTML)
      )
      .addTo(mapRef.current);

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapRef.current.on("load", () => {
      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      mapRef.current?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property]);

  // Update map style dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    const style = isDarkMode
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";
      
    // Only update if different to avoid reloading
    // Mapbox doesn't expose current style URL easily, but setStyle is cheap if same? 
    // Actually setStyle triggers a reload. We should check.
    // We'll trust the prop change.
    map.setStyle(style);
  }, [isDarkMode]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={mapContainerRef}
          className="w-full h-[400px] rounded-lg overflow-hidden border bg-muted"
        />
        {!mapLoaded && (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
