import type {
  PortalClient,
  PortalData,
  PortalObservation,
  PortalObservationHistoryEntry,
  PortalObservationPhoto,
  PortalPhoto,
  PortalProject,
  PortalReport,
  PortalTimelineItem,
  ProjectStatus,
} from "@/lib/portal/types";

type DbClient = {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
};

type DbEmployee = {
  name: string;
  email: string | null;
  phone: string | null;
};

type DbProject = {
  id: string;
  name: string;
  status: string | null;
  job_number: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  zipcode: string | null;
  address: string | null;
  client_name: string | null;
  acres_completed: number | null;
  client_portal_enabled: boolean | null;
  cover_photo_url: string | null;
  kmz_url: string | null;
  kmz_filename: string | null;
  kmz_uploaded_at: string | null;
  google_earth_url: string | null;
  contract_po: string | null;
  contract_expiration: string | null;
  wickd_contact_employee_id: string | null;
  superintendent_name: string | null;
  superintendent_phone: string | null;
  /** From dashboard migration `add_project_schedule_dates` */
  next_wicking_date: string | null;
  next_spraying_date: string | null;
  next_mowing_date: string | null;
  last_mowing_date: string | null;
};

type DbObservation = {
  id: string;
  project_id: string;
  title: string | null;
  description: string | null;
  location: string | null;
  /** Positive / Negative */
  category: string | null;
  /** Broader class, e.g. Hazards on Site */
  type: string | null;
  status: string | null;
  progress: string | null;
  description_tags: string[] | null;
  attachments: string[] | null;
  resolution_photos: string[] | null;
  due_date: string | null;
  logged_at: string | null;
  report_date: string | null;
  updated_at: string | null;
};

type DbAuditLog = {
  id: string;
  entity_id: string;
  action: string;
  created_at: string;
  report_date: string | null;
  submitted_employee_name: string | null;
  details: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  } | null;
};

type DbAttachment = {
  id: string;
  project_id: string;
  notes: string | null;
  cloudinary_urls: string[] | null;
  file_names: string[] | null;
  tags: string[] | null;
  logged_at: string | null;
  report_date: string | null;
};

type DbReport = {
  id: string;
  project_id: string;
  prepared_by: string | null;
  report_date: string | null;
  signed_at: string | null;
  created_at: string | null;
};

type DbChemicalLog = {
  project_id: string;
  application_type: string | null;
  logged_at: string | null;
  report_date: string | null;
};

type DbMetric = {
  project_id: string;
  acres_completed: number | null;
  green_space_completed: number | null;
  logged_at: string | null;
  report_date: string | null;
  metric_values?: Record<string, unknown> | null;
};

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=400&fit=crop&auto=format";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatAddress(parts: {
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  zipcode?: string | null;
  address?: string | null;
}): string {
  if (parts.address?.trim()) return parts.address.trim();
  const lines = [
    parts.street_address?.trim(),
    [parts.city, parts.state].filter(Boolean).join(", ").trim(),
    (parts.zip_code ?? parts.zipcode)?.trim(),
  ].filter(Boolean);
  return lines.join("\n") || "—";
}

function mapStatus(status: string | null | undefined): ProjectStatus {
  const value = (status ?? "active").toLowerCase();
  if (value === "paused") return "Paused";
  if (value === "completed" || value === "complete") return "Completed";
  return "Active";
}

function mapObservationStatus(status: string | null): string {
  const value = (status ?? "open").trim();
  if (!value) return "Open";
  if (value.toLowerCase() === "resolved") return "Resolved";
  if (value.toLowerCase().includes("progress")) return "In Progress";
  return value;
}

function mapObservationTitle(input: {
  title: string | null;
  type: string | null;
  description: string | null;
}): string {
  const title = input.title?.trim();
  if (title) return title;
  const type = input.type?.trim();
  if (type) return type;
  const description = input.description?.trim();
  if (description) return description.split("\n")[0]!.slice(0, 80);
  return "Observation";
}

function mapObservationDescription(input: {
  description: string | null;
  title: string | null;
  type: string | null;
}): string {
  const description = input.description?.trim();
  if (description) return description;
  return "";
}

