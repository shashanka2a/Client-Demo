"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useProject } from "@/contexts/project-context";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Everything the tour can "do" on screen. Screens read these values and fall
 * back to their own local state when a value is `null`/`false`, so the tour and
 * real user input never fight over the same state.
 */
export type DemoSim = {
  // Overview
  infoExpanded: boolean;
  requestText: string | null;
  requestSent: boolean;
  // Map
  mapBoundary: boolean | null;
  mapPinOpen: boolean;
  // Site health
  healthTab: "open" | "resolved" | null;
  healthExpanded: boolean;
  healthLightbox: boolean;
  // Gallery
  galleryFilter: string | null;
  gallerySearch: string | null;
  galleryLightbox: boolean;
  // Reports
  reportExpanded: boolean;
  reportModal: boolean;
  reportDownloaded: boolean;
};

export const DEFAULT_SIM: DemoSim = {
  infoExpanded: false,
  requestText: null,
  requestSent: false,
  mapBoundary: null,
  mapPinOpen: false,
  healthTab: null,
  healthExpanded: false,
  healthLightbox: false,
  galleryFilter: null,
  gallerySearch: null,
  galleryLightbox: false,
  reportExpanded: false,
  reportModal: false,
  reportDownloaded: false,
};

/** One beat in a step's timeline. Times are ms from the start of the step. */
export type DemoAction = {
  at: number;
  /** Move the cursor to this element. Persists until another action changes it. */
  target?: string;
  /** Caption shown next to the cursor. Use "" to clear it. */
  label?: string;
  /** Show a click ripple at this moment. */
  click?: boolean;
  /** Move the spotlight. `null` returns to the step's default target. */
  focus?: string | null;
  /** Apply state changes to the screen. */
  set?: Partial<DemoSim>;
  /** Type text into a field, one character at a time. */
  type?: { key: "requestText" | "gallerySearch"; text: string };
  /** Switch the active project (ignored if the project doesn't exist). */
  project?: string;
};

export type DemoStep = {
  id: string;
  /** Short section name shown above the title. */
  section: string;
  title: string;
  /** What the user is looking at / can do — one or two plain sentences. */
  description: string;
  /** Why it matters to them — one short line. */
  benefit: string;
  path: string;
  /** Element to click to reach this page. Omit if the step doesn't change page. */
  navTarget?: string;
  navLabel?: string;
  /** Default spotlight target. */
  targetSelector: string;
  initialSim?: Partial<DemoSim>;
  actions: DemoAction[];
  durationMs: number;
};

export type DemoStatus = "idle" | "running" | "complete";

/* -------------------------------------------------------------------------- */
/*  Tour script                                                               */
/* -------------------------------------------------------------------------- */

export const DEMO_START_PROJECT_ID = "proj-sunridge-phase-2";
const ALT_PROJECT_ID = "proj-tupelo-block-a";

const nav = (name: string) => `[data-demo='nav-${name}'], [data-demo='bottom-nav-${name}']`;

const SEL = {
  switcher: "[data-demo='nav-portfolio-switcher'], [data-demo='project-switcher']",
  switcherSelect:
    "[data-demo='nav-portfolio-switcher'] select, [data-demo='project-switcher'] select",
  lightbox: "[data-demo='lightbox']",
  lightboxClose: "[data-demo='lightbox-close']",
};

