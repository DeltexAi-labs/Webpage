import { siteConfig } from "@/lib/site";

export type EnquiryDetails = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  submittedAt: Date;
};

const ink = "#07131f";
const mint = "#53d9a0";
const paper = "#f2f5f3";
const muted = "#6b7f8c";
const line = "#e2e8e4";

const fontStack =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif";

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function paragraphs(message: string) {
  return escapeHtml(message)
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n/g, "<br />"))
    .filter(Boolean)
    .map(
      (block) =>
        `<p class="body-text" style="margin:0 0 12px;color:#243746;font-size:15px;line-height:1.68;">${block}</p>`,
    )
    .join("");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

function detailRow(label: string, value: string, href?: string) {
  const content = href
    ? `<a href="${href}" style="color:${ink};text-decoration:none;font-weight:600;">${value}</a>`
    : `<span style="color:${ink};font-weight:600;">${value}</span>`;

  // Stacked rather than two columns: a label above its value survives a narrow screen without
  // the value wrapping into a ragged column.
  return `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid ${line};">
        <span class="label" style="display:block;margin-bottom:3px;color:${muted};font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">${label}</span>
        <span class="value" style="font-size:15px;line-height:1.5;">${content}</span>
      </td>
    </tr>`;
}

type ShellOptions = {
  preheader: string;
  eyebrow: string;
  heading: string;
  intro: string;
  body: string;
  footer: string;
};

function emailShell({ preheader, eyebrow, heading, intro, body, footer }: ShellOptions) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${escapeHtml(heading)}</title>
<style>
  /* Gmail, Apple Mail and Outlook mobile honour these; anything that ignores them keeps the
     desktop sizes, which already fit a 600px column. */
  @media only screen and (max-width: 480px) {
    .wrap { padding: 14px 10px !important; }
    .pad { padding: 22px 18px !important; }
    .foot { padding: 14px 18px 6px !important; }
    .h1 { font-size: 19px !important; line-height: 1.3 !important; }
    .lead { font-size: 14px !important; }
    .body-text { font-size: 14px !important; line-height: 1.62 !important; }
    .label { font-size: 10px !important; }
    .value { font-size: 14px !important; }
    .small { font-size: 12px !important; }
    .btn a { display: block !important; text-align: center !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${paper};">
  <tr>
    <td class="wrap" align="center" style="padding:28px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:100%;border-collapse:separate;">

        <tr>
          <td class="pad" style="padding:26px 30px 0;background:#ffffff;border:1px solid ${line};border-bottom:0;border-radius:12px 12px 0 0;font-family:${fontStack};">
            <p style="margin:0 0 18px;font-size:13px;font-weight:700;color:${ink};letter-spacing:-0.2px;">
              ${siteConfig.name}
              <span style="color:${muted};font-weight:400;"> · ${escapeHtml(eyebrow)}</span>
            </p>
            <h1 class="h1" style="margin:0;color:${ink};font-size:22px;font-weight:700;letter-spacing:-0.5px;line-height:1.3;">${escapeHtml(heading)}</h1>
            <p class="lead body-text" style="margin:10px 0 0;color:${muted};font-size:15px;line-height:1.65;">${intro}</p>
          </td>
        </tr>

        <tr>
          <td class="pad" style="padding:22px 30px 28px;background:#ffffff;border:1px solid ${line};border-top:0;border-radius:0 0 12px 12px;font-family:${fontStack};">
            ${body}
          </td>
        </tr>

        <tr>
          <td class="foot" style="padding:16px 30px 6px;font-family:${fontStack};">
            <p class="small" style="margin:0;color:${muted};font-size:12px;line-height:1.6;text-align:center;">${footer}</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function internalEnquiryEmail(details: EnquiryDetails) {
  const { name, email, phone, service, message, submittedAt } = details;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeService = escapeHtml(service);

  const body = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${detailRow("Name", safeName)}
      ${detailRow("Email", safeEmail, `mailto:${safeEmail}`)}
      ${detailRow("Phone", phone ? escapeHtml(phone) : "Not supplied", phone ? `tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}` : undefined)}
      ${detailRow("Service", safeService)}
      ${detailRow("Received", escapeHtml(`${formatDate(submittedAt)} UTC`))}
    </table>

    <div style="margin:20px 0 0;padding:16px 18px;background:#f7faf8;border-left:3px solid ${mint};border-radius:8px;">
      <span class="label" style="display:block;margin-bottom:8px;color:#46606f;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">The brief</span>
      ${paragraphs(message)}
    </div>

    <table class="btn" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0 0;">
      <tr>
        <td style="border-radius:8px;background:${ink};">
          <a href="mailto:${safeEmail}?subject=${encodeURIComponent(`Re: your ${service} enquiry`)}" style="display:inline-block;padding:12px 22px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Reply to ${safeName}</a>
        </td>
      </tr>
    </table>`;

  return {
    // Name first: inbox lists truncate the tail, and who wrote in matters more than the category.
    subject: `New enquiry from ${name} — ${service}`,
    html: emailShell({
      preheader: `${name} asked about ${service}.`,
      eyebrow: "New enquiry",
      heading: `New enquiry from ${safeName}`,
      intro: `Sent from the website contact form about ${safeService.toLowerCase()}. Reply to this email to reach them directly.`,
      body,
      footer: `${siteConfig.name} website · ${escapeHtml(siteConfig.siteUrl)}`,
    }),
    text: [
      `New project enquiry — ${service}`,
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not supplied"}`,
      `Service: ${service}`,
      `Received: ${formatDate(submittedAt)} UTC`,
      "",
      "The brief:",
      message,
    ].join("\n"),
  };
}

