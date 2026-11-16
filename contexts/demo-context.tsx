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
import { useRouter, usePathname } from "next/navigation";
import { useProject } from "@/contexts/project-context";

export type DemoWorkflowId =
  | "portfolio"
  | "overview"
  | "map"
  | "health"
  | "gallery"
  | "reports"
  | "profile";

export type SidebarModuleInfo = {
  name: string;
  targetRole: string;
  purposeSummary: string;
};

export type DemoStep = {
  id: string;
  workflowId: DemoWorkflowId;
  workflowTitle: string;
  stepNumber: number;
  totalStepsInWorkflow: number;
  globalIndex: number;
  title: string;
  path: string;
  actionLabel?: string;
  description: string;
  valueTakeaway: string;
  durationMs: number;
  targetSelector?: string;
  simulatedAction?: "click" | "type" | "expand" | "lightbox" | "switch-project" | "tab-resolved";
  actionPayload?: string;
  cursorTarget?: { xPercent: number; yPercent: number };
  sidebarModule?: SidebarModuleInfo;
};

export const DEMO_WORKFLOWS: { id: DemoWorkflowId; title: string; count: number }[] = [
  { id: "portfolio", title: "Portfolio Assets", count: 2 },
  { id: "overview", title: "Overview", count: 4 },
  { id: "map", title: "Project Map", count: 3 },
  { id: "health", title: "Site Health", count: 4 },
  { id: "gallery", title: "Photo Gallery", count: 4 },
  { id: "reports", title: "Daily Reports", count: 3 },
  { id: "profile", title: "Account Profile", count: 2 },
];

