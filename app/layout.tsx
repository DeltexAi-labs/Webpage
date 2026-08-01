import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  applicationName: "Deltech",
  title: {
    default: "Deltech | Consulting, software and AI",
    template: "%s | Deltech",
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  category: "technology",
  creator: "Deltech",
  publisher: "Deltech",
  keywords: [
    "technology consulting",
    "web development",
    "app development",
    "AI automation",
    "cloud engineering",
    "product design",
    "interface design",
  ],
  openGraph: {
    // Images come from the opengraph-image files, so each route gets its own generated card.
    title: "Deltech | Technology that moves the work forward",
    description: siteConfig.description,
    type: "website",
    siteName: "Deltech",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deltech | Consulting, software and AI",
    description: siteConfig.description,
  },
  icons: {
    icon: "/icon.png",
    apple: "/deltech-logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07131f",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
