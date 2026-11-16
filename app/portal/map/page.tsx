import type { Metadata } from "next";
import { MapPageClient } from "@/components/portal/map-page-client";

export const metadata: Metadata = {
  title: "Map",
};

export default function MapPage() {
  return <MapPageClient />;
}
