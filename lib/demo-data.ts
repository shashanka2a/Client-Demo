import type {
  PortalClient,
  PortalData,
  PortalObservation,
  PortalPhoto,
  PortalProject,
  PortalReport,
  PortalTimelineItem,
} from "@/lib/portal/types";

export const DEMO_CLIENT: PortalClient = {
  id: "client-meridian-001",
  name: "Sarah Jenkins",
  email: "demo@meridianenergy.com",
  companyName: "Meridian Energy Partners, LLC",
};

export const DEMO_PROJECTS: PortalProject[] = [
  {
    id: "proj-sunridge-phase-2",
    name: "Sunridge Solar Farm — Phase II",
    status: "Active",
    clientName: "Meridian Energy Partners, LLC",
    address: "4820 County Road 14\nBirmingham, AL 35242",
    jobNumber: "WET-2024-0147",
    contractExpiration: "Dec 31, 2025",
    contactName: "Marcus D. Webb",
    contactPhone: "(205) 448-7731",
    contactEmail: "m.webb@wickdenvironmental.com",
    superintendent: "Carlos R. Fuentes",
    superintendentPhone: "(205) 448-7740",
    acresCompleted: 142,
    totalAcres: 210,
    lastSpraying: "Jun 18, 2025",
    lastWicking: "Jun 24, 2025",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=600&fit=crop&auto=format",
    kmzUrl: "/api/boundary.kmz",
    kmzFilename: "WICKD_Tupelo Panel Mapping.kmz",
    kmzUploadedAt: "2025-06-24T14:30:00Z",
    googleEarthUrl: null,
    hasMap: true,
  },
  {
    id: "proj-tupelo-block-a",
    name: "Tupelo Solar Facility — Block A",
    status: "Active",
    clientName: "Meridian Energy Partners, LLC",
    address: "1120 Industrial Parkway\nTupelo, MS 38801",
    jobNumber: "WET-2024-0288",
    contractExpiration: "Nov 15, 2026",
    contactName: "Devon T. Marsh",
    contactPhone: "(662) 555-0192",
    contactEmail: "d.marsh@wickdenvironmental.com",
    superintendent: "Carlos R. Fuentes",
    superintendentPhone: "(205) 448-7740",
    acresCompleted: 275,
    totalAcres: 340,
    lastSpraying: "Jun 22, 2025",
    lastWicking: "Jun 26, 2025",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1200&h=600&fit=crop&auto=format",
    kmzUrl: "/api/boundary.kmz",
    kmzFilename: "WICKD_Tupelo Panel Mapping.kmz",
    kmzUploadedAt: "2025-06-26T10:15:00Z",
    googleEarthUrl: null,
    hasMap: true,
  },
  {
    id: "proj-talladega-highland",
    name: "Talladega Highland Solar Farm",
    status: "Completed",
    clientName: "Meridian Energy Partners, LLC",
    address: "840 Ridge Rd\nTalladega, AL 35160",
    jobNumber: "WET-2023-0912",
    contractExpiration: "Aug 30, 2025",
    contactName: "Marcus D. Webb",
    contactPhone: "(205) 448-7731",
    contactEmail: "m.webb@wickdenvironmental.com",
    superintendent: "Carlos R. Fuentes",
    superintendentPhone: "(205) 448-7740",
    acresCompleted: 185,
    totalAcres: 185,
    lastSpraying: "May 14, 2025",
    lastWicking: "May 20, 2025",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=1200&h=600&fit=crop&auto=format",
    kmzUrl: "/api/boundary.kmz",
    kmzFilename: "WICKD_Tupelo Panel Mapping.kmz",
    kmzUploadedAt: "2025-05-20T16:00:00Z",
    googleEarthUrl: null,
    hasMap: true,
  },
];

