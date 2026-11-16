"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronRight, Clock, X } from "lucide-react";
import { useProject } from "@/contexts/project-context";
import type {
  PortalObservation,
  PortalObservationPhoto,
} from "@/lib/portal/types";
import { EmptyState, StatusBadge } from "@/components/portal/shared";
import { useDemo } from "@/contexts/demo-context";

function ObservationCard({
  item,
  expanded,
  onToggle,
  onPhotoClick,
}: {
  item: PortalObservation;
  expanded: boolean;
  onToggle: () => void;
  onPhotoClick: (photo: PortalObservationPhoto) => void;
}) {
  const meta = [
    item.location !== "—" ? item.location : null,
    item.date !== "—" ? item.date : null,
    item.dueDate !== "—" ? `Due ${item.dueDate}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const shortDescription = (() => {
    const text = item.description.trim();
    if (!text) return null;
    if (item.tags.length > 0) return null;
    if (/^(scale & density|physical traits|behavior & threat|visibility & access)\s*:/i.test(text)) {
      return null;
    }
    const firstLine = text.split("\n").map((line) => line.trim()).find(Boolean) ?? "";
    return firstLine.length > 120 ? `${firstLine.slice(0, 117)}…` : firstLine || null;
  })();

  const fullDescription = (() => {
    const text = item.description.trim();
    if (!text) return null;
    if (item.tags.length > 0) return null;
    if (/^(scale & density|physical traits|behavior & threat|visibility & access)\s*:/i.test(text)) {
      return null;
    }
    return text;
  })();

  const hasExpandableContent =
    item.photos.length > 0 || item.history.length > 0 || Boolean(fullDescription);

  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={!hasExpandableContent}
          className="flex-1 min-w-0 text-left disabled:cursor-default"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white/90 leading-snug">{item.title}</p>
              {shortDescription ? (
                <p className="text-xs text-white/55 mt-1.5 leading-relaxed line-clamp-2">
                  {shortDescription}
                </p>
              ) : null}
              {meta ? (
                <p className="text-[11px] text-white/35 font-mono mt-1.5 truncate">{meta}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <StatusBadge status={item.status} />
              {item.progress !== "—" && (
                <span className="px-2 py-0.5 rounded-md bg-white/6 text-[10px] font-semibold text-white/45">
                  {item.progress}
                </span>
              )}
            </div>
          </div>
        </button>

        {hasExpandableContent ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse observation details" : "Show photos and history"}
            className="mt-0.5 w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/45 hover:text-white/80 hover:bg-white/8 transition-colors flex-shrink-0"
          >
            <ChevronRight
              size={16}
              className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        ) : null}
      </div>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className="inline-flex px-2 py-0.5 rounded-md bg-[#FF6633]/12 text-[10px] font-semibold text-[#FF6633] uppercase tracking-wide">
          {item.observationType}
        </span>
        {item.sentiment && (
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${
              item.sentiment.toLowerCase() === "positive"
                ? "bg-[#34C759]/12 text-[#34C759]"
                : "bg-[#FF3B30]/12 text-[#FF3B30]"
            }`}
          >
            {item.sentiment}
          </span>
        )}
        {item.attachmentCount > 0 && (
          <span className="inline-flex px-2 py-0.5 rounded-md bg-white/6 text-[10px] font-semibold text-white/40">
            {item.attachmentCount} photo{item.attachmentCount === 1 ? "" : "s"}
          </span>
        )}
        {item.tags.slice(0, 6).map((tag) => (
          <span
            key={tag}
            className="inline-flex px-2 py-0.5 rounded-md bg-white/6 text-[10px] font-medium text-white/35"
          >
            {tag}
          </span>
        ))}
        {item.tags.length > 6 && (
          <span className="text-[10px] text-white/30">+{item.tags.length - 6} more</span>
        )}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/6 space-y-4">
          {fullDescription ? (
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/35 mb-1.5">
                Notes
              </p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {fullDescription}
              </p>
            </div>
          ) : null}

          {item.photos.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/35 mb-2">
                Photos
              </p>
              <div className="grid grid-cols-3 gap-2">
                {item.photos.map((photo, pIndex) => (
                  <button
                    key={photo.id}
                    type="button"
                    data-demo={pIndex === 0 ? "observation-photo" : undefined}
                    onClick={() => onPhotoClick(photo)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-white/8 bg-secondary group"
                  >
                    <Image
                      src={photo.url}
                      alt={photo.label}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                      sizes="120px"
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/55 text-[9px] font-semibold text-white/80">
                      {photo.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {item.history.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/35 mb-2">
                History
              </p>
              <ul className="space-y-2">
                {item.history.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start gap-2.5 rounded-lg bg-white/4 px-3 py-2"
                  >
                    <Clock size={13} className="text-white/30 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white/80">{entry.label}</p>
                      <p className="text-[11px] text-white/35 mt-0.5">
                        {entry.date}
                        {entry.detail ? ` · ${entry.detail}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-white/30">No history recorded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

type HealthTab = "open" | "resolved";

function groupByType(items: PortalObservation[]) {
  const map = new Map<string, PortalObservation[]>();
  for (const item of items) {
    const key = item.observationType || "Other";
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function HealthScreen() {
  const { observations, activeProject } = useProject();
  const { currentStep, simulatedExpanded, simulatedTab, simulatedModalOpen } = useDemo();
  const [activeTab, setActiveTab] = useState<HealthTab>("open");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<PortalObservationPhoto | null>(null);

  const effectiveTab = currentStep?.id === "health-2" ? simulatedTab : activeTab;

  const openItems = useMemo(
    () => observations.filter((o) => o.status.toLowerCase() !== "resolved"),
    [observations]
  );
  const resolvedItems = useMemo(
    () => observations.filter((o) => o.status.toLowerCase() === "resolved"),
    [observations]
  );

  const activeItems = effectiveTab === "open" ? openItems : resolvedItems;
  const typeGroups = useMemo(() => groupByType(activeItems), [activeItems]);

  const effectiveExpandedId =
    (currentStep?.id === "health-audit" ||
      currentStep?.id === "health-proof" ||
      currentStep?.id === "health-3") &&
    (simulatedExpanded || currentStep?.id === "health-proof")
      ? openItems[0]?.id ?? "obs-1"
      : expandedId;

  const effectiveLightbox =
    (currentStep?.id === "health-proof" || currentStep?.id === "health-4") && simulatedModalOpen
      ? openItems[0]?.photos[0] ?? null
      : lightbox;

  if (!activeProject) return null;

  const emptyMessage =
    effectiveTab === "open"
      ? "No open items — site looking good"
      : "No resolved items yet";

  return (
    <div className="pb-28 lg:pb-8 lg:max-w-3xl lg:mx-auto">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Site Health Watchlist</h1>
        <p className="text-sm text-white/40">{activeProject.name}</p>
      </div>

      <div className="px-4 mb-5 flex gap-2" data-demo="health-tabs">
        {(
          [
            { key: "open" as const, label: "Open", count: openItems.length },
            { key: "resolved" as const, label: "Resolved", count: resolvedItems.length },
          ] as const
        ).map((tab) => {
          const selected = effectiveTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              data-demo={tab.key === "resolved" ? "health-tab-resolved" : undefined}
              onClick={() => {
                setActiveTab(tab.key);
                setExpandedId(null);
              }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors border ${
                selected
                  ? tab.key === "open"
                    ? "bg-[#FF6633] text-white border-[#FF6633]"
                    : "bg-[#34C759] text-white border-[#34C759]"
                  : "bg-card text-white/50 border-white/8 hover:text-white/75"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-xs font-mono ${
                  selected ? "text-white/80" : "text-white/30"
                }`}
              >
                ({tab.count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-4 space-y-5">
        {typeGroups.map(([type, items]) => (
          <div key={type}>
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  activeTab === "open" ? "bg-[#FF6633]" : "bg-[#34C759]"
                }`}
              />
              <span
                className={`text-xs font-bold uppercase tracking-widest ${
                  activeTab === "open" ? "text-[#FF6633]" : "text-[#34C759]"
                }`}
              >
                {type}
              </span>
              <span className="text-xs text-white/20 font-mono ml-auto">{items.length}</span>
            </div>

            <div
              className={`rounded-2xl border border-white/8 bg-card divide-y divide-white/5 overflow-hidden ${
                activeTab === "resolved" ? "opacity-85" : ""
              }`}
            >
              {items.map((item, index) => (
                <div key={item.id} data-demo={index === 0 ? "observation-card-first" : undefined}>
                  <ObservationCard
                    item={item}
                    expanded={effectiveExpandedId === item.id}
                    onToggle={() =>
                      setExpandedId((current) => (current === item.id ? null : item.id))
                    }
                    onPhotoClick={setLightbox}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {activeItems.length === 0 && <EmptyState message={emptyMessage} />}

        <p className="text-xs text-white/20 pb-4">
          Observations logged by Wick&apos;d field team. Contact your project manager for details.
        </p>
      </div>

      {effectiveLightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X size={18} />
          </button>
          <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden max-h-[60vh]">
              <Image
                src={effectiveLightbox.url}
                alt={effectiveLightbox.label}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
            <p className="text-center text-sm text-white/70 mt-4">{effectiveLightbox.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}
