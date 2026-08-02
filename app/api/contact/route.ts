import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { clientReceiptEmail, internalEnquiryEmail, type EnquiryDetails } from "@/lib/emails";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestLog = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  service?: unknown;
  message?: unknown;
  website?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanMessage(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function isRateLimited(identifier: string) {
  const now = Date.now();
  const existing = requestLog.get(identifier);

  if (!existing || existing.resetAt <= now) {
    requestLog.set(identifier, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const identifier = forwardedFor || request.headers.get("x-real-ip") || "local";

  if (isRateLimited(identifier)) {
    return NextResponse.json(
      { message: "Too many enquiries were sent from this connection. Please try again later." },
      { status: 429 },
    );
  }

  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ message: "The enquiry data was not valid." }, { status: 400 });
  }

  if (cleanText(body.website, 200)) {
    return NextResponse.json({ message: "Thanks—your enquiry has been received." });
  }

  const name = cleanText(body.name, 80);
  const email = cleanText(body.email, 160).toLowerCase();
  const phone = cleanText(body.phone, 30);
  const service = cleanText(body.service, 100);
  const message = cleanMessage(body.message, 4000);

  if (!name || !service || message.length < 20 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { message: "Please provide your name, a valid email, a service, and a little more project detail." },
      { status: 400 },
    );
  }

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.replace(/\s/g, "");
  const recipient = process.env.CONTACT_TO_EMAIL?.trim() || siteConfig.contactEmail;

  if (!smtpUser || !smtpPass) {
    return NextResponse.json(
      { message: `Online sending is being configured. Please email ${recipient} directly for now.` },
      { status: 503 },
    );
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const details: EnquiryDetails = { name, email, phone, service, message, submittedAt: new Date() };
  const internal = internalEnquiryEmail(details);

  try {
    await transporter.sendMail({
      from: `${siteConfig.name} website <${smtpUser}>`,
      to: recipient,
      replyTo: email,
      subject: internal.subject,
      text: internal.text,
      html: internal.html,
    });

    // The confirmation is a courtesy: a failure here must not tell the sender their enquiry was lost.
    const receipt = clientReceiptEmail(details);
    try {
      await transporter.sendMail({
        from: `${siteConfig.name} <${smtpUser}>`,
        to: email,
        replyTo: recipient,
        subject: receipt.subject,
        text: receipt.text,
        html: receipt.html,
      });
    } catch (error) {
      console.error("Contact confirmation delivery failed", error);
    }

    return NextResponse.json({
      message: `Thanks—your project enquiry has been sent to ${siteConfig.name}.`,
    });
  } catch (error) {
    console.error("Contact email delivery failed", error);
    return NextResponse.json(
      { message: `We could not send the enquiry. Please email ${recipient} directly.` },
      { status: 502 },
    );
  }
}
