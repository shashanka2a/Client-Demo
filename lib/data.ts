import { Droplets, Scissors, Zap } from "lucide-react";
import type { FilterChip, ObsType } from "./types";

export const PROJECT = {
  name: "Sunridge Solar Farm — Phase II",
  status: "Active" as "Active" | "Paused" | "Completed",
  clientName: "Meridian Energy Partners, LLC",
  address: "4820 County Road 14\nBirmingham, AL 35242",
  jobNumber: "WET-2024-0147",
  contractExpiration: "December 31, 2025",
  contactName: "Marcus D. Webb",
  contactPhone: "(205) 448-7731",
  contactEmail: "m.webb@wickdenvironmental.com",
  superintendent: "Carlos R. Fuentes",
  superintendentPhone: "(205) 448-7740",
  acresCompleted: 142,
  totalAcres: 210,
  lastSpraying: "Jun 18, 2025",
  lastWicking: "Jun 24, 2025",
  hasMap: true,
};

export const TIMELINE = [
  { label: "Last Wicking", date: "Jun 24, 2025", type: "past", icon: Zap, color: "#5856D6" },
  { label: "Last Spraying", date: "Jun 18, 2025", type: "past", icon: Droplets, color: "#34C759" },
  { label: "Last Mowing", date: "Jun 10, 2025", type: "past", icon: Scissors, color: "#FF9500" },
  { label: "Next Wicking", date: "Jul 8, 2025", type: "upcoming", icon: Zap, color: "#FF6633" },
  { label: "Next Spraying", date: "Jul 14, 2025", type: "upcoming", icon: Droplets, color: "#FF6633" },
  { label: "Next Mowing", date: "—", type: "upcoming", icon: Scissors, color: "#FF6633" },
];

export const SITE_BOUNDARY: [number, number][] = [
  [33.5148, -86.8412],
  [33.5168, -86.8355],
  [33.5182, -86.8290],
  [33.5175, -86.8241],
  [33.5155, -86.8228],
  [33.5118, -86.8235],
  [33.5098, -86.8278],
  [33.5092, -86.8340],
  [33.5105, -86.8390],
  [33.5128, -86.8418],
  [33.5148, -86.8412],
];

export const SITE_CENTER: [number, number] = [33.5138, -86.8325];

export const ZONE_MARKERS: { id: string; pos: [number, number]; label: string; color: string }[] = [
  { id: "A", pos: [33.5155, -86.8370], label: "Zone A", color: "#34C759" },
  { id: "B", pos: [33.5162, -86.8310], label: "Zone B", color: "#FF9500" },
  { id: "C", pos: [33.5120, -86.8295], label: "Zone C", color: "#5856D6" },
  { id: "D", pos: [33.5108, -86.8355], label: "Zone D", color: "#34C759" },
];

export const OBSERVATIONS: {
  id: number;
  description: string;
  location: string;
  category: ObsType;
  priority: "Critical" | "High";
  status: "Open" | "In Progress";
}[] = [
  { id: 1, description: "Kudzu regrowth encroaching panel rows — immediate treatment needed", location: "Zone B — Row 12–18", category: "Environmental / Other", priority: "Critical", status: "Open" },
  { id: 2, description: "Unmarked utility conduit exposed at grade level, trip/dig hazard", location: "Zone A — Row 4", category: "Electrical Safety", priority: "Critical", status: "In Progress" },
  { id: 3, description: "Active erosion channel cutting through access road berm", location: "Zone C — South slope", category: "Environmental / Other", priority: "Critical", status: "Open" },
  { id: 4, description: "Cogongrass spreading along eastern fence line", location: "Zone D — Eastern perimeter", category: "Environmental / Other", priority: "High", status: "In Progress" },
  { id: 5, description: "Bermudagrass encroachment at panel base rows reducing clearance", location: "Zone A — Panel base rows", category: "Environmental / Other", priority: "High", status: "In Progress" },
  { id: 6, description: "Standing water accumulation around inverter pad — drainage blocked", location: "Zone B — Inverter pad 3", category: "Housekeeping", priority: "High", status: "Open" },
  { id: 7, description: "Damaged perimeter fence section — gap approx. 40 ft, unsecured", location: "North gate — 40 ft span", category: "Hazardous Materials – Chemicals", priority: "High", status: "Open" },
];

export const OBSERVATION_PINS = OBSERVATIONS.map((o, i) => ({
  id: o.id,
  description: o.description,
  location: o.location,
  category: o.category,
  priority: o.priority,
  status: o.status,
  pos: [
    33.5098 + (i * 0.0018) + Math.sin(i) * 0.003,
    -86.8412 + (i * 0.0025) + Math.cos(i) * 0.003,
  ] as [number, number],
}));

export const PHOTOS = [
  { id: 1, src: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop&auto=format", caption: "Zone B panel row mowing — post-treatment", date: "Jun 24, 2025", category: "Progress" as FilterChip },
  { id: 2, src: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=400&fit=crop&auto=format", caption: "Kudzu regrowth identified — Zone B Row 14", date: "Jun 22, 2025", category: "Chemical" as FilterChip },
  { id: 3, src: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=400&fit=crop&auto=format", caption: "Inverter pad 3 — standing water observation", date: "Jun 20, 2025", category: "Safety" as FilterChip },
  { id: 4, src: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=400&fit=crop&auto=format", caption: "Equipment staging — Zone D morning setup", date: "Jun 19, 2025", category: "Equipment" as FilterChip },
  { id: 5, src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&auto=format", caption: "Red-tailed hawk nesting near perimeter fence", date: "Jun 17, 2025", category: "Wildlife" as FilterChip },
  { id: 6, src: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=400&fit=crop&auto=format", caption: "Post-storm site condition — Zone C drainage", date: "Jun 14, 2025", category: "Weather" as FilterChip },
  { id: 7, src: "https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?w=400&h=400&fit=crop&auto=format", caption: "Chemical application — herbicide spraying Zone A", date: "Jun 10, 2025", category: "Chemical" as FilterChip },
  { id: 8, src: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=400&h=400&fit=crop&auto=format", caption: "Progress overview — Phase II central array", date: "Jun 6, 2025", category: "Progress" as FilterChip },
];

export const REPORTS = [
  { id: 1, date: "Jun 24, 2025", preparedBy: "Carlos R. Fuentes", description: "Wicking operations — Zones A & B complete" },
  { id: 2, date: "Jun 23, 2025", preparedBy: "Devon T. Marsh", description: "Site inspection & watchlist update" },
  { id: 3, date: "Jun 20, 2025", preparedBy: "Carlos R. Fuentes", description: "Standing water assessment — Inverter Pad 3" },
  { id: 4, date: "Jun 18, 2025", preparedBy: "Devon T. Marsh", description: "Chemical application — herbicide Zone D" },
  { id: 5, date: "Jun 14, 2025", preparedBy: "Carlos R. Fuentes", description: "Post-storm site survey — all zones" },
  { id: 6, date: "Jun 10, 2025", preparedBy: "Devon T. Marsh", description: "Mowing operations — Zone C & perimeter" },
  { id: 7, date: "Jun 6, 2025", preparedBy: "Carlos R. Fuentes", description: "Weekly progress inspection" },
];

export const DEMO_CREDENTIALS: { username: string; password: string }[] = [];

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=400&fit=crop&auto=format";
