import React, { useEffect, useRef, useState, useCallback } from "react";
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
  return isDark
    ? "mapbox://styles/mapbox/dark-v11"
    : "mapbox://styles/mapbox/streets-v12";
};

// Zoom threshold for switching between clusters and individual markers
const CLUSTER_MAX_ZOOM = 8;
const INDIVIDUAL_MIN_ZOOM = 9;

// CSS for marker animations
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

.price-marker {
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.price-marker.marker-hidden {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

.price-marker.marker-visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
`;

// GeoJSON source and layer IDs
const SOURCE_ID = "properties-source";
const CLUSTER_LAYER_ID = "clusters";
const CLUSTER_COUNT_LAYER_ID = "cluster-count";
const UNCLUSTERED_POINT_LAYER_ID = "unclustered-point";

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
  const markerElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const previousHighlightedIdRef = useRef<string | null>(null);
  const appliedStyleRef = useRef<string>("");
  const propertiesDataRef = useRef<Property[]>([]);
  const currentZoomRef = useRef<number>(4); // Track zoom without re-renders

  const [mapLoaded, setMapLoaded] = useState(false);
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
    setMapStyleType((prev) => (prev === "streets" ? "satellite" : "streets"));
  };

  // Create GeoJSON from properties
  const createGeoJSON = useCallback(
    (props: Property[]): GeoJSON.FeatureCollection => {
      const features: GeoJSON.Feature[] = props
        .filter(
          (p) =>
            p.location?.coordinates &&
            Array.isArray(p.location.coordinates) &&
            p.location.coordinates.length === 2 &&
            typeof p.location.coordinates[0] === "number" &&
            typeof p.location.coordinates[1] === "number"
        )
        .map((property) => ({
          type: "Feature",
          properties: {
            id: property._id,
            price: property.totalPrice,
            priceFormatted: formatPrice(property.totalPrice),
            category: property.propertyCategory,
            address:
              property.address?.address ||
              property.society ||
              "Address available",
            rate: property.rate,
            featuredMedia: property.featuredMedia,
          },
          geometry: {
            type: "Point",
            coordinates: property.location.coordinates,
          },
        }));

      return {
        type: "FeatureCollection",
        features,
      };
    },
    []
  );

  // Update marker visibility based on current zoom
  const updateMarkerVisibility = useCallback((forceShow?: string) => {
    const zoom = currentZoomRef.current;
    const shouldShowMarkers = zoom >= INDIVIDUAL_MIN_ZOOM;

    markerElementsRef.current.forEach((el, id) => {
      // Force show a specific marker (for highlighting)
      if (forceShow && id === forceShow) {
        el.classList.remove("marker-hidden");
        el.classList.add("marker-visible");
        return;
      }

      if (shouldShowMarkers) {
        el.classList.remove("marker-hidden");
        el.classList.add("marker-visible");
      } else {
        el.classList.remove("marker-visible");
        el.classList.add("marker-hidden");
      }
    });
  }, []);

  // Setup clustering layers
  const setupClusterLayers = useCallback(
    (map: mapboxgl.Map, geojson: GeoJSON.FeatureCollection) => {
      // Remove existing source and layers if they exist
      if (map.getLayer(CLUSTER_COUNT_LAYER_ID))
        map.removeLayer(CLUSTER_COUNT_LAYER_ID);
      if (map.getLayer(CLUSTER_LAYER_ID)) map.removeLayer(CLUSTER_LAYER_ID);
      if (map.getLayer(UNCLUSTERED_POINT_LAYER_ID))
        map.removeLayer(UNCLUSTERED_POINT_LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

      // Add source with clustering
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
        clusterRadius: 60,
      });

      // Cluster circles layer
      map.addLayer({
        id: CLUSTER_LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": [
            "step",
            ["get", "point_count"],
            22, // base size
            10,
            26,
            50,
            30,
            100,
            36,
          ],
          "circle-color": "#6366f1", // Indigo-500 for visibility
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 1,
        },
      });

      // Cluster count text layer
      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: "symbol",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 14,
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // Unclustered point layer - visible at medium zoom, fades at high zoom where DOM markers appear
      map.addLayer({
        id: UNCLUSTERED_POINT_LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 10,
          "circle-color": "#6366f1",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            CLUSTER_MAX_ZOOM,
            1,
            INDIVIDUAL_MIN_ZOOM,
            0,
          ],
          "circle-stroke-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            CLUSTER_MAX_ZOOM,
            1,
            INDIVIDUAL_MIN_ZOOM,
            0,
          ],
        },
      });
    },
    []
  );

  // Create individual DOM markers for high zoom
  const createIndividualMarkers = useCallback(
    (map: mapboxgl.Map, props: Property[]) => {
      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      markerElementsRef.current.clear();

      const validProperties = props.filter(
        (p) =>
          p.location?.coordinates &&
          Array.isArray(p.location.coordinates) &&
          p.location.coordinates.length === 2 &&
          typeof p.location.coordinates[0] === "number" &&
          typeof p.location.coordinates[1] === "number"
      );

      const shouldShowMarkers = currentZoomRef.current >= INDIVIDUAL_MIN_ZOOM;

      validProperties.forEach((property) => {
        const [lng, lat] = property.location.coordinates;
        const priceFormatted = formatPrice(property.totalPrice);

        const el = document.createElement("div");
        // Start hidden if zoom is below threshold
        el.className = `price-marker group cursor-pointer ${
          shouldShowMarkers ? "marker-visible" : "marker-hidden"
        }`;
        el.setAttribute("data-property-id", property._id);
        el.style.zIndex = "20";
        el.innerHTML = `
        <div class="marker-inner transition-all duration-300 group-hover:scale-110" style="transform-origin: bottom center;">
          <div class="marker-bubble" style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); padding: 6px 10px; border-radius: 99px; box-shadow: 0 4px 12px hsl(var(--foreground) / 0.2); font-weight: 600; font-size: 13px; white-space: nowrap; display: flex; align-items: center; justify-content: center; border: 2px solid hsl(var(--background)); transition: all 0.3s ease;">
            ${priceFormatted}
          </div>
          <div class="marker-arrow" style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid hsl(var(--primary)); margin: -2px auto 0 auto; filter: drop-shadow(0 2px 1px rgba(0,0,0,0.1)); transition: border-top-color 0.3s ease;"></div>
        </div>
      `;

        markerElementsRef.current.set(property._id, el);

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: "custom-popup",
          maxWidth: "300px",
        }).setHTML(
          `<div style="width: 260px; overflow: hidden; border-radius: 12px; background: hsl(var(--card)); box-shadow: 0 10px 40px hsl(var(--foreground) / 0.15); border: 1px solid hsl(var(--border)); font-family: system-ui, -apple-system, sans-serif; cursor: pointer;">
           <div style="height: 140px; width: 100%; overflow: hidden; background-color: hsl(var(--muted)); position: relative;">
             <img src="${
               property.featuredMedia
             }" alt="Property" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onerror="this.src='/images/placeholder.webp'" />
             <div style="position: absolute; top: 10px; left: 10px; padding: 3px 8px; background: hsl(var(--background) / 0.9); backdrop-filter: blur(4px); border-radius: 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: hsl(var(--foreground)); border: 1px solid hsl(var(--border));">
                ${property.propertyCategory}
             </div>
           </div>
           <div style="padding: 14px 16px;">
              <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 20px; color: hsl(var(--card-foreground)); font-weight: 600; letter-spacing: -0.3px;">${priceFormatted}</span>
                <span style="font-size: 11px; color: hsl(var(--muted-foreground)); font-weight: 500;">₹${
                  property.rate
                }/sqft</span>
              </div>
              <p style="font-size: 12px; color: hsl(var(--muted-foreground)); margin: 0 0 12px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${
                property.address?.address ||
                property.society ||
                "Address available on request"
              }</p>
              
              <button id="view-details-${
                property._id
              }" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px; border-radius: 8px; background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: none; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
           </div>
         </div>`
        );

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);

        popup.on("open", () => {
          const button = document.getElementById(
            `view-details-${property._id}`
          );
          if (button) {
            button.onclick = (e) => {
              e.preventDefault();
              onSelectProperty?.(property._id);
            };
          }
        });
      });

      setMarkersVersion((v) => v + 1);
    },
    [onSelectProperty]
  );

  // Initialize map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    let initObserver: ResizeObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const initMap = () => {
      if (mapRef.current) return;
      setMapLoaded(false);

      const defaultCenter: [number, number] = [77.209, 28.6139];
      const initialStyle = getMapStyleUrl(mapStyleType, isDarkMode);

      const map = new mapboxgl.Map({
        container,
        style: initialStyle,
        center: defaultCenter,
        zoom: 4,
      });
      mapRef.current = map;
      appliedStyleRef.current = initialStyle;
      currentZoomRef.current = 4;

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(container);

      // Track zoom changes and update marker visibility
      map.on("zoom", () => {
        const newZoom = map.getZoom();
        const wasAboveThreshold = currentZoomRef.current >= INDIVIDUAL_MIN_ZOOM;
        const isAboveThreshold = newZoom >= INDIVIDUAL_MIN_ZOOM;
        currentZoomRef.current = newZoom;

        // Only update visibility when crossing the threshold
        if (wasAboveThreshold !== isAboveThreshold) {
          updateMarkerVisibility();
        }
      });

      map.on("load", () => {
        map.resize();
        currentZoomRef.current = map.getZoom();
        setMapLoaded(true);
      });

      // Handle cluster clicks - zoom in to expand
      map.on("click", CLUSTER_LAYER_ID, async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [CLUSTER_LAYER_ID],
        });
        if (!features.length) return;

        const clusterId = features[0].properties?.cluster_id;
        if (clusterId === undefined) return;

        const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
        if (!source) return;

        // Use callback API for getClusterExpansionZoom
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) {
            // Fallback: just zoom in a bit
            const geometry = features[0].geometry;
            if (geometry.type === "Point") {
              map.easeTo({
                center: geometry.coordinates as [number, number],
                zoom: map.getZoom() + 2,
                duration: 500,
              });
            }
            return;
          }

          const geometry = features[0].geometry;
          if (
            geometry.type === "Point" &&
            zoom !== null &&
            zoom !== undefined
          ) {
            map.easeTo({
              center: geometry.coordinates as [number, number],
              zoom: zoom,
              duration: 500,
            });
          }
        });
      });

      // Handle unclustered point clicks at medium zoom
      map.on("click", UNCLUSTERED_POINT_LAYER_ID, (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [UNCLUSTERED_POINT_LAYER_ID],
        });
        if (!features.length) return;

        const props = features[0].properties;
        if (props?.id) {
          const geometry = features[0].geometry;
          if (geometry.type === "Point") {
            map.easeTo({
              center: geometry.coordinates as [number, number],
              zoom: INDIVIDUAL_MIN_ZOOM + 1,
              duration: 500,
            });
          }
        }
      });

      // Change cursor on cluster/point hover
      map.on("mouseenter", CLUSTER_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CLUSTER_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", UNCLUSTERED_POINT_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", UNCLUSTERED_POINT_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
    };

    const { width, height } = container.getBoundingClientRect();
    if (width > 0 && height > 0) {
      initMap();
    } else {
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

  // Apply map style changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextStyle = getMapStyleUrl(mapStyleType, isDarkMode);
    if (appliedStyleRef.current === nextStyle) return;

    appliedStyleRef.current = nextStyle;

    map.once("style.load", () => {
      const geojson = createGeoJSON(propertiesDataRef.current);
      if (geojson.features.length > 0) {
        setupClusterLayers(map, geojson);
      }
    });

    map.setStyle(nextStyle);
  }, [mapStyleType, isDarkMode, createGeoJSON, setupClusterLayers]);

  // Update data when properties change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    propertiesDataRef.current = properties;
    const geojson = createGeoJSON(properties);

    const setupLayers = () => {
      setupClusterLayers(map, geojson);
      createIndividualMarkers(map, properties);

      // Fit bounds to all properties
      if (geojson.features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        geojson.features.forEach((feature) => {
          if (feature.geometry.type === "Point") {
            bounds.extend(feature.geometry.coordinates as [number, number]);
          }
        });

        if (geojson.features.length === 1) {
          const coords = geojson.features[0].geometry;
          if (coords.type === "Point") {
            map.easeTo({
              center: coords.coordinates as [number, number],
              zoom: 14,
            });
          }
        } else {
          map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }
      }
    };

    if (map.isStyleLoaded()) {
      setupLayers();
    } else {
      map.once("style.load", setupLayers);
    }

    return () => {
      map.off("style.load", setupLayers);
    };
  }, [
    properties,
    mapLoaded,
    createGeoJSON,
    setupClusterLayers,
    createIndividualMarkers,
  ]);

  // Handle marker highlighting
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

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
        markerBubble.style.boxShadow =
          "0 4px 12px hsl(var(--foreground) / 0.2)";
        markerBubble.style.border = "2px solid hsl(var(--background))";
      }
      if (markerArrow) {
        markerArrow.style.borderTopColor = "hsl(var(--primary))";
      }
      el.style.zIndex = "20";
    };

    const highlightMarker = (propertyId: string) => {
      const el = markerElementsRef.current.get(propertyId);
      if (!el) return;

      const markerInner = el.querySelector(".marker-inner") as HTMLElement;
      const markerBubble = el.querySelector(".marker-bubble") as HTMLElement;
      const markerArrow = el.querySelector(".marker-arrow") as HTMLElement;

      el.style.zIndex = "100";
      // Force show the marker even if below zoom threshold
      el.classList.remove("marker-hidden");
      el.classList.add("marker-visible");

      if (markerInner) {
        markerInner.classList.remove("marker-highlighted");
        void markerInner.offsetHeight;
        markerInner.classList.add("marker-highlighted");
        markerInner.style.transform = "scale(1.25)";
      }
      if (markerBubble) {
        markerBubble.style.backgroundColor = "hsl(var(--accent))";
        markerBubble.style.boxShadow = "0 6px 20px hsl(var(--accent) / 0.4)";
        markerBubble.style.border = "3px solid hsl(var(--background))";
      }
      if (markerArrow) {
        markerArrow.style.borderTopColor = "hsl(var(--accent))";
      }
    };

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    if (
      previousHighlightedIdRef.current &&
      previousHighlightedIdRef.current !== highlightedPropertyId
    ) {
      resetMarker(previousHighlightedIdRef.current);
      // Restore visibility state for the reset marker
      updateMarkerVisibility();
    }

    if (highlightedPropertyId) {
      highlightMarker(highlightedPropertyId);
      previousHighlightedIdRef.current = highlightedPropertyId;

      const property = properties.find((p) => p._id === highlightedPropertyId);
      if (property?.location?.coordinates) {
        const [lng, lat] = property.location.coordinates;
        map.easeTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), INDIVIDUAL_MIN_ZOOM + 1),
          duration: 800,
        });
      }

      highlightTimeoutRef.current = setTimeout(() => {
        resetMarker(highlightedPropertyId);
        previousHighlightedIdRef.current = null;
        updateMarkerVisibility();
        onHighlightComplete?.();
      }, 5000);
    } else {
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
  }, [
    highlightedPropertyId,
    highlightRequestId,
    mapLoaded,
    markersVersion,
    properties,
    onHighlightComplete,
    updateMarkerVisibility,
  ]);

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
          <span className="font-medium">
            {mapStyleType === "streets" ? "Satellite" : "Map"}
          </span>
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
