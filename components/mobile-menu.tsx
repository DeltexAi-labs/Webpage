"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ArrowIcon } from "@/components/arrow-icon";

type MobileMenuProps = {
  navigation: { href: string; label: string }[];
  ctaHref: string;
};

export function MobileMenu({ navigation, ctaHref }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // A tap anywhere outside the panel — or Escape — dismisses it, the way a native menu behaves.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="mobile-menu" ref={menuRef} data-open={open || undefined}>
      <button
        className="mobile-menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span />
        <span />
      </button>

      <div className="mobile-menu-sheet" id="mobile-navigation" hidden={!open}>
        <p className="mobile-menu-label">Menu</p>
        <nav aria-label="Mobile navigation">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>
              {item.label}
              <ArrowIcon />
            </Link>
          ))}
        </nav>
        <a className="button button-mint mobile-menu-cta" href={ctaHref} onClick={() => setOpen(false)}>
          Start a project
        </a>
      </div>
    </div>
  );
}
