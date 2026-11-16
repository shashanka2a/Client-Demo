"use client";

import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { TOUR_MINUTES, useDemo } from "@/contexts/demo-context";

export function FreeExplorationBadge() {
  const { status, stepIndex, totalSteps, startWalkthrough } = useDemo();

  if (status === "running") return null;

  // Where the viewer is in the tour decides what the button offers.
  const finished = status === "complete";
  const midway = !finished && stepIndex > 0;

  const label = finished ? "Replay tour" : midway ? "Resume tour" : "Take the tour";
  const hint = finished
    ? "Explore freely, or watch it again"
    : midway
      ? `Step ${stepIndex + 1} of ${totalSteps}`
      : `${totalSteps} quick steps · about ${TOUR_MINUTES} min`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed bottom-[84px] right-4 z-40 lg:bottom-6 lg:right-6"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#141414]/90 p-2 pl-4 shadow-2xl shadow-black/70 backdrop-blur-xl">
        <div className="hidden min-w-0 sm:block">
          <p className="text-xs font-semibold text-white/90">Interactive demo</p>
          <p className="text-[11px] text-white/45">{hint}</p>
        </div>
        <button
          type="button"
          onClick={() => startWalkthrough(finished || !midway)}
          className="flex items-center gap-1.5 rounded-xl bg-[#FF6633] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-[#FF6633]/20 transition-all hover:bg-[#FF7A4D] active:scale-95"
        >
          {finished ? <RotateCcw size={12} /> : <Play size={12} className="fill-white" />}
          <span>{label}</span>
        </button>
      </div>
    </motion.div>
  );
}
