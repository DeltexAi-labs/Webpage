import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage, type LegalSection } from "@/components/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms that govern use of the Deltech & Big Technologies website and the ground rules for engagements that start from it.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "scope",
    title: "What these terms cover",
    body: (
      <>
        <p>
          These terms govern your use of this website and any enquiry you send through it. They are not the
          contract for delivery work: every engagement is governed by a separate written agreement covering
          scope, price, timeline, and liability, and that agreement takes precedence wherever the two differ.
        </p>
        <p>Using the site means you accept what is written here.</p>
      </>
    ),
  },
  {
    id: "using-the-site",
    title: "Using the site",
    body: (
      <>
        <p>You may read, share, and quote this site freely. You may not:</p>
        <ul>
          <li>Submit false details, or send enquiries on someone else&rsquo;s behalf without their knowledge.</li>
          <li>Use the enquiry form for bulk marketing, spam, or automated submissions.</li>
          <li>Attempt to disrupt, probe, or gain unauthorised access to the site or its infrastructure.</li>
          <li>Copy the site&rsquo;s design, copy, or code wholesale to present as your own.</li>
        </ul>
        <p>We rate-limit the enquiry endpoint and may block traffic that abuses it.</p>
      </>
    ),
  },
  {
    id: "enquiries",
    title: "Enquiries are not a contract",
    body: (
      <>
        <p>
          Sending an enquiry does not oblige us to take the work, and it does not oblige you to hire us.
          Nothing on this site is an offer capable of acceptance — prices, timelines, and approaches are
          discussed and agreed in writing before any work starts.
        </p>
        <p>We aim to reply to every genuine enquiry within one working day.</p>
      </>
    ),
  },
  {
    id: "confidentiality",
    title: "What you send us",
    body: (
      <>
        <p>
          Treat the enquiry form as a first conversation, not a secure channel: send enough for us to
          understand the problem, and keep credentials, trade secrets, and personal data of your own customers
          out of it until we have a confidentiality agreement in place.
        </p>
        <p>
          We will not disclose the substance of your enquiry to anyone outside Deltech &amp; Big Technologies, and we are happy to
          sign an NDA before a detailed discussion. How we store what you send is described in our{" "}
          <Link href="/privacy">privacy policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: (
      <>
        <p>
          The Deltech &amp; Big Technologies name, brand, site design, and written content belong to us. The ideas you describe in an
          enquiry remain yours — we claim no rights over them by receiving them.
        </p>
        <p>
          Ownership of work produced during an engagement is set out in that engagement&rsquo;s agreement. Our
          normal position is that you own the deliverables once they are paid for, while we retain rights to
          our pre-existing tools and general know-how.
        </p>
      </>
    ),
  },
  {
    id: "accuracy",
    title: "Accuracy and availability",
    body: (
      <>
        <p>
          We keep this site accurate, but it describes capabilities in general terms and is not professional
          advice for your specific situation. Do not make an architectural, financial, or legal decision on the
          strength of a web page alone — ask us.
        </p>
        <p>
          The site is provided as it is. We do not guarantee uninterrupted availability, and we may change or
          remove content without notice.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party links and services",
    body: (
      <p>
        Where we link to another organisation&rsquo;s site or tool, we do not control it and are not responsible
        for its content, terms, or handling of your data. Read their terms before relying on them.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    body: (
      <>
        <p>
          To the extent the law allows, we are not liable for indirect or consequential loss arising from your
          use of this website, including lost profit, lost data, or business interruption.
        </p>
        <p>
          Nothing here limits liability for death or personal injury caused by negligence, for fraud, or for
          anything else that cannot lawfully be limited. Liability for delivery work is dealt with in the
          engagement agreement, not here.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <>
        <p>
          We may update these terms as the business changes. The version published here, with the date at the
          top of the page, is the one that applies.
        </p>
        <p>
          Questions go to <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> or{" "}
          {siteConfig.contactPhone}.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of service"
      title="The ground rules, in plain language."
      summary="What you can expect from this site, what we expect from you, and where the real contract begins."
      updated="1 August 2026"
      sections={sections}
    />
  );
}
