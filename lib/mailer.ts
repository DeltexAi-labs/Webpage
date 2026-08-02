import nodemailer from "nodemailer";

import { siteConfig } from "@/lib/site";

export type SmtpSettings = {
  user: string;
  pass: string;
  recipient: string;
};

/** Returns null when SMTP has not been configured, so callers can degrade instead of throwing. */
export function readSmtpSettings(): SmtpSettings | null {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
  const recipient = process.env.CONTACT_TO_EMAIL?.trim() || siteConfig.contactEmail;

  if (!user || !pass) {
    // Names only — never the values. This is the fastest way to spot a missing deployment variable.
    const missing = [!user && "SMTP_USER", !pass && "SMTP_PASS"].filter(Boolean).join(", ");
    console.error(
      `SMTP is not configured: ${missing} missing in this environment. ` +
        "Set it in the hosting provider's environment variables and redeploy.",
    );
    return null;
  }

  return { user, pass, recipient };
}

export function createTransport(settings: SmtpSettings) {
  const port = Number(process.env.SMTP_PORT || 465);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: settings.user, pass: settings.pass },
  });
}
