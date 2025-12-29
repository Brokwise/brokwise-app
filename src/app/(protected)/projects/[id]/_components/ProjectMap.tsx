"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

interface ProjectMapProps {
  coordinates: [number, number];
  name: string;
}

export const ProjectMap = ({ coordinates, name }: ProjectMapProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const currentStyleRef = useRef<string>("");

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    const initialStyle = isDarkMode
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";

    currentStyleRef.current = initialStyle;

    const map = new mapboxgl.Map({
      container,
      style: initialStyle,
      center: coordinates,
      zoom: 14,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const marker = new mapboxgl.Marker({ color: "#ef4444" }) // Red marker
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="font-family: sans-serif; padding: 4px; font-weight: 600;">${name}</div>`
        )
      )
      .addTo(map);

    markerRef.current = marker;

    map.on("load", () => {
      setMapLoaded(true);
      map.resize();
    });

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initialize once

  // Update style on theme change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const targetStyle = isDarkMode
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";

    if (currentStyleRef.current !== targetStyle) {
      currentStyleRef.current = targetStyle;
      map.setStyle(targetStyle);
    }
  }, [isDarkMode]);

  // Update center and marker if coordinates change
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    map.flyTo({ center: coordinates });
    marker.setLngLat(coordinates);
  }, [coordinates]);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border bg-muted">
      <div ref={mapContainerRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