export const DEMO_TIMELINES: Record<string, PortalTimelineItem[]> = {
  "proj-sunridge-phase-2": [
    {
      label: "Last Wicking",
      date: "Jun 24, 2025",
      type: "past",
      iconName: "zap",
      color: "#5856D6",
    },
    {
      label: "Last Spraying",
      date: "Jun 18, 2025",
      type: "past",
      iconName: "droplets",
      color: "#34C759",
    },
    {
      label: "Last Mowing",
      date: "Jun 10, 2025",
      type: "past",
      iconName: "scissors",
      color: "#FF9500",
    },
    {
      label: "Next Wicking",
      date: "Jul 8, 2025",
      type: "upcoming",
      iconName: "zap",
      color: "#FF6633",
    },
    {
      label: "Next Spraying",
      date: "Jul 14, 2025",
      type: "upcoming",
      iconName: "droplets",
      color: "#FF6633",
    },
    {
      label: "Next Mowing",
      date: "Jul 22, 2025",
      type: "upcoming",
      iconName: "scissors",
      color: "#FF6633",
    },
  ],
  "proj-tupelo-block-a": [
    {
      label: "Last Wicking",
      date: "Jun 26, 2025",
      type: "past",
      iconName: "zap",
      color: "#5856D6",
    },
    {
      label: "Last Spraying",
      date: "Jun 22, 2025",
      type: "past",
      iconName: "droplets",
      color: "#34C759",
    },
    {
      label: "Last Mowing",
      date: "Jun 15, 2025",
      type: "past",
      iconName: "scissors",
      color: "#FF9500",
    },
    {
      label: "Next Wicking",
      date: "Jul 12, 2025",
      type: "upcoming",
      iconName: "zap",
      color: "#FF6633",
    },
    {
      label: "Next Spraying",
      date: "Jul 18, 2025",
      type: "upcoming",
      iconName: "droplets",
      color: "#FF6633",
    },
    {
      label: "Next Mowing",
      date: "Jul 28, 2025",
      type: "upcoming",
      iconName: "scissors",
      color: "#FF6633",
    },
  ],
  "proj-talladega-highland": [
    {
      label: "Last Wicking",
      date: "May 20, 2025",
      type: "past",
      iconName: "zap",
      color: "#5856D6",
    },
    {
      label: "Last Spraying",
      date: "May 14, 2025",
      type: "past",
      iconName: "droplets",
      color: "#34C759",
    },
    {
      label: "Last Mowing",
      date: "May 8, 2025",
      type: "past",
      iconName: "scissors",
      color: "#FF9500",
    },
    {
      label: "Next Wicking",
      date: "Season Complete",
      type: "upcoming",
      iconName: "zap",
      color: "#34C759",
    },
    {
      label: "Next Spraying",
      date: "Season Complete",
      type: "upcoming",
      iconName: "droplets",
      color: "#34C759",
    },
    {
      label: "Next Mowing",
      date: "Aug 15, 2025",
      type: "upcoming",
      iconName: "scissors",
      color: "#FF6633",
    },
  ],
};

