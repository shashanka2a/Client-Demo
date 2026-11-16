"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Camera, Search, X } from "lucide-react";
import { useProject } from "@/contexts/project-context";
import { useDemo } from "@/contexts/demo-context";
import type { PortalPhoto } from "@/lib/portal/types";

const CHIP_ORDER = [
  "Progress",
  "Wildlife",
  "Equipment",
  "Chemical",
  "Safety",
  "Weather",
  "General",
] as const;

export function GalleryScreen() {
  const { photos, activeProject } = useProject();
  const { currentStep, simulatedSearch, simulatedModalOpen } = useDemo();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState<PortalPhoto | null>(null);

  const effectiveFilter =
    currentStep?.id === "gallery-categories" || currentStep?.id === "gallery-2"
      ? "Progress"
      : activeFilter;
  const effectiveSearch =
    (currentStep?.id === "gallery-search" || currentStep?.id === "gallery-3") && simulatedSearch
      ? simulatedSearch
      : search;

  const chips = useMemo(() => {
    const categories = new Set(photos.map((photo) => photo.category));
    const ordered = CHIP_ORDER.filter((chip) => categories.has(chip));
    const custom = [...categories]
      .filter((chip) => !CHIP_ORDER.includes(chip as (typeof CHIP_ORDER)[number]))
      .sort((a, b) => a.localeCompare(b));
    return ["All", ...ordered, ...custom];
  }, [photos]);

  const filtered = photos.filter((p) => {
    const matchesFilter = effectiveFilter === "All" || p.category === effectiveFilter;
    const matchesSearch =
      effectiveSearch === "" ||
      p.caption.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(effectiveSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const effectiveLightbox =
    (currentStep?.id === "gallery-lightbox" || currentStep?.id === "gallery-4") && simulatedModalOpen
      ? filtered[0] ?? photos[0] ?? null
      : lightbox;

  if (!activeProject) return null;

  return (
    <div className="pb-28 lg:pb-8 lg:max-w-5xl lg:mx-auto">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xs font-bold tracking-[0.2em] text-[#FF6633] uppercase mb-1">Solar Site Photo Gallery</h1>
        <p className="text-xl font-bold text-white">{activeProject.name}</p>
      </div>

      <div className="px-4 mb-4" data-demo="gallery-search">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={effectiveSearch}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search photos by tag (e.g. Kudzu, Mowing, Inverter)"
            className="w-full bg-card border border-[#FF6633]/30 focus:border-[#FF6633]/70 rounded-xl py-3 pl-10 pr-10 text-sm text-white/80 placeholder-white/25 outline-none transition-colors"
          />
          {effectiveSearch && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }} data-demo="gallery-chips">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              effectiveFilter === chip
                ? "bg-[#FF6633] text-white"
                : "bg-secondary text-white/50 hover:text-white/80"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="px-4" data-demo="gallery-grid">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-white/25">
            <Camera size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No photos match this filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filtered.map((photo, index) => (
              <button
                key={photo.id}
                data-demo={index === 0 ? "gallery-first-photo" : undefined}
                onClick={() => setLightbox(photo)}
                className="relative aspect-square rounded-xl overflow-hidden bg-secondary group"
              >
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-[10px] text-white/90 line-clamp-2 leading-tight">{photo.caption}</p>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm text-[9px] font-bold text-[#FF6633] uppercase tracking-wide">
                    {photo.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {effectiveLightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X size={18} />
          </button>
          <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden max-h-[60vh]">
              <Image
                src={effectiveLightbox.src}
                alt={effectiveLightbox.caption}
                fill
                className="object-cover"
                sizes="800px"
              />
            </div>
            <div className="mt-4 px-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-[#FF6633]/20 text-[#FF6633] text-xs font-bold uppercase tracking-wide">
                  {effectiveLightbox.category}
                </span>
                <span className="text-xs text-white/35 font-mono">{effectiveLightbox.date}</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{effectiveLightbox.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
