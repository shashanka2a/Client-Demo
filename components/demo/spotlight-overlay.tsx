"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "@/contexts/demo-context";
import { useEnsureVisible, useTrackedRect } from "@/components/demo/use-tracked-rect";

const PAD = 8;
const RADIUS = 16;
const SPRING = { type: "spring", damping: 30, stiffness: 260, mass: 0.8 } as const;

export function SpotlightOverlay() {
  const { isWalkthroughRunning, spotlightSelector } = useDemo();
  const rect = useTrackedRect(isWalkthroughRunning ? spotlightSelector : null);
  useEnsureVisible(isWalkthroughRunning ? spotlightSelector : null, rect);

  const hole = rect
    ? {
        x: Math.max(0, rect.left - PAD),
        y: Math.max(0, rect.top - PAD),
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  return (
    <AnimatePresence>
      {isWalkthroughRunning && (
        // Sits above modals (z-100) so the highlight still works when the tour opens one.
        <motion.div
          key="spotlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[105] pointer-events-none"
          aria-hidden
        >
          {hole ? (
            <>
              <svg className="absolute inset-0 h-full w-full">
                <defs>
                  <mask id="demo-spotlight-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <motion.rect
                      rx={RADIUS}
                      ry={RADIUS}
                      fill="black"
                      initial={false}
                      animate={hole}
                      transition={SPRING}
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="rgba(0, 0, 0, 0.55)"
                  mask="url(#demo-spotlight-mask)"
                />
              </svg>

              <motion.div
                initial={false}
                animate={{ left: hole.x, top: hole.y, width: hole.width, height: hole.height }}
                transition={SPRING}
                style={{ borderRadius: RADIUS }}
                className="demo-ring absolute border-2 border-[#FF6633]"
              />
            </>
          ) : (
            // No target on screen yet (e.g. mid page-change): keep the mood steady.
            <div className="absolute inset-0 bg-black/40" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