export const DEMO_STEPS: DemoStep[] = [
  // ==========================================
  // Workflow 1: Portfolio Assets (2 steps)
  // ==========================================
  {
    id: "portfolio-switcher-nav",
    workflowId: "portfolio",
    workflowTitle: "Portfolio Assets",
    stepNumber: 1,
    totalStepsInWorkflow: 2,
    globalIndex: 0,
    title: "Multi-Asset Portfolio Switcher",
    path: "/portal/overview",
    actionLabel: "Inspecting Portfolio Switcher",
    targetSelector: "[data-demo='nav-portfolio-switcher']",
    cursorTarget: { xPercent: 8, yPercent: 12 },
    description:
      "Switch between contracted solar farms, transmission corridors, and substation easements without needing separate logins.",
    valueTakeaway: "Consolidated multi-facility management under one client account.",
    durationMs: 7000,
  },
  {
    id: "portfolio-switcher-action",
    workflowId: "portfolio",
    workflowTitle: "Portfolio Assets",
    stepNumber: 2,
    totalStepsInWorkflow: 2,
    globalIndex: 1,
    title: "Isolated Facility Loading",
    path: "/portal/overview",
    actionLabel: "Loading Tupelo Solar Facility",
    targetSelector: "[data-demo='nav-portfolio-switcher']",
    cursorTarget: { xPercent: 10, yPercent: 13 },
    simulatedAction: "switch-project",
    actionPayload: "proj-tupelo-block-a",
    description:
      "Selecting an asset dynamically loads its GIS boundaries, acreage metrics, maintenance schedules, and dedicated field superintendent.",
    valueTakeaway: "Zero risk of data mixing between independent utility off-takers.",
    durationMs: 6500,
  },

  // ==========================================
  // Workflow 2: Overview (4 steps)
  // ==========================================
  {
    id: "overview-nav",
    workflowId: "overview",
    workflowTitle: "Overview",
    stepNumber: 1,
    totalStepsInWorkflow: 4,
    globalIndex: 2,
    title: "Overview Dashboard",
    path: "/portal/overview",
    actionLabel: "Opening Overview",
    targetSelector: "[data-demo='nav-overview']",
    cursorTarget: { xPercent: 8, yPercent: 19 },
    simulatedAction: "switch-project",
    actionPayload: "proj-everglades-solar",
    description:
      "The client landing page provides an immediate operational summary of active acreage, vegetation status, contacts, and maintenance schedules.",
    valueTakeaway: "Single source of truth replacing fragmented status emails.",
    durationMs: 6500,
  },
  {
    id: "overview-kpis",
    workflowId: "overview",
    workflowTitle: "Overview",
    stepNumber: 2,
    totalStepsInWorkflow: 4,
    globalIndex: 3,
    title: "Contract Specifications & Directory",
    path: "/portal/overview",
    targetSelector: "[data-demo='general-info-toggle']",
    cursorTarget: { xPercent: 50, yPercent: 32 },
    simulatedAction: "expand",
    actionLabel: "Viewing Contract Details",
    description:
      "Review contract specifications, PO numbers, site address, and direct phone lines for the assigned Wick'd project manager and superintendent.",
    valueTakeaway: "Direct access to field leadership with zero support ticket friction.",
    durationMs: 7000,
  },
  {
    id: "overview-schedule",
    workflowId: "overview",
    workflowTitle: "Overview",
    stepNumber: 3,
    totalStepsInWorkflow: 4,
    globalIndex: 4,
    title: "Maintenance & Mowing Schedule",
    path: "/portal/overview",
    targetSelector: "[data-demo='maintenance-timeline']",
    cursorTarget: { xPercent: 30, yPercent: 55 },
    description:
      "Tracks past and scheduled wicking, mowing, and herbicide cycles to ensure ground cover stays below tracker row height limits.",
    valueTakeaway: "Transparent operational schedule preventing panel shading and power production losses.",
    durationMs: 7000,
  },
  {
    id: "overview-inquiry",
    workflowId: "overview",
    workflowTitle: "Overview",
    stepNumber: 4,
    totalStepsInWorkflow: 4,
    globalIndex: 5,
    title: "Direct Site Inquiries",
    path: "/portal/overview",
    targetSelector: "[data-demo='request-section']",
    cursorTarget: { xPercent: 50, yPercent: 78 },
    actionLabel: "Sending Request to Superintendent",
    simulatedAction: "type",
    actionPayload:
      "Can we get an updated acreage count for Zone B before Friday's review?",
    description:
      "Submit questions or service requests directly to the project manager. Messages are routed straight to field leadership.",
    valueTakeaway: "Fast communication channel tied directly to the active project.",
    durationMs: 7500,
  },

  // ==========================================
  // Workflow 3: Project Map (3 steps)
  // ==========================================
  {
    id: "map-nav",
    workflowId: "map",
    workflowTitle: "Project Map",
    stepNumber: 1,
    totalStepsInWorkflow: 3,
    globalIndex: 6,
    title: "Satellite GIS & CAD Mapping",
    path: "/portal/map",
    targetSelector: "[data-demo='nav-map']",
    cursorTarget: { xPercent: 8, yPercent: 25 },
    actionLabel: "Opening Map Module",
    description:
      "Visualizes CAD/KMZ engineering layers directly on high-resolution satellite imagery—including panel blocks, inverter pads, and access roads.",
    valueTakeaway: "Full spatial visibility across 200+ acre facilities without CAD licenses.",
    durationMs: 7000,
  },
  {
    id: "map-layers",
    workflowId: "map",
    workflowTitle: "Project Map",
    stepNumber: 2,
    totalStepsInWorkflow: 3,
    globalIndex: 7,
    title: "Boundary & Layer Controls",
    path: "/portal/map",
    targetSelector: "[data-demo='map-controls']",
    cursorTarget: { xPercent: 25, yPercent: 12 },
    actionLabel: "Toggling Map Layers",
    simulatedAction: "click",
    description:
      "Toggle panel array boundaries, inverter pins, and observation clusters to focus on specific zones or inspect access routes.",
    valueTakeaway: "Filter complex engineering data with one click.",
    durationMs: 6500,
  },
  {
    id: "map-pins",
    workflowId: "map",
    workflowTitle: "Project Map",
    stepNumber: 3,
    totalStepsInWorkflow: 3,
    globalIndex: 8,
    title: "Geotagged Field Observations",
    path: "/portal/map",
    targetSelector: "[data-demo='map-observation-card']",
    cursorTarget: { xPercent: 50, yPercent: 80 },
    actionLabel: "Inspecting Geotagged Pin",
    simulatedAction: "click",
    description:
      "Click mapped pins to inspect localized hazards, environmental notes, and photo records tied to exact latitude and longitude coordinates.",
    valueTakeaway: "Connects field observations directly to specific inverter rows and tracker blocks.",
    durationMs: 7000,
  },

  // ==========================================
  // Workflow 4: Site Health (4 steps)
  // ==========================================
  {
    id: "health-nav",
    workflowId: "health",
    workflowTitle: "Site Health",
    stepNumber: 1,
    totalStepsInWorkflow: 4,
    globalIndex: 9,
    title: "Site Health Watchlist",
    path: "/portal/health",
    targetSelector: "[data-demo='nav-health']",
    cursorTarget: { xPercent: 8, yPercent: 31 },
    actionLabel: "Opening Site Health",
    description:
      "Tracks site hazards such as vine growth near tracker motors, panel shading risks, and stormwater runoff across the facility.",
    valueTakeaway: "Proactive risk detection preventing equipment damage and power losses.",
    durationMs: 7000,
  },
  {
    id: "health-lifecycle",
    workflowId: "health",
    workflowTitle: "Site Health",
    stepNumber: 2,
    totalStepsInWorkflow: 4,
    globalIndex: 10,
    title: "Open vs. Resolved Triage",
    path: "/portal/health",
    targetSelector: "[data-demo='health-tabs']",
    cursorTarget: { xPercent: 50, yPercent: 18 },
    actionLabel: "Toggling Status Tabs",
    simulatedAction: "tab-resolved",
    description:
      "Filter between open issues requiring contractor remediation and resolved items verified by field supervisors.",
    valueTakeaway: "Closed-loop verification confirming remediated items are permanently compliant.",
    durationMs: 6500,
  },
  {
    id: "health-audit",
    workflowId: "health",
    workflowTitle: "Site Health",
    stepNumber: 3,
    totalStepsInWorkflow: 4,
    globalIndex: 11,
    title: "Issue Cards & Audit Trail",
    path: "/portal/health",
    targetSelector: "[data-demo='observation-card-first']",
    cursorTarget: { xPercent: 50, yPercent: 34 },
    actionLabel: "Expanding Observation Card",
    simulatedAction: "expand",
    description:
      "Expand any card to review hazard severity badges, row location tags, due dates, crew assignments, and superintendent action logs.",
    valueTakeaway: "Transparent documentation for off-taker audits, insurers, and regulators.",
    durationMs: 7000,
  },
  {
    id: "health-proof",
    workflowId: "health",
    workflowTitle: "Site Health",
    stepNumber: 4,
    totalStepsInWorkflow: 4,
    globalIndex: 12,
    title: "Photographic Verification",
    path: "/portal/health",
    targetSelector: "[data-demo='observation-photo']",
    cursorTarget: { xPercent: 20, yPercent: 50 },
    actionLabel: "Inspecting Verification Photo",
    simulatedAction: "lightbox",
    description:
      "High-resolution photos provide visual proof of completed vegetation clearing and herbicide efficacy before sign-off.",
    valueTakeaway: "Clear photographic confirmation that contracted work orders are fulfilled.",
    durationMs: 7000,
  },

  // ==========================================
  // Workflow 5: Photo Gallery (4 steps)
  // ==========================================
  {
    id: "gallery-nav",
    workflowId: "gallery",
    workflowTitle: "Photo Gallery",
    stepNumber: 1,
    totalStepsInWorkflow: 4,
    globalIndex: 13,
    title: "Photo Evidence Gallery",
    path: "/portal/gallery",
    targetSelector: "[data-demo='nav-photos']",
    cursorTarget: { xPercent: 8, yPercent: 37 },
    actionLabel: "Opening Photo Gallery",
    description:
      "A chronological visual archive capturing drone aerials, equipment passes, chemical applications, and site conditions.",
    valueTakeaway: "Remote visual inspection across large-scale facilities without site visits.",
    durationMs: 7000,
  },
  {
    id: "gallery-categories",
    workflowId: "gallery",
    workflowTitle: "Photo Gallery",
    stepNumber: 2,
    totalStepsInWorkflow: 4,
    globalIndex: 14,
    title: "Operational Category Chips",
    path: "/portal/gallery",
    targetSelector: "[data-demo='gallery-chips']",
    cursorTarget: { xPercent: 25, yPercent: 22 },
    actionLabel: "Filtering by Progress",
    simulatedAction: "click",
    actionPayload: "Progress",
    description:
      "Filter photos by operational category: Progress, Equipment, Chemical Application, Safety, Wildlife, or Weather.",
    valueTakeaway: "Locate specific photographic evidence in seconds across hundreds of site uploads.",
    durationMs: 6500,
  },
  {
    id: "gallery-search",
    workflowId: "gallery",
    workflowTitle: "Photo Gallery",
    stepNumber: 3,
    totalStepsInWorkflow: 4,
    globalIndex: 15,
    title: "Keyword & Species Search",
    path: "/portal/gallery",
    targetSelector: "[data-demo='gallery-search']",
    cursorTarget: { xPercent: 50, yPercent: 16 },
    actionLabel: "Searching Photos for 'Kudzu'",
    simulatedAction: "type",
    actionPayload: "Kudzu",
    description:
      "Instant search finds matching plant species, equipment types, or project block captions in real time.",
    valueTakeaway: "Instant documentation lookup for targeted site zones.",
    durationMs: 7000,
  },
  {
    id: "gallery-lightbox",
    workflowId: "gallery",
    workflowTitle: "Photo Gallery",
    stepNumber: 4,
    totalStepsInWorkflow: 4,
    globalIndex: 16,
    title: "Full-Resolution Inspection",
    path: "/portal/gallery",
    targetSelector: "[data-demo='gallery-first-photo']",
    cursorTarget: { xPercent: 25, yPercent: 38 },
    actionLabel: "Viewing High-Res Image Detail",
    simulatedAction: "lightbox",
    description:
      "Click any photo to open full-resolution imagery with timestamp metadata, GPS coordinates, and superintendent field captions.",
    valueTakeaway: "Zoom into tracker row bases and cable trays on desktop or mobile.",
    durationMs: 7000,
  },

  // ==========================================
  // Workflow 6: Daily Reports (3 steps)
  // ==========================================
  {
    id: "reports-nav",
    workflowId: "reports",
    workflowTitle: "Daily Reports",
    stepNumber: 1,
    totalStepsInWorkflow: 3,
    globalIndex: 17,
    title: "Certified Daily Field Logs",
    path: "/portal/reports",
    targetSelector: "[data-demo='nav-reports']",
    cursorTarget: { xPercent: 8, yPercent: 43 },
    actionLabel: "Opening Daily Reports",
    description:
      "Access certified daily field logs submitted by licensed project superintendents, recording daily work completed and site conditions.",
    valueTakeaway: "Verified digital compliance records replacing manual paper logs.",
    durationMs: 7000,
  },
  {
    id: "reports-cards",
    workflowId: "reports",
    workflowTitle: "Daily Reports",
    stepNumber: 2,
    totalStepsInWorkflow: 3,
    globalIndex: 18,
    title: "Daily Log Columns & Metrics",
    path: "/portal/reports",
    targetSelector: "[data-demo='reports-first-card']",
    cursorTarget: { xPercent: 50, yPercent: 30 },
    actionLabel: "Expanding Report Details",
    simulatedAction: "expand",
    description:
      "Each log row displays cleared acreage (+28 ac), weather and wind drift conditions, logged delays, crew headcounts, and verified digital signatures.",
    valueTakeaway: "Documented weather and wind velocity records for drift compliance.",
    durationMs: 7500,
  },
  {
    id: "reports-export",
    workflowId: "reports",
    workflowTitle: "Daily Reports",
    stepNumber: 3,
    totalStepsInWorkflow: 3,
    globalIndex: 19,
    title: "Official PDF Compliance Export",
    path: "/portal/reports",
    targetSelector: "[data-demo='report-download-btn']",
    cursorTarget: { xPercent: 50, yPercent: 82 },
    actionLabel: "Downloading Signed PDF",
    simulatedAction: "click",
    description:
      "Download official signed PDF reports ready for distribution to utility off-takers, lenders, and asset management reviews.",
    valueTakeaway: "Generates audit-ready compliance packages in a single click.",
    durationMs: 7000,
  },

  // ==========================================
  // Workflow 7: Account Profile (2 steps)
  // ==========================================
  {
    id: "profile-nav",
    workflowId: "profile",
    workflowTitle: "Account Profile",
    stepNumber: 1,
    totalStepsInWorkflow: 2,
    globalIndex: 20,
    title: "Account & Access Profile",
    path: "/portal/profile",
    targetSelector: "[data-demo='nav-profile']",
    cursorTarget: { xPercent: 8, yPercent: 92 },
    actionLabel: "Opening Profile",
    description:
      "View client organization identity, authorized stakeholder access, and assigned facility permissions.",
    valueTakeaway: "Secure tenant access ensuring proprietary site data remains confidential.",
    durationMs: 6500,
  },
  {
    id: "profile-guardrails",
    workflowId: "profile",
    workflowTitle: "Account Profile",
    stepNumber: 2,
    totalStepsInWorkflow: 2,
    globalIndex: 21,
    title: "Guided Tour Complete",
    path: "/portal/profile",
    targetSelector: "[data-demo='profile-card']",
    cursorTarget: { xPercent: 50, yPercent: 30 },
    description:
      "You have completed the walkthrough! You can now freely explore the client portal, toggle GIS layers, test photo filters, and view reports.",
    valueTakeaway: "Full hands-on access to test every feature of the client portal.",
    durationMs: 8000,
  },
];

