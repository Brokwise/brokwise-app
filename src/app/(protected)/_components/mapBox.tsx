import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Property } from "@/types/property";
import { Loader2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapBoxProps {
  properties: Property[];
  onSelectProperty?: (propertyId: string) => void;
}

const formatPrice = (price: number) => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  } else {
    return `₹${price.toLocaleString()}`;
  }
};

export const MapBox = ({ properties, onSelectProperty }: MapBoxProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const appliedStyleRef = useRef<string>("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<
    "streets-v12" | "satellite-streets-v12"
  >("streets-v12");

  const toggleStyle = () => {
    setMapStyle((prev) =>
      prev === "streets-v12" ? "satellite-streets-v12" : "streets-v12"
    );
  };

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    let initObserver: ResizeObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const initMap = () => {
      if (mapRef.current) return;
      setMapLoaded(false);

      // Default center (New Delhi)
      const defaultCenter: [number, number] = [77.209, 28.6139];

      const map = new mapboxgl.Map({
        container,
        // Start with a default style; subsequent changes are handled by the style effect below.
        style: `mapbox://styles/mapbox/streets-v12`,
        center: defaultCenter,
        zoom: 4,
      });
      mapRef.current = map;
      appliedStyleRef.current = `mapbox://styles/mapbox/streets-v12`;

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Keep Mapbox in sync with any container resizing (sidebar collapse, split view, mobile overlay, etc.).
      resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(container);

      map.on("load", () => {
        // Ensure correct first render sizing when the map becomes visible.
        map.resize();
        setMapLoaded(true);
      });
    };

    const { width, height } = container.getBoundingClientRect();
    if (width > 0 && height > 0) {
      initMap();
    } else {
      // Delay init until the container is visible/sized (e.g. switching to map/split view).
      initObserver = new ResizeObserver(() => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          initObserver?.disconnect();
          initObserver = null;
          initMap();
        }
      });
      initObserver.observe(container);
    }

    return () => {
      initObserver?.disconnect();
      resizeObserver?.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      appliedStyleRef.current = "";
    };
  }, []);

  // Apply map style without reinitializing the map (prevents flicker + loader loop).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextStyle = `mapbox://styles/mapbox/${mapStyle}`;
    if (appliedStyleRef.current === nextStyle) return;

    appliedStyleRef.current = nextStyle;
    map.setStyle(nextStyle);
  }, [mapStyle]);

  // Update markers when properties change (without recreating the map).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Filter properties with valid coordinates
    const validProperties = properties.filter(
      (p) =>
        p.location?.coordinates &&
        Array.isArray(p.location.coordinates) &&
        p.location.coordinates.length === 2 &&
        typeof p.location.coordinates[0] === "number" &&
        typeof p.location.coordinates[1] === "number"
    );

    if (validProperties.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    validProperties.forEach((property) => {
      const [lng, lat] = property.location.coordinates;
      const priceFormatted = formatPrice(property.totalPrice);

      // Create custom marker element
      const el = document.createElement("div");
      el.className = "custom-marker group cursor-pointer z-20";
      el.innerHTML = `
        <div class="transition-transform duration-200 group-hover:scale-110">
          <div style="background-color: #0f172a; color: white; padding: 6px 10px; border-radius: 99px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3); font-weight: 600; font-size: 13px; white-space: nowrap; display: flex; align-items: center; justify-content: center; border: 2px solid white;">
            ${priceFormatted}
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #0f172a; margin: -2px auto 0 auto; filter: drop-shadow(0 2px 1px rgba(0,0,0,0.1));"></div>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: "custom-popup",
        maxWidth: "300px",
      }).setHTML(
        `<div style="width: 260px; overflow: hidden; border-radius: 12px; background: white; box-shadow: 0 10px 40px rgba(0,0,0,0.12); border: 1px solid #f1f5f9; font-family: system-ui, -apple-system, sans-serif; cursor: pointer;">
           <div style="height: 140px; width: 100%; overflow: hidden; background-color: #f1f5f9; position: relative;">
             <img src="${property.featuredMedia}" alt="Property" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onerror="this.src='/images/placeholder.webp'" />
             <div style="position: absolute; top: 10px; left: 10px; padding: 3px 8px; background: rgba(255,255,255,0.95); backdrop-filter: blur(4px); border-radius: 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; border: 1px solid #f1f5f9;">
                ${property.propertyCategory}
             </div>
           </div>
           <div style="padding: 14px 16px;">
              <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 20px; color: #0f172a; font-weight: 600; letter-spacing: -0.3px;">${priceFormatted}</span>
                <span style="font-size: 11px; color: #64748b; font-weight: 500;">₹${property.rate}/sqft</span>
              </div>
              <p style="font-size: 12px; color: #64748b; margin: 0 0 12px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${property.address?.address || property.society || "Address available on request"}</p>
              
              <button id="view-details-${property._id}" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px; border-radius: 8px; background: #0f172a; color: white; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: none; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='#0f172a'">
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
           </div>
         </div>`
      );

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);

      // Add click event listener to the button inside popup
      // Note: We attach to the button ID, but the whole card interaction is handled via this button for now.
      // We could also attach to the card itself if we gave it an ID.
      popup.on("open", () => {
        const button = document.getElementById(`view-details-${property._id}`);
        if (button) {
          button.onclick = (e) => {
            e.preventDefault();
            onSelectProperty?.(property._id);
          };
        }
        // Also attach to the image wrapper for better UX
        const card = button?.closest('.group');
        if (card) {
             (card as HTMLElement).onclick = (e) => {
                // Prevent double firing if button clicked
                if ((e.target as HTMLElement).closest('button')) return;
                e.preventDefault();
                onSelectProperty?.(property._id);
            };
        }
      });

      bounds.extend([lng, lat]);
    });

    const fitToMarkers = () => {
      if (validProperties.length === 1) {
        const [lng, lat] = validProperties[0].location.coordinates;
        map.easeTo({ center: [lng, lat], zoom: 12 });
      } else {
        map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }
    };

    if (map.isStyleLoaded()) {
      fitToMarkers();
    } else {
      map.once("style.load", fitToMarkers);
    }

    // Cleanup: remove the style.load listener if effect re-runs or component unmounts
    return () => {
      map.off("style.load", fitToMarkers);
    };
  }, [properties, onSelectProperty, mapLoaded]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden border bg-muted group">
      <div ref={mapContainerRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          className="shadow-lg bg-background/80 backdrop-blur-md border-border/50 hover:bg-background/90 text-foreground transition-all"
          onClick={toggleStyle}
        >
          <Layers className="h-4 w-4 mr-2" />
          <span className="font-medium">{mapStyle === "streets-v12" ? "Satellite" : "Map"}</span>
        </Button>
      </div>

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
