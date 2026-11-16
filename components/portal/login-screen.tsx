"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle, ArrowRight, Eye, EyeOff, Lock, Play, User,
} from "lucide-react";
import { HERO_IMAGE } from "@/lib/data";
import { useAuth } from "@/contexts/auth-context";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

export function LoginScreen() {
  const { login, loginAsDemo } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { usernameRef.current?.focus(); }, []);

  const isSetup = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("setup") === "1";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSetupDone(false);

    try {
      if (isSetup) {
        if (!hasSupabaseConfig()) {
          throw new Error("Supabase is not configured for this deployment.");
        }
        const next = password.trim();
        if (next.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }
        if (next !== confirmPassword.trim()) {
          throw new Error("Passwords do not match.");
        }

        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({ password: next });
        if (updateError) throw updateError;

        setSetupDone(true);
        router.replace("/portal/overview");
        return;
      }

      const result = await login(username, password);
      if (result.error) throw new Error(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative flex-1 flex flex-col">
        <div className="relative h-56 md:h-72 overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt="Solar site aerial"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0D0D0D]" />

          <div className="absolute top-0 inset-x-0 flex items-center justify-center pt-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
                <Image
                  src="/icon.png"
                  alt="Wick'd Environmental"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg tracking-tight leading-tight">Wick&apos;d Environmental</p>
                <p className="text-white/40 text-xs tracking-widest uppercase font-medium">Technologies</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-5 -mt-6 relative z-10 pb-12 flex flex-col max-w-sm mx-auto w-full">
          <div
            className={`bg-card rounded-2xl border border-white/8 p-6 shadow-2xl transition-transform ${shake ? "animate-[shake_0.4s_ease]" : ""}`}
          >
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white mb-1">
                {isSetup ? "Set your password" : "Client Portal"}
              </h1>
              <p className="text-sm text-white/40">
                {isSetup ? "Finish account setup to access your portal" : "Sign in to view your project dashboard"}
              </p>
            </div>

            {setupDone && (
              <div className="mb-4 rounded-xl bg-[#34C759]/10 border border-[#34C759]/20 px-3 py-2.5">
                <p className="text-xs text-[#34C759]/90">Password updated. Redirecting…</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isSetup && (
                <div>
                  <label className="text-xs font-semibold text-[#FF6633] uppercase tracking-wide block mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      ref={usernameRef}
                      type="email"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(""); }}
                      placeholder="you@company.com"
                      autoComplete="email"
                      className="w-full bg-secondary rounded-xl pl-10 pr-4 py-3 text-sm text-white/90 placeholder-white/20 border border-white/8 focus:border-[#FF6633]/60 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#FF6633] uppercase tracking-wide block mb-1.5">
                  {isSetup ? "New password" : "Password"}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder={isSetup ? "Choose a strong password" : "••••••••"}
                    autoComplete={isSetup ? "new-password" : "current-password"}
                    className="w-full bg-secondary rounded-xl pl-10 pr-10 py-3 text-sm text-white/90 placeholder-white/20 border border-white/8 focus:border-[#FF6633]/60 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {isSetup && (
                <div>
                  <label className="text-xs font-semibold text-[#FF6633] uppercase tracking-wide block mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      className="w-full bg-secondary rounded-xl pl-10 pr-4 py-3 text-sm text-white/90 placeholder-white/20 border border-white/8 focus:border-[#FF6633]/60 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} className="text-[#FF3B30] flex-shrink-0" />
                  <p className="text-xs text-[#FF3B30]">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  !password ||
                  (isSetup ? !confirmPassword : !username)
                }
                className="w-full bg-[#FF6633] hover:bg-[#FF7A4D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isSetup ? "Updating password…" : "Signing in…"}
                  </span>
                ) : (
                  <>
                    {isSetup ? "Set Password" : "Sign In"}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {!isSetup && (
              <div className="mt-5 pt-5 border-t border-white/8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-[#FF6633] uppercase">
                    Interactive Demo
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#34C759]/15 text-[#34C759]">
                    Ready to Explore
                  </span>
                </div>
                <button
                  type="button"
                  onClick={loginAsDemo}
                  className="w-full group relative overflow-hidden bg-[#FF6633] hover:bg-[#FF7A4D] text-white font-bold rounded-xl py-3 px-4 text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6633]/20 active:scale-[0.98]"
                >
                  <Play size={12} className="fill-white" />
                  <span>Explore Interactive Client Demo</span>
                  <ArrowRight size={13} className="text-white/80 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <div className="flex items-center justify-between text-[11px] text-white/40 pt-1">
                  <span>Quick demo login:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername("demo@meridianenergy.com");
                      setPassword("demoportal");
                      setError("");
                    }}
                    className="text-[#FF6633] hover:text-[#FF8533] underline font-mono text-[10px] transition-colors"
                  >
                    Auto-fill demo credentials
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-white/20 mt-6">
            Need access? Contact{" "}
            <a href="mailto:m.webb@wickdenvironmental.com" className="text-white/35 hover:text-white/60 underline transition-colors">
              your Wick&apos;d project manager
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