export const DEMO_OBSERVATIONS: Record<string, PortalObservation[]> = {
  "proj-sunridge-phase-2": [
    {
      id: "obs-1",
      title: "Kudzu regrowth encroaching panel rows",
      observationType: "Environmental / Other",
      sentiment: "Negative",
      description:
        "Fast-growing kudzu vines detected creeping into lower tracking panel framework. Requires targeted herbicide wicking application along row perimeter to prevent shading and torque motor entanglement.",
      location: "Zone B — Row 12–18",
      status: "In Progress",
      progress: "Chemical treatment scheduled",
      tags: ["Kudzu", "Invasive Species", "Panel Shading", "Vegetation"],
      attachmentCount: 2,
      photos: [
        {
          id: "obs-1-photo-1",
          url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop&auto=format",
          label: "Initial vine encroachment",
        },
        {
          id: "obs-1-photo-2",
          url: "https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?w=800&h=600&fit=crop&auto=format",
          label: "Targeted application pass",
        },
      ],
      history: [
        {
          id: "obs-1-hist-3",
          label: "Progress → Chemical treatment scheduled",
          date: "Jun 24, 2025",
          detail: "Carlos R. Fuentes",
        },
        {
          id: "obs-1-hist-2",
          label: "1 site photo added",
          date: "Jun 23, 2025",
          detail: "Devon T. Marsh",
        },
        {
          id: "obs-1-hist-1",
          label: "Observation logged",
          date: "Jun 22, 2025",
          detail: "Devon T. Marsh",
        },
      ],
      dueDate: "Jul 2, 2025",
      date: "Jun 22, 2025",
    },
    {
      id: "obs-2",
      title: "Unmarked utility conduit exposed at grade level",
      observationType: "Electrical Safety",
      sentiment: "Negative",
      description:
        "Secondary DC collection trench settled after rainfall, exposing approx. 12 feet of conduit line. Identified as a trip hazard and equipment strike risk during mowing operations.",
      location: "Zone A — Row 4",
      status: "In Progress",
      progress: "Safety cones placed · Backfill pending",
      tags: ["Conduit", "Trip Hazard", "Mower Clearance", "Safety"],
      attachmentCount: 1,
      photos: [
        {
          id: "obs-2-photo-1",
          url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=600&fit=crop&auto=format",
          label: "Exposed utility line",
        },
      ],
      history: [
        {
          id: "obs-2-hist-2",
          label: "Status → In Progress (Cones Placed)",
          date: "Jun 21, 2025",
          detail: "Carlos R. Fuentes",
        },
        {
          id: "obs-2-hist-1",
          label: "Observation logged",
          date: "Jun 20, 2025",
          detail: "Carlos R. Fuentes",
        },
      ],
      dueDate: "Jun 30, 2025",
      date: "Jun 20, 2025",
    },
    {
      id: "obs-3",
      title: "Active erosion channel cutting through access road berm",
      observationType: "Environmental / Other",
      sentiment: "Negative",
      description:
        "Stormwater runoff formed 6-inch gully across secondary gravel service road. Recommending riprap check dam installation and hydroseeding on adjacent berm slope.",
      location: "Zone C — South slope",
      status: "Open",
      progress: "Assessment complete",
      tags: ["Erosion", "Stormwater", "Roadway", "Check Dam"],
      attachmentCount: 1,
      photos: [
        {
          id: "obs-3-photo-1",
          url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop&auto=format",
          label: "Runoff channel across road",
        },
      ],
      history: [
        {
          id: "obs-3-hist-1",
          label: "Observation logged",
          date: "Jun 19, 2025",
          detail: "Devon T. Marsh",
        },
      ],
      dueDate: "Jul 5, 2025",
      date: "Jun 19, 2025",
    },
    {
      id: "obs-4",
      title: "Standing water accumulation around Inverter Pad 3",
      observationType: "Housekeeping",
      sentiment: "Negative",
      description:
        "Perimeter ditch silt buildup preventing natural drainage away from concrete equipment pad. Culvert cleared; monitoring standing water dissipation over 48 hours.",
      location: "Zone B — Inverter pad 3",
      status: "Open",
      progress: "Culvert unclogged · Monitoring",
      tags: ["Drainage", "Inverter", "Standing Water", "Culvert"],
      attachmentCount: 1,
      photos: [
        {
          id: "obs-4-photo-1",
          url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=600&fit=crop&auto=format",
          label: "Standing water pool",
        },
      ],
      history: [
        {
          id: "obs-4-hist-1",
          label: "Observation logged",
          date: "Jun 18, 2025",
          detail: "Carlos R. Fuentes",
        },
      ],
      dueDate: "Jun 28, 2025",
      date: "Jun 18, 2025",
    },
    {
      id: "obs-5",
      title: "Panel Block C vegetation clearance verified optimal",
      observationType: "Vegetation Compliance",
      sentiment: "Positive",
      description:
        "Post-wicking inspection confirms all Johnson grass and thistle suppressed below 14-inch threshold. Ground cover healthy clover mix without tracker interference.",
      location: "Zone C — Central rows",
      status: "Resolved",
      progress: "Verified compliant",
      tags: ["Vegetation", "Compliance", "Optimal Clearance"],
      attachmentCount: 1,
      photos: [
        {
          id: "obs-5-photo-1",
          url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop&auto=format",
          label: "Verified row clearance",
        },
      ],
      history: [
        {
          id: "obs-5-hist-2",
          label: "Status → Resolved",
          date: "Jun 24, 2025",
          detail: "Carlos R. Fuentes",
        },
        {
          id: "obs-5-hist-1",
          label: "Observation logged",
          date: "Jun 17, 2025",
          detail: "Devon T. Marsh",
        },
      ],
      dueDate: "Jun 25, 2025",
      date: "Jun 17, 2025",
    },
    {
      id: "obs-6",
      title: "Stormwater detention basin functioning as engineered",
      observationType: "Environmental / Other",
      sentiment: "Positive",
      description:
        "All sediment traps clean and free-flowing following 2.4 inches of rainfall. Water discharge clarity verified compliant with state NPDES permit standards.",
      location: "Basin 2 — North boundary",
      status: "Resolved",
      progress: "Turbidity verified < 25 NTU",
      tags: ["Stormwater", "NPDES", "Sediment", "Permit Compliance"],
      attachmentCount: 1,
      photos: [
        {
          id: "obs-6-photo-1",
          url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop&auto=format",
          label: "Clean basin discharge",
        },
      ],
      history: [
        {
          id: "obs-6-hist-2",
          label: "Status → Resolved",
          date: "Jun 22, 2025",
          detail: "Devon T. Marsh",
        },
        {
          id: "obs-6-hist-1",
          label: "Observation logged",
          date: "Jun 15, 2025",
          detail: "Devon T. Marsh",
        },
      ],
      dueDate: "Jun 22, 2025",
      date: "Jun 15, 2025",
    },
  ],
  "proj-tupelo-block-a": [
    {
      id: "obs-t-1",
      title: "Perimeter fence wash-out along creek line",
      observationType: "Hazards on Site",
      sentiment: "Negative",
      description:
        "Minor embankment slide eroded soil underneath corner post fence anchor. Temporary chainlink skirt attached; permanent anchor pin scheduled.",
      location: "Sector 4 — Creek crossing",
      status: "In Progress",
      progress: "Temporary fence secured",
      tags: ["Perimeter Security", "Fence", "Erosion"],
      attachmentCount: 1,
      photos: [],
      history: [],
      dueDate: "Jul 10, 2025",
      date: "Jun 25, 2025",
    },
  ],
  "proj-talladega-highland": [],
};

