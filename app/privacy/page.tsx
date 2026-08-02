import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage, type LegalSection } from "@/components/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Deltech & Big Technologies collects when you use this website or send a project enquiry, why we hold it, and how to have it removed.",
  alternates: { canonical: "/privacy" },
};

const sections: LegalSection[] = [
  {
    id: "summary",
    title: "The short version",
    body: (
      <>
        <p>
          This site has no advertising, no tracking pixels, and no third-party analytics. The only personal
          information we hold is what you type into the enquiry form and send to us by email or phone.
        </p>
        <p>
          We use it to answer you and to run the resulting project. We do not sell it, and we do not add you
          to a marketing list you did not ask for.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>When you submit the enquiry form, we receive:</p>
        <ul>
          <li>Your name and work email address.</li>
          <li>Your phone number, if you choose to give one.</li>
          <li>The service you selected and the project description you wrote.</li>
        </ul>
        <p>
          Our hosting provider also keeps standard server logs — IP address, timestamp, and requested page —
          which are used to keep the site available and to rate-limit abusive traffic. We do not combine these
          logs with enquiry data to profile you.
        </p>
      </>
    ),
  },
  {
    id: "why",
    title: "Why we hold it",
    body: (
      <>
        <p>
          We hold enquiry details on the basis of your request: you asked us to get in touch, and we cannot do
          that without them. If the enquiry becomes an engagement, the same details support the contract we
          agree with you.
        </p>
        <p>
          Server logs are held on the basis of our legitimate interest in operating a working, non-abused
          website.
        </p>
      </>
    ),
  },
  {
    id: "where-it-goes",
    title: "Where it goes",
    body: (
      <>
        <p>
          Form submissions are delivered as email to our own inbox over an authenticated SMTP connection, and a
          copy of the confirmation is sent back to the address you supplied. The message therefore passes
          through our email and hosting providers, who process it on our behalf and under their own security
          terms.
        </p>
        <p>
          Nothing is shared with anyone else — no data brokers, no advertising networks, no partner lists.
          Where a project requires a specialist subcontractor, we tell you before any of your information
          reaches them.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        This site sets no advertising or analytics cookies, and there is no consent banner because there is
        nothing to consent to. Your browser may store ordinary technical items such as cache entries, which we
        neither read nor control.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <>
        <p>
          Enquiries that do not lead to work are kept for up to 24 months, so that we recognise the context if
          you come back to us, then deleted. Records tied to a signed engagement are kept for as long as the
          relationship lasts plus any period we are required to retain business records.
        </p>
        <p>Server logs are rotated by our hosting provider on their standard schedule.</p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          You can ask us for a copy of what we hold about you, ask us to correct it, or ask us to delete it.
          You can also object to us holding it at all — in which case we will remove the enquiry and stop
          processing.
        </p>
        <p>
          Write to <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> and we will
          respond within 30 days. There is no charge for a reasonable request.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        The site is served over HTTPS, credentials for mail delivery are held as server-side environment
        variables and never exposed to the browser, and the enquiry endpoint is rate-limited. No system is
        perfect: if we ever become aware of a breach affecting your information, we will tell you directly.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact and changes",
    body: (
      <>
        <p>
          Questions about this policy, or about anything we hold, go to{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> or{" "}
          {siteConfig.contactPhone}.
        </p>
        <p>
          If this policy changes we will update the date at the top of the page. Material changes affecting
          existing clients will also be raised with them directly. See also our{" "}
          <Link href="/terms">terms of service</Link>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="What we collect, and what we do not."
      summary="No trackers, no data selling, no marketing list. This page explains exactly what happens to the details you send us."
      updated="1 August 2026"
      sections={sections}
    />
  );
}