export type SecurityAlertDetails = {
  host: string;
  detectedAt: Date;
  windowMs: number;
  totalRequests: number;
  offenders: {
    ip: string;
    requests: number;
    paths: string[];
    userAgent: string;
    firstSeen: number;
    lastSeen: number;
  }[];
};

export function securityAlertEmail(details: SecurityAlertDetails) {
  const { host, detectedAt, windowMs, totalRequests, offenders } = details;
  const seconds = Math.round(windowMs / 1000);

  const rows = offenders
    .map(
      (offender) => `
      <tr>
        <td style="padding:12px 10px 12px 0;border-bottom:1px solid ${line};vertical-align:top;">
          <span style="color:${ink};font-family:'SFMono-Regular',Consolas,monospace;font-size:14px;font-weight:700;">${escapeHtml(offender.ip)}</span>
        </td>
        <td style="padding:12px 10px;border-bottom:1px solid ${line};vertical-align:top;text-align:right;">
          <span style="color:#b42318;font-size:14px;font-weight:700;">${offender.requests}</span>
        </td>
        <td style="padding:12px 0 12px 10px;border-bottom:1px solid ${line};vertical-align:top;">
          <span style="color:#5b6f7c;font-size:12.5px;line-height:1.5;">${escapeHtml(offender.paths.join(", ") || "—")}</span><br />
          <span style="color:#8d9ea9;font-size:11.5px;">${escapeHtml(offender.userAgent.slice(0, 90) || "no user agent")}</span>
        </td>
      </tr>`,
    )
    .join("");

  const body = `
    <p style="margin:0 0 22px;color:#243746;font-size:15px;line-height:1.7;">
      <strong>${offenders.length} addresses</strong> were rate-limited on <strong>${escapeHtml(host)}</strong> at
      the same time, together making <strong>${totalRequests} requests</strong> inside a ${seconds}-second window.
      They are blocked automatically; this message is for your awareness.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding:0 10px 10px 0;border-bottom:2px solid ${ink};">
          <span style="color:${muted};font-size:11px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">Source IP</span>
        </td>
        <td style="padding:0 10px 10px;border-bottom:2px solid ${ink};text-align:right;">
          <span style="color:${muted};font-size:11px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">Hits</span>
        </td>
        <td style="padding:0 0 10px 10px;border-bottom:2px solid ${ink};">
          <span style="color:${muted};font-size:11px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">Targets</span>
        </td>
      </tr>
      ${rows}
    </table>

    <div style="margin:26px 0 0;padding:22px 24px;background:#fff7f6;border:1px solid #f3d6d2;border-left:3px solid #b42318;border-radius:12px;">
      <span style="display:block;margin-bottom:10px;color:#8a2b22;font-size:11px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">If this keeps happening</span>
      <p style="margin:0;color:#5b3a36;font-size:13.5px;line-height:1.7;">
        The app blocks these addresses by itself, but application-level blocking cannot absorb a large
        volumetric attack. Put the domain behind a network-level WAF, block the listed ranges there, and
        confirm the origin only accepts traffic through it.
      </p>
    </div>

    <p style="margin:24px 0 0;color:#8d9ea9;font-size:12px;line-height:1.6;">
      Detected ${escapeHtml(formatDate(detectedAt))} UTC. Further alerts are suppressed briefly so an
      attack cannot flood this inbox.
    </p>`;

  return {
    subject: `Traffic alert — ${offenders.length} addresses blocked on ${host}`,
    html: emailShell({
      preheader: `${offenders.length} addresses blocked after ${totalRequests} requests in ${seconds}s.`,
      eyebrow: "Automated traffic alert",
      heading: "Unusual traffic was blocked.",
      intro: "Your site rate-limited a burst of requests. The sources are listed below.",
      body,
      footer: `${siteConfig.name} · automated monitoring · ${escapeHtml(siteConfig.siteUrl)}`,
    }),
    text: [
      `Unusual traffic blocked on ${host}`,
      `Detected: ${formatDate(detectedAt)} UTC`,
      `${offenders.length} addresses, ${totalRequests} requests in ${seconds}s`,
      "",
      ...offenders.map(
        (offender) =>
          `${offender.ip} — ${offender.requests} hits — ${offender.paths.join(", ")} — ${offender.userAgent.slice(0, 90)}`,
      ),
      "",
      "These addresses are blocked automatically. For sustained attacks, use a network-level WAF.",
    ].join("\n"),
  };
}

