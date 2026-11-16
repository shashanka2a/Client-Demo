"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { useDemo } from "@/contexts/demo-context";

export function WalkthroughCard() {
  const {
    isWalkthroughRunning,
    currentStep,
    isPaused,
    progressPercent,
    currentStepIndex,
    pauseWalkthrough,
    resumeWalkthrough,
    nextStep,
    prevStep,
    replayCurrentStep,
    exitWalkthrough,
  } = useDemo();

  if (!isWalkthroughRunning) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-[380px] z-50 pointer-events-auto"
      >
        <div className="bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/80 ring-1 ring-white/5">
          {/* Header: Section Eyebrow + Window Controls */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#FF6633]">
                {currentStep.workflowTitle}
              </span>
              <span className="text-[10px] font-mono text-white/35">
                · {currentStep.stepNumber} of {currentStep.totalStepsInWorkflow}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={replayCurrentStep}
                title="Replay step"
                className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <RotateCcw size={12} />
              </button>
              <button
                type="button"
                onClick={exitWalkthrough}
                title="Exit walkthrough"
                className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Title & Human Description */}
          <h3 className="text-sm font-semibold text-white leading-snug mb-1">
            {currentStep.title}
          </h3>
          <p className="text-xs text-white/65 leading-relaxed mb-3">
            {currentStep.description}
          </p>

          {/* Progress Bar */}
          <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden mb-3">
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-[#FF6633]"
              style={{ width: `${progressPercent}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={isPaused ? resumeWalkthrough : pauseWalkthrough}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-colors"
            >
              {isPaused ? <Play size={11} className="fill-white" /> : <Pause size={11} className="fill-white" />}
              <span>{isPaused ? "Resume" : "Pause"}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
                title="Previous step"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF6633] hover:bg-[#FF7A4D] text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
              >
                <span>{currentStepIndex === 21 ? "Finish" : "Next"}</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
