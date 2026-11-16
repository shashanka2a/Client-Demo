"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Session, User, SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import {
  activateDemoSession,
  deactivateDemoSession,
  isDemoSessionActive,
} from "@/lib/demo-data";

export const DEMO_USER: User = {
  id: "demo-client-user-001",
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Sarah Jenkins", role: "client" },
  aud: "authenticated",
  confirmation_sent_at: "2025-01-01T00:00:00Z",
  recovery_sent_at: "",
  email_change_sent_at: "",
  new_email: "",
  invited_at: "",
  action_link: "",
  email: "demo@meridianenergy.com",
  phone: "",
  created_at: "2025-01-01T00:00:00Z",
  confirmed_at: "2025-01-01T00:00:00Z",
  email_confirmed_at: "2025-01-01T00:00:00Z",
  phone_confirmed_at: "",
  last_sign_in_at: new Date().toISOString(),
  role: "authenticated",
  updated_at: new Date().toISOString(),
  identities: [],
  is_anonymous: false,
} as unknown as User;

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  userEmail: string;
  isAuthenticated: boolean;
  isReady: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabaseRef = useRef<SupabaseClient | null>(null);

  const getSupabase = useCallback(() => {
    if (!hasSupabaseConfig()) return null;
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }, []);

  useEffect(() => {
    // Check if demo session is active
    if (isDemoSessionActive()) {
      setUser(DEMO_USER);
      setIsDemo(true);
      setIsReady(true);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      // Default to demo mode if no supabase configuration is provided
      activateDemoSession();
      setUser(DEMO_USER);
      setIsDemo(true);
      setIsReady(true);
      return;
    }

    let mounted = true;

    async function init() {
      const { data } = await supabase!.auth.getSession();
      if (!mounted) return;
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsDemo(false);
      } else {
        // Fallback to demo mode if requested or no active session
        if (isDemoSessionActive()) {
          setUser(DEMO_USER);
          setIsDemo(true);
        } else {
          setUser(null);
          setIsDemo(false);
        }
      }
      setIsReady(true);
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession) {
        setSession(nextSession);
        setUser(nextSession.user);
        setIsDemo(false);
      }
      setIsReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [getSupabase]);

  useEffect(() => {
    if (!isReady) return;

    const isLoginPage = pathname === "/";
    const isProtected = pathname.startsWith("/portal");
    const isSetupFlow =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("setup") === "1";

    if (!user && isProtected) {
      router.replace("/");
    } else if (user && isLoginPage && !isSetupFlow) {
      router.replace("/portal/overview");
    }
  }, [isReady, user, pathname, router]);

  const loginAsDemo = useCallback(() => {
    activateDemoSession();
    setUser(DEMO_USER);
    setIsDemo(true);
    router.push("/portal/overview");
  }, [router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPass = password.trim();

      // Check for demo credentials or demo trigger
      if (
        trimmedEmail.includes("demo") ||
        trimmedPass.includes("demo") ||
        !hasSupabaseConfig()
      ) {
        activateDemoSession();
        setUser(DEMO_USER);
        setIsDemo(true);
        router.push("/portal/overview");
        return {};
      }

      const supabase = getSupabase();
      if (!supabase) {
        activateDemoSession();
        setUser(DEMO_USER);
        setIsDemo(true);
        router.push("/portal/overview");
        return {};
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        return { error: "Incorrect email or password. Please try again." };
      }

      deactivateDemoSession();
      setIsDemo(false);
      router.push("/portal/overview");
      return {};
    },
    [router, getSupabase]
  );

  const logout = useCallback(async () => {
    deactivateDemoSession();
    setUser(null);
    setSession(null);
    setIsDemo(false);
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    router.push("/");
  }, [router, getSupabase]);

  const value = useMemo(
    () => ({
      user,
      session,
      userEmail: user?.email ?? "",
      isAuthenticated: !!user,
      isReady,
      isDemo,
      login,
      loginAsDemo,
      logout,
    }),
    [user, session, isReady, isDemo, login, loginAsDemo, logout]
  );

  if (!isReady) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
