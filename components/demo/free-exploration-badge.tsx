"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useDemo } from "@/contexts/demo-context";

export function FreeExplorationBadge() {
  const { isWalkthroughRunning, startWalkthrough, currentStepIndex } = useDemo();

  if (isWalkthroughRunning) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-20 lg:bottom-6 right-4 z-40"
    >
      <div className="bg-[#141414]/90 backdrop-blur-xl border border-[#FF6633]/30 rounded-2xl p-2.5 shadow-2xl shadow-black/80 flex items-center gap-3">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
          <span className="text-xs font-bold text-white/90">
            Interactive Demo
          </span>
        </div>

        <button
          type="button"
          onClick={() => startWalkthrough(currentStepIndex >= 21)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF6633] hover:bg-[#FF7A4D] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6633]/20 active:scale-95"
        >
          <Play size={12} className="fill-white" />
          <span>{currentStepIndex > 0 && currentStepIndex < 21 ? "Resume Tour" : "Start Guided Tour"}</span>
        </button>
      </div>
    </motion.div>
  );
}
