import type { Metadata } from "next";
import { HealthScreen } from "@/components/portal/health-screen";

export const metadata: Metadata = {
  title: "Site Health",
};

export default function HealthPage() {
  return <HealthScreen />;
}
