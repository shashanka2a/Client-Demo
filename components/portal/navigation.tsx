"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User, Home, Map, Activity, Image as ImageIcon, FileText,
} from "lucide-react";
import { ProjectSwitcher } from "@/components/portal/project-switcher";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";

const NAV_TABS = [
  { href: "/portal/overview", icon: Home, label: "Overview" },
  { href: "/portal/map", icon: Map, label: "Map" },
  { href: "/portal/health", icon: Activity, label: "Health" },
  { href: "/portal/gallery", icon: ImageIcon, label: "Photos" },
  { href: "/portal/reports", icon: FileText, label: "Reports" },
  { href: "/portal/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414]/95 backdrop-blur-xl border-t border-white/8 lg:hidden">
      <div
        className="flex justify-around items-center px-2 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
      >
        {NAV_TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              data-demo={`bottom-nav-${label.toLowerCase()}`}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all duration-200 relative ${
                active ? "text-[#FF6633]" : "text-white/35 hover:text-white/60"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
              <span className="text-[9px] font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const { userEmail } = useAuth();
  const { client } = useProject();
  const desktopTabs = NAV_TABS.filter((tab) => tab.href !== "/portal/profile");

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-[#141414] border-r border-white/8 z-40">
      <div className="px-5 pt-7 pb-6 border-b border-white/6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10">
            <Image
              src="/icon.png"
              alt="Wick'd Environmental"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white leading-tight tracking-tight">Wick&apos;d Environmental</p>
            <p className="text-[9px] text-white/30 tracking-widest uppercase font-medium">Technologies</p>
          </div>
        </div>
      </div>

      <ProjectSwitcher variant="sidebar" />

      <nav className="flex-1 px-3 py-4 space-y-1">
        {desktopTabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              data-demo={`nav-${label.toLowerCase()}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                active
                  ? "bg-[#FF6633]/12 text-[#FF6633] border border-[#FF6633]/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/4 border border-transparent"
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.7} />
              <span>{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF6633]" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 border-t border-white/6 pt-4">
        <Link
          href="/portal/profile"
          data-demo="nav-profile"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 ${
            pathname === "/portal/profile"
              ? "bg-[#FF6633]/12 border border-[#FF6633]/20"
              : "hover:bg-white/4 border border-transparent"
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[#FF6633]/15 border border-[#FF6633]/25 flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-[#FF6633]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/60 font-medium truncate">{client?.companyName ?? userEmail}</p>
            <p className="text-[10px] text-white/30 truncate">View profile</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

export function MobilePortalHeader() {
  const pathname = usePathname();
  const { projects } = useProject();
  const showSwitcher = projects.length > 1 && pathname !== "/portal/profile";

  return (
    <div className="lg:hidden border-b border-white/8 bg-[#141414]">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/10">
            <Image
              src="/icon.png"
              alt="Wick'd Environmental"
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white leading-tight">Wick&apos;d Environmental</p>
            <p className="text-[9px] text-white/30 tracking-widest uppercase">Technologies</p>
          </div>
        </div>
      </div>
      {showSwitcher && <ProjectSwitcher variant="mobile" />}
    </div>
  );
}
