"use client";

import { BottomNav, DesktopSidebar, MobilePortalHeader } from "@/components/portal/navigation";
import { ProjectProvider } from "@/contexts/project-context";
import { PortalProjectGate } from "@/components/portal/portal-project-gate";
import { ProjectKmzSync } from "@/components/portal/project-kmz-sync";
import { DemoProvider } from "@/contexts/demo-context";
import { AnimatedCursor } from "@/components/demo/animated-cursor";
import { WalkthroughCard } from "@/components/demo/walkthrough-card";
import { SpotlightOverlay } from "@/components/demo/spotlight-overlay";
import { FreeExplorationBadge } from "@/components/demo/free-exploration-badge";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <DemoProvider>
        <ProjectKmzSync />
        <SpotlightOverlay />
        <AnimatedCursor />
        <WalkthroughCard />
        <FreeExplorationBadge />

        <div className="min-h-screen bg-background">
          <DesktopSidebar />
          <div className="lg:pl-60">
            <div className="max-w-[430px] mx-auto lg:max-w-none">
              <PortalProjectGate>
                <MobilePortalHeader />
                {children}
              </PortalProjectGate>
            </div>
          </div>
          <BottomNav />
        </div>
      </DemoProvider>
    </ProjectProvider>
  );
}
