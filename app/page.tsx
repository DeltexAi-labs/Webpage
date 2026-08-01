import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/arrow-icon";
import { ContactForm } from "@/components/contact-form";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { ServiceCard } from "@/components/service-card";
import { engagementModels, processSteps, services } from "@/lib/services";
import { primaryContactHref, projectEmailHref, siteConfig } from "@/lib/site";

const capabilities = [
  "Product strategy",
  "Research and experience design",
  "Next.js and React",
  "Mobile and desktop",
  "Python and API engineering",
  "AI and language models",
  "Cloud and DevOps",
  "Brand and interface design",
];

const proofPoints = [
  {
    value: "10+",
    label: "clients served",
    copy: "A growing record of delivered client work.",
  },
  {
    value: "Active",
    label: "work underway",
    copy: "New builds and partnerships continue in progress.",
  },
  {
    value: "End to end",
    label: "delivery support",
    copy: "From consultation and design through launch.",
  },
];

const aiCapabilities = [
  {
    number: "01",
    title: "AI assistants",
    copy: "Useful copilots grounded in your approved knowledge and workflows.",
  },
  {
    number: "02",
    title: "Workflow automation",
    copy: "Route, classify, extract, and act on repetitive business information.",
  },
  {
    number: "03",
    title: "Voice and language",
    copy: "Speech recognition, summarization, translation, and language interfaces.",
  },
  {
    number: "04",
    title: "Evaluation and controls",
    copy: "Test quality, cost, safety, and human review before relying on an AI system.",
  },
];

const aiFlow = [
  { stage: "Task", copy: "One business decision or process worth improving." },
  { stage: "Grounding", copy: "Approved, current information the system may rely on." },
  { stage: "System", copy: "Model, tools, and guardrails sized to the job." },
  { stage: "Review", copy: "Human checkpoints wherever the cost of error is real." },
  { stage: "Evidence", copy: "Measured against the process it replaces." },
];

const aiTeamRoles = [
  "Machine learning engineers",
  "Data engineers",
  "Software architects",
  "Product designers",
  "Delivery leads",
];

const teamTraits = [
  {
    title: "Senior by default",
    copy: "The people who scope your work are the people who build it. No handover to juniors after the pitch.",
  },
  {
    title: "Low ego, high standards",
    copy: "Direct about trade-offs, quick to say when an idea is not worth building.",
  },
  {
    title: "One team, start to launch",
    copy: "The same faces from kickoff through release, so context never has to be rebuilt.",
  },
  {
    title: "We like the hard parts",
    copy: "Messy data, legacy systems, and unclear requirements are the work, not an obstacle to it.",
  },
];

const contactPhoneHref = `tel:${siteConfig.contactPhone.replace(/[^\d+]/g, "")}`;

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.siteUrl,
  logo: `${siteConfig.siteUrl}/deltech-logo.png`,
  description: siteConfig.description,
  email: siteConfig.contactEmail,
  telephone: siteConfig.contactPhone,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: siteConfig.contactEmail,
    telephone: siteConfig.contactPhone,
    availableLanguage: "English",
  },
  knowsAbout: capabilities,
};

