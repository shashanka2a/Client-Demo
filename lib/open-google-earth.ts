import type { LatLng } from "@/lib/kmz-parser";
import {
  DEFAULT_KMZ_MIME,
  GOOGLE_EARTH_OPEN_URL,
  KMZ_ACTIVE_URL,
} from "@/lib/kmz-constants";

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobileDevice(): boolean {
  return isAndroid() || isIOS() || /Mobile/i.test(navigator.userAgent);
}

function buildEarthWebUrl(center: LatLng): string {
  const [lat, lng] = center;
  return `https://earth.google.com/web/@${lat},${lng},300a,2500d,35y,0h,0t,0r`;
}

function absoluteKmzUrl(): string {
  return `${window.location.origin}${KMZ_ACTIVE_URL}`;
}

async function tryShareKmz(fileName: string): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    const res = await fetch(KMZ_ACTIVE_URL);
    if (!res.ok) return false;

    const blob = await res.blob();
    const file = new File([blob], fileName, { type: DEFAULT_KMZ_MIME });

    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      return false;
    }

    await navigator.share({ files: [file], title: fileName });
    return true;
  } catch {
    return false;
  }
}

function openAndroidKmz(kmzUrl: string, fallbackUrl: string) {
  const path = kmzUrl.replace(/^https?:\/\//, "");
  const intentUrl =
    `intent://${path}#Intent;` +
    "scheme=https;action=android.intent.action.VIEW;" +
    `type=${encodeURIComponent(DEFAULT_KMZ_MIME)};` +
    `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;

  window.location.href = intentUrl;
}

function openDesktopEarth() {
  window.open(
    `${window.location.origin}${GOOGLE_EARTH_OPEN_URL}`,
    "_blank",
    "noopener,noreferrer"
  );
}

/** Open the active KMZ in Google Earth — desktop uses NetworkLink KML; mobile uses app/share. */
export async function openInGoogleEarth(center: LatLng, fileName: string): Promise<void> {
  if (!isMobileDevice()) {
    openDesktopEarth();
    return;
  }

  const kmzUrl = absoluteKmzUrl();
  const earthWebUrl = buildEarthWebUrl(center);

  if (await tryShareKmz(fileName)) return;

  if (isAndroid()) {
    openAndroidKmz(kmzUrl, earthWebUrl);
    return;
  }

  if (isIOS()) {
    // Safari prompts to open KMZ in Google Earth when MIME type is recognized.
    window.location.assign(kmzUrl);
    return;
  }

  window.open(earthWebUrl, "_blank", "noopener,noreferrer");
}
