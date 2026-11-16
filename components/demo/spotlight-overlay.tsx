"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "@/contexts/demo-context";

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function SpotlightOverlay() {
  const { isWalkthroughRunning, currentStep } = useDemo();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const updateRect = useCallback(() => {
    if (!isWalkthroughRunning || !currentStep?.targetSelector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentStep.targetSelector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    // Scroll element into view if offscreen
    const rawRect = el.getBoundingClientRect();
    const isOffscreen =
      rawRect.top < 0 ||
      rawRect.bottom > window.innerHeight ||
      rawRect.left < 0 ||
      rawRect.right > window.innerWidth;

    if (isOffscreen && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: Math.max(0, rect.top),
      left: Math.max(0, rect.left),
      width: rect.width,
      height: rect.height,
    });
  }, [isWalkthroughRunning, currentStep?.targetSelector]);

  useEffect(() => {
    updateRect();

    // Check again after page render / transitions
    const t1 = setTimeout(updateRect, 100);
    const t2 = setTimeout(updateRect, 300);
    const t3 = setTimeout(updateRect, 600);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [updateRect, currentStep?.id]);

  if (!isWalkthroughRunning) return null;

  const pad = 6;
  const rx = 14;

  return (
    <AnimatePresence>
      <motion.div
        key="spotlight-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 pointer-events-none z-30"
      >
        {targetRect ? (
          <>
            {/* SVG mask creating a true cutout hole over target element */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <mask id="spotlight-cutout">
                  {/* Fill entire canvas with white */}
                  <rect width="100%" height="100%" fill="white" />
                  {/* Cutout hole is black */}
                  <rect
                    x={targetRect.left - pad}
                    y={targetRect.top - pad}
                    width={targetRect.width + pad * 2}
                    height={targetRect.height + pad * 2}
                    rx={rx}
                    ry={rx}
                    fill="black"
                  />
                </mask>
              </defs>
              {/* Dimmed backdrop through mask */}
              <rect
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.45)"
                mask="url(#spotlight-cutout)"
              />
            </svg>

            {/* Precision highlight ring with subtle orange accent glow */}
            <motion.div
              layout
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 240,
              }}
              style={{
                top: targetRect.top - pad,
                left: targetRect.left - pad,
                width: targetRect.width + pad * 2,
                height: targetRect.height + pad * 2,
              }}
              className="absolute rounded-2xl border-2 border-[#FF6633] shadow-[0_0_20px_rgba(255,102,51,0.35)] ring-2 ring-[#FF6633]/20 pointer-events-none"
            />
          </>
        ) : (
          /* Subtle ambient dim when no target selector */
          <div className="absolute inset-0 bg-black/25 transition-opacity" />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
