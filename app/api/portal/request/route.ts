import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEMO_COOKIE_NAME } from "@/lib/demo-data";
import { sendEmail } from "@/lib/email";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

type RequestBody = {
  projectId?: string;
  message?: string;
};

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const projectId = body.projectId?.trim();
  const message = body.message?.trim();
  if (!projectId || !message) {
    return NextResponse.json(
      { error: "projectId and message are required." },
      { status: 400 }
    );
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const isDemo = cookieStore.get(DEMO_COOKIE_NAME)?.value === "true";

  if (!hasSupabaseConfig() || isDemo) {
    // In demo environment, simulate successful delivery
    return NextResponse.json({
      ok: true,
      sentTo: "Marcus D. Webb (Wick'd Project Manager)",
      note: "Demo request recorded successfully.",
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const service = createServiceClient();

    const { data: linkedClient, error: linkedError } = await service
      .from("clients")
      .select("id, name, email, company_name")
      .eq("auth_user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (linkedError) throw new Error(linkedError.message);

    let client = linkedClient;
    if (!client && user.email) {
      const normalizedEmail = user.email.trim().toLowerCase();
      const { data: emailMatches, error: emailError } = await service
        .from("clients")
        .select("id, name, email, company_name")
        .ilike("email", normalizedEmail)
        .eq("status", "active");
      if (emailError) throw new Error(emailError.message);
      client =
        (emailMatches ?? []).find(
          (row) => row.email.trim().toLowerCase() === normalizedEmail
        ) ?? null;
    }

    if (!client) {
      return NextResponse.json(
        { error: "No active client account is linked to this login." },
        { status: 403 }
      );
    }

    const { data: access, error: accessError } = await service
      .from("client_project_access")
      .select("project_id")
      .eq("client_id", client.id)
      .eq("project_id", projectId)
      .maybeSingle();

    if (accessError) throw new Error(accessError.message);
    if (!access) {
      return NextResponse.json(
        { error: "You do not have access to this project." },
        { status: 403 }
      );
    }

    const { data: project, error: projectError } = await service
      .from("projects")
      .select("id, name, job_number, wickd_contact_employee_id")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) throw new Error(projectError.message);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    let contactEmail: string | null = null;
    let contactName = "Wick'd Environmental";

    if (project.wickd_contact_employee_id) {
      const { data: employee, error: employeeError } = await service
        .from("employees")
        .select("name, email")
        .eq("id", project.wickd_contact_employee_id)
        .maybeSingle();
      if (employeeError) throw new Error(employeeError.message);
      if (employee?.email?.trim()) {
        contactEmail = employee.email.trim();
        contactName = employee.name?.trim() || contactName;
      }
    }

    if (!contactEmail) {
      contactEmail =
        process.env.GMAIL_USER?.trim() || "support.utilityvision@gmail.com";
      contactName = "Wick'd Support";
    }

    const company = client.company_name?.trim();
    const clientLabel = company ? `${client.name} (${company})` : client.name;
    const jobLabel = project.job_number?.trim() || "—";
    const subject = `Client portal request — ${project.name}`;
    const text = [
      `A client submitted a request from the Wick'd Client Portal.`,
      ``,
      `Project: ${project.name}`,
      `Job #: ${jobLabel}`,
      `Client: ${clientLabel}`,
      `Client email: ${client.email}`,
      `Wick'd contact: ${contactName}`,
      ``,
      `Message:`,
      message,
      ``,
      `Reply directly to this email to reach the client.`,
    ].join("\n");

    await sendEmail({
      to: contactEmail,
      replyTo: client.email,
      subject,
      text,
    });

    return NextResponse.json({ ok: true, sentTo: contactName });
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : "Failed to send request.";
    console.error("[portal/request]", messageText);
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
