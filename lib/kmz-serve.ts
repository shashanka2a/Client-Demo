import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  DEFAULT_KMZ_MIME,
  KMZ_SESSION_COOKIE,
} from "@/lib/kmz-constants";
import { getKmz } from "@/lib/kmz-session-store";

/** Serve the active KMZ (custom upload or project default). */
export async function getActiveKmzResponse(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(KMZ_SESSION_COOKIE)?.value;

  if (sessionId) {
    const stored = getKmz(sessionId);
    if (stored) {
      return new NextResponse(new Uint8Array(stored.data), {
        headers: {
          "Content-Type": DEFAULT_KMZ_MIME,
          "Content-Disposition": `inline; filename="${stored.fileName}"`,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      });
    }
  }

  // Fallback to default KMZ file from project root
  const rootKmzCandidates = [
    path.join(process.cwd(), "WICKD_Tupelo Panel Mapping.kmz"),
    path.join(process.cwd(), "public", "WICKD_Tupelo-Panel-Mapping.kmz"),
  ];
  for (const filePath of rootKmzCandidates) {
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": DEFAULT_KMZ_MIME,
          "Content-Disposition": `inline; filename="${path.basename(filePath)}"`,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  }

  return NextResponse.json({ error: "KMZ not found" }, { status: 404 });
}