export default function Home() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <main id="main-content">
      <section className="hero">
        <Image
          className="hero-background-image"
          src="/deltech-technology-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="shell hero-grid">
          <Reveal className="hero-copy" distance={18}>
            <p className="eyebrow hero-eyebrow">
              <span /> Consulting · Software · AI
            </p>
            <h1>
              Ideas shaped into <em>working</em> technology.
            </h1>
            <p className="hero-intro">
              Deltech provides technology consultation, builds modern websites and applications, and creates
              practical AI systems for organizations ready to move from ambition to delivery.
            </p>
            <div className="button-row">
              <a className="button button-mint" href={primaryContactHref}>
                Start a conversation <ArrowIcon />
              </a>
              <Link className="button button-ghost-light" href="/services">
                Explore services
              </Link>
            </div>
            <div className="hero-note">
              <span className="status-dot" />
              <span>Available for consultation, focused builds, and ongoing engineering partnerships.</span>
            </div>
          </Reveal>
        </div>
        <div className="shell hero-strip" aria-label="Deltech core capabilities">
          <span>Strategy</span>
          <i />
          <span>Experience</span>
          <i />
          <span>Engineering</span>
          <i />
          <span>AI</span>
          <i />
          <span>Design</span>
          <span className="mobile-capability-summary">Strategy · Engineering · AI</span>
        </div>
      </section>

      <section className="proof-section" aria-labelledby="proof-heading">
        <div className="shell proof-grid">
          <Reveal className="proof-intro">
            <p className="eyebrow dark-eyebrow">A growing delivery record</p>
            <h2 id="proof-heading">Trusted to turn plans into products.</h2>
          </Reveal>
          <Reveal className="proof-points" delay={0.1}>
            {proofPoints.map((point) => (
              <div key={point.label}>
                <strong>{point.value}</strong>
                <span>{point.label}</span>
                <p>{point.copy}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section services-section" id="services">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow dark-eyebrow">What you can hire us for</p>
              <h2>From the first decision to the dependable release.</h2>
            </div>
            <p>
              Choose a focused service or combine capabilities around one outcome. We define what is known,
              what must be tested, and where technology is not the answer.
            </p>
          </div>
          <Reveal className="service-grid">
            {services.map((service) => (
              <ServiceCard service={service} key={service.slug} />
            ))}
          </Reveal>
          <div className="section-action">
            <Link className="text-link text-link-large" href="/services">
              View the complete service catalog <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <section className="section ai-section" id="ai">
        <div className="shell">
          <div className="ai-panel">
            <Reveal className="ai-panel-head" distance={20}>
              <div>
                <p className="eyebrow ai-eyebrow"><span /> AI, designed for real work</p>
                <h2>Put AI where it creates a measurable advantage.</h2>
              </div>
              <div className="ai-panel-lead">
                <p>
                  We design and integrate AI around a clear business task, reliable source information,
                  human oversight, and evidence that the result is better than the current process. No
                  pilot is called a success until the numbers say so.
                </p>
                <Link className="button button-mint" href="/services#ai-automation">
                  Explore AI services <ArrowIcon />
                </Link>
              </div>
            </Reveal>

            <Reveal className="ai-flow" delay={0.08} distance={18}>
              {aiFlow.map((stage) => (
                <article key={stage.stage}>
                  <span className="ai-flow-node" aria-hidden="true">
                    <i />
                  </span>
                  <strong>{stage.stage}</strong>
                  <p>{stage.copy}</p>
                </article>
              ))}
            </Reveal>

            <Reveal className="ai-capability-grid" delay={0.12} distance={20}>
              {aiCapabilities.map((capability) => (
                <article key={capability.number}>
                  <span>{capability.number}</span>
                  <h3>{capability.title}</h3>
                  <p>{capability.copy}</p>
                </article>
              ))}
            </Reveal>

            <Reveal className="ai-team" delay={0.16} distance={16}>
              <div className="ai-team-lead">
                <span className="ai-team-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <p>
                  <strong>An experienced team.</strong> Every engagement is staffed with people who have
                  delivered systems in production, not a handover to juniors after the pitch.
                </p>
              </div>
              <ul className="ai-team-roles">
                {aiTeamRoles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section difference-section">
        <div className="shell difference-grid">
          <Reveal className="difference-visual">
            <span className="visual-label">A useful technology partner</span>
            <div className="visual-ring visual-ring-one" />
            <div className="visual-ring visual-ring-two" />
            <div className="visual-core">
              <span>DELTECH</span>
              <strong>Clarity<br />to launch</strong>
            </div>
            <div className="visual-tag tag-one">Business value</div>
            <div className="visual-tag tag-two">User needs</div>
            <div className="visual-tag tag-three">Sound engineering</div>
          </Reveal>
          <Reveal className="difference-copy" delay={0.1}>
            <p className="eyebrow light-eyebrow">How we think</p>
            <h2>Good technology work starts with honest trade-offs.</h2>
            <p>
              We do not begin with a favorite tool or an AI label. We begin with the people, process, and
              result that matter—then choose the smallest dependable system that can deliver it.
            </p>
            <div className="principle-list">
              <div>
                <span>01</span>
                <p><strong>Evidence over theatre.</strong> Capabilities and limitations are stated plainly.</p>
              </div>
              <div>
                <span>02</span>
                <p><strong>Progress you can inspect.</strong> Work arrives in reviewable, testable increments.</p>
              </div>
              <div>
                <span>03</span>
                <p><strong>Ownership after launch.</strong> Documentation and maintainability are part of delivery.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section process-section" id="process">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow dark-eyebrow">A visible delivery process</p>
              <h2>Less mystery. Better decisions.</h2>
            </div>
            <p>
              Every engagement is shaped differently, but the work stays understandable from discovery through launch.
            </p>
          </div>
          <Reveal>
            <ol className="process-grid">
              {processSteps.map((step) => (
                <li key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="section engagement-section" id="engagements">
        <div className="shell">
          <div className="section-heading centered-heading">
            <p className="eyebrow dark-eyebrow">Ways to work together</p>
            <h2>Start at the level your problem needs.</h2>
          </div>
          <Reveal className="engagement-grid">
            {engagementModels.map((model, index) => (
              <article key={model.title} className={index === 1 ? "engagement-card featured" : "engagement-card"}>
                <p>{model.eyebrow}</p>
                <h3>{model.title}</h3>
                <span className="engagement-rule" />
                <p>{model.description}</p>
                <div>
                  <span>Best for</span>
                  <p>{model.bestFor}</p>
                </div>
                <a href={projectEmailHref(model.title)} className="text-link">
                  Discuss this model <ArrowIcon />
                </a>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="capability-band" aria-label="Technology capabilities">
        <div className="shell capability-grid">
          <div>
            <p className="eyebrow light-eyebrow">Capabilities</p>
            <h2>A cross-functional team without unnecessary layers.</h2>
          </div>
          <ul>
            {capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section team-section" id="team">
        <div className="shell team-band">
          <Reveal className="team-copy" distance={18}>
            <p className="eyebrow light-eyebrow team-eyebrow"><span /> The people</p>
            <h2>A happy team, ready to deliver.</h2>
            <p>
              Small, senior, and glad to be building. People who enjoy the work do better work—and they
              stay on your project long enough to finish it properly.
            </p>
            <div className="team-avatars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <p className="team-availability">
              <span className="status-dot" />
              Available for new projects this quarter.
            </p>
          </Reveal>
          <Reveal className="team-traits" delay={0.12} distance={18}>
            {teamTraits.map((trait) => (
              <article key={trait.title}>
                <strong>{trait.title}</strong>
                <p>{trait.copy}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section contact-section" id="contact">
        <div className="shell contact-panel">
          <Reveal className="contact-intro">
            <p className="eyebrow contact-eyebrow">Start a conversation</p>
            <h2>Tell us what you want to make possible.</h2>
            <p className="contact-lede">
              Share the problem, the people it affects, and what success should look like. We will help identify
              a responsible, useful path forward.
            </p>
            <div className="contact-direct-grid">
              <a href={`mailto:${siteConfig.contactEmail}`}>
                <span>Email</span>
                <strong>{siteConfig.contactEmail}</strong>
              </a>
              <a href={contactPhoneHref}>
                <span>Phone</span>
                <strong>{siteConfig.contactPhone}</strong>
              </a>
            </div>
            <p className="contact-honesty">
              You will get a direct response about feasibility, discovery needs, and what we would not recommend.
            </p>
          </Reveal>
          <Reveal className="contact-form-wrap" delay={0.12}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
      </main>
    </>
  );
}
