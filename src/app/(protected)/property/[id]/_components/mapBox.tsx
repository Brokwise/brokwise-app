import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Property } from "@/types/property";
import { Loader2, MapPin } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { formatAddress } from "@/utils/helper";

export const MapBox = ({ property }: { property: Property }) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  // Initialize Mapbox
  useEffect(() => {
    if (!property?.location?.coordinates || !mapContainerRef.current) return;

    // Set your Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    const [lng, lat] = property.location.coordinates;

    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 14,
    });

    // Add marker
    new mapboxgl.Marker({ color: "#0f172a" })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup().setHTML(
          `<div class="p-2"><strong>${
            property.propertyCategory
          }</strong><br/>${formatAddress(property.address)}</div>`
        )
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
  }, [property]);

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
          className="w-full h-[400px] rounded-lg overflow-hidden"
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
