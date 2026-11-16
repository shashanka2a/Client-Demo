import type { LucideIcon } from "lucide-react";

export type ProjectStatus = "Active" | "Paused" | "Completed";

export type PortalProject = {
  id: string;
  name: string;
  status: ProjectStatus;
  clientName: string;
  address: string;
  jobNumber: string;
  contractExpiration: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  superintendent: string;
  superintendentPhone: string;
  acresCompleted: number;
  totalAcres: number;
  lastSpraying: string;
  lastWicking: string;
  coverPhotoUrl: string | null;
  kmzUrl: string | null;
  kmzFilename: string | null;
  /** Changes on every dashboard KMZ upload — used to bust client cache */
  kmzUploadedAt: string | null;
  googleEarthUrl: string | null;
  hasMap: boolean;
};

export type PortalClient = {
  id: string;
  name: string;
  email: string;
  companyName: string;
};

export type PortalObservationPhoto = {
  id: string;
  url: string;
  label: string;
};

export type PortalObservationHistoryEntry = {
  id: string;
  label: string;
  date: string;
  detail?: string;
};

export type PortalObservation = {
  id: string;
  /** Primary heading from DB `title` */
  title: string;
  /** Broader class from DB `type` (e.g. Hazards on Site) */
  observationType: string;
  /** Positive / Negative from DB `category` */
  sentiment: "Positive" | "Negative" | string;
  description: string;
  location: string;
  status: "Open" | "Resolved" | string;
  progress: string;
  tags: string[];
  attachmentCount: number;
  photos: PortalObservationPhoto[];
  history: PortalObservationHistoryEntry[];
  dueDate: string;
  date: string;
};

export type PortalPhoto = {
  id: string;
  src: string;
  caption: string;
  date: string;
  category: string;
};

export type PortalReport = {
  id: string;
  date: string;
  preparedBy: string;
  description: string;
};

export type PortalTimelineItem = {
  label: string;
  date: string;
  type: "past" | "upcoming";
  iconName: "droplets" | "zap" | "scissors";
  color: string;
};

export type PortalData = {
  client: PortalClient;
  projects: PortalProject[];
  observations: Record<string, PortalObservation[]>;
  photos: Record<string, PortalPhoto[]>;
  reports: Record<string, PortalReport[]>;
  timelines: Record<string, PortalTimelineItem[]>;
};

export type TimelineIconName = PortalTimelineItem["iconName"];

export type TimelineIconMap = Record<TimelineIconName, LucideIcon>;
