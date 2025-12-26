import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Property } from "@/types/property";
import { Loader2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface MapBoxProps {
  properties: Property[];
  onSelectProperty?: (propertyId: string) => void;
  highlightedPropertyId?: string | null;
  highlightRequestId?: number;
  onHighlightComplete?: () => void;
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

// Map style options based on theme
type MapStyleType = "streets" | "satellite";

const getMapStyleUrl = (styleType: MapStyleType, isDark: boolean): string => {
  if (styleType === "satellite") {
    return "mapbox://styles/mapbox/satellite-streets-v12";
  }
  // Use dark style for dark mode
  return isDark 
    ? "mapbox://styles/mapbox/dark-v11" 
    : "mapbox://styles/mapbox/streets-v12";
};

// CSS for marker jump animation - injected once
const MARKER_ANIMATION_STYLES = `
@keyframes markerJump {
  0% { transform: scale(1) translateY(0); }
  20% { transform: scale(1.3) translateY(-15px); }
  40% { transform: scale(1.25) translateY(-8px); }
  60% { transform: scale(1.28) translateY(-12px); }
  80% { transform: scale(1.25) translateY(-5px); }
  100% { transform: scale(1.25) translateY(0); }
}

.marker-highlighted {
  animation: markerJump 0.6s ease-out forwards;
}
`;

export const MapBox = ({
  properties,
  onSelectProperty,
  highlightedPropertyId,
  highlightRequestId,
  onHighlightComplete,
}: MapBoxProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  // Map property IDs to their marker elements for targeted updates
  const markerElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousHighlightedIdRef = useRef<string | null>(null);
  const appliedStyleRef = useRef<string>("");
  const [mapLoaded, setMapLoaded] = useState(false);
  // Incremented each time markers are recreated so highlight effect can sync
  const [markersVersion, setMarkersVersion] = useState(0);
  const [mapStyleType, setMapStyleType] = useState<MapStyleType>("streets");
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Inject marker animation styles once
  useEffect(() => {
    const styleId = "mapbox-marker-animation-styles";
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.textContent = MARKER_ANIMATION_STYLES;
      document.head.appendChild(styleSheet);
    }
  }, []);

  const toggleStyle = () => {
    setMapStyleType((prev) =>
      prev === "streets" ? "satellite" : "streets"
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
      const initialStyle = getMapStyleUrl(mapStyleType, isDarkMode);

      const map = new mapboxgl.Map({
        container,
        // Start with theme-aware style
        style: initialStyle,
        center: defaultCenter,
        zoom: 4,
      });
      mapRef.current = map;
      appliedStyleRef.current = initialStyle;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply map style without reinitializing the map (prevents flicker + loader loop).
  // This effect now responds to both style type changes and theme changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextStyle = getMapStyleUrl(mapStyleType, isDarkMode);
    if (appliedStyleRef.current === nextStyle) return;

    appliedStyleRef.current = nextStyle;
    map.setStyle(nextStyle);
  }, [mapStyleType, isDarkMode]);

  // Update markers when properties change (without recreating the map).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear old markers and element references
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    markerElementsRef.current.clear();

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

      const el = document.createElement("div");
      el.className = "custom-marker group cursor-pointer z-20";
      el.setAttribute("data-property-id", property._id);
      el.innerHTML = `
        <div class="marker-inner transition-all duration-300 group-hover:scale-110" style="transform-origin: bottom center;">
          <div class="marker-bubble" style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); padding: 6px 10px; border-radius: 99px; box-shadow: 0 4px 12px hsl(var(--foreground) / 0.2); font-weight: 600; font-size: 13px; white-space: nowrap; display: flex; align-items: center; justify-content: center; border: 2px solid hsl(var(--background)); transition: all 0.3s ease;">
            ${priceFormatted}
          </div>
          <div class="marker-arrow" style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid hsl(var(--primary)); margin: -2px auto 0 auto; filter: drop-shadow(0 2px 1px rgba(0,0,0,0.1)); transition: border-top-color 0.3s ease;"></div>
        </div>
      `;

      // Store element reference for highlighting
      markerElementsRef.current.set(property._id, el);

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: "custom-popup",
        maxWidth: "300px",
      }).setHTML(
        `<div style="width: 260px; overflow: hidden; border-radius: 12px; background: hsl(var(--card)); box-shadow: 0 10px 40px hsl(var(--foreground) / 0.15); border: 1px solid hsl(var(--border)); font-family: system-ui, -apple-system, sans-serif; cursor: pointer;">
           <div style="height: 140px; width: 100%; overflow: hidden; background-color: hsl(var(--muted)); position: relative;">
             <img src="${property.featuredMedia}" alt="Property" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onerror="this.src='/images/placeholder.webp'" />
             <div style="position: absolute; top: 10px; left: 10px; padding: 3px 8px; background: hsl(var(--background) / 0.9); backdrop-filter: blur(4px); border-radius: 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: hsl(var(--foreground)); border: 1px solid hsl(var(--border));">
                ${property.propertyCategory}
             </div>
           </div>
           <div style="padding: 14px 16px;">
              <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 20px; color: hsl(var(--card-foreground)); font-weight: 600; letter-spacing: -0.3px;">${priceFormatted}</span>
                <span style="font-size: 11px; color: hsl(var(--muted-foreground)); font-weight: 500;">₹${property.rate}/sqft</span>
              </div>
              <p style="font-size: 12px; color: hsl(var(--muted-foreground)); margin: 0 0 12px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${property.address?.address || property.society || "Address available on request"}</p>
              
              <button id="view-details-${property._id}" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px; border-radius: 8px; background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: none; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
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

    // Signal that markers are now ready for highlighting
    setMarkersVersion((v) => v + 1);

    // Cleanup: remove the style.load listener if effect re-runs or component unmounts
    return () => {
      map.off("style.load", fitToMarkers);
    };
  }, [properties, onSelectProperty, mapLoaded]);

  // Handle marker highlighting with jump animation
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Helper function to reset a marker to its default state
    const resetMarker = (propertyId: string) => {
      const el = markerElementsRef.current.get(propertyId);
      if (!el) return;

      const markerInner = el.querySelector(".marker-inner") as HTMLElement;
      const markerBubble = el.querySelector(".marker-bubble") as HTMLElement;
      const markerArrow = el.querySelector(".marker-arrow") as HTMLElement;

      if (markerInner) {
        markerInner.style.transform = "";
        markerInner.style.animation = "";
        markerInner.classList.remove("marker-highlighted");
      }
      if (markerBubble) {
        markerBubble.style.backgroundColor = "hsl(var(--primary))";
        markerBubble.style.boxShadow = "0 4px 12px hsl(var(--foreground) / 0.2)";
        markerBubble.style.border = "2px solid hsl(var(--background))";
      }
      if (markerArrow) {
        markerArrow.style.borderTopColor = "hsl(var(--primary))";
      }
      el.style.zIndex = "20";
    };

    // Helper function to highlight a marker with jump animation
    const highlightMarker = (propertyId: string) => {
      const el = markerElementsRef.current.get(propertyId);
      if (!el) return;

      const markerInner = el.querySelector(".marker-inner") as HTMLElement;
      const markerBubble = el.querySelector(".marker-bubble") as HTMLElement;
      const markerArrow = el.querySelector(".marker-arrow") as HTMLElement;

      // Bring marker to front
      el.style.zIndex = "100";

      if (markerInner) {
        // Restart the jump animation deterministically (even if the same marker is highlighted again).
        markerInner.classList.remove("marker-highlighted");
        // Force a reflow so the animation can be re-triggered.
        void markerInner.offsetHeight;
        markerInner.classList.add("marker-highlighted");
        markerInner.style.transform = "scale(1.25)";
      }
      if (markerBubble) {
        // Change to accent color (highlighted state)
        markerBubble.style.backgroundColor = "hsl(var(--accent))";
        markerBubble.style.boxShadow = "0 6px 20px hsl(var(--accent) / 0.4)";
        markerBubble.style.border = "3px solid hsl(var(--background))";
      }
      if (markerArrow) {
        markerArrow.style.borderTopColor = "hsl(var(--accent))";
      }
    };

    // Clear any existing timeout
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    // Reset previous marker if there was one (exclusive selection)
    if (previousHighlightedIdRef.current && previousHighlightedIdRef.current !== highlightedPropertyId) {
      resetMarker(previousHighlightedIdRef.current);
    }

    // Highlight the new marker
    if (highlightedPropertyId) {
      highlightMarker(highlightedPropertyId);
      previousHighlightedIdRef.current = highlightedPropertyId;

      // Find the property to center the map on it
      const property = properties.find((p) => p._id === highlightedPropertyId);
      if (property?.location?.coordinates) {
        const [lng, lat] = property.location.coordinates;
        map.easeTo({ 
          center: [lng, lat], 
          zoom: Math.max(map.getZoom(), 14),
          duration: 800
        });
      }

      // Auto-reset after 5 seconds
      highlightTimeoutRef.current = setTimeout(() => {
        resetMarker(highlightedPropertyId);
        previousHighlightedIdRef.current = null;
        if (onHighlightComplete) {
          onHighlightComplete();
        }
      }, 5000);
    } else {
      // If highlight is cleared externally, ensure any previously highlighted marker is reset immediately.
      if (previousHighlightedIdRef.current) {
        resetMarker(previousHighlightedIdRef.current);
      }
      previousHighlightedIdRef.current = null;
    }

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
    };
  }, [highlightedPropertyId, highlightRequestId, mapLoaded, markersVersion, properties, onHighlightComplete]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden border bg-muted group">
      <div ref={mapContainerRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="shadow-lg bg-background/80 backdrop-blur-md border-border/50 hover:bg-background/90 text-foreground transition-all"
          onClick={toggleStyle}
        >
          <Layers className="h-4 w-4 mr-2" />
          <span className="font-medium">{mapStyleType === "streets" ? "Satellite" : "Map"}</span>
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
