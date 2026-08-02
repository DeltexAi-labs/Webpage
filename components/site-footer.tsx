import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand-block">
          <BrandMark />
          <p className="footer-kicker">Consulting · Software · AI</p>
          <p className="footer-summary">
            Practical consulting, software, and AI delivery backed by experience serving more than 10 clients.
          </p>
          <div className="footer-availability"><span /> Available for new project conversations</div>
        </div>
        <div>
          <p className="footer-label">Explore</p>
          <Link href="/services">Services</Link>
          <Link href="/#ai">AI solutions</Link>
          <Link href="/#process">How we work</Link>
        </div>
        <div>
          <p className="footer-label">Legal</p>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of service</Link>
        </div>
        <div>
          <p className="footer-label">Contact</p>
          {siteConfig.contactEmail ? (
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          ) : (
            <span>Contact channel configured at launch</span>
          )}
          <a href={`tel:${siteConfig.contactPhone.replace(/[^\d+]/g, "")}`}>{siteConfig.contactPhone}</a>
          {siteConfig.bookingUrl ? <a href={siteConfig.bookingUrl}>Book a consultation</a> : null}
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
        <nav className="footer-legal-links" aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
