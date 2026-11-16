import { cookies } from "next/headers";
import { KMZ_SESSION_COOKIE } from "@/lib/kmz-constants";
import { getKmz } from "@/lib/kmz-session-store";
import { getRequestOrigin } from "@/lib/request-origin";

export async function GET(request: Request) {
  const origin = getRequestOrigin(request);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(KMZ_SESSION_COOKIE)?.value;
  const hasCustom = sessionId ? Boolean(getKmz(sessionId)) : false;

  const kmzUrl = `${origin}/api/boundary.kmz`;
  const title = hasCustom ? "Site Boundary" : "Project Boundary";

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${title}</name>
    <NetworkLink>
      <name>${title}</name>
      <flyToView>1</flyToView>
      <Link>
        <href>${kmzUrl}</href>
      </Link>
    </NetworkLink>
  </Document>
</kml>`;

  return new Response(kml, {
    headers: {
      "Content-Type": "application/vnd.google-earth.kml+xml",
      "Content-Disposition": 'inline; filename="wickd-site-boundary.kml"',
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}
