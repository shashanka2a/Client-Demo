"use client";

import { useProject } from "@/contexts/project-context";
import { ChevronDown } from "lucide-react";

type ProjectSwitcherProps = {
  variant?: "inline" | "sidebar" | "mobile";
};

export function ProjectSwitcher({ variant = "inline" }: ProjectSwitcherProps) {
  const { projects, activeProject, setActiveProjectId } = useProject();

  if (projects.length <= 1 || !activeProject) return null;

  const isSidebar = variant === "sidebar";
  const isMobile = variant === "mobile";
  const showChips = variant === "inline";

  return (
    <div
      data-demo={isSidebar ? "nav-portfolio-switcher" : "project-switcher"}
      className={`${
        isSidebar
          ? "px-3 py-4 border-b border-white/6"
          : isMobile
            ? "px-4 pb-3"
            : "px-4 pt-2 pb-2 lg:px-0"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 block">
          Portfolio Asset
        </label>
      </div>

      {showChips && (
        <div className="flex flex-wrap gap-2 mb-2.5">
          {projects.map((project) => {
            const active = project.id === activeProject.id;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setActiveProjectId(project.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border ${
                  active
                    ? "bg-[#FF6633]/15 border-[#FF6633]/30 text-[#FF6633]"
                    : "bg-secondary border-white/8 text-white/55 hover:text-white/85"
                }`}
              >
                {project.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative z-20">
        <select
          value={activeProject.id}
          onChange={(e) => setActiveProjectId(e.target.value)}
          className="w-full appearance-none bg-secondary border border-white/8 rounded-xl px-3 py-2.5 pr-9 text-sm text-white/90 focus:border-[#FF6633]/50 focus:outline-none"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id} className="bg-[#141414]">
              {project.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        />
      </div>
    </div>
  );
}
