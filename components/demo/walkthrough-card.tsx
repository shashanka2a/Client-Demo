"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { DEMO_STEPS, useDemo, useDemoProgress } from "@/contexts/demo-context";
import { useTrackedRect, type TrackedRect } from "@/components/demo/use-tracked-rect";

type Dock = "bottom" | "top";

const DESKTOP_MIN = 1024;
const CARD_W = 392;
const EDGE = 24;

/** Where the card would sit for a given dock, so we can check it against the highlighted area. */
function dockRect(dock: Dock, height: number): TrackedRect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const desktop = vw >= DESKTOP_MIN;
  const width = desktop ? CARD_W : vw - 32;
  const left = desktop ? vw - EDGE - CARD_W : 16;
  // Mobile has a 72px bottom nav the card has to clear.
  const bottomGap = desktop ? EDGE : 84;
  const top = dock === "bottom" ? vh - bottomGap - height : desktop ? EDGE : 12;
  return { top, left, width, height };
}

function overlaps(a: TrackedRect, b: TrackedRect, pad = 12) {
  return !(
    a.left + a.width + pad < b.left ||
    b.left + b.width + pad < a.left ||
    a.top + a.height + pad < b.top ||
    b.top + b.height + pad < a.top
  );
}

export function WalkthroughCard() {
  const {
    status,
    step,
    stepIndex,
    totalSteps,
    isPaused,
    spotlightSelector,
    pauseWalkthrough,
    resumeWalkthrough,
    nextStep,
    prevStep,
    goToStep,
    startWalkthrough,
    replayCurrentStep,
    exitWalkthrough,
  } = useDemo();
  const progress = useDemoProgress();

  const visible = status !== "idle";
  const complete = status === "complete";
  const isLast = stepIndex === totalSteps - 1;

  const cardRef = useRef<HTMLDivElement>(null);
  const [dock, setDock] = useState<Dock>("bottom");
  const focusRect = useTrackedRect(visible && !complete ? spotlightSelector : null);

  // Keep the card out of the way: if it would cover what we're highlighting, move it to the other edge.
  useEffect(() => {
    if (!visible || !focusRect || !cardRef.current) return;
    const height = cardRef.current.offsetHeight;
    const here = dockRect(dock, height);
    if (!overlaps(here, focusRect)) return;
    const other: Dock = dock === "bottom" ? "top" : "bottom";
    if (!overlaps(dockRect(other, height), focusRect)) setDock(other);
  }, [visible, focusRect, dock, step.id, complete]);

  // Keyboard: ← / → to move, Esc to leave. Never steal keys from form fields.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) {
        return;
      }
      if (e.key === "ArrowRight" && !complete) nextStep();
      else if (e.key === "ArrowLeft") prevStep();
      else if (e.key === "Escape") exitWalkthrough();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, complete, nextStep, prevStep, exitWalkthrough]);

  if (!visible) return null;

  const position =
    dock === "bottom"
      ? "bottom-[84px] lg:bottom-6 lg:top-auto"
      : "top-3 lg:top-6 bottom-auto";

  return (
    <motion.div
      ref={cardRef}
      layout="position"
      transition={{ type: "spring", damping: 32, stiffness: 320 }}
      role="dialog"
      aria-label="Guided tour"
      aria-live="polite"
      className={`fixed left-4 right-4 z-[110] pointer-events-auto lg:left-auto lg:right-6 lg:w-[392px] ${position}`}
    >
      <div className="rounded-2xl border border-white/10 bg-[#141414]/95 p-4 shadow-2xl shadow-black/80 ring-1 ring-white/5 backdrop-blur-xl">
        <AnimatePresence mode="wait" initial>
          {complete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#34C759]/15 ring-1 ring-[#34C759]/30">
                <CheckCircle2 size={22} className="text-[#34C759]" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-white">You&apos;re all set</h3>
              <p className="mb-4 text-[13px] leading-relaxed text-white/65">
                That&apos;s the whole portal. Now try it yourself: switch sites, filter photos, or open
                a report.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startWalkthrough(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-white/6 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw size={13} />
                  Replay tour
                </button>
                <button
                  type="button"
                  onClick={exitWalkthrough}
                  className="ml-auto flex items-center gap-1.5 rounded-xl bg-[#FF6633] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#FF7A4D] active:scale-95"
                >
                  Explore on my own
                  <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {/* Progress: one segment per step, click to jump */}
              <div className="mb-3 flex items-center gap-1" role="tablist" aria-label="Tour steps">
                {DEMO_STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={i === stepIndex}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                    title={s.title}
                    onClick={() => goToStep(i)}
                    className="group flex-1 py-1.5"
                  >
                    <span className="relative block h-1 overflow-hidden rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-[#FF6633]"
                        style={{
                          width: `${i < stepIndex ? 100 : i === stepIndex ? progress * 100 : 0}%`,
                          transition: i === stepIndex ? "width 80ms linear" : "width 200ms ease-out",
                        }}
                      />
                    </span>
                  </button>
                ))}
              </div>

              {/* Eyebrow + utility actions */}
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
                  <span className="text-[#FF6633]">{step.section}</span>
                  <span className="font-mono normal-case tracking-normal text-white/35">
                    {stepIndex + 1} / {totalSteps}
                  </span>
                  {isPaused && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/60">
                      Paused
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={replayCurrentStep}
                    title="Replay this step"
                    aria-label="Replay this step"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={exitWalkthrough}
                    title="Close tour (Esc)"
                    aria-label="Close tour"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <h3 className="mb-1.5 text-[15px] font-semibold leading-snug text-white">
                {step.title}
              </h3>
              <p className="mb-3 text-[13px] leading-relaxed text-white/70">{step.description}</p>

              <div className="mb-4 flex items-start gap-2 rounded-xl bg-white/[0.04] px-3 py-2">
                <Lightbulb size={13} className="mt-0.5 flex-shrink-0 text-[#FF6633]" />
                <p className="text-xs leading-relaxed text-white/60">{step.benefit}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={stepIndex === 0}
                  title="Back (←)"
                  aria-label="Previous step"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <ArrowLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={isPaused ? resumeWalkthrough : pauseWalkthrough}
                  title={isPaused ? "Resume" : "Pause"}
                  aria-label={isPaused ? "Resume tour" : "Pause tour"}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {isPaused ? <Play size={14} className="fill-current" /> : <Pause size={14} className="fill-current" />}
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  title="Next (→)"
                  className="ml-auto flex h-9 items-center gap-1.5 rounded-xl bg-[#FF6633] px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#FF7A4D] active:scale-95"
                >
                  {isLast ? "Finish" : "Next"}
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
