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
      el.className = "custom-marker";
      el.innerHTML = `
        <div style="background-color: white; color: #0f172a; padding: 6px 10px; border-radius: 999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); font-weight: 700; font-size: 13px; white-space: nowrap; text-align: center;">
          ${priceFormatted}
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid white; margin: -2px auto 0 auto; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));"></div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: "custom-popup",
        maxWidth: "300px",
      }).setHTML(
        `<div style="width: 260px; overflow: hidden; border-radius: 12px; background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); font-family: inherit;">
           <div style="height: 150px; width: 100%; background-color: #f3f4f6; position: relative;">
             <img src="${property.featuredMedia}" alt="Property" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/images/placeholder.webp'" />
           </div>
           <div style="padding: 16px;">
              <h3 style="font-weight: 800; font-size: 12px; margin: 0 0 8px 0; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">${property.propertyCategory}</h3>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <span style="font-weight: 700; font-size: 18px; color: #0f172a;">${priceFormatted}</span>
                <span style="font-size: 13px; color: #64748b;">Rate: ₹${property.rate}</span>
              </div>
              <button id="view-details-${property._id}" style="display: block; width: 100%; text-align: center; background-color: #0f172a; color: white; padding: 10px; border-radius: 8px; font-size: 14px; text-decoration: none; font-weight: 500; transition: opacity 0.2s; border: none; cursor: pointer;">
                View Details
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
      popup.on("open", () => {
        const button = document.getElementById(`view-details-${property._id}`);
        if (button) {
          button.onclick = (e) => {
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
  }, [properties, onSelectProperty, mapLoaded]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden border bg-muted group">
      <div ref={mapContainerRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="secondary"
          size="sm"
          className="shadow-md bg-white hover:bg-gray-100 text-black"
          onClick={toggleStyle}
        >
          <Layers className="h-4 w-4 mr-2" />
          {mapStyle === "streets-v12" ? "Satellite" : "Map"}
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
