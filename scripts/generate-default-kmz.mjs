import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import JSZip from "jszip";
import { kml } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const kmzCandidates = [
  path.join(root, "WICKD_Tupelo Panel Mapping.kmz"),
  path.join(root, "public", "WICKD_Tupelo-Panel-Mapping.kmz"),
];
const kmzPath = kmzCandidates.find((p) => fs.existsSync(p));
const outPath = path.join(root, "lib", "default-kmz-boundary.json");

function collectPositions(geometry, out) {
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

function geojsonCenter(geojson) {
  const positions = [];
  for (const feature of geojson.features) {
    if (feature.geometry) collectPositions(feature.geometry, positions);
  }
  if (positions.length === 0) return [0, 0];
  const lng = positions.reduce((s, [lon]) => s + lon, 0) / positions.length;
  const lat = positions.reduce((s, [, la]) => s + la, 0) / positions.length;
  return [lat, lng];
}

function countVertices(geojson) {
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

function countPins(geojson) {
  return geojson.features.filter((f) => {
    const t = f.geometry?.type;
    return t === "Point" || t === "MultiPoint";
  }).length;
}

function countLabels(geojson) {
  return geojson.features.filter((f) => {
    const name = f.properties?.name;
    return typeof name === "string" && name.trim().length > 0;
  }).length;
}

function parseKmlText(kmlText) {
  const doc = new DOMParser().parseFromString(kmlText, "text/xml");
  const parseError = doc.getElementsByTagName("parsererror");
  if (parseError.length > 0) {
    throw new Error("Invalid KML file — could not parse XML.");
  }
  const result = kml(doc);
  return {
    type: "FeatureCollection",
    features: result.features.filter((f) => f.geometry !== null),
  };
}

async function extractKmlTexts(buffer, fileName) {
  const name = fileName.toLowerCase();
  if (name.endsWith(".kml")) {
    return [buffer.toString("utf8")];
  }
  const zip = await JSZip.loadAsync(buffer);
  const texts = [];
  for (const entry of Object.keys(zip.files)) {
    if (entry.toLowerCase().endsWith(".kml") && !zip.files[entry].dir) {
      texts.push(await zip.file(entry).async("text"));
    }
  }
  if (texts.length === 0) {
    throw new Error("No KML document found inside the KMZ archive.");
  }
  return texts;
}

async function main() {
  if (!kmzPath) {
    console.error(`KMZ not found. Tried:\n${kmzCandidates.join("\n")}`);
    process.exit(1);
  }

  const buffer = fs.readFileSync(kmzPath);
  const fileName = path.basename(kmzPath);
  const kmlTexts = await extractKmlTexts(buffer, fileName);
  const geojson = {
    type: "FeatureCollection",
    features: kmlTexts.flatMap((text) => parseKmlText(text).features),
  };

  if (geojson.features.length === 0) {
    throw new Error("No map features found in KMZ.");
  }

  const boundary = {
    geojson,
    center: geojsonCenter(geojson),
    featureCount: geojson.features.length,
    vertexCount: countVertices(geojson),
    pinCount: countPins(geojson),
    labelCount: countLabels(geojson),
    fileName,
    fileSize: buffer.length,
    uploadedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    isDefault: true,
  };

  fs.writeFileSync(outPath, JSON.stringify(boundary));
  console.log(
    `Wrote ${outPath} (${boundary.featureCount} features, ${boundary.pinCount} pins)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