export const DEMO_PHOTOS: Record<string, PortalPhoto[]> = {
  "proj-sunridge-phase-2": [
    {
      id: "photo-1",
      src: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=800&fit=crop&auto=format",
      caption: "Zone B panel row wicking and mowing — post-treatment status",
      date: "Jun 24, 2025",
      category: "Progress",
    },
    {
      id: "photo-2",
      src: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=800&fit=crop&auto=format",
      caption: "Kudzu regrowth identified along Zone B Row 14 tracker posts",
      date: "Jun 22, 2025",
      category: "Chemical",
    },
    {
      id: "photo-3",
      src: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=800&fit=crop&auto=format",
      caption: "Inverter pad 3 perimeter drainage and concrete pad inspection",
      date: "Jun 20, 2025",
      category: "Safety",
    },
    {
      id: "photo-4",
      src: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=800&fit=crop&auto=format",
      caption: "Wick'd specialized low-impact tractor rig staging in Zone D",
      date: "Jun 19, 2025",
      category: "Equipment",
    },
    {
      id: "photo-5",
      src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&auto=format",
      caption: "Red-tailed hawk nesting in conservation buffer outside arrays",
      date: "Jun 17, 2025",
      category: "Wildlife",
    },
    {
      id: "photo-6",
      src: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=800&fit=crop&auto=format",
      caption: "Post-storm stormwater detention basin survey — clean runoff",
      date: "Jun 14, 2025",
      category: "Weather",
    },
    {
      id: "photo-7",
      src: "https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?w=800&h=800&fit=crop&auto=format",
      caption: "Targeted herbicide wicking applicator pass across Zone A array",
      date: "Jun 10, 2025",
      category: "Chemical",
    },
    {
      id: "photo-8",
      src: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&h=800&fit=crop&auto=format",
      caption: "Phase II central solar array overview — 142 acres maintained",
      date: "Jun 6, 2025",
      category: "Progress",
    },
  ],
  "proj-tupelo-block-a": [
    {
      id: "photo-t-1",
      src: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&h=800&fit=crop&auto=format",
      caption: "Tupelo Block A north substation and panel array",
      date: "Jun 26, 2025",
      category: "Progress",
    },
  ],
  "proj-talladega-highland": [],
};

