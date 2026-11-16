"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";

export function PortalProjectGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isLoading, error, projects } = useProject();
  const isProfile = pathname === "/portal/profile";

  // Profile (and Sign out) must stay reachable even when project data fails.
  if (isProfile) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FF6633]/30 border-t-[#FF6633] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-white/50">Loading your projects…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="text-sm font-semibold text-white mb-2">Unable to load projects</p>
          <p className="text-xs text-white/40 mb-5">{error}</p>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary border border-white/10 text-white/60 hover:text-white/85 text-xs font-medium transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="text-sm font-semibold text-white mb-2">No portal projects yet</p>
          <p className="text-xs text-white/40 mb-5">
            Your account is active, but no projects have client portal access enabled.
          </p>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary border border-white/10 text-white/60 hover:text-white/85 text-xs font-medium transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
