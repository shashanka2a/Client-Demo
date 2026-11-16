"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "@/contexts/demo-context";

export function AnimatedCursor() {
  const { cursorPos, cursorText, currentStep, isWalkthroughRunning } = useDemo();

  if (!isWalkthroughRunning || !cursorPos.visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <motion.div
        animate={{
          left: `${cursorPos.x}%`,
          top: `${cursorPos.y}%`,
        }}
        transition={{
          type: "spring",
          damping: 28,
          stiffness: 220,
          mass: 0.6,
        }}
        className="absolute -translate-x-1 -translate-y-1"
      >
        {/* Realistic Pointer Arrow */}
        <div className="relative">
          <svg
            width="26"
            height="32"
            viewBox="0 0 24 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          >
            <path
              d="M1 1L8.5 22.5L12.5 14.5L20.5 13L1 1Z"
              fill="#FF6633"
              stroke="#FFFFFF"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          </svg>

          {/* Click Ripple Effect */}
          <AnimatePresence>
            {cursorPos.clicking && (
              <motion.span
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute top-1 left-1 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FF6633] bg-[#FF6633]/30 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Action / Typing Pill Tag */}
          {(currentStep.actionLabel || cursorText) && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute left-6 top-4 bg-[#141414]/95 border border-[#FF6633]/40 rounded-lg px-2.5 py-1 shadow-2xl backdrop-blur-md whitespace-nowrap flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6633] animate-ping" />
              <span className="text-[11px] font-semibold text-white/90">
                {cursorText ? `"${cursorText}"` : currentStep.actionLabel}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
