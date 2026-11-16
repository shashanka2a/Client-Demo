"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "@/contexts/demo-context";
import { useEnsureVisible, useTrackedRect } from "@/components/demo/use-tracked-rect";

const SPRING = { type: "spring", damping: 26, stiffness: 190, mass: 0.7 } as const;

export function AnimatedCursor() {
  const { isWalkthroughRunning, cursor } = useDemo();
  const rect = useTrackedRect(isWalkthroughRunning ? cursor.selector : null);
  useEnsureVisible(isWalkthroughRunning ? cursor.selector : null, rect);

  // Where the cursor was last seen, so it glides between targets instead of teleporting.
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const previous = lastPoint.current;

  let point: { x: number; y: number } | null = null;
  if (rect) {
    // Point at a natural "hit spot": the centre of small controls, and the
    // leading part of wide ones (inputs, cards) rather than their far middle.
    point = {
      x: rect.left + Math.min(rect.width / 2, 120),
      y: rect.top + Math.min(rect.height / 2, 26),
    };
    lastPoint.current = point;
  }

  const visible = isWalkthroughRunning && point !== null;
  const start =
    previous ??
    (typeof window !== "undefined"
      ? { x: window.innerWidth * 0.55, y: window.innerHeight * 0.55 }
      : { x: 0, y: 0 });
  const at = point ?? start;
  // Keep the caption on screen: flip it left near the right edge, and above near the bottom.
  const flipLeft = typeof window !== "undefined" && at.x > window.innerWidth - 240;
  const flipUp = typeof window !== "undefined" && at.y > window.innerHeight - 90;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="cursor"
            initial={{ opacity: 0, x: start.x, y: start.y, scale: 0.8 }}
            animate={{ opacity: 1, x: at.x, y: at.y, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ ...SPRING, opacity: { duration: 0.2 } }}
            className="absolute left-0 top-0"
          >
            <div className="relative -translate-x-[3px] -translate-y-[3px]">
              {/* Click ripple */}
              <AnimatePresence>
                {cursor.clicking && (
                  <motion.span
                    initial={{ scale: 0.4, opacity: 0.9 }}
                    animate={{ scale: 2.6, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute left-[3px] top-[3px] h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FF6633] bg-[#FF6633]/30"
                  />
                )}
              </AnimatePresence>

              {/* Pointer */}
              <motion.svg
                width="24"
                height="28"
                viewBox="0 0 24 30"
                fill="none"
                animate={{ scale: cursor.clicking ? 0.82 : 1 }}
                transition={{ duration: 0.12 }}
                className="origin-top-left drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)]"
              >
                <path
                  d="M1 1L8.5 22.5L12.5 14.5L20.5 13L1 1Z"
                  fill="#FF6633"
                  stroke="#FFFFFF"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
              </motion.svg>

              {/* Live caption: tells the viewer what the cursor is doing */}
              <AnimatePresence mode="wait">
                {cursor.label && (
                  <motion.div
                    key={cursor.label}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`absolute whitespace-nowrap rounded-lg border border-white/10 bg-[#141414]/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xl shadow-black/50 backdrop-blur-md ${
                      flipUp ? "bottom-4" : "top-5"
                    } ${flipLeft ? "right-3" : "left-5"}`}
                  >
                    {cursor.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
