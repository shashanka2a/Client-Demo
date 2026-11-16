import type { Metadata } from "next";
import { GalleryScreen } from "@/components/portal/gallery-screen";

export const metadata: Metadata = {
  title: "Photo Gallery",
};

export default function GalleryPage() {
  return <GalleryScreen />;
}
