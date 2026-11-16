import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEMO_COOKIE_NAME, DEMO_PORTAL_DATA } from "@/lib/demo-data";
import { loadPortalDataForAuthUser } from "@/lib/portal/load-portal-data";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get(DEMO_COOKIE_NAME)?.value === "true";

  if (!hasSupabaseConfig() || isDemo) {
    return NextResponse.json(DEMO_PORTAL_DATA);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // In demo mode or public demonstration, fallback to demo portal data
      return NextResponse.json(DEMO_PORTAL_DATA);
    }

    const service = createServiceClient();
    const data = await loadPortalDataForAuthUser(service, user.id, user.email);
    return NextResponse.json(data);
  } catch (error) {
    console.warn("[portal/data] Supabase load error, serving demo data fallback:", error);
    return NextResponse.json(DEMO_PORTAL_DATA);
  }
}
