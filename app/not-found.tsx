import type { Metadata } from "next";
import Link from "next/link";

import { ArrowIcon } from "@/components/arrow-icon";
import { services } from "@/lib/services";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That address does not exist on the Deltech & Big Technologies site. Here is the way back.",
  robots: { index: false, follow: true },
};

const destinations = [
  { href: "/", label: "Home", copy: "What Deltech does and how we work." },
  { href: "/services", label: "Services", copy: "Consulting, engineering, AI, and design." },
  { href: "/#contact", label: "Start a project", copy: "Tell us what you need built." },
];

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <span className="not-found-ghost" aria-hidden="true">404</span>
      <div className="shell not-found-inner">
        <p className="eyebrow not-found-eyebrow"><span /> Error 404</p>
        <h1>This page has not been built.</h1>
        <p className="not-found-lead">
          The address may have moved, or it may never have existed. Nothing is broken on your side—here
          are the routes that do work.
        </p>

        <div className="button-row">
          <Link className="button button-mint" href="/">
            Back to home <ArrowIcon />
          </Link>
          <Link className="button button-ghost-light" href="/services">
            Explore services
          </Link>
        </div>

        <ul className="not-found-links">
          {destinations.map((destination) => (
            <li key={destination.href}>
              <Link href={destination.href}>
                <strong>{destination.label}</strong>
                <span>{destination.copy}</span>
                <ArrowIcon />
              </Link>
            </li>
          ))}
        </ul>

        <p className="not-found-help">
          Looking for something specific? Email{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> and we will point you
          to it. You can also jump straight to{" "}
          <Link href={`/services#${services[0].slug}`}>{services[0].title.toLowerCase()}</Link>.
        </p>
      </div>
    </main>
  );
}
