import { kml } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import type { FeatureCollection, Geometry, Position } from "geojson";
import { SITE_BOUNDARY, SITE_CENTER } from "@/lib/data";

export type LatLng = [number, number];

export type ParsedKmz = {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  geojson: FeatureCollection;
  center: LatLng;
  featureCount: number;
  vertexCount: number;
  pinCount: number;
  labelCount: number;
};

/** Default site boundary as GeoJSON (lng, lat order per spec). */
export function createDefaultGeoJson(): FeatureCollection {
  const ring = SITE_BOUNDARY.map(([lat, lng]) => [lng, lat] as Position);
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: "Sunridge Phase II",
          stroke: "#FF6633",
          "stroke-width": 2.5,
          "stroke-opacity": 0.9,
          fill: "#FF6633",
          "fill-opacity": 0.08,
        },
        geometry: { type: "Polygon", coordinates: [ring] },
      },
    ],
  };
}

function collectPositions(geometry: Geometry, out: Position[]) {
  switch (geometry.type) {
    case "Point":
      out.push(geometry.coordinates);
      break;
    case "MultiPoint":
    case "LineString":
      out.push(...geometry.coordinates);
      break;
    case "MultiLineString":
    case "Polygon":
      geometry.coordinates.forEach((ring) => out.push(...ring));
      break;
    case "MultiPolygon":
      geometry.coordinates.forEach((poly) => poly.forEach((ring) => out.push(...ring)));
      break;
    case "GeometryCollection":
      geometry.geometries.forEach((g) => collectPositions(g, out));
      break;
  }
}

export function geojsonCenter(geojson: FeatureCollection): LatLng {
  const positions: Position[] = [];
  for (const feature of geojson.features) {
    if (feature.geometry) collectPositions(feature.geometry, positions);
  }
  if (positions.length === 0) return SITE_CENTER;
  const lng = positions.reduce((s, [lon]) => s + lon, 0) / positions.length;
  const lat = positions.reduce((s, [, la]) => s + la, 0) / positions.length;
  return [lat, lng];
}

function countVertices(geojson: FeatureCollection): number {
  let count = 0;
  for (const feature of geojson.features) {
    const geom = feature.geometry;
    if (!geom) continue;
    if (geom.type === "Polygon") {
      for (const ring of geom.coordinates) {
        const n = ring.length;
        count += n > 1 && ring[0][0] === ring[n - 1][0] && ring[0][1] === ring[n - 1][1] ? n - 1 : n;
      }
    } else if (geom.type === "LineString") {
      count += geom.coordinates.length;
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates) {
        for (const ring of poly) {
          const n = ring.length;
          count += n > 1 && ring[0][0] === ring[n - 1][0] && ring[0][1] === ring[n - 1][1] ? n - 1 : n;
        }
      }
    } else if (geom.type === "MultiLineString") {
      for (const line of geom.coordinates) count += line.length;
    }
  }
  return count;
}

function countPins(geojson: FeatureCollection): number {
  return geojson.features.filter((f) => {
    const t = f.geometry?.type;
    return t === "Point" || t === "MultiPoint";
  }).length;
}

function countLabels(geojson: FeatureCollection): number {
  return geojson.features.filter((f) => {
    const name = f.properties?.name;
    return typeof name === "string" && name.trim().length > 0;
  }).length;
}

async function extractKmlTexts(file: File): Promise<string[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".kml")) {
    return [await file.text()];
  }

  if (name.endsWith(".kmz")) {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(file);
    const texts: string[] = [];

    for (const path of Object.keys(zip.files)) {
      if (path.toLowerCase().endsWith(".kml") && !zip.files[path].dir) {
        texts.push(await zip.file(path)!.async("text"));
      }
    }

    if (texts.length === 0) {
      throw new Error("No KML document found inside the KMZ archive.");
    }
    return texts;
  }

  throw new Error("Unsupported file type. Please upload a .kmz or .kml file.");
}

function parseKmlText(kmlText: string): FeatureCollection {
  const doc = new DOMParser().parseFromString(kmlText, "text/xml");
  const parseError = doc.getElementsByTagName("parsererror");
  if (parseError.length > 0) {
    throw new Error("Invalid KML file — could not parse XML.");
  }
  const result = kml(doc as unknown as Document);
  return {
    type: "FeatureCollection",
    features: result.features.filter((f) => f.geometry !== null) as FeatureCollection["features"],
  };
}

function mergeCollections(collections: FeatureCollection[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: collections.flatMap((c) => c.features),
  };
}

/**
 * Parse a .kmz or .kml file using @tmcw/togeojson (industry-standard KML → GeoJSON).
 * KMZ archives are unzipped with jszip, then each .kml inside is converted.
 */
export async function parseKmzFile(file: File): Promise<ParsedKmz> {
  const kmlTexts = await extractKmlTexts(file);
  const collections = kmlTexts.map(parseKmlText);
  const geojson = mergeCollections(collections);

  if (geojson.features.length === 0) {
    throw new Error("No map features found in this file.");
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    geojson,
    center: geojsonCenter(geojson),
    featureCount: geojson.features.length,
    vertexCount: countVertices(geojson),
    pinCount: countPins(geojson),
    labelCount: countLabels(geojson),
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function extractVertexPositions(geometry: Geometry): Position[] {
  const positions: Position[] = [];
  collectPositions(geometry, positions);

  if (geometry.type === "Polygon") {
    return geometry.coordinates[0]?.slice(0, -1) ?? positions;
  }
  if (geometry.type === "LineString") {
    return geometry.coordinates;
  }
  if (geometry.type === "MultiPolygon") {
    const verts: Position[] = [];
    for (const poly of geometry.coordinates) {
      const ring = poly[0];
      if (ring) verts.push(...ring.slice(0, ring.length > 1 ? -1 : undefined));
    }
    return verts;
  }
  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.flat();
  }
  return positions;
}