export const DEMO_STEPS: DemoStep[] = [
  {
    id: "switch-sites",
    section: "Your sites",
    title: "Switch sites in one click",
    description:
      "Every site you manage lives in one account. Pick a site and the whole portal, from map to photos to reports, updates to match.",
    benefit: "No extra logins, and no mixed-up data between sites.",
    path: "/portal/overview",
    navTarget: nav("overview"),
    navLabel: "Open Overview",
    targetSelector: SEL.switcher,
    actions: [
      { at: 1600, target: SEL.switcherSelect, label: "Pick a site" },
      { at: 2800, click: true, label: "Tupelo Solar Facility", project: ALT_PROJECT_ID },
      { at: 5600, label: "Back to Sunridge" },
      { at: 6300, click: true, project: DEMO_START_PROJECT_ID },
    ],
    durationMs: 9000,
  },
  {
    id: "overview-team",
    section: "Overview",
    title: "Contract details and your team",
    description:
      "Open General Information to see your contract terms, plus the direct phone and email for your project manager and superintendent.",
    benefit: "Reach the right person without opening a support ticket.",
    path: "/portal/overview",
    targetSelector: "[data-demo='general-info-toggle']",
    actions: [
      { at: 1600, target: "[data-demo='general-info-toggle'] button", label: "Open General Information" },
      { at: 2600, click: true, set: { infoExpanded: true } },
    ],
    durationMs: 9000,
  },
  {
    id: "overview-schedule",
    section: "Overview",
    title: "See what's coming up",
    description:
      "Past and upcoming wicking, spraying, and mowing dates in one timeline, so you know when crews will be on site.",
    benefit: "Plan around work days, and keep vegetation clear of panels.",
    path: "/portal/overview",
    targetSelector: "[data-demo='maintenance-timeline']",
    actions: [],
    durationMs: 6500,
  },
  {
    id: "overview-request",
    section: "Overview",
    title: "Ask your team anything",
    description:
      "Type a question or request and send it straight to your Wick'd project manager. No email chains needed.",
    benefit: "One direct line to the people running your site.",
    path: "/portal/overview",
    targetSelector: "[data-demo='request-section']",
    actions: [
      { at: 1500, target: "[data-demo='request-section'] textarea", label: "Write a request" },
      {
        at: 2300,
        type: {
          key: "requestText",
          text: "Can we get an updated acreage count for Zone B before Friday?",
        },
      },
      { at: 6000, target: "[data-demo='request-send']", label: "Send it" },
      { at: 6800, click: true, label: "", set: { requestSent: true } },
    ],
    durationMs: 10000,
  },
  {
    id: "map-layers",
    section: "Project map",
    title: "Your site on satellite imagery",
    description:
      "Your engineering boundary is drawn on live satellite imagery. Use the chips to show or hide the boundary and field observations.",
    benefit: "See the whole site without needing CAD software.",
    path: "/portal/map",
    navTarget: nav("map"),
    navLabel: "Open Map",
    targetSelector: "[data-demo='map-container']",
    actions: [
      {
        at: 2000,
        target: "[data-demo='map-toggle-boundary']",
        label: "Hide the boundary",
        focus: "[data-demo='map-controls']",
      },
      { at: 3000, click: true, set: { mapBoundary: false } },
      { at: 5200, label: "Show it again" },
      { at: 5900, click: true, set: { mapBoundary: true } },
    ],
    durationMs: 9000,
  },
  {
    id: "map-pin",
    section: "Project map",
    title: "Tap a pin for the field notes",
    description:
      "Each pin is a geotagged observation. Tap one to see its status, location, and type, tied to the exact spot on site.",
    benefit: "Every issue is linked to a real place on the map.",
    path: "/portal/map",
    targetSelector: "[data-demo='map-container']",
    actions: [
      { at: 1600, target: "[data-demo='map-pin-first']", label: "Select a pin" },
      { at: 2600, click: true, label: "", set: { mapPinOpen: true } },
      { at: 3400, focus: "[data-demo='map-observation-card']" },
    ],
    durationMs: 8500,
  },
  {
    id: "health-status",
    section: "Site health",
    title: "Track issues from open to resolved",
    description:
      "Open items still need action. Switch to Resolved to see what has been fixed and signed off by a supervisor.",
    benefit: "A clear record that every fix was verified.",
    path: "/portal/health",
    navTarget: nav("health"),
    navLabel: "Open Site Health",
    targetSelector: "[data-demo='health-tabs']",
    initialSim: { healthTab: "open" },
    actions: [
      { at: 1800, target: "[data-demo='health-tab-resolved']", label: "See resolved items" },
      { at: 2600, click: true, set: { healthTab: "resolved" } },
      { at: 5600, target: "[data-demo='health-tab-open']", label: "Back to open items" },
      { at: 6300, click: true, set: { healthTab: "open" } },
    ],
    durationMs: 9000,
  },
  {
    id: "health-detail",
    section: "Site health",
    title: "Open an issue for the full record",
    description:
      "Each issue shows its severity, location, due date, field notes, and a dated history. Tap a photo to see the proof.",
    benefit: "Audit-ready documentation for insurers and regulators.",
    path: "/portal/health",
    targetSelector: "[data-demo='observation-card-first']",
    initialSim: { healthTab: "open" },
    actions: [
      {
        at: 1500,
        target: "[data-demo='observation-card-first'] button[aria-expanded]",
        label: "Open the issue",
      },
      { at: 2400, click: true, set: { healthExpanded: true } },
      {
        at: 3800,
        target: "[data-demo='observation-photo']",
        label: "Tap a photo",
        focus: "[data-demo='observation-photo']",
      },
      {
        at: 4800,
        click: true,
        label: "",
        set: { healthLightbox: true },
        focus: SEL.lightbox,
      },
      { at: 8200, target: SEL.lightboxClose, label: "Close" },
      { at: 8800, click: true, label: "", set: { healthLightbox: false }, focus: null },
    ],
    durationMs: 10500,
  },
  {
    id: "gallery",
    section: "Photos",
    title: "Find any photo in seconds",
    description:
      "Filter by category, search by keyword, then open a photo for full resolution, the date, and the superintendent's caption.",
    benefit: "Inspect the site remotely, without a site visit.",
    path: "/portal/gallery",
    navTarget: nav("photos"),
    navLabel: "Open Photos",
    targetSelector: "[data-demo='gallery-grid']",
    actions: [
      {
        at: 1600,
        target: "[data-demo='gallery-chip-Chemical']",
        label: "Filter by category",
        focus: "[data-demo='gallery-chips']",
      },
      { at: 2500, click: true, set: { galleryFilter: "Chemical" } },
      {
        at: 4200,
        target: "[data-demo='gallery-search'] input",
        label: "Search by keyword",
        focus: "[data-demo='gallery-search']",
      },
      { at: 4900, type: { key: "gallerySearch", text: "Kudzu" } },
      {
        at: 6400,
        target: "[data-demo='gallery-first-photo']",
        label: "Open the photo",
        focus: "[data-demo='gallery-grid']",
      },
      { at: 7300, click: true, label: "", set: { galleryLightbox: true }, focus: SEL.lightbox },
      { at: 10600, target: SEL.lightboxClose, label: "Close" },
      { at: 11200, click: true, label: "", set: { galleryLightbox: false }, focus: null },
    ],
    durationMs: 12500,
  },
  {
    id: "reports",
    section: "Reports",
    title: "Signed reports, ready to share",
    description:
      "Each daily log records weather, crew, equipment, and a digital signature. Open the PDF and download it for lenders or utility partners.",
    benefit: "Audit-ready records in a single click.",
    path: "/portal/reports",
    navTarget: nav("reports"),
    navLabel: "Open Reports",
    targetSelector: "[data-demo='reports-first-card']",
    actions: [
      { at: 1600, target: "[data-demo='report-expand-btn']", label: "Expand the report" },
      { at: 2400, click: true, set: { reportExpanded: true } },
      { at: 5000, target: "[data-demo='report-view-btn']", label: "View the PDF" },
      {
        at: 5800,
        click: true,
        label: "",
        set: { reportModal: true },
        focus: "[data-demo='report-modal']",
      },
      { at: 8400, target: "[data-demo='report-download-btn']", label: "Download it" },
      { at: 9200, click: true, label: "", set: { reportDownloaded: true } },
    ],
    durationMs: 12000,
  },
];

