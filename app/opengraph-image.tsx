import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Deltech & Big Technologies — consulting, software, and AI delivery";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Technology partner",
    title: "Ideas shaped into working technology.",
  });
}
