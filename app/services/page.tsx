import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/arrow-icon";
import { JsonLd } from "@/components/json-ld";
import { ServiceCard } from "@/components/service-card";
import { services } from "@/lib/services";
import { projectEmailHref, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore Deltech consulting, product design, website and application development, AI automation, and backend engineering services.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Technology consulting, software and AI services | Deltech",
    description:
      "Explore Deltech consulting, product design, website and application development, AI automation, and backend engineering services.",
    url: "/services",
    type: "website",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Deltech technology services",
  itemListElement: services.map((service, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      name: service.title,
      description: service.summary,
      url: `${siteConfig.siteUrl}/services#${service.slug}`,
      provider: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.siteUrl,
      },
    },
  })),
};

const decisionGuide = [
  {
    need: "You know the problem but not the right technical direction",
    start: "Technology consulting",
    href: "#technology-consulting",
  },
  {
    need: "You need a customer-facing site, portal, or digital service",
    start: "Websites and web platforms",
    href: "#websites-platforms",
  },
  {
    need: "The workflow belongs on phones or employee computers",
    start: "Mobile and desktop applications",
    href: "#mobile-desktop-apps",
  },
  {
    need: "Repetitive knowledge work is slowing your team down",
    start: "AI systems and automation",
    href: "#ai-automation",
  },
  {
    need: "Existing software is fragile, slow, or hard to operate",
    start: "Cloud and backend engineering",
    href: "#cloud-backend",
  },
  {
    need: "Your product works, but customers find it confusing or difficult to use",
    start: "Product and interface design",
    href: "#product-design",
  },
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <main id="main-content">
      <section className="page-hero">
        <Image
          className="page-hero-background-image"
          src="/deltech-technology-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow hero-eyebrow"><span /> Services</p>
            <h1>Organized around outcomes.</h1>
          </div>
          <p>
            Consulting, product design, engineering, AI, and cloud. Engage one specialty or the full mix,
            from idea to operation.
          </p>
        </div>
      </section>

      <section className="section service-catalog">
        <div className="shell detailed-service-grid">
          {services.map((service) => (
            <ServiceCard service={service} detailed key={service.slug} />
          ))}
        </div>
      </section>

      <section className="section decision-section">
        <div className="shell decision-grid">
          <div className="decision-intro">
            <p className="eyebrow dark-eyebrow">Where should you start?</p>
            <h2>Begin with the constraint you can see.</h2>
            <p>You do not need to diagnose the whole solution before talking to us.</p>
          </div>
          <div className="decision-table">
            {decisionGuide.map((item) => (
              <Link href={item.href} key={item.need}>
                <span>{item.need}</span>
                <strong>{item.start}</strong>
                <ArrowIcon />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section contact-section compact-contact" id="contact">
        <div className="shell contact-card">
          <div>
            <p className="eyebrow light-eyebrow">Not sure which service fits?</p>
            <h2>Start with the business problem.</h2>
          </div>
          <div className="contact-actions">
            {siteConfig.contactEmail ? (
              <a className="button button-mint" href={projectEmailHref("service consultation")}>
                Discuss your project <ArrowIcon />
              </a>
            ) : (
              <p className="contact-pending">
                Add <code>NEXT_PUBLIC_CONTACT_EMAIL</code> before launch to enable project enquiries.
              </p>
            )}
            <p>We will help identify the smallest responsible next step.</p>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
