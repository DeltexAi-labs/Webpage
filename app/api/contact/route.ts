import { NextRequest, NextResponse } from "next/server";

import { clientReceiptEmail, internalEnquiryEmail, type EnquiryDetails } from "@/lib/emails";
import { createTransport, readSmtpSettings } from "@/lib/mailer";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_MESSAGE_LENGTH = 20;

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

  // Name the fields that actually failed, so the sender knows what to change.
  const problems: string[] = [];
  if (!name) problems.push("your name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push("a valid work email");
  if (!service) problems.push("the service you need");
  if (message.length < MIN_MESSAGE_LENGTH) {
    problems.push(
      message.length === 0
        ? "a short description of the project"
        : `at least ${MIN_MESSAGE_LENGTH} characters about the project (you wrote ${message.length})`,
    );
  }

  if (problems.length > 0) {
    const list =
      problems.length === 1
        ? problems[0]
        : `${problems.slice(0, -1).join(", ")} and ${problems[problems.length - 1]}`;

    return NextResponse.json({ message: `Please add ${list}.` }, { status: 400 });
  }

  const smtp = readSmtpSettings();

  if (!smtp) {
    return NextResponse.json(
      {
        message: `Online sending is being configured. Please email ${siteConfig.contactEmail} directly for now.`,
      },
      { status: 503 },
    );
  }

  const { user: smtpUser, recipient } = smtp;
  const transporter = createTransport(smtp);

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
