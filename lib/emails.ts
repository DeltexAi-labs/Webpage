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
const inkSoft = "#0d2032";
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
        `<p style="margin:0 0 14px;color:#243746;font-size:15px;line-height:1.7;">${block}</p>`,
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

  return `
    <tr>
      <td style="padding:13px 0;border-bottom:1px solid ${line};width:132px;vertical-align:top;">
        <span style="color:${muted};font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">${label}</span>
      </td>
      <td style="padding:13px 0;border-bottom:1px solid ${line};vertical-align:top;">
        <span style="font-size:15px;line-height:1.5;">${content}</span>
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
<meta name="color-scheme" content="light" />
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${paper};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:100%;border-collapse:separate;">

        <tr>
          <td style="padding:38px 40px 34px;background:${inkSoft};background-image:linear-gradient(150deg,${inkSoft} 0%,${ink} 70%);border-radius:18px 18px 0 0;font-family:${fontStack};">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <span style="color:${mint};font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(eyebrow)}</span>
                </td>
                <td align="right">
                  <span style="color:#ffffff;font-size:15px;font-weight:800;letter-spacing:-0.4px;">${siteConfig.name}</span>
                </td>
              </tr>
            </table>
            <h1 style="margin:20px 0 0;color:#ffffff;font-size:26px;font-weight:750;letter-spacing:-0.8px;line-height:1.25;">${escapeHtml(heading)}</h1>
            <p style="margin:14px 0 0;color:#a9bbc6;font-size:14px;line-height:1.65;">${intro}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:34px 40px 38px;background:#ffffff;border-radius:0 0 18px 18px;font-family:${fontStack};">
            ${body}
          </td>
        </tr>

        <tr>
          <td style="padding:22px 40px 8px;font-family:${fontStack};">
            <p style="margin:0;color:${muted};font-size:12px;line-height:1.7;text-align:center;">${footer}</p>
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

    <div style="margin:28px 0 0;padding:22px 24px;background:#f7faf8;border:1px solid ${line};border-left:3px solid ${mint};border-radius:12px;">
      <span style="display:block;margin-bottom:12px;color:#46606f;font-size:11px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">The brief</span>
      ${paragraphs(message)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
      <tr>
        <td style="border-radius:999px;background:${ink};">
          <a href="mailto:${safeEmail}?subject=${encodeURIComponent(`Re: your ${service} enquiry`)}" style="display:inline-block;padding:14px 26px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Reply to ${safeName}</a>
        </td>
      </tr>
    </table>`;

  return {
    subject: `New ${service} enquiry — ${name}`,
    html: emailShell({
      preheader: `${name} asked about ${service}.`,
      eyebrow: "New project enquiry",
      heading: `${safeName} wants to talk about ${safeService.toLowerCase()}.`,
      intro: "Sent from the website contact form. Reply directly to reach the sender.",
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
        <td style="padding:0 14px 0 0;width:34px;vertical-align:top;">
          <span style="color:${mint};font-size:12px;font-weight:800;letter-spacing:1px;">${number}</span>
        </td>
        <td style="padding:0 0 18px;vertical-align:top;">
          <strong style="display:block;color:${ink};font-size:15px;font-weight:700;letter-spacing:-0.2px;">${title}</strong>
          <span style="display:block;margin-top:4px;color:#5b6f7c;font-size:13.5px;line-height:1.6;">${copy}</span>
        </td>
      </tr>`,
    )
    .join("");

  const body = `
    <p style="margin:0 0 22px;color:#243746;font-size:15px;line-height:1.7;">
      Thanks ${safeFirstName} — your enquiry about <strong>${safeService}</strong> is with us. Here is what happens next.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 26px;">
      ${steps}
    </table>

    <div style="padding:22px 24px;background:#f7faf8;border:1px solid ${line};border-left:3px solid ${mint};border-radius:12px;">
      <span style="display:block;margin-bottom:12px;color:#46606f;font-size:11px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">What you sent us</span>
      ${paragraphs(message)}
    </div>

    <p style="margin:26px 0 0;color:#5b6f7c;font-size:13.5px;line-height:1.7;">
      Need to add something? Just reply to this email — it reaches the same people.
    </p>`;

  return {
    subject: `We received your enquiry — ${siteConfig.name}`,
    html: emailShell({
      preheader: `Thanks ${firstName}. A person is reading your brief and will reply within one working day.`,
      eyebrow: "Enquiry received",
      heading: "Thanks — we have your brief.",
      intro: `A person will read it and reply within one working day.`,
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