export const TOTAL_STEPS = DEMO_STEPS.length;
export const TOUR_MINUTES = Math.max(
  1,
  Math.round(DEMO_STEPS.reduce((sum, s) => sum + s.durationMs, 0) / 60000)
);

/* -------------------------------------------------------------------------- */
/*  Timeline evaluation (pure)                                                */
/* -------------------------------------------------------------------------- */

const TYPE_MS_PER_CHAR = 55;
const CLICK_FLASH_MS = 450;
const NAV_CLICK_MS = 900;
const NAV_PUSH_MS = 1050;
const TICK_MS = 60;
/** A throttled or backgrounded tab can deliver ticks late; never let one skip more than this. */
const MAX_TICK_DELTA_MS = 200;

type CursorState = {
  selector: string | null;
  label: string;
  clicking: boolean;
};

const HIDDEN_CURSOR: CursorState = { selector: null, label: "", clicking: false };

function deriveStepState(step: DemoStep, elapsed: number) {
  const sim: DemoSim = { ...DEFAULT_SIM, ...step.initialSim };
  let target: string | null = null;
  let label = "";
  let clicking = false;
  let focus = step.targetSelector;

  for (const action of step.actions) {
    if (action.at > elapsed) break;
    if (action.target !== undefined) target = action.target;
    if (action.label !== undefined) label = action.label;
    // A click completes the thought, so its caption shouldn't linger afterwards.
    else if (action.click) label = "";
    if (action.focus !== undefined) focus = action.focus ?? step.targetSelector;
    if (action.set) Object.assign(sim, action.set);
    if (action.type) {
      const chars = Math.min(
        action.type.text.length,
        Math.floor((elapsed - action.at) / TYPE_MS_PER_CHAR) + 1
      );
      sim[action.type.key] = action.type.text.slice(0, chars);
    }
    if (action.click && elapsed - action.at < CLICK_FLASH_MS) clicking = true;
  }

  return { sim, cursor: { selector: target, label, clicking }, focus };
}

