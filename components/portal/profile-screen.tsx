"use client";

import { Building2, LogOut, Mail, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useOptionalProject } from "@/contexts/project-context";
import { Card, InfoRow, SectionHeader } from "@/components/portal/shared";

export function ProfileScreen() {
  const { userEmail, logout } = useAuth();
  const projectCtx = useOptionalProject();
  const client = projectCtx?.client ?? null;
  const projects = projectCtx?.projects ?? [];
  const activeProject = projectCtx?.activeProject ?? null;

  const displayName = client?.name?.trim() || "Client user";
  const companyName = client?.companyName?.trim() || "—";
  const initial = (displayName[0] || userEmail[0] || "C").toUpperCase();

  return (
    <div className="pb-28 lg:pb-8 lg:max-w-xl lg:mx-auto">
      <div className="px-4 pt-6 pb-5">
        <h1 className="text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-sm text-white/40">Account details for this portal login</p>
      </div>

      <div className="px-4 space-y-4" data-demo="profile-card">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6633]/15 border border-[#FF6633]/25 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-[#FF6633]">{initial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-white truncate">{displayName}</p>
              <p className="text-xs text-white/40 truncate">{companyName}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader label="Account" />
          <div className="space-y-0">
            <div className="py-3 border-b border-white/5">
              <p className="text-xs font-semibold tracking-wide text-[#FF6633] uppercase mb-0.5">Name</p>
              <div className="flex items-center gap-2">
                <User size={14} className="text-white/30 flex-shrink-0" />
                <p className="text-sm text-white/90">{displayName}</p>
              </div>
            </div>
            <div className="py-3 border-b border-white/5">
              <p className="text-xs font-semibold tracking-wide text-[#FF6633] uppercase mb-0.5">Client</p>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-white/30 flex-shrink-0" />
                <p className="text-sm text-white/90">{companyName}</p>
              </div>
            </div>
            <div className="py-3">
              <p className="text-xs font-semibold tracking-wide text-[#FF6633] uppercase mb-0.5">Username</p>
              <div className="flex items-center gap-2 min-w-0">
                <Mail size={14} className="text-white/30 flex-shrink-0" />
                <p className="text-sm text-white/90 truncate">{userEmail || "—"}</p>
              </div>
            </div>
          </div>
        </Card>

        {(activeProject || projects.length > 0) && (
          <Card className="p-4">
            <SectionHeader label="Access" />
            {activeProject && (
              <InfoRow label="Active project" value={activeProject.name} />
            )}
            <InfoRow
              label="Assigned projects"
              value={
                projects.length > 0
                  ? projects.map((project) => project.name).join("\n")
                  : "None"
              }
            />
          </Card>
        )}

        <button
          type="button"
          onClick={() => void logout()}
          className="w-full flex items-center justify-center gap-2 bg-[#FF3B30]/12 hover:bg-[#FF3B30]/18 border border-[#FF3B30]/25 text-[#FF3B30] font-bold rounded-xl py-3.5 text-sm transition-colors active:scale-[0.98]"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}