export const DEMO_REPORTS: Record<string, PortalReport[]> = {
  "proj-sunridge-phase-2": [
    {
      id: "rep-1",
      date: "Jun 24, 2025",
      preparedBy: "Carlos R. Fuentes",
      description:
        "Daily field report — Completed selective wicking passes on Zones A & B (28 acres). Weather conditions optimal; no tracker interference.",
    },
    {
      id: "rep-2",
      date: "Jun 23, 2025",
      preparedBy: "Devon T. Marsh",
      description:
        "Site health watchlist inspection — Kudzu flagged on Zone B; utility conduit cone markers verified intact; culvert check completed.",
    },
    {
      id: "rep-3",
      date: "Jun 20, 2025",
      preparedBy: "Carlos R. Fuentes",
      description:
        "Drainage & inverter pad assessment — Inverter Pad 3 ditch cleared of silt; standing water dissipation recorded under observation obs-4.",
    },
    {
      id: "rep-4",
      date: "Jun 18, 2025",
      preparedBy: "Devon T. Marsh",
      description:
        "Chemical application log — Garlon 3A selective wicking pass on perimeter fence lines. Zero drift logged; wind speed 4 mph SE.",
    },
    {
      id: "rep-5",
      date: "Jun 14, 2025",
      preparedBy: "Carlos R. Fuentes",
      description:
        "Post-storm survey — Stormwater sediment basin 2 checked; zero erosion breaching array foundation piles; access roads passable.",
    },
    {
      id: "rep-6",
      date: "Jun 10, 2025",
      preparedBy: "Devon T. Marsh",
      description:
        "Mowing operations — Zone C array and perimeter firebreaks mowed to 8-inch height; zero panel or cabling damage.",
    },
    {
      id: "rep-7",
      date: "Jun 6, 2025",
      preparedBy: "Carlos R. Fuentes",
      description:
        "Weekly comprehensive progress certification — 142 acres certified complete for Phase II contract cycle WET-2024-0147.",
    },
  ],
  "proj-tupelo-block-a": [
    {
      id: "rep-t-1",
      date: "Jun 26, 2025",
      preparedBy: "Carlos R. Fuentes",
      description: "Daily inspection — Block A wicking and mowing complete (42 acres).",
    },
  ],
  "proj-talladega-highland": [],
};

export const DEMO_PORTAL_DATA: PortalData = {
  client: DEMO_CLIENT,
  projects: DEMO_PROJECTS,
  observations: DEMO_OBSERVATIONS,
  photos: DEMO_PHOTOS,
  reports: DEMO_REPORTS,
  timelines: DEMO_TIMELINES,
};

export const DEMO_COOKIE_NAME = "wickd_demo_session";

export function isDemoSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      localStorage.getItem("wickd_demo_active") === "true" ||
      document.cookie.includes(`${DEMO_COOKIE_NAME}=true`)
    );
  } catch {
    return false;
  }
}

export function activateDemoSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("wickd_demo_active", "true");
    document.cookie = `${DEMO_COOKIE_NAME}=true; path=/; max-age=86400; SameSite=Lax`;
  } catch {
    // fallback
  }
}

export function deactivateDemoSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("wickd_demo_active");
    document.cookie = `${DEMO_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  } catch {
    // fallback
  }
}
