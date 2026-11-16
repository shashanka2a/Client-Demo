"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FeatureCollection } from "geojson";
import type { LatLng } from "@/lib/kmz-parser";
import { renderGeoJson } from "@/lib/kmz-render";

const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

type KmzMapProps = {
  geojson: FeatureCollection;
  center: LatLng;
  className?: string;
  height?: string | number;
  padding?: number;
  zoomControl?: boolean;
  showLabels?: boolean;
};

export function KmzMap({
  geojson,
  center,
  className = "",
  height = "100%",
  padding = 32,
  zoomControl = false,
  showLabels = true,
}: KmzMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const kmzLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center,
        zoom: 14,
        zoomControl,
        attributionControl: false,
      });

      L.tileLayer(SATELLITE_TILES, { maxZoom: 20 }).addTo(mapInstance.current);
      kmzLayer.current = L.layerGroup().addTo(mapInstance.current);
    }

    const map = mapInstance.current;
    const bounds = renderGeoJson(kmzLayer.current!, geojson, { showLabels });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [padding, padding] });
    } else {
      map.setView(center, 14);
    }

    return () => {
      map.invalidateSize();
    };
  }, [geojson, center, padding, zoomControl, showLabels]);

  useEffect(() => {
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
      kmzLayer.current = null;
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full" style={{ background: "#0D0D0D" }} />
      <div className="absolute bottom-2 right-2 z-[500] px-2 py-0.5 rounded bg-black/60 text-[9px] text-white/30 pointer-events-none select-none">
        © Esri
      </div>
    </div>
  );
}
