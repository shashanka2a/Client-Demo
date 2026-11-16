import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { KMZ_SESSION_COOKIE } from "@/lib/kmz-constants";
import { clearKmz, createSessionId, getKmz, saveKmz } from "@/lib/kmz-session-store";
import { getActiveKmzResponse } from "@/lib/kmz-serve";

export async function GET() {
  return getActiveKmzResponse();
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing KMZ file" }, { status: 400 });
  }

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(KMZ_SESSION_COOKIE)?.value;
  if (!sessionId) sessionId = createSessionId();

  const buffer = Buffer.from(await file.arrayBuffer());
  saveKmz(sessionId, buffer, file.name || "boundary.kmz");

  const response = NextResponse.json({ ok: true, sessionId });
  response.cookies.set(KMZ_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}

export async function DELETE() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(KMZ_SESSION_COOKIE)?.value;
  if (sessionId) clearKmz(sessionId);

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(KMZ_SESSION_COOKIE);
  return response;
}
