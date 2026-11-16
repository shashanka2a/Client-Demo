import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl, requireServiceRoleKey } from "@/lib/supabase/env";

export function createServiceClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const serviceRoleKey = requireServiceRoleKey();
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
