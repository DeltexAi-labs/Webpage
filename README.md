# Deltech Company Page

A public Next.js website presenting Deltech's general technology services:

- Technology consultation and technical due diligence
- Websites, portals, and web applications
- Mobile and desktop applications
- AI assistants, automation, speech, classification, and extraction
- Cloud, API, database, and deployment engineering
- Product strategy, UX, and modern interface design
- A validated project-enquiry form delivered through a server-only Nodemailer route
- Framer Motion reveal effects with reduced-motion support
- Search metadata, canonical URLs, JSON-LD, `robots.txt`, and an XML sitemap

The homepage also presents Deltech's client-provided track record of serving more than 10 clients and
highlights active work in progress. No customer names, testimonials, or unsupported performance claims are used.

Contact and booking links remain disabled until real launch details are configured.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run lint
npm run build
npm start
```

## Configuration

Copy `.env.example` to `.env.local` and set the public deployment values:

```dotenv
NEXT_PUBLIC_SITE_URL=https://your-real-domain.example
NEXT_PUBLIC_CONTACT_EMAIL=deltex@gmail.com
NEXT_PUBLIC_CONTACT_PHONE=0793472960
NEXT_PUBLIC_BOOKING_URL=https://your-real-booking-page.example

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=deltex@gmail.com
SMTP_PASS=your-google-app-password
CONTACT_TO_EMAIL=deltex@gmail.com
```

For Gmail, `SMTP_PASS` must be a Google App Password created for this site—not the normal Gmail password.
Keep it only in `.env.local` or the deployment provider's encrypted environment settings. The contact endpoint
returns a direct-email fallback until SMTP credentials are configured.

`NEXT_PUBLIC_SITE_URL` must be the final HTTPS production origin before launch. It is used for canonical URLs,
the XML sitemap, robots host declaration, social metadata, and structured-data URLs.

## Structure

- `app/page.tsx` — general company landing page
- `app/services/page.tsx` — detailed service catalog and decision guide
- `components/` — shared navigation, footer, service cards, and visual elements
- `components/contact-form.tsx` — interactive enquiry form and submission feedback
- `components/reveal.tsx` — reduced-motion-aware Framer Motion reveal component
- `lib/services.ts` — reusable service and engagement content
- `lib/site.ts` — deployment and contact configuration
- `app/globals.css` — responsive design system with reduced-motion support
- `app/api/contact/route.ts` — validated, rate-limited Nodemailer endpoint
- `app/sitemap.ts` and `app/robots.ts` — search-engine discovery and crawler rules
- `components/json-ld.tsx` — safe JSON-LD serialization for Organization and Service data
- `public/deltech-logo.png` — web-ready logo prepared from the supplied Deltech artwork
- `public/deltech-technology-hero.png` — prepared hero background based on the supplied technology image

## Logo preparation

The supplied logo was processed with the built-in image editing workflow. The final prompt requested only a
tighter crop, centered composition, and edge cleanup while preserving the original blue-and-white mark.

The supplied technology image was also prepared with the built-in image editing workflow as a wide hero
background. Its globe, tablet, map, and network concept were preserved while the left side was simplified and
darkened for readable website copy.
