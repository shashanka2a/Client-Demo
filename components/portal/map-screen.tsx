"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Globe, MapPin, Tag, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useProject } from "@/contexts/project-context";
import { useKmz } from "@/contexts/kmz-context";
import { renderGeoJson } from "@/lib/kmz-render";
import type { PortalObservation } from "@/lib/portal/types";
import { Card, EmptyState, StatusBadge } from "@/components/portal/shared";
import { useDemo } from "@/contexts/demo-context";

const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

type ObservationPin = PortalObservation & { pos: [number, number] };

export function MapScreen() {
  const { activeProject, observations } = useProject();
  const { boundary, hasCustomUpload, openInGoogleEarth } = useKmz();
  const { sim } = useDemo();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const kmzLayer = useRef<L.LayerGroup | null>(null);
  const obsGroup = useRef<L.LayerGroup | null>(null);

  const [pickedObs, setSelectedObs] = useState<ObservationPin | null>(null);
  const [kmzToggle, setShowKmz] = useState(true);
  const [showObs, setShowObs] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // The guided tour can drive the layer chips and open a pin; otherwise the user's own choices apply.
  const showKmz = sim.mapBoundary ?? kmzToggle;

  const observationPins = useMemo(() => {
    if (!boundary) return [];
    const [centerLat, centerLng] = boundary.center;
    return observations.map((obs, index) => ({
      ...obs,
      pos: [
        centerLat + Math.sin(index) * 0.002 + index * 0.0008,
        centerLng + Math.cos(index) * 0.002 + index * 0.001,
      ] as [number, number],
    }));
  }, [observations, boundary]);

  const selectedObs = sim.mapPinOpen ? (observationPins[0] ?? pickedObs) : pickedObs;

  // The map shrinks when the detail card opens; let Leaflet re-measure so tiles don't glitch.
  useEffect(() => {
    if (!leafletMap.current) return;
    const timer = window.setTimeout(() => leafletMap.current?.invalidateSize(), 60);
    return () => window.clearTimeout(timer);
  }, [selectedObs]);

  useEffect(() => {
    if (!boundary) return;
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: boundary.center,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });
    leafletMap.current = map;

    L.tileLayer(SATELLITE_TILES, { maxZoom: 20 }).addTo(map);

    kmzLayer.current = L.layerGroup().addTo(map);
    obsGroup.current = L.layerGroup().addTo(map);

    // Leaflet often needs a size recalc after the container finishes layout.
    requestAnimationFrame(() => map.invalidateSize());
    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 150);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      leafletMap.current = null;
      kmzLayer.current = null;
      obsGroup.current = null;
    };
  }, [boundary]);

  useEffect(() => {
    if (!obsGroup.current) return;
    obsGroup.current.clearLayers();

    observationPins.forEach((obs) => {
      const color =
        obs.sentiment.toLowerCase() === "positive"
          ? "#34C759"
          : obs.observationType.toLowerCase().includes("hazard")
            ? "#FF3B30"
            : "#FF9500";
      const icon = L.divIcon({
        className: "",
        html: `<div ${obs.id === observationPins[0]?.id ? 'data-demo="map-pin-first"' : ""} style="width:12px;height:12px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 8px ${color}aa;cursor:pointer"></div>`,
        iconAnchor: [6, 6],
      });
      L.marker(obs.pos, { icon })
        .addTo(obsGroup.current!)
        .on("click", () => setSelectedObs(obs));
    });
  }, [observationPins]);

  useEffect(() => {
    if (!boundary) return;
    if (!leafletMap.current || !kmzLayer.current) return;

    const map = leafletMap.current;
    const bounds = renderGeoJson(kmzLayer.current, boundary.geojson, { showLabels });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [32, 32] });
    } else {
      map.setView(boundary.center, 14);
    }

    requestAnimationFrame(() => map.invalidateSize());
  }, [boundary, showLabels]);

  useEffect(() => {
    if (!leafletMap.current || !kmzLayer.current) return;
    if (!boundary) return;
    if (showKmz) {
      kmzLayer.current.addTo(leafletMap.current);
    } else {
      kmzLayer.current.remove();
    }
  }, [showKmz]);

  useEffect(() => {
    if (!leafletMap.current || !obsGroup.current) return;
    if (showObs) {
      obsGroup.current.addTo(leafletMap.current);
    } else {
      obsGroup.current.remove();
    }
  }, [showObs]);

  const featureSummary = boundary
    ? [
        boundary.featureCount
          ? `${boundary.featureCount} feature${boundary.featureCount !== 1 ? "s" : ""}`
          : null,
        boundary.pinCount
          ? `${boundary.pinCount} pin${boundary.pinCount !== 1 ? "s" : ""}`
          : null,
        boundary.labelCount
          ? `${boundary.labelCount} label${boundary.labelCount !== 1 ? "s" : ""}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div className="flex flex-col h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom,0px))] lg:h-[calc(100vh-2rem)]">
      <div className="px-4 pt-6 pb-3 flex-shrink-0">
        <p className="text-xs font-bold tracking-[0.2em] text-[#FF6633] uppercase mb-0.5">Project Map</p>
        <h1 className="text-xl font-bold text-white">{activeProject?.name ?? "Project Map"}</h1>
        {boundary ? (
          <p className="text-xs text-white/35 mt-0.5 font-mono">
            {boundary.fileName}
            {featureSummary ? ` · ${featureSummary}` : ` · ${boundary.vertexCount} vertices`}
          </p>
        ) : (
          <p className="text-xs text-white/35 mt-0.5">
            No KMZ uploaded for this project.
          </p>
        )}
      </div>

      <div className="px-4 mb-3 flex gap-2 flex-shrink-0 flex-wrap" data-demo="map-controls">
        <button
          data-demo="map-toggle-boundary"
          onClick={() => setShowKmz((v) => !v)}
          disabled={!boundary}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            !boundary
              ? "bg-secondary border-white/8 text-white/20 cursor-not-allowed"
              : showKmz
                ? "bg-[#FF6633]/15 border-[#FF6633]/30 text-[#FF6633]"
                : "bg-secondary border-white/8 text-white/35"
          }`}
        >
          <MapPin size={11} /> Boundary
        </button>
        {boundary && hasCustomUpload && boundary.labelCount > 0 && (
          <button
            onClick={() => setShowLabels((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              showLabels ? "bg-white/10 border-white/20 text-white/80" : "bg-secondary border-white/8 text-white/35"
            }`}
          >
            <Tag size={11} /> Labels
          </button>
        )}
        <button
          data-demo="map-toggle-observations"
          onClick={() => setShowObs((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            showObs ? "bg-[#FF3B30]/10 border-[#FF3B30]/25 text-[#FF3B30]" : "bg-secondary border-white/8 text-white/35"
          }`}
        >
          <AlertCircle size={11} /> Observations
        </button>
        <button
          type="button"
          data-demo="google-earth-btn"
          onClick={() => void openInGoogleEarth()}
          disabled={!boundary}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            !boundary
              ? "bg-secondary border-white/8 text-white/20 cursor-not-allowed"
              : "bg-secondary border-white/8 text-white/50 hover:text-white/80"
          }`}
        >
          <Globe size={11} /> Google Earth
        </button>
      </div>

      {/* `isolate` keeps Leaflet's internal z-indexes (400–1000) contained, so overlays like the guided tour always render above the map. */}
      <div className="flex-1 mx-4 rounded-2xl overflow-hidden border border-white/8 relative isolate min-h-0" data-demo="map-container">
        {boundary ? (
          <div ref={mapRef} className="w-full h-full" style={{ background: "#0D0D0D" }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center px-6" style={{ background: "#0D0D0D" }}>
            <div className="w-full max-w-sm">
              <EmptyState message="No map available for this project yet." />
              <p className="text-xs text-white/25 mt-3">
                A project KMZ hasn’t been uploaded. Contact your project manager to add a boundary file.
              </p>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 z-[500] px-2 py-0.5 rounded bg-black/60 text-[9px] text-white/30 pointer-events-none select-none">
          © Esri
        </div>
      </div>

      {selectedObs && (
        <div className="mx-4 mt-3 flex-shrink-0" data-demo="map-observation-card">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-white/90 leading-snug">{selectedObs.title}</p>
                  <button onClick={() => setSelectedObs(null)} className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
                {selectedObs.description && selectedObs.tags.length === 0 ? (
                  <p className="text-xs text-white/55 mb-2 leading-relaxed line-clamp-2">
                    {selectedObs.description.split("\n").find((line) => line.trim()) ?? selectedObs.description}
                  </p>
                ) : null}
                <p className="text-xs text-white/40 font-mono mb-2">
                  {selectedObs.location !== "—"
                    ? `${selectedObs.location} · ${selectedObs.date}`
                    : selectedObs.date}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={selectedObs.status} />
                  <span className="px-2 py-0.5 rounded-md bg-white/6 text-[10px] font-semibold text-white/40 uppercase tracking-wide">
                    {selectedObs.observationType}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/6 text-[10px] font-semibold text-white/40 uppercase tracking-wide">
                    {selectedObs.title}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="px-4 py-3 flex-shrink-0 flex flex-wrap gap-x-5 gap-y-1.5 lg:pb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-[#FF6633] rounded" />
          <span className="text-[10px] text-white/30">Panel boundary</span>
        </div>
        {hasCustomUpload && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-3 rounded-full bg-[#E53935] border border-white/30" />
              <span className="text-[10px] text-white/30">Inverter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-3 rounded-full bg-[#F9A825] border border-white/30" />
              <span className="text-[10px] text-white/30">Panel block</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-3 rounded-full bg-[#26A69A] border border-white/30" />
              <span className="text-[10px] text-white/30">Culvert</span>
            </div>
          </>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" />
          <span className="text-[10px] text-white/30">Hazard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500]" />
          <span className="text-[10px] text-white/30">Vegetation / other</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
          <span className="text-[10px] text-white/30">Positive</span>
        </div>
      </div>
    </div>
  );
}
