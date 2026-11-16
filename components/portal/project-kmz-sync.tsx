"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useOptionalProject } from "@/contexts/project-context";
import { useKmz } from "@/contexts/kmz-context";
import { parseKmzFile } from "@/lib/kmz-parser";

function cacheBustedUrl(url: string, uploadedAt: string | null | undefined): string {
  const stamp = uploadedAt?.trim() || String(Date.now());
  const joiner = url.includes("?") ? "&" : "?";
  return `${url}${joiner}v=${encodeURIComponent(stamp)}`;
}

/** Loads the active project's KMZ from the DB (`projects.kmz_url`). */
export function ProjectKmzSync() {
  const pathname = usePathname();
  const projectCtx = useOptionalProject();
  const { uploadKmz, clearKmz } = useKmz();
  const requestId = useRef(0);

  useEffect(() => {
    const activeProject = projectCtx?.activeProject;
    if (!activeProject) return;

    const { id: projectId, kmzUrl, kmzFilename, kmzUploadedAt } = activeProject;

    if (!kmzUrl) {
      clearKmz();
      return;
    }

    const currentRequest = ++requestId.current;
    let cancelled = false;

    async function loadProjectKmz() {
      try {
        // On Map visits, also bust with Date.now so CDN/browser can't reuse bytes.
        const stamp =
          pathname === "/portal/map"
            ? `${kmzUploadedAt ?? "na"}-${Date.now()}`
            : kmzUploadedAt;
        const response = await fetch(cacheBustedUrl(kmzUrl!, stamp), {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Failed to fetch project KMZ (${response.status})`);
        const buffer = await response.arrayBuffer();
        const fileName = kmzFilename || "project-boundary.kmz";
        const file = new File([buffer], fileName, {
          type: "application/vnd.google-earth.kmz",
        });
        const parsed = await parseKmzFile(file);
        if (cancelled || currentRequest !== requestId.current) return;
        uploadKmz(parsed, buffer, {
          projectId,
          sourceUrl: kmzUrl!,
          uploadedAt: kmzUploadedAt,
        });
      } catch (err) {
        console.error(`[ProjectKmzSync] failed for project ${projectId}:`, err);
        if (!cancelled && currentRequest === requestId.current) clearKmz();
      }
    }

    void loadProjectKmz();

    return () => {
      cancelled = true;
    };
  }, [
    pathname,
    projectCtx?.activeProject?.id,
    projectCtx?.activeProject?.kmzUrl,
    projectCtx?.activeProject?.kmzFilename,
    projectCtx?.activeProject?.kmzUploadedAt,
    uploadKmz,
    clearKmz,
  ]);

  return null;
}
