import type { SupabaseClient } from "@supabase/supabase-js";
import { mapPortalBundle } from "@/lib/portal/map-portal-data";
import type { PortalData } from "@/lib/portal/types";

type ClientRow = {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
};

const CLIENT_SELECT =
  "id, name, email, company_name, street_address, city, state, zip_code";

async function resolveActiveClient(
  supabase: SupabaseClient,
  authUserId: string,
  authEmail?: string | null
): Promise<ClientRow> {
  const { data: linkedClient, error: linkedError } = await supabase
    .from("clients")
    .select(CLIENT_SELECT)
    .eq("auth_user_id", authUserId)
    .eq("status", "active")
    .maybeSingle();

  if (linkedError) throw new Error(linkedError.message);
  if (linkedClient) return linkedClient;

  const normalizedEmail = authEmail?.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("No active client account is linked to this login.");
  }

  const { data: emailMatches, error: emailError } = await supabase
    .from("clients")
    .select(CLIENT_SELECT)
    .ilike("email", normalizedEmail)
    .eq("status", "active");

  if (emailError) throw new Error(emailError.message);

  const emailClient = (emailMatches ?? []).find(
    (row) => row.email.trim().toLowerCase() === normalizedEmail
  );

  if (!emailClient) {
    throw new Error("No active client account is linked to this login.");
  }

  const { error: linkError } = await supabase
    .from("clients")
    .update({ auth_user_id: authUserId })
    .eq("id", emailClient.id)
    .is("auth_user_id", null);

  if (linkError) throw new Error(linkError.message);

  return emailClient;
}

export async function loadPortalDataForAuthUser(
  supabase: SupabaseClient,
  authUserId: string,
  authEmail?: string | null
): Promise<PortalData> {
  const client = await resolveActiveClient(supabase, authUserId, authEmail);

  const { data: accessRows, error: accessError } = await supabase
    .from("client_project_access")
    .select("project_id")
    .eq("client_id", client.id);

  if (accessError) throw new Error(accessError.message);

  const projectIds = (accessRows ?? []).map((row) => row.project_id);
  if (projectIds.length === 0) {
    return mapPortalBundle({
      client,
      employeesById: {},
      projects: [],
      observations: [],
      auditLogs: [],
      attachments: [],
      reports: [],
      chemicalLogs: [],
      metrics: [],
    });
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select(
      "id, name, status, job_number, street_address, city, state, zip_code, zipcode, address, client_name, acres_completed, client_portal_enabled, cover_photo_url, kmz_url, kmz_filename, kmz_uploaded_at, google_earth_url, contract_po, contract_expiration, wickd_contact_employee_id, superintendent_name, superintendent_phone, next_wicking_date, next_spraying_date, next_mowing_date, last_mowing_date"
    )
    .in("id", projectIds);

  if (projectsError) throw new Error(projectsError.message);

  const enabledProjects = projects ?? [];
  const enabledProjectIds = enabledProjects.map((project) => project.id);

  if (enabledProjectIds.length === 0) {
    return mapPortalBundle({
      client,
      employeesById: {},
      projects: [],
      observations: [],
      auditLogs: [],
      attachments: [],
      reports: [],
      chemicalLogs: [],
      metrics: [],
    });
  }

  const contactIds = [
    ...new Set(
      enabledProjects
        .map((project) => project.wickd_contact_employee_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const employeesById: Record<
    string,
    { name: string; email: string | null; phone: string | null }
  > = {};

  if (contactIds.length > 0) {
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, name, email, phone")
      .in("id", contactIds);

    if (employeesError) throw new Error(employeesError.message);

    for (const employee of employees ?? []) {
      employeesById[employee.id] = {
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
      };
    }
  }

  const [
    observationsResult,
    attachmentsResult,
    reportsResult,
    chemicalLogsResult,
    metricsResult,
    auditLogsResult,
  ] = await Promise.all([
    supabase
      .from("observations")
      .select(
        "id, project_id, title, description, location, category, type, status, progress, description_tags, attachments, resolution_photos, due_date, logged_at, report_date, updated_at"
      )
      .in("project_id", enabledProjectIds)
      .order("logged_at", { ascending: false }),
    supabase
      .from("attachments")
      .select("id, project_id, notes, cloudinary_urls, file_names, tags, logged_at, report_date")
      .in("project_id", enabledProjectIds)
      .order("logged_at", { ascending: false }),
    supabase
      .from("daily_signed_reports")
      .select("id, project_id, prepared_by, report_date, signed_at, created_at")
      .in("project_id", enabledProjectIds)
      .order("report_date", { ascending: false }),
    supabase
      .from("chemicals_logs")
      .select("project_id, application_type, logged_at, report_date")
      .in("project_id", enabledProjectIds)
      .order("logged_at", { ascending: false }),
    supabase
      .from("metrics")
      .select("project_id, acres_completed, green_space_completed, logged_at, report_date, metric_values")
      .in("project_id", enabledProjectIds)
      .order("logged_at", { ascending: false }),
    supabase
      .from("audit_log")
      .select("id, entity_id, action, created_at, report_date, submitted_employee_name, details")
      .eq("entity_type", "observations")
      .in("project_id", enabledProjectIds)
      .order("created_at", { ascending: false }),
  ]);

  for (const result of [
    observationsResult,
    attachmentsResult,
    reportsResult,
    chemicalLogsResult,
    metricsResult,
  ]) {
    if (result.error) throw new Error(result.error.message);
  }

  // Observation history is optional — don't block portal load if audit_log fails.
  if (auditLogsResult.error) {
    console.warn("[portal/data] audit_log:", auditLogsResult.error.message);
  }

  return mapPortalBundle({
    client,
    employeesById,
    projects: enabledProjects,
    observations: observationsResult.data ?? [],
    auditLogs: auditLogsResult.error ? [] : auditLogsResult.data ?? [],
    attachments: attachmentsResult.data ?? [],
    reports: reportsResult.data ?? [],
    chemicalLogs: chemicalLogsResult.data ?? [],
    metrics: metricsResult.data ?? [],
  });
}