type DemoContextValue = {
  isDemoActive: boolean;
  isWalkthroughRunning: boolean;
  isPaused: boolean;
  currentStepIndex: number;
  currentStep: DemoStep;
  progressPercent: number;
  playbackSpeed: number;
  cursorPos: { x: number; y: number; visible: boolean; clicking: boolean };
  cursorText: string;
  simulatedExpanded: boolean;
  simulatedTab: "open" | "resolved";
  simulatedSearch: string;
  simulatedModalOpen: boolean;
  startWalkthrough: (fromBeginning?: boolean) => void;
  pauseWalkthrough: () => void;
  resumeWalkthrough: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  jumpToWorkflow: (workflowId: DemoWorkflowId) => void;
  replayCurrentStep: () => void;
  exitWalkthrough: () => void;
  setSpeed: (speed: number) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const projectCtx = useProject();

  const [isWalkthroughRunning, setIsWalkthroughRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Animated cursor state
  const [cursorPos, setCursorPos] = useState<{
    x: number;
    y: number;
    visible: boolean;
    clicking: boolean;
  }>({
    x: 50,
    y: 50,
    visible: false,
    clicking: false,
  });
  const [cursorText, setCursorText] = useState("");

  // Simulated screen interactions
  const [simulatedExpanded, setSimulatedExpanded] = useState(false);
  const [simulatedTab, setSimulatedTab] = useState<"open" | "resolved">("open");
  const [simulatedSearch, setSimulatedSearch] = useState("");
  const [simulatedModalOpen, setSimulatedModalOpen] = useState(false);

  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepStartTimeRef = useRef<number>(0);

  const currentStep = DEMO_STEPS[currentStepIndex] ?? DEMO_STEPS[0]!;

  // Handle navigation and simulated actions when step changes
  useEffect(() => {
    if (!isWalkthroughRunning) {
      setCursorPos((prev) => ({ ...prev, visible: false }));
      return;
    }

    const step = currentStep;

    // Route to correct page if needed
    if (pathname !== step.path) {
      router.push(step.path);
    }

    // Position cursor with dynamic DOM target precision
    const updateCursorPosition = () => {
      if (typeof window !== "undefined" && step.targetSelector) {
        const el = document.querySelector(step.targetSelector);
        if (el) {
          const rect = el.getBoundingClientRect();
          const xPercent = Math.min(95, Math.max(3, ((rect.left + rect.width / 2) / window.innerWidth) * 100));
          const yPercent = Math.min(95, Math.max(3, ((rect.top + rect.height / 2) / window.innerHeight) * 100));
          setCursorPos({
            x: Math.round(xPercent),
            y: Math.round(yPercent),
            visible: true,
            clicking: false,
          });
          return;
        }
      }
      if (step.cursorTarget) {
        setCursorPos({
          x: step.cursorTarget.xPercent,
          y: step.cursorTarget.yPercent,
          visible: true,
          clicking: false,
        });
      }
    };

    updateCursorPosition();
    const t1 = setTimeout(updateCursorPosition, 100);
    const t2 = setTimeout(updateCursorPosition, 300);
    const t3 = setTimeout(updateCursorPosition, 600);

    // Reset step simulated states
    setSimulatedExpanded(false);
    setSimulatedTab("open");
    setSimulatedSearch("");
    setSimulatedModalOpen(false);
    setCursorText("");

    // Schedule simulated action halfway through the step duration
    const actionDelay = (step.durationMs * 0.4) / playbackSpeed;
    const actionTimer = setTimeout(() => {
      // Trigger click animation
      setCursorPos((prev) => ({ ...prev, clicking: true }));
      setTimeout(() => setCursorPos((prev) => ({ ...prev, clicking: false })), 400);

      // Perform simulated action
      if (step.simulatedAction === "expand") {
        setSimulatedExpanded(true);
      } else if (step.simulatedAction === "tab-resolved") {
        setSimulatedTab("resolved");
        setTimeout(() => setSimulatedTab("open"), 3000);
      } else if (step.simulatedAction === "type") {
        const text = step.actionPayload || "Kudzu";
        let cur = "";
        const interval = setInterval(() => {
          if (cur.length < text.length) {
            cur = text.slice(0, cur.length + 1);
            setCursorText(cur);
            setSimulatedSearch(cur);
          } else {
            clearInterval(interval);
          }
        }, 60);
      } else if (step.simulatedAction === "lightbox") {
        setSimulatedModalOpen(true);
        setTimeout(() => setSimulatedModalOpen(false), 2500);
      } else if (step.simulatedAction === "switch-project" && step.actionPayload) {
        projectCtx?.setActiveProjectId(step.actionPayload);
      }
    }, actionDelay);

    return () => {
      clearTimeout(actionTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentStepIndex, isWalkthroughRunning, playbackSpeed, pathname, router, projectCtx, currentStep]);

  // Step countdown and auto-advance
  useEffect(() => {
    if (!isWalkthroughRunning || isPaused) {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const duration = currentStep.durationMs / playbackSpeed;
    stepStartTimeRef.current = Date.now();
    setProgressPercent(0);

    // Update progress bar smoothly
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - stepStartTimeRef.current;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgressPercent(pct);
    }, 100);

    // Advance to next step when duration expires
    stepTimerRef.current = setTimeout(() => {
      if (currentStepIndex < DEMO_STEPS.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        // Tour completed
        setIsWalkthroughRunning(false);
        setIsPaused(false);
      }
    }, duration);

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentStepIndex, isWalkthroughRunning, isPaused, playbackSpeed, currentStep]);

  const startWalkthrough = useCallback((fromBeginning = true) => {
    if (fromBeginning) {
      setCurrentStepIndex(0);
    }
    setIsWalkthroughRunning(true);
    setIsPaused(false);
    setProgressPercent(0);
  }, []);

  const pauseWalkthrough = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeWalkthrough = useCallback(() => {
    setIsPaused(false);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setProgressPercent(0);
    } else {
      setIsWalkthroughRunning(false);
    }
  }, [currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setProgressPercent(0);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < DEMO_STEPS.length) {
      setCurrentStepIndex(index);
      setProgressPercent(0);
      setIsWalkthroughRunning(true);
      setIsPaused(false);
    }
  }, []);

  const jumpToWorkflow = useCallback((workflowId: DemoWorkflowId) => {
    const firstStepIndex = DEMO_STEPS.findIndex((s) => s.workflowId === workflowId);
    if (firstStepIndex !== -1) {
      setCurrentStepIndex(firstStepIndex);
      setProgressPercent(0);
      setIsWalkthroughRunning(true);
      setIsPaused(false);
    }
  }, []);

  const replayCurrentStep = useCallback(() => {
    setProgressPercent(0);
    setCurrentStepIndex((prev) => prev); // re-trigger
  }, []);

  const exitWalkthrough = useCallback(() => {
    setIsWalkthroughRunning(false);
    setIsPaused(false);
    setProgressPercent(0);
    setCursorPos((prev) => ({ ...prev, visible: false }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  const value = useMemo(
    () => ({
      isDemoActive: true,
      isWalkthroughRunning,
      isPaused,
      currentStepIndex,
      currentStep,
      progressPercent,
      playbackSpeed,
      cursorPos,
      cursorText,
      simulatedExpanded,
      simulatedTab,
      simulatedSearch,
      simulatedModalOpen,
      startWalkthrough,
      pauseWalkthrough,
      resumeWalkthrough,
      nextStep,
      prevStep,
      goToStep,
      jumpToWorkflow,
      replayCurrentStep,
      exitWalkthrough,
      setSpeed,
    }),
    [
      isWalkthroughRunning,
      isPaused,
      currentStepIndex,
      currentStep,
      progressPercent,
      playbackSpeed,
      cursorPos,
      cursorText,
      simulatedExpanded,
      simulatedTab,
      simulatedSearch,
      simulatedModalOpen,
      startWalkthrough,
      pauseWalkthrough,
      resumeWalkthrough,
      nextStep,
      prevStep,
      goToStep,
      jumpToWorkflow,
      replayCurrentStep,
      exitWalkthrough,
      setSpeed,
    ]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemo must be used within DemoProvider");
  }
  return ctx;
}
