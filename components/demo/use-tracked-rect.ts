"use client";

import { useEffect, useRef, useState } from "react";

export type TrackedRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/**
 * Resolve a demo target. Selectors may list several alternatives
 * (e.g. desktop sidebar vs. mobile bottom nav), so we return the first
 * match that is actually visible on screen.
 */
export function resolveDemoTarget(selector: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  let nodes: NodeListOf<HTMLElement>;
  try {
    nodes = document.querySelectorAll<HTMLElement>(selector);
  } catch {
    return null;
  }
  for (const node of Array.from(nodes)) {
    const r = node.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return node;
  }
  return null;
}

function sameRect(a: TrackedRect | null, b: TrackedRect | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

/**
 * Follows an element's on-screen rectangle every frame, so highlights and the
 * cursor stay glued to it through scrolling, route changes, and layout shifts
 * (expanding cards, opening panels, async map loads).
 */
export function useTrackedRect(selector: string | null | undefined): TrackedRect | null {
  const [rect, setRect] = useState<TrackedRect | null>(null);

  useEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }

    let frame = 0;
    let last: TrackedRect | null = null;

    const tick = () => {
      const el = resolveDemoTarget(selector);
      let next: TrackedRect | null = null;
      if (el) {
        const r = el.getBoundingClientRect();
        next = { top: r.top, left: r.left, width: r.width, height: r.height };
      }
      if (!sameRect(last, next)) {
        last = next;
        setRect(next);
      }
      frame = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(frame);
  }, [selector]);

  return rect;
}

/**
 * Gently scrolls a target into view once it has been located, and again if it
 * grows significantly (e.g. an accordion opens). Never fights the user: it
 * only fires once per target/size combination.
 */
export function useEnsureVisible(selector: string | null | undefined, rect: TrackedRect | null) {
  const doneKey = useRef<string | null>(null);

  useEffect(() => {
    if (!selector || !rect) return;

    const key = `${selector}|${Math.round(rect.height / 80)}`;
    if (doneKey.current === key) return;
    doneKey.current = key;

    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const margin = 72;
    const tall = rect.height > vh * 0.7;

    const belowFold = !tall && rect.top + rect.height > vh - margin;
    const aboveFold = rect.top < margin;
    const offSide = rect.left < 0 || rect.left + Math.min(rect.width, 40) > vw;
    if (!belowFold && !aboveFold && !offSide) return;

    const el = resolveDemoTarget(selector);
    if (!el || typeof el.scrollIntoView !== "function") return;
    el.scrollIntoView({
      behavior: "smooth",
      block: tall ? "start" : "center",
      inline: "center",
    });
  }, [selector, rect]);
}
