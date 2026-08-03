import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Deltech & Big Technologies terms of service";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Terms",
    title: "The ground rules, in plain language.",
    tags: ["Site use", "Enquiries", "Liability"],
  });
}
