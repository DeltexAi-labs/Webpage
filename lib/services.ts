export type Service = {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  summary: string;
  outcome: string;
  deliverables: string[];
  accent: "blue" | "mint" | "violet" | "amber";
};

export const services: Service[] = [
  {
    slug: "technology-consulting",
    number: "01",
    title: "Technology consulting",
    shortTitle: "Consulting",
    summary:
      "Turn an unclear technology problem into a practical roadmap your team can execute.",
    outcome: "Clear priorities, architecture decisions, delivery risks, and a plan tied to business value.",
    deliverables: [
      "Discovery and requirements workshops",
      "Architecture and stack recommendations",
      "Product and delivery roadmaps",
      "Technical due diligence and audits",
    ],
    accent: "blue",
  },
  {
    slug: "websites-platforms",
    number: "02",
    title: "Websites and web platforms",
    shortTitle: "Web development",
    summary:
      "Fast, accessible websites and web applications designed around real customer journeys.",
    outcome: "A responsive, maintainable product that communicates clearly and is ready to grow.",
    deliverables: [
      "Company and marketing websites",
      "Customer portals and dashboards",
      "E-commerce and booking experiences",
      "API and third-party integrations",
    ],
    accent: "mint",
  },
  {
    slug: "mobile-desktop-apps",
    number: "03",
    title: "Mobile and desktop applications",
    shortTitle: "App development",
    summary:
      "Useful applications for the devices your customers and teams already depend on.",
    outcome: "A tested application with a focused first release and a path to future capabilities.",
    deliverables: [
      "iOS and Android applications",
      "Cross-platform desktop software",
      "Internal operations tools",
      "Offline, device, and notification workflows",
    ],
    accent: "violet",
  },
  {
    slug: "ai-automation",
    number: "04",
    title: "AI systems and automation",
    shortTitle: "AI services",
    summary:
      "Apply AI where it removes repetitive work or improves decisions—not where a rule would work better.",
    outcome: "A measured AI workflow with human controls, observable quality, and manageable operating cost.",
    deliverables: [
      "AI assistants and knowledge search",
      "Document and workflow automation",
      "Speech, classification, and extraction",
      "Model evaluation and safety controls",
    ],
    accent: "amber",
  },
  {
    slug: "cloud-backend",
    number: "05",
    title: "Cloud and backend engineering",
    shortTitle: "Cloud systems",
    summary:
      "Reliable APIs, data flows, and deployment foundations behind modern digital products.",
    outcome: "A backend that is observable, documented, secure by default, and ready for real usage.",
    deliverables: [
      "API and database architecture",
      "Cloud deployment and CI/CD",
      "Authentication and billing systems",
      "Performance and reliability improvements",
    ],
    accent: "blue",
  },
  {
    slug: "product-design",
    number: "06",
    title: "Product and interface design",
    shortTitle: "Digital design",
    summary:
      "Make websites and applications clear, attractive, and easy for customers to understand and use.",
    outcome: "A polished product direction with user flows, screens, and reusable visual patterns ready to build.",
    deliverables: [
      "User journeys and wireframes",
      "Responsive interface design",
      "Interactive product prototypes",
      "Reusable design systems",
    ],
    accent: "violet",
  },
];

export const engagementModels = [
  {
    title: "Consultation",
    eyebrow: "Find the right direction",
    description:
      "A focused review for leaders who need clarity before committing budget, people, or technology.",
    bestFor: "Architecture decisions, product direction, audits, rescue plans",
  },
  {
    title: "Build sprint",
    eyebrow: "Move from idea to release",
    description:
      "A scoped engagement that takes one valuable outcome through design, implementation, and launch.",
    bestFor: "MVPs, websites, integrations, automations, internal tools",
  },
  {
    title: "Engineering partner",
    eyebrow: "Keep improving",
    description:
      "Ongoing product and engineering capacity for teams that need dependable delivery beyond version one.",
    bestFor: "Product roadmaps, modernization, design systems, maintenance",
  },
];

export const processSteps = [
  {
    number: "01",
    title: "Understand",
    copy: "We map the users, business goal, existing systems, constraints, and definition of success.",
  },
  {
    number: "02",
    title: "Shape",
    copy: "We reduce uncertainty with a clear scope, technical approach, milestones, and trade-offs.",
  },
  {
    number: "03",
    title: "Build",
    copy: "We deliver in reviewable increments, test critical behavior, and keep decisions visible.",
  },
  {
    number: "04",
    title: "Launch and learn",
    copy: "We deploy, document, measure the result, and prioritize what should improve next.",
  },
];
