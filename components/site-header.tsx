import Link from "next/link";

import { ArrowIcon } from "@/components/arrow-icon";
import { BrandMark } from "@/components/brand-mark";
import { MobileMenu } from "@/components/mobile-menu";
import { primaryContactHref } from "@/lib/site";

const navigation = [
  { href: "/services", label: "Services" },
  { href: "/#ai", label: "AI solutions" },
  { href: "/#process", label: "How we work" },
  { href: "/#team", label: "Team" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand-link">
          <BrandMark />
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <a className="button button-small button-ink header-cta" href={primaryContactHref}>
          Start a project <ArrowIcon />
        </a>

        <MobileMenu navigation={navigation} ctaHref={primaryContactHref} />
      </div>
    </header>
  );
}
