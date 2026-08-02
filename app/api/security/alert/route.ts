import { NextRequest, NextResponse } from "next/server";

import { securityAlertEmail } from "@/lib/emails";
import { createTransport, readSmtpSettings } from "@/lib/mailer";
import type { AttackSnapshot } from "@/lib/shield";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AlertPayload = {
  attack?: AttackSnapshot;
  host?: string;
};

export async function POST(request: NextRequest) {
  const secret = process.env.SECURITY_ALERT_SECRET;

  // Without a configured secret the endpoint stays closed rather than open.
  if (!secret || request.headers.get("x-shield-key") !== secret) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  let payload: AlertPayload;
  try {
    payload = (await request.json()) as AlertPayload;
  } catch {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const attack = payload.attack;
  if (!attack?.offenders?.length) {
    return NextResponse.json({ message: "Nothing to report." }, { status: 400 });
  }

  const smtp = readSmtpSettings();
  if (!smtp) {
    console.error("Traffic alert not sent: SMTP is not configured", {
      offenders: attack.offenders.map((offender) => offender.ip),
    });
    return NextResponse.json({ message: "Mail transport unavailable." }, { status: 503 });
  }

  const recipient = process.env.SECURITY_ALERT_TO?.trim() || smtp.recipient;
  const alert = securityAlertEmail({
    host: payload.host || "the website",
    detectedAt: new Date(attack.detectedAt),
    windowMs: attack.windowMs,
    totalRequests: attack.totalRequests,
    offenders: attack.offenders,
  });

  try {
    await createTransport(smtp).sendMail({
      from: `Website monitoring <${smtp.user}>`,
      to: recipient,
      subject: alert.subject,
      text: alert.text,
      html: alert.html,
    });
  } catch (error) {
    // Log the addresses even when mail fails, so the evidence is not lost with the email.
    console.error("Traffic alert delivery failed", error, {
      offenders: attack.offenders.map((offender) => offender.ip),
    });
    return NextResponse.json({ message: "Alert delivery failed." }, { status: 502 });
  }

  return NextResponse.json({ message: "Alert sent.", offenders: attack.offenders.length });
}