export function clientReceiptEmail(details: EnquiryDetails) {
  const { name, service, message } = details;
  const firstName = name.split(" ")[0] || name;
  const safeFirstName = escapeHtml(firstName);
  const safeService = escapeHtml(service);

  const steps = [
    ["01", "We read it properly", "A person reviews the brief — not an autoresponder queue."],
    ["02", "We reply within one working day", "With first questions, or a suggested next step."],
    ["03", "We agree the smallest useful start", "A call, a scoping session, or a short paid discovery."],
  ]
    .map(
      ([number, title, copy]) => `
      <tr>
        <td style="padding:0 10px 0 0;width:26px;vertical-align:top;">
          <span style="color:${mint};font-size:12px;font-weight:700;">${number}</span>
        </td>
        <td style="padding:0 0 12px;vertical-align:top;">
          <strong class="value" style="display:block;color:${ink};font-size:14.5px;font-weight:700;letter-spacing:-0.2px;">${title}</strong>
          <span class="small" style="display:block;margin-top:2px;color:#5b6f7c;font-size:13px;line-height:1.55;">${copy}</span>
        </td>
      </tr>`,
    )
    .join("");

  const body = `
    <p class="body-text" style="margin:0 0 16px;color:#243746;font-size:15px;line-height:1.68;">
      Thanks ${safeFirstName} — we have received your enquiry about <strong>${safeService}</strong>. Here is what happens next.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 18px;">
      ${steps}
    </table>

    <div style="padding:16px 18px;background:#f7faf8;border-left:3px solid ${mint};border-radius:8px;">
      <span class="label" style="display:block;margin-bottom:8px;color:#46606f;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">What you sent us</span>
      ${paragraphs(message)}
    </div>

    <p class="small" style="margin:18px 0 0;color:#5b6f7c;font-size:13px;line-height:1.6;">
      Need to add something? Just reply to this email — it reaches the same people.
    </p>`;

  return {
    subject: `We received your enquiry — ${siteConfig.name}`,
    html: emailShell({
      preheader: `Thanks ${firstName}. We have your enquiry and will reply within one working day.`,
      eyebrow: "Enquiry received",
      heading: "We have received your enquiry",
      intro: `Thanks ${safeFirstName}. A person will read it and reply within one working day.`,
      body,
      footer: `${siteConfig.name} · ${escapeHtml(siteConfig.contactEmail)} · ${escapeHtml(siteConfig.siteUrl)}`,
    }),
    text: [
      `Thanks ${firstName} — we received your enquiry about ${service}.`,
      "",
      "What happens next:",
      "1. A person reviews the brief.",
      "2. We reply within one working day with first questions or a next step.",
      "3. We agree the smallest useful start — a call, a scoping session, or a short discovery.",
      "",
      "What you sent us:",
      message,
      "",
      `Reply to this email to add anything. — ${siteConfig.name}`,
    ].join("\n"),
  };
}
