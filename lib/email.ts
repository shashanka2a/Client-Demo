import nodemailer from "nodemailer";

function requireGmailConfig() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !pass) {
    throw new Error("Email is not configured (missing GMAIL_USER / GMAIL_APP_PASSWORD).");
  }
  return { user, pass };
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  cc?: string;
}) {
  const { user, pass } = requireGmailConfig();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Wick'd Client Portal" <${user}>`,
    to: options.to,
    cc: options.cc,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html ?? options.text.replace(/\n/g, "<br>"),
  });
}
