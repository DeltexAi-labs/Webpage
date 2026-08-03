import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

// Satori cannot fetch relative URLs, so the mark is inlined from disk at render time.
const logoDataUri = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public", "deltech-logo.png"),
).toString("base64")}`;

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

type OgImageOptions = {
  /** Small mint line under the wordmark, e.g. the section this page belongs to. */
  eyebrow: string;
  /** One short line beneath that. The card is the logo, so this stays brief. */
  title: string;
  tags?: string[];
};

const defaultTags = ["Consulting", "Software", "AI", "Cloud"];

export function renderOgImage({ eyebrow, title, tags = defaultTags }: OgImageOptions) {
  const host = siteConfig.siteUrl.replace(/^https?:\/\//, "");
  // Better to show nothing than "localhost:3000" if the site URL was never configured.
  const showHost = !/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|$)/.test(host);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 72px",
          background: "linear-gradient(150deg, #12293c 0%, #07131f 62%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand glow, echoing the mint accent used across the site. */}
        <div
          style={{
            position: "absolute",
            top: -300,
            right: -210,
            width: 700,
            height: 700,
            borderRadius: 700,
            background: "radial-gradient(circle, rgba(83,217,160,0.26) 0%, rgba(83,217,160,0) 64%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 6,
            background: "linear-gradient(90deg, #9ff8cf 0%, #53d9a0 32%, rgba(83,217,160,0) 88%)",
          }}
        />

        {/* The mark is the subject of the card: centred and large, with the wordmark beneath it. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders raw img only. */}
          <img
            src={logoDataUri}
            width={268}
            height={268}
            alt=""
            // Round crop: the artwork is a circular emblem on a black field.
            style={{ objectFit: "cover", borderRadius: 268 }}
          />

          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 52,
              fontWeight: 700,
              letterSpacing: -1.8,
              textAlign: "center",
            }}
          >
            {siteConfig.name}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 12,
              color: "#9ff8cf",
              fontSize: 21,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 18,
              maxWidth: 760,
              color: "#a9bbc6",
              fontSize: 24,
              lineHeight: 1.45,
              textAlign: "center",
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  padding: "9px 18px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.05)",
                  color: "#c6d5df",
                  fontSize: 19,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          {showHost ? <div style={{ display: "flex", color: "#7f95a3", fontSize: 22 }}>{host}</div> : null}
        </div>
      </div>
    ),
    ogSize,
  );
}
