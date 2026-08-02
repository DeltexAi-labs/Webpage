import nodemailer from "nodemailer";

import { siteConfig } from "@/lib/site";

export type SmtpSettings = {
  user: string;
  pass: string;
  recipient: string;
};

/** Returns null when SMTP has not been configured, so callers can degrade instead of throwing. */
export function readSmtpSettings(): SmtpSettings | null {
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
  const recipient = process.env.CONTACT_TO_EMAIL?.trim() || siteConfig.contactEmail;

  // The mailbox is nearly always the address we send to, so infer it rather than fail outright.
  const explicitUser = process.env.SMTP_USER?.trim();
  const user = explicitUser || recipient;

  if (!pass) {
    // Names only — never the values. This is the fastest way to spot a missing deployment variable.
    console.error(
      "SMTP is not configured: SMTP_PASS missing in this environment. " +
        "Set it in the hosting provider's environment variables and redeploy.",
    );
    return null;
  }

  if (!explicitUser) {
    console.warn(
      `SMTP_USER is not set; falling back to ${user}. ` +
        "Set SMTP_USER explicitly if the sending mailbox differs from the contact address.",
    );
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
