import type { ReactNode } from "react";

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
};

export function LegalPage({ eyebrow, title, summary, updated, sections }: LegalPageProps) {
  return (
    <main id="main-content">
      <section className="legal-hero">
        <div className="shell">
          <p className="eyebrow legal-eyebrow"><span /> {eyebrow}</p>
          <h1>{title}</h1>
          <p className="legal-summary">{summary}</p>
          <p className="legal-updated">
            <span className="status-dot" /> Last updated {updated}
          </p>
        </div>
      </section>

      <section className="section legal-section">
        <div className="shell legal-grid">
          <aside className="legal-toc">
            <p className="legal-toc-label">On this page</p>
            <nav aria-label="Section navigation">
              {sections.map((section, index) => (
                <a href={`#${section.id}`} key={section.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="legal-body">
            {sections.map((section, index) => (
              <article id={section.id} key={section.id}>
                <span className="legal-index">{String(index + 1).padStart(2, "0")}</span>
                <h2>{section.title}</h2>
                {section.body}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
