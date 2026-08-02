import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Deltech & Big Technologies terms of service";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Terms",
    title: "The ground rules, in plain language.",
    description:
      "What you can expect from this site, what we expect from you, and where the real contract begins.",
    tags: ["Site use", "Enquiries", "Liability"],
  });
}
