"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ChevronDown,
  Gauge,
  LogOut,
  Map,
  Activity,
  Image as ImageIcon,
  FileText,
  Home,
  Layers,
  User,
  type LucideIcon,
} from "lucide-react";
import {
  DEMO_WORKFLOWS,
  type DemoWorkflowId,
  useDemo,
} from "@/contexts/demo-context";

const WORKFLOW_ICONS: Record<DemoWorkflowId, LucideIcon> = {
  portfolio: Layers,
  overview: Home,
  map: Map,
  health: Activity,
  gallery: ImageIcon,
  reports: FileText,
  profile: User,
};

export function DemoControlBar() {
  const {
    isWalkthroughRunning,
    isPaused,
    currentStep,
    currentStepIndex,
    playbackSpeed,
    startWalkthrough,
    pauseWalkthrough,
    resumeWalkthrough,
    nextStep,
    prevStep,
    replayCurrentStep,
    jumpToWorkflow,
    exitWalkthrough,
    setSpeed,
  } = useDemo();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/10 px-3 py-2 text-xs text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        {/* Left: Brand / Demo Badge + Workflow Dropdown */}
        <div className="flex items-center gap-2 relative">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#FF6633]/15 border border-[#FF6633]/30 text-[#FF6633] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6633]" />
            <span className="text-[10px] uppercase tracking-wider hidden sm:inline">Product Demo</span>
          </div>

          {/* Workflow Selector Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 border border-white/8 text-white/90 font-medium transition-colors"
            >
              <span className="truncate max-w-[150px] sm:max-w-[200px]">
                {currentStep.workflowTitle}
              </span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 z-50 w-64 bg-[#181818] border border-white/12 rounded-xl shadow-2xl py-1.5 divide-y divide-white/5">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Jump to Workflow Feature
                  </div>
                  <div className="py-1">
                    {DEMO_WORKFLOWS.map((wf) => {
                      const Icon = WORKFLOW_ICONS[wf.id];
                      const active = currentStep.workflowId === wf.id;
                      return (
                        <button
                          key={wf.id}
                          type="button"
                          onClick={() => {
                            jumpToWorkflow(wf.id);
                            setMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                            active
                              ? "bg-[#FF6633]/15 text-[#FF6633] font-semibold"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <Icon size={14} className={active ? "text-[#FF6633]" : "text-white/40"} />
                          <span className="flex-1 truncate">{wf.title}</span>
                          <span className="text-[10px] font-mono text-white/30">
                            {wf.count} steps
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1.5">
          {isWalkthroughRunning ? (
            <>
              <button
                type="button"
                onClick={isPaused ? resumeWalkthrough : pauseWalkthrough}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF6633] hover:bg-[#FF7A4D] text-white font-bold transition-colors active:scale-95 shadow-sm"
              >
                {isPaused ? <Play size={12} className="fill-white" /> : <Pause size={12} className="fill-white" />}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>

              <button
                type="button"
                onClick={replayCurrentStep}
                title="Replay Current Step"
                className="px-2 py-1.5 rounded-lg bg-white/6 hover:bg-white/12 text-white/70 hover:text-white transition-colors"
              >
                <RotateCcw size={13} />
              </button>

              <button
                type="button"
                onClick={nextStep}
                title="Skip to Next Step"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/6 hover:bg-white/12 text-white/70 hover:text-white transition-colors"
              >
                <span>Next</span>
                <SkipForward size={12} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => startWalkthrough(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF6633] hover:bg-[#FF7A4D] text-white font-bold transition-all shadow-md shadow-[#FF6633]/20 active:scale-95"
            >
              <Play size={12} className="fill-white" />
              <span>Start Guided Tour</span>
            </button>
          )}

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={() => setSpeed(playbackSpeed === 1 ? 1.5 : 1)}
            title="Playback Speed"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/6 hover:bg-white/12 text-white/60 hover:text-white text-[11px] font-mono transition-colors"
          >
            <Gauge size={12} />
            <span>{playbackSpeed}x</span>
          </button>
        </div>

        {/* Right: Exit / Free Exploration */}
        <div className="flex items-center gap-2">
          {isWalkthroughRunning ? (
            <button
              type="button"
              onClick={exitWalkthrough}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">Exit Walkthrough</span>
              <span className="sm:hidden">Exit</span>
            </button>
          ) : (
            <span className="text-[11px] text-white/40 hidden md:inline">
              Free Exploration Mode Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
