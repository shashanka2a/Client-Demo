"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FeatureCollection } from "geojson";
import type { LatLng, ParsedKmz } from "@/lib/kmz-parser";
import { DEFAULT_KMZ_MIME, GOOGLE_EARTH_OPEN_URL } from "@/lib/kmz-constants";
import { openInGoogleEarth as launchGoogleEarth } from "@/lib/open-google-earth";
import defaultKmzBoundary from "@/lib/default-kmz-boundary.json";

const STORAGE_KEY = "wickd-kmz-boundary-v3";
const FILE_STORAGE_KEY = "wickd-kmz-file-v3";
const LEGACY_STORAGE_KEYS = ["wickd-kmz-boundary-v2", "wickd-kmz-file"];

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function syncCustomKmzToServer(fileName: string, fileData: ArrayBuffer) {
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([fileData], { type: DEFAULT_KMZ_MIME }),
    fileName
  );
  await fetch("/api/kmz/active", { method: "POST", body: formData });
}

async function clearServerKmz() {
  await fetch("/api/kmz/active", { method: "DELETE" });
}

export type KmzSourceMeta = {
  projectId: string;
  sourceUrl: string;
  uploadedAt: string | null;
};

export type KmzBoundary = {
  geojson: FeatureCollection;
  center: LatLng;
  featureCount: number;
  vertexCount: number;
  pinCount: number;
  labelCount: number;
  fileName: string;
  fileSize?: number;
  uploadedAt: string;
  isDefault?: boolean;
  /** Ties cached boundary to the project KMZ version that produced it */
  source?: KmzSourceMeta;
};

type KmzContextValue = {
  boundary: KmzBoundary | null;
  hasCustomUpload: boolean;
  /** Desktop: NetworkLink KML. Mobile handlers use openInGoogleEarth(). */
  googleEarthUrl: string;
  openInGoogleEarth: () => Promise<void>;
  uploadKmz: (parsed: ParsedKmz, fileData: ArrayBuffer, source?: KmzSourceMeta) => void;
  clearKmz: () => void;
};

const KmzContext = createContext<KmzContextValue | null>(null);

function parsedToBoundary(parsed: ParsedKmz, source?: KmzSourceMeta): KmzBoundary {
  return {
    geojson: parsed.geojson,
    center: parsed.center,
    featureCount: parsed.featureCount,
    vertexCount: parsed.vertexCount,
    pinCount: parsed.pinCount,
    labelCount: parsed.labelCount,
    fileName: parsed.fileName,
    fileSize: parsed.fileSize,
    uploadedAt: parsed.uploadedAt,
    isDefault: false,
    source,
  };
}

function migrateStored(data: unknown): KmzBoundary | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  if (d.geojson && typeof d.geojson === "object") {
    return d as KmzBoundary;
  }

  // Old custom format — discard and force re-upload
  if (d.polygons || d.lines || d.pins) {
    return null;
  }

  return null;
}

function clearLegacyStorage() {
  for (const key of LEGACY_STORAGE_KEYS) {
    sessionStorage.removeItem(key);
  }
}

export function KmzProvider({ children }: { children: ReactNode }) {
  const [boundary, setBoundary] = useState<KmzBoundary | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function hydrate() {
      try {
        clearLegacyStorage();
        const stored = sessionStorage.getItem(STORAGE_KEY);
        const storedFile = sessionStorage.getItem(FILE_STORAGE_KEY);

        if (stored) {
          const migrated = migrateStored(JSON.parse(stored));
          // Only restore when we know which project/version it came from.
          // ProjectKmzSync will replace it after portal data loads.
          if (migrated?.source?.projectId && migrated.source.sourceUrl) {
            setBoundary(migrated);
            if (!migrated.isDefault && storedFile) {
              await syncCustomKmzToServer(
                migrated.fileName,
                base64ToArrayBuffer(storedFile)
              );
            }
          } else {
            sessionStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(FILE_STORAGE_KEY);
            setBoundary(defaultKmzBoundary as unknown as KmzBoundary);
          }
        } else if (storedFile) {
          sessionStorage.removeItem(FILE_STORAGE_KEY);
          setBoundary(defaultKmzBoundary as unknown as KmzBoundary);
        } else {
          setBoundary(defaultKmzBoundary as unknown as KmzBoundary);
        }
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(FILE_STORAGE_KEY);
        await clearServerKmz();
        setBoundary(defaultKmzBoundary as unknown as KmzBoundary);
      }
      setIsReady(true);
    }

    void hydrate();
  }, []);

  const uploadKmz = useCallback(
    (parsed: ParsedKmz, fileData: ArrayBuffer, source?: KmzSourceMeta) => {
      const next = parsedToBoundary(parsed, source);
      setBoundary(next);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      sessionStorage.setItem(FILE_STORAGE_KEY, arrayBufferToBase64(fileData));
      void syncCustomKmzToServer(parsed.fileName, fileData);
    },
    []
  );

  const clearKmz = useCallback(() => {
    setBoundary(null);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(FILE_STORAGE_KEY);
    void clearServerKmz();
  }, []);

  const openInGoogleEarth = useCallback(async () => {
    if (!boundary) return;
    await launchGoogleEarth(boundary.center, boundary.fileName);
  }, [boundary]);

  const value = useMemo(
    () => ({
      boundary,
      hasCustomUpload: Boolean(boundary && !boundary.isDefault),
      googleEarthUrl: GOOGLE_EARTH_OPEN_URL,
      openInGoogleEarth,
      uploadKmz,
      clearKmz,
    }),
    [boundary, openInGoogleEarth, uploadKmz, clearKmz]
  );

  if (!isReady) return null;

  return <KmzContext.Provider value={value}>{children}</KmzContext.Provider>;
}

export function useKmz() {
  const ctx = useContext(KmzContext);
  if (!ctx) {
    throw new Error("useKmz must be used within KmzProvider");
  }
  return ctx;
}
