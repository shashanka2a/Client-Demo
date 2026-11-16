"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Sun, Phone, Mail, ChevronDown, CheckCircle2, ArrowRight,
  Droplets, Zap, Scissors,
} from "lucide-react";
import { useProject } from "@/contexts/project-context";
import type { TimelineIconName } from "@/lib/portal/types";
import { Card, SectionHeader, StatusPill, InfoRow } from "@/components/portal/shared";
import { useDemo } from "@/contexts/demo-context";

const TIMELINE_ICONS = {
  droplets: Droplets,
  zap: Zap,
  scissors: Scissors,
} satisfies Record<TimelineIconName, typeof Droplets>;

export function OverviewScreen() {
  const { activeProject, heroImage, timeline } = useProject();
  const { simulatedExpanded, currentStep, cursorText } = useDemo();
  const [requestText, setRequestText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [infoExpanded, setInfoExpanded] = useState(false);

  const isExpanded =
    infoExpanded ||
    ((currentStep?.id === "overview-kpis" || currentStep?.id === "overview-2") && simulatedExpanded);
  const isTyping =
    currentStep?.id === "overview-inquiry" || currentStep?.id === "overview-4";
  const displayRequestText = isTyping ? (cursorText || requestText) : requestText;
  const isSimulatedSubmitted = isTyping && cursorText.length > 30;
  const hasSubmitted = submitted || isSimulatedSubmitted;

  async function submitRequest() {
    const message = requestText.trim();
    if (!message || !activeProject || submitting) return;

    setSubmitting(true);
    setRequestError(null);
    try {
      const res = await fetch("/api/portal/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id, message }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to send request.");
      }
      setSubmitted(true);
      setRequestText("");
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Failed to send request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!activeProject) return null;

  return (
    <div className="pb-28 lg:pb-8 lg:max-w-4xl lg:mx-auto">
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
        <Image
          src={heroImage}
          alt={`${activeProject.name} aerial view`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 800px"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0D0D0D]" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
            <Sun size={16} className="text-[#FF6633]" />
            <span className="text-xs font-bold tracking-widest text-white uppercase">Wick&apos;d Environmental</span>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
            <span className="text-xs text-white/60 font-mono">{activeProject.jobNumber}</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-10" data-demo="project-header">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white leading-tight mb-2">{activeProject.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusPill status={activeProject.status} />
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FF6633]/15 flex items-center justify-center flex-shrink-0 border border-[#FF6633]/20">
              <Sun size={22} className="text-[#FF6633]" />
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <Card className="overflow-hidden" data-demo="general-info-toggle">
          <button
            onClick={() => setInfoExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/3 transition-colors"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-[#FF6633]">General Information</span>
            <ChevronDown
              size={16}
              className={`text-white/30 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
          {isExpanded && (
            <div className="px-4 pb-4 border-t border-white/5">
              <InfoRow label="Client" value={activeProject.clientName} />
              <InfoRow label="Project Address" value={activeProject.address} />
              <InfoRow label="Contract / PO #" value={activeProject.jobNumber} mono />
              <InfoRow label="Contract Expiration" value={activeProject.contractExpiration} />
              <div className="py-3 border-b border-white/5">
                <p className="text-xs font-semibold tracking-wide text-[#FF6633] uppercase mb-1">Wick&apos;d Contact</p>
                <p className="text-sm text-white/90 mb-1">{activeProject.contactName}</p>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  <a href={`tel:${activeProject.contactPhone}`} className="flex items-center gap-1.5 text-xs text-[#FF6633] hover:opacity-80 transition-opacity">
                    <Phone size={12} />{activeProject.contactPhone}
                  </a>
                  <a href={`mailto:${activeProject.contactEmail}`} className="flex items-center gap-1.5 text-xs text-[#FF6633] hover:opacity-80 transition-opacity">
                    <Mail size={12} />{activeProject.contactEmail}
                  </a>
                </div>
              </div>
              <div className="py-3">
                <p className="text-xs font-semibold tracking-wide text-[#FF6633] uppercase mb-1">Project Superintendent</p>
                <p className="text-sm text-white/90 mb-1">{activeProject.superintendent}</p>
                <a href={`tel:${activeProject.superintendentPhone}`} className="flex items-center gap-1.5 text-xs text-[#FF6633] hover:opacity-80 transition-opacity">
                  <Phone size={12} />{activeProject.superintendentPhone}
                </a>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4" data-demo="maintenance-timeline">
          <SectionHeader label="Maintenance & Schedule" />
          <div className="space-y-0">
            {timeline.map((item, i) => {
              const Icon = TIMELINE_ICONS[item.iconName];
              const isUpcoming = item.type === "upcoming";
              const isLast = i === timeline.length - 1;
              return (
                <div key={i} className="flex gap-3 relative">
                  {!isLast && (
                    <div className="absolute left-[19px] top-8 bottom-0 w-px bg-white/8 z-0" />
                  )}
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center z-10 mt-1 border ${
                    isUpcoming
                      ? "bg-[#FF6633]/10 border-[#FF6633]/30"
                      : "bg-white/6 border-white/10"
                  }`}>
                    <Icon size={15} style={{ color: isUpcoming ? "#FF6633" : item.color }} />
                  </div>
                  <div className={`flex-1 py-2 pb-4 ${isLast ? "pb-0" : ""}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white/90">{item.label}</span>
                      {isUpcoming && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF6633]/15 text-[#FF6633] uppercase tracking-wider">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 font-mono ${
                      item.date === "—" ? "text-white/25" : isUpcoming ? "text-[#FF6633]/80" : "text-white/45"
                    }`}>
                      {item.date === "—" ? "TBD — not yet scheduled" : item.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4" data-demo="request-section">
          <SectionHeader label="Need Something?" />
          <p className="text-sm text-white/50 mb-3">Have a question about your site? Send a request directly to your Wick&apos;d contact.</p>
          <textarea
            value={displayRequestText}
            onChange={(e) => setRequestText(e.target.value)}
            placeholder="Type your question or request below…"
            rows={3}
            className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/25 border border-white/8 focus:border-[#FF6633]/50 focus:outline-none resize-none transition-colors"
          />
          {hasSubmitted ? (
            <div className="mt-3 flex items-center gap-2 text-[#34C759] text-sm animate-pulse">
              <CheckCircle2 size={16} />
              Request sent — we&apos;ll be in touch soon.
            </div>
          ) : (
            <>
              <button
                onClick={() => void submitRequest()}
                disabled={!displayRequestText.trim() || submitting}
                className="mt-3 w-full bg-[#FF6633] hover:bg-[#FF7A4D] disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {submitting ? "Sending…" : "Request Updated Information"}
                {!submitting && <ArrowRight size={16} />}
              </button>
              {requestError && (
                <p className="mt-2 text-sm text-red-400">{requestError}</p>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