function mapObservationPhotos(
  observationId: string,
  attachments: string[] | null | undefined,
  resolutionPhotos: string[] | null | undefined
): PortalObservationPhoto[] {
  const site = (attachments ?? []).filter(Boolean).map((url, index) => ({
    id: `${observationId}-site-${index}`,
    url,
    label: "Site photo",
  }));
  const resolution = (resolutionPhotos ?? []).filter(Boolean).map((url, index) => ({
    id: `${observationId}-resolution-${index}`,
    url,
    label: "Resolution",
  }));
  return [...site, ...resolution];
}

function buildObservationHistory(
  observationId: string,
  observation: DbObservation,
  audits: DbAuditLog[]
): PortalObservationHistoryEntry[] {
  const rows = audits
    .filter((row) => row.entity_id === observationId)
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const entries: PortalObservationHistoryEntry[] = [];
  const whoFallback = "Wick'd field team";

  for (const row of rows) {
    const who = row.submitted_employee_name?.trim() || whoFallback;
    const date = formatDate(row.created_at);

    if (row.action === "INSERT") {
      entries.push({
        id: row.id,
        label: "Observation logged",
        date,
        detail: who,
      });
      continue;
    }

    if (row.action !== "UPDATE") continue;

    const before = row.details?.before;
    const after = row.details?.after;
    if (!before || !after) continue;

    if (before.status !== after.status && after.status) {
      entries.push({
        id: `${row.id}-status`,
        label: `Status → ${String(after.status)}`,
        date,
        detail: who,
      });
    }

    if (before.progress !== after.progress && after.progress) {
      entries.push({
        id: `${row.id}-progress`,
        label: `Progress → ${String(after.progress)}`,
        date,
        detail: who,
      });
    }

    const beforeAtt = Array.isArray(before.attachments) ? before.attachments.length : 0;
    const afterAtt = Array.isArray(after.attachments) ? after.attachments.length : 0;
    if (afterAtt > beforeAtt) {
      entries.push({
        id: `${row.id}-photos`,
        label: `${afterAtt - beforeAtt} site photo${afterAtt - beforeAtt === 1 ? "" : "s"} added`,
        date,
        detail: who,
      });
    }

    const beforeRes = Array.isArray(before.resolution_photos)
      ? before.resolution_photos.length
      : 0;
    const afterRes = Array.isArray(after.resolution_photos)
      ? after.resolution_photos.length
      : 0;
    if (afterRes > beforeRes) {
      entries.push({
        id: `${row.id}-resolution`,
        label: `${afterRes - beforeRes} resolution photo${afterRes - beforeRes === 1 ? "" : "s"} added`,
        date,
        detail: who,
      });
    }
  }

  if (entries.length === 0 && observation.logged_at) {
    entries.push({
      id: `${observationId}-logged`,
      label: "Observation logged",
      date: formatDate(observation.logged_at),
      detail: whoFallback,
    });
  }

  if (observation.updated_at && observation.logged_at) {
    const updated = new Date(observation.updated_at).getTime();
    const logged = new Date(observation.logged_at).getTime();
    if (updated - logged > 60_000 && !entries.some((e) => e.label.startsWith("Status"))) {
      entries.unshift({
        id: `${observationId}-updated`,
        label: "Last updated",
        date: formatDate(observation.updated_at),
        detail: whoFallback,
      });
    }
  }

  return entries;
}

function latestLogDate(
  logs: { logged_at: string | null; report_date: string | null }[],
  type?: string
): string {
  const filtered = type
    ? logs.filter((log) => (log as DbChemicalLog).application_type?.toLowerCase() === type)
    : logs;

  const sorted = [...filtered].sort((a, b) => {
    const aDate = new Date(a.report_date ?? a.logged_at ?? 0).getTime();
    const bDate = new Date(b.report_date ?? b.logged_at ?? 0).getTime();
    return bDate - aDate;
  });

  const latest = sorted[0];
  return formatShortDate(latest?.report_date ?? latest?.logged_at);
}

