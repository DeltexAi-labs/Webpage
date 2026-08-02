import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Deltech & Big Technologies privacy policy";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Privacy",
    title: "What we collect, and what we do not.",
    description:
      "No trackers, no data selling, no marketing list. Exactly what happens to the details you send us.",
    tags: ["No tracking", "No cookies", "Plain language"],
  });
}
