import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Deltech & Big Technologies services — consulting, engineering, AI, and design";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Services",
    title: "Organized around outcomes.",
    description:
      "Consulting, product design, engineering, AI, and cloud. Engage one specialty or the full mix, from idea to operation.",
    tags: ["Consulting", "Design", "Engineering", "AI", "Cloud"],
  });
}