function mapPhotoCategory(tags: string[] | null | undefined): string {
  const tag = (tags ?? []).map((value) => value.trim()).find(Boolean);
  return tag ?? "General";
}

function metricNumeric(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function hasMowingMetric(metric: DbMetric): boolean {
  const values = metric.metric_values;
  if (!values || typeof values !== "object" || Array.isArray(values)) return false;
  const arrayAcres = metricNumeric(values.mowing_array_completed);
  const greenAcres = metricNumeric(values.mowing_green_space_completed);
  return (arrayAcres ?? 0) > 0 || (greenAcres ?? 0) > 0;
}

function latestMowingDate(
  metrics: DbMetric[],
  projectId: string,
  project: DbProject,
  chemicalLogs: DbChemicalLog[]
): string {
  if (project.last_mowing_date) {
    return formatShortDate(project.last_mowing_date);
  }

  const latestMetric = metrics
    .filter((metric) => metric.project_id === projectId && hasMowingMetric(metric))
    .sort((a, b) => {
      const aDate = new Date(a.report_date ?? a.logged_at ?? 0).getTime();
      const bDate = new Date(b.report_date ?? b.logged_at ?? 0).getTime();
      return bDate - aDate;
    })[0];

  if (latestMetric) {
    return formatShortDate(latestMetric.report_date ?? latestMetric.logged_at);
  }

  return latestLogDate(
    chemicalLogs.filter((log) => log.project_id === projectId),
    "mowing"
  );
}

function buildTimeline(
  chemicalLogs: DbChemicalLog[],
  metrics: DbMetric[],
  project: DbProject
): PortalTimelineItem[] {
  const projectChemicals = chemicalLogs.filter((log) => log.project_id === project.id);
  const lastMowing = latestMowingDate(metrics, project.id, project, chemicalLogs);

  return [
    {
      label: "Last Wicking",
      date: latestLogDate(projectChemicals, "wicking"),
      type: "past",
      iconName: "zap",
      color: "#5856D6",
    },
    {
      label: "Last Spraying",
      date: latestLogDate(projectChemicals, "spraying"),
      type: "past",
      iconName: "droplets",
      color: "#34C759",
    },
    {
      label: "Last Mowing",
      date: lastMowing,
      type: "past",
      iconName: "scissors",
      color: "#FF9500",
    },
    {
      label: "Next Wicking",
      date: formatShortDate(project.next_wicking_date),
      type: "upcoming",
      iconName: "zap",
      color: "#FF6633",
    },
    {
      label: "Next Spraying",
      date: formatShortDate(project.next_spraying_date),
      type: "upcoming",
      iconName: "droplets",
      color: "#FF6633",
    },
    {
      label: "Next Mowing",
      date: formatShortDate(project.next_mowing_date),
      type: "upcoming",
      iconName: "scissors",
      color: "#FF6633",
    },
  ];
}

export function mapClient(client: DbClient): PortalClient {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    companyName: client.company_name ?? client.name,
  };
}

export function mapProject(
  project: DbProject,
  client: DbClient,
  employee: DbEmployee | null,
  latestMetric: DbMetric | null
): PortalProject {
  const acresCompleted = Math.round(
    Number(latestMetric?.acres_completed ?? project.acres_completed ?? 0)
  );
  const greenSpace = Number(latestMetric?.green_space_completed ?? 0);
  const totalAcres = Math.max(acresCompleted + greenSpace, acresCompleted, 1);

  return {
    id: project.id,
    name: project.name,
    status: mapStatus(project.status),
    clientName: project.client_name?.trim() || client.company_name || client.name,
    address: formatAddress(project),
    jobNumber:
      project.contract_po?.trim() ||
      project.job_number?.trim() ||
      "—",
    contractExpiration: formatDate(project.contract_expiration),
    contactName: employee?.name ?? "Wick'd Environmental",
    contactPhone: employee?.phone ?? "—",
    contactEmail: employee?.email ?? "support.utilityvision@gmail.com",
    superintendent: project.superintendent_name?.trim() || "—",
    superintendentPhone: project.superintendent_phone?.trim() || "—",
    acresCompleted,
    totalAcres,
    lastSpraying: "—",
    lastWicking: "—",
    coverPhotoUrl: project.cover_photo_url ?? HERO_FALLBACK,
    kmzUrl: project.kmz_url,
    kmzFilename: project.kmz_filename,
    kmzUploadedAt: project.kmz_uploaded_at,
    googleEarthUrl: project.google_earth_url,
    hasMap: true,
  };
}

