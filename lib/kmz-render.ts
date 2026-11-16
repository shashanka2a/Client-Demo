import L from "leaflet";
import type { Feature, FeatureCollection, Geometry, Point } from "geojson";
import { geojsonCenter } from "@/lib/kmz-parser";

type RenderOptions = {
  showLabels?: boolean;
};

type LabelAlign = "left" | "center" | "right";
type PinVariant = "inverter" | "panel" | "culvert" | "default";

const PIN_COLORS: Record<PinVariant, string> = {
  inverter: "#E53935",
  panel: "#F9A825",
  culvert: "#26A69A",
  default: "#5C6BC0",
};

const LABEL_SHADOW =
  "0 0 4px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.7), 1px 1px 2px rgba(0,0,0,0.9)";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pinVariant(name: string): PinVariant {
  const n = name.toUpperCase();
  if (n.includes("INVERTER")) return "inverter";
  if (n.includes("PANEL BLOCK") || n.includes("PANEL")) return "panel";
  if (n.includes("CULVERT")) return "culvert";
  return "default";
}

function shouldShowLabel(name?: string): boolean {
  if (!name?.trim()) return false;
  const n = name.trim().toLowerCase();
  return !["untitled polygon", "untitled path", "untitled", "untitled placemark"].includes(n);
}

function pushpinSvg(color: string) {
  return `<svg width="16" height="24" viewBox="0 0 16 24" style="flex-shrink:0;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.55))">
    <path d="M8 0C4.69 0 2 2.69 2 6c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6z" fill="${color}" stroke="#fff" stroke-width="0.75"/>
    <circle cx="8" cy="6" r="2" fill="#fff" opacity="0.35"/>
  </svg>`;
}

function labelAlignForLng(lng: number, minLng: number, maxLng: number): LabelAlign {
  const range = maxLng - minLng;
  if (range <= 0) return "center";

  const ratio = (lng - minLng) / range;
  if (ratio < 0.33) return "left";
  if (ratio > 0.67) return "right";
  return "center";
}

function getLngBounds(geojson: FeatureCollection): { minLng: number; maxLng: number } {
  const layer = L.geoJSON(geojson);
  const bounds = layer.getBounds();
  return { minLng: bounds.getWest(), maxLng: bounds.getEast() };
}

function labelHtml(name: string) {
  return `<span style="color:#fff;font-weight:700;font-size:11px;font-family:Inter,system-ui,sans-serif;line-height:1.2;white-space:nowrap;text-shadow:${LABEL_SHADOW}">${escapeHtml(name)}</span>`;
}

function pointMarkerIcon(name: string, showLabel: boolean, align: LabelAlign) {
  const color = PIN_COLORS[pinVariant(name)];

  let labelStyle = "";
  switch (align) {
    case "left":
      labelStyle =
        "position:absolute;right:10px;bottom:2px;transform:translateX(0);text-align:right;max-width:160px";
      break;
    case "right":
      labelStyle = "position:absolute;left:10px;bottom:2px;text-align:left;max-width:160px";
      break;
    default:
      labelStyle =
        "position:absolute;left:0;top:6px;transform:translateX(-50%);text-align:center;white-space:nowrap";
      break;
  }

  const labelBlock = showLabel
    ? `<div style="${labelStyle};pointer-events:none">${labelHtml(name)}</div>`
    : "";

  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:0;height:0;pointer-events:none">
      <div style="position:absolute;left:-8px;top:-24px">${pushpinSvg(color)}</div>
      ${labelBlock}
    </div>`,
    iconAnchor: [0, 0],
  });
}

function polygonLabelIcon(label: string, align: LabelAlign) {
  let transform = "translate(-50%,-50%)";
  let textAlign = "center";

  if (align === "left") {
    transform = "translate(0,-50%)";
    textAlign = "left";
  } else if (align === "right") {
    transform = "translate(-100%,-50%)";
    textAlign = "right";
  }

  return L.divIcon({
    className: "",
    html: `<div style="transform:${transform};color:#fff;font-weight:700;font-size:11px;line-height:1.3;font-family:Inter,system-ui,sans-serif;text-align:${textAlign};text-shadow:${LABEL_SHADOW};white-space:nowrap;pointer-events:none">${escapeHtml(label)}</div>`,
    iconAnchor: [0, 0],
  });
}

function kmlStyle(feature: Feature | undefined): L.PathOptions {
  const p = feature?.properties ?? {};
  const stroke = (p.stroke as string) ?? "#FF6633";
  return {
    color: stroke,
    weight: (p["stroke-width"] as number) ?? 2,
    opacity: (p["stroke-opacity"] as number) ?? 1,
    fillColor: (p.fill as string) ?? stroke,
    fillOpacity: (p["fill-opacity"] as number) ?? 0.2,
  };
}

function isPointGeometry(geom: Geometry | null | undefined): geom is Point {
  return geom?.type === "Point";
}

function getPointFeatures(geojson: FeatureCollection): { latlng: L.LatLng; name: string }[] {
  const points: { latlng: L.LatLng; name: string }[] = [];

  for (const feature of geojson.features) {
    const geom = feature.geometry;
    const name = (feature.properties?.name as string) ?? "";

    if (geom?.type === "Point") {
      const [lng, lat] = geom.coordinates;
      points.push({ latlng: L.latLng(lat, lng), name });
    } else if (geom?.type === "MultiPoint") {
      for (const [lng, lat] of geom.coordinates) {
        points.push({ latlng: L.latLng(lat, lng), name });
      }
    }
  }

  return points;
}

/** Render GeoJSON — KMZView-style: colored boundaries, pushpin markers, bold labels. */
export function renderGeoJson(
  target: L.LayerGroup,
  geojson: FeatureCollection,
  options: RenderOptions = { showLabels: true }
): L.LatLngBounds {
  target.clearLayers();
  const bounds = L.latLngBounds([]);

  const shapes = L.layerGroup().addTo(target);
  const markers = L.layerGroup().addTo(target);
  const labels = L.layerGroup().addTo(target);

  const { minLng, maxLng } = getLngBounds(geojson);

  const shapeCollection: FeatureCollection = {
    type: "FeatureCollection",
    features: geojson.features.filter((f) => !isPointGeometry(f.geometry)),
  };

  const geoLayer = L.geoJSON(shapeCollection, {
    style: (feature) => kmlStyle(feature),
    onEachFeature: (feature) => {
      const name = feature.properties?.name as string | undefined;
      const geom = feature.geometry;

      if (
        options.showLabels &&
        shouldShowLabel(name) &&
        geom &&
        (geom.type === "Polygon" || geom.type === "MultiPolygon")
      ) {
        const [lat, lng] = geojsonCenter({
          type: "FeatureCollection",
          features: [feature],
        });
        const center = L.latLng(lat, lng);
        const align = labelAlignForLng(lng, minLng, maxLng);
        L.marker(center, {
          icon: polygonLabelIcon(name!.trim(), align),
          interactive: false,
        }).addTo(labels);
        bounds.extend(center);
      }
    },
  });

  geoLayer.addTo(shapes);
  const geoBounds = geoLayer.getBounds();
  if (geoBounds.isValid()) bounds.extend(geoBounds);

  for (const { latlng, name } of getPointFeatures(geojson)) {
    const showLabel = !!(options.showLabels && shouldShowLabel(name));
    const align = labelAlignForLng(latlng.lng, minLng, maxLng);
    L.marker(latlng, {
      icon: pointMarkerIcon(name || "Pin", showLabel, align),
      interactive: false,
    }).addTo(markers);
    bounds.extend(latlng);
  }

  return bounds;
}
