import nodemailer from "nodemailer";

const PLACEHOLDER = /(\.\.\.|change-me|xxx|placeholder)/i;

export function isEmailConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  return Boolean(host && user && !PLACEHOLDER.test(host));
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  const from = process.env.EMAIL_FROM ?? "AvoSearch <noreply@avosearch.test>";

  if (!isEmailConfigured()) {
    console.log("[email] (demo — SMTP not configured)", {
      to: input.to,
      subject: input.subject,
      text: input.text.slice(0, 200),
    });
    return true;
  }

  try {
    const transport = createTransport();
    await transport.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html ?? input.text.replace(/\n/g, "<br>"),
    });
    return true;
  } catch (error) {
    console.error("[email] send failed", error);
    return false;
  }
}