export function mapPortalBundle(input: {
  client: DbClient;
  employeesById: Record<string, DbEmployee>;
  projects: DbProject[];
  observations: DbObservation[];
  auditLogs: DbAuditLog[];
  attachments: DbAttachment[];
  reports: DbReport[];
  chemicalLogs: DbChemicalLog[];
  metrics: DbMetric[];
}): PortalData {
  const client = mapClient(input.client);
  const projects = input.projects.map((project) => {
    const latestMetric =
      input.metrics
        .filter((metric) => metric.project_id === project.id)
        .sort(
          (a, b) =>
            new Date(b.report_date ?? b.logged_at ?? 0).getTime() -
            new Date(a.report_date ?? a.logged_at ?? 0).getTime()
        )[0] ?? null;

    const employee = project.wickd_contact_employee_id
      ? input.employeesById[project.wickd_contact_employee_id] ?? null
      : null;

    const mapped = mapProject(project, input.client, employee, latestMetric);
    mapped.lastSpraying = latestLogDate(
      input.chemicalLogs.filter((log) => log.project_id === project.id),
      "spraying"
    );
    mapped.lastWicking = latestLogDate(
      input.chemicalLogs.filter((log) => log.project_id === project.id),
      "wicking"
    );
    return mapped;
  });

  const observations: Record<string, PortalObservation[]> = {};
  const photos: Record<string, PortalPhoto[]> = {};
  const reports: Record<string, PortalReport[]> = {};
  const timelines: Record<string, PortalTimelineItem[]> = {};

  for (const project of projects) {
    observations[project.id] = input.observations
      .filter((observation) => observation.project_id === project.id)
      .map((observation) => {
        const photos = mapObservationPhotos(
          observation.id,
          observation.attachments,
          observation.resolution_photos
        );
        return {
          id: observation.id,
          title: mapObservationTitle(observation),
          observationType: observation.type?.trim() || "Observation",
          sentiment: observation.category?.trim() || "Negative",
          description: mapObservationDescription(observation),
          location: observation.location?.trim() || "—",
          status: mapObservationStatus(observation.status),
          progress: observation.progress?.trim() || "—",
          tags: (observation.description_tags ?? []).filter(Boolean),
          attachmentCount: photos.length,
          photos,
          history: buildObservationHistory(
            observation.id,
            observation,
            input.auditLogs
          ),
          dueDate: formatShortDate(observation.due_date),
          date: formatShortDate(observation.report_date ?? observation.logged_at),
        };
      });

    photos[project.id] = input.attachments
      .filter((attachment) => attachment.project_id === project.id)
      .flatMap((attachment) => {
        const category = mapPhotoCategory(attachment.tags);
        return (attachment.cloudinary_urls ?? []).map((src, index) => ({
          id: `${attachment.id}-${index}`,
          src,
          caption: attachment.notes?.trim() || attachment.file_names?.[index] || "Site photo",
          date: formatDate(attachment.report_date ?? attachment.logged_at),
          category,
        }));
      });

    reports[project.id] = input.reports
      .filter((report) => report.project_id === project.id)
      .map((report) => ({
        id: report.id,
        date: formatDate(report.report_date ?? report.signed_at ?? report.created_at),
        preparedBy: report.prepared_by?.trim() || "Wick'd Field Team",
        description: `Daily signed report — ${formatDate(report.report_date ?? report.signed_at)}`,
      }));

    const dbProject = input.projects.find((row) => row.id === project.id)!;
    timelines[project.id] = buildTimeline(input.chemicalLogs, input.metrics, dbProject);
  }

  return {
    client,
    projects,
    observations,
    photos,
    reports,
    timelines,
  };
}

export { HERO_FALLBACK };