function shallowEqual<T extends object>(a: T, b: T) {
  const keys = Object.keys(a) as (keyof T)[];
  return keys.every((k) => a[k] === b[k]);
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                   */
/* -------------------------------------------------------------------------- */

type DemoContextValue = {
  status: DemoStatus;
  isWalkthroughRunning: boolean;
  isTourComplete: boolean;
  isPaused: boolean;
  stepIndex: number;
  step: DemoStep;
  totalSteps: number;
  /** Simulated screen state. Equals `DEFAULT_SIM` whenever the tour is idle. */
  sim: DemoSim;
  cursor: CursorState;
  spotlightSelector: string | null;
  startWalkthrough: (fromBeginning?: boolean) => void;
  pauseWalkthrough: () => void;
  resumeWalkthrough: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  replayCurrentStep: () => void;
  exitWalkthrough: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);
/** Progress (0–1) through the current step. Kept separate so only the card re-renders on every tick. */
const DemoProgressContext = createContext(0);

export function DemoProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const projectCtx = useProject();

  const [status, setStatus] = useState<DemoStatus>("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [replayToken, setReplayToken] = useState(0);
  const [sim, setSim] = useState<DemoSim>(DEFAULT_SIM);
  const [cursor, setCursor] = useState<CursorState>(HIDDEN_CURSOR);
  const [spotlightSelector, setSpotlightSelector] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Latest values for the ticking loop, so it never has to restart for them.
  const pathnameRef = useRef(pathname);
  const routerRef = useRef(router);
  const projectRef = useRef(projectCtx);
  pathnameRef.current = pathname;
  routerRef.current = router;
  projectRef.current = projectCtx;

  const elapsedRef = useRef(0);
  const navElapsedRef = useRef(0);
  const lastTickAtRef = useRef(0);
  const pushedRef = useRef(false);
  const firedProjectsRef = useRef<Set<number>>(new Set());

  const step = DEMO_STEPS[stepIndex] ?? DEMO_STEPS[0]!;
  const isRunning = status === "running";

  const switchProject = useCallback((projectId: string) => {
    const { projects, activeProject, setActiveProjectId } = projectRef.current;
    if (!projects.some((p) => p.id === projectId)) return;
    if (activeProject?.id === projectId) return;
    setActiveProjectId(projectId);
  }, []);

  const clearStage = useCallback(() => {
    setSim(DEFAULT_SIM);
    setCursor(HIDDEN_CURSOR);
    setSpotlightSelector(null);
    setProgress(0);
  }, []);

  // 1) Reset the clock whenever a step (re)starts.
  useEffect(() => {
    if (!isRunning) return;
    elapsedRef.current = 0;
    navElapsedRef.current = 0;
    pushedRef.current = false;
    firedProjectsRef.current = new Set();
    setProgress(0);
    setSim({ ...DEFAULT_SIM, ...step.initialSim });
    setCursor(HIDDEN_CURSOR);
    setSpotlightSelector(step.targetSelector);
    // Every step is written against the first site; make sure we start there.
    switchProject(DEMO_START_PROJECT_ID);
  }, [isRunning, stepIndex, replayToken, step, switchProject]);

  // 2) Single clock that drives navigation, the cursor, simulated state and auto-advance.
  useEffect(() => {
    if (!isRunning || isPaused) return;

    lastTickAtRef.current = performance.now();

    const timer = setInterval(() => {
      // Real time since the last tick (so timing holds up even if the browser throttles us).
      const now = performance.now();
      const dt = Math.min(MAX_TICK_DELTA_MS, Math.max(0, now - lastTickAtRef.current));
      lastTickAtRef.current = now;

      // Phase A — get to the right page first, by "clicking" the nav item.
      if (pathnameRef.current !== step.path) {
        navElapsedRef.current += dt;
        const navMs = navElapsedRef.current;
        const next: CursorState = {
          selector: step.navTarget ?? null,
          label: step.navLabel ?? "",
          clicking: navMs >= NAV_CLICK_MS && navMs < NAV_CLICK_MS + CLICK_FLASH_MS,
        };
        setCursor((prev) => (shallowEqual(prev, next) ? prev : next));
        setSpotlightSelector(step.navTarget ?? step.targetSelector);

        const pushAt = step.navTarget ? NAV_PUSH_MS : 0;
        if (navMs >= pushAt && !pushedRef.current) {
          pushedRef.current = true;
          routerRef.current.push(step.path);
        }
        return;
      }

      // Phase B — play the step's timeline.
      elapsedRef.current += dt;
      const elapsed = elapsedRef.current;

      step.actions.forEach((action, i) => {
        if (action.project && action.at <= elapsed && !firedProjectsRef.current.has(i)) {
          firedProjectsRef.current.add(i);
          switchProject(action.project);
        }
      });

      const derived = deriveStepState(step, elapsed);
      setSim((prev) => (shallowEqual(prev, derived.sim) ? prev : derived.sim));
      setCursor((prev) => (shallowEqual(prev, derived.cursor) ? prev : derived.cursor));
      setSpotlightSelector(derived.focus);
      setProgress(Math.min(1, elapsed / step.durationMs));

      if (elapsed >= step.durationMs) {
        if (stepIndex < TOTAL_STEPS - 1) {
          setStepIndex(stepIndex + 1);
        } else {
          setStatus("complete");
        }
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [isRunning, isPaused, step, stepIndex, replayToken, switchProject]);

  /* ----------------------------- Public actions ---------------------------- */

  const startWalkthrough = useCallback((fromBeginning = true) => {
    if (fromBeginning) setStepIndex(0);
    setReplayToken((t) => t + 1);
    setIsPaused(false);
    setStatus("running");
  }, []);

  const pauseWalkthrough = useCallback(() => setIsPaused(true), []);
  const resumeWalkthrough = useCallback(() => setIsPaused(false), []);

  const goToStep = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_STEPS) return;
    setStepIndex(index);
    setReplayToken((t) => t + 1);
    setIsPaused(false);
    setStatus("running");
  }, []);

  const nextStep = useCallback(() => {
    if (stepIndex < TOTAL_STEPS - 1) {
      goToStep(stepIndex + 1);
    } else {
      clearStage();
      setStatus("complete");
    }
  }, [stepIndex, goToStep, clearStage]);

  const prevStep = useCallback(() => {
    // From the finish screen, "back" returns to the last step.
    if (status === "complete") {
      goToStep(TOTAL_STEPS - 1);
    } else if (stepIndex > 0) {
      goToStep(stepIndex - 1);
    }
  }, [status, stepIndex, goToStep]);

  const replayCurrentStep = useCallback(() => {
    setReplayToken((t) => t + 1);
    setIsPaused(false);
  }, []);

  const exitWalkthrough = useCallback(() => {
    setStatus("idle");
    setIsPaused(false);
    clearStage();
  }, [clearStage]);

  // Leave the stage clean when the tour ends or is dismissed.
  useEffect(() => {
    if (status !== "running") clearStage();
  }, [status, clearStage]);

  const value = useMemo<DemoContextValue>(
    () => ({
      status,
      isWalkthroughRunning: status === "running",
      isTourComplete: status === "complete",
      isPaused,
      stepIndex,
      step,
      totalSteps: TOTAL_STEPS,
      sim,
      cursor,
      spotlightSelector,
      startWalkthrough,
      pauseWalkthrough,
      resumeWalkthrough,
      nextStep,
      prevStep,
      goToStep,
      replayCurrentStep,
      exitWalkthrough,
    }),
    [
      status,
      isPaused,
      stepIndex,
      step,
      sim,
      cursor,
      spotlightSelector,
      startWalkthrough,
      pauseWalkthrough,
      resumeWalkthrough,
      nextStep,
      prevStep,
      goToStep,
      replayCurrentStep,
      exitWalkthrough,
    ]
  );

  return (
    <DemoContext.Provider value={value}>
      <DemoProgressContext.Provider value={progress}>{children}</DemoProgressContext.Provider>
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemo must be used within DemoProvider");
  }
  return ctx;
}

export function useDemoProgress() {
  return useContext(DemoProgressContext);
}
