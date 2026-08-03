import type { ReactNode } from "react";

/**
 * Renders the small subset of Markdown a chat model actually emits — bold, inline code, links,
 * and bullet lists — as React elements. No HTML is ever injected, so a poisoned reply cannot
 * introduce markup.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|https?:\/\/[^\s<>()]+)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(INLINE)
    .filter((part) => part !== "")
    .map((part, index) => {
      const key = `${keyPrefix}-${index}`;

      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return <strong key={key}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
        return <code key={key}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }
      if (/^https?:\/\//.test(part)) {
        const trailing = part.match(/[.,;:)]+$/)?.[0] ?? "";
        const href = trailing ? part.slice(0, -trailing.length) : part;
        return (
          <span key={key}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              {href.replace(/^https?:\/\//, "")}
            </a>
            {trailing}
          </span>
        );
      }

      return <span key={key}>{part}</span>;
    });
}

export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  function flushBullets() {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`}>
        {bullets.map((item, index) => (
          <li key={index}>{renderInline(item, `li-${blocks.length}-${index}`)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  }

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trimEnd();
    const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);

    if (bullet) {
      bullets.push(bullet[1]);
      continue;
    }

    flushBullets();
    if (line.trim() === "") continue;

    // A heading marker from the model is rendered as emphasis, not a document heading.
    const heading = line.match(/^\s*#{1,4}\s+(.*)$/);
    const content = heading ? heading[1] : line;

    blocks.push(
      <p key={`p-${blocks.length}`}>
        {heading ? <strong>{renderInline(content, `h-${blocks.length}`)}</strong> : renderInline(content, `p-${blocks.length}`)}
      </p>,
    );
  }

  flushBullets();
  return <>{blocks}</>;
}
