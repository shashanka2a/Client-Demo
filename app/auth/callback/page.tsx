"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

function parseFragment(fragment: string): URLSearchParams {
  const raw = fragment.startsWith("#") ? fragment.slice(1) : fragment;
  return new URLSearchParams(raw);
}

function getAuthTypeFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const hashParams = parseFragment(window.location.hash);
  return params.get("type") ?? hashParams.get("type");
}

function getCodeFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

function getTokensFromHash(): { access_token: string; refresh_token: string } | null {
  if (typeof window === "undefined") return null;
  const hashParams = parseFragment(window.location.hash);
  const access_token = hashParams.get("access_token");
  const refresh_token = hashParams.get("refresh_token");
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const type = useMemo(() => getAuthTypeFromUrl(), []);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setError("Supabase is not configured for this deployment.");
      return;
    }

    const supabase = createClient();

    async function finishAuth() {
      try {
        let session: Session | null = null;

        const code = getCodeFromUrl();
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          session = data.session;
        } else {
          const tokens = getTokensFromHash();
          if (tokens) {
            const { data, error: setSessionError } = await supabase.auth.setSession(tokens);
            if (setSessionError) throw setSessionError;
            session = data.session;
          } else {
            const { data } = await supabase.auth.getSession();
            session = data.session;
          }
        }

        if (!session) {
          throw new Error("Unable to complete sign-in. Please try again.");
        }

        if (type === "invite" || type === "recovery") {
          router.replace("/?setup=1");
          return;
        }

        router.replace("/portal/overview");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to complete sign-in.");
      }
    }

    void finishAuth();
  }, [router, type]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-10 h-10 border-2 border-[#FF6633]/30 border-t-[#FF6633] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-white mb-1">Finishing sign-in…</p>
        {error && <p className="text-xs text-white/40 mt-2">{error}</p>}
      </div>
    </div>
  );
}

