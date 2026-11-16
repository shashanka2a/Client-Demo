"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useProject } from "@/contexts/project-context";

const MapScreen = dynamic(
  () => import("@/components/portal/map-screen").then((m) => m.MapScreen),
  { ssr: false, loading: () => <div className="h-dvh bg-[#0D0D0D] animate-pulse" /> }
);

export function MapPageClient() {
  const { refresh } = useProject();

  // Always pull latest project KMZ metadata when opening Map (without blocking the page).
  useEffect(() => {
    void refresh({ silent: true });
  }, [refresh]);

  return <MapScreen />;
}
