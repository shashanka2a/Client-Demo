"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import type {
  PortalClient,
  PortalData,
  PortalObservation,
  PortalPhoto,
  PortalProject,
  PortalTimelineItem,
} from "@/lib/portal/types";
import { HERO_FALLBACK } from "@/lib/portal/map-portal-data";

const ACTIVE_PROJECT_KEY = "wickd-active-project-id";

type ProjectContextValue = {
  client: PortalClient | null;
  projects: PortalProject[];
  activeProject: PortalProject | null;
  setActiveProjectId: (projectId: string) => void;
  observations: PortalObservation[];
  photos: PortalPhoto[];
  timeline: PortalTimelineItem[];
  heroImage: string;
  isLoading: boolean;
  error: string | null;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady: authReady } = useAuth();
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/portal/data", { cache: "no-store" });
      const payload = (await response.json()) as PortalData & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load project data");
      }

      setPortalData(payload);

      const storedProjectId = sessionStorage.getItem(ACTIVE_PROJECT_KEY);
      const nextProjectId =
        payload.projects.find((project) => project.id === storedProjectId)?.id ??
        payload.projects[0]?.id ??
        null;

      setActiveProjectId(nextProjectId);
      if (nextProjectId) {
        sessionStorage.setItem(ACTIVE_PROJECT_KEY, nextProjectId);
      } else {
        sessionStorage.removeItem(ACTIVE_PROJECT_KEY);
      }
    } catch (err) {
      if (!silent) {
        setPortalData(null);
        setActiveProjectId(null);
        setError(err instanceof Error ? err.message : "Failed to load project data");
      } else {
        console.warn("[portal] silent refresh failed:", err);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!isAuthenticated) {
      setPortalData(null);
      setActiveProjectId(null);
      setError(null);
      return;
    }

    void refresh();
  }, [authReady, isAuthenticated, refresh]);

  const setActiveProjectIdAndPersist = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    sessionStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
  }, []);

  const activeProject =
    portalData?.projects.find((project) => project.id === activeProjectId) ?? null;

  const value = useMemo<ProjectContextValue>(
    () => ({
      client: portalData?.client ?? null,
      projects: portalData?.projects ?? [],
      activeProject,
      setActiveProjectId: setActiveProjectIdAndPersist,
      observations:
        activeProject && portalData
          ? portalData.observations[activeProject.id] ?? []
          : [],
      photos:
        activeProject && portalData ? portalData.photos[activeProject.id] ?? [] : [],
      timeline:
        activeProject && portalData ? portalData.timelines[activeProject.id] ?? [] : [],
      heroImage: activeProject?.coverPhotoUrl ?? HERO_FALLBACK,
      isLoading,
      error,
      refresh,
    }),
    [
      portalData,
      activeProject,
      setActiveProjectIdAndPersist,
      isLoading,
      error,
      refresh,
    ]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject must be used within ProjectProvider");
  }
  return ctx;
}

/** Safe hook for screens that may render outside the portal provider. */
export function useOptionalProject() {
  return useContext(ProjectContext);
}
