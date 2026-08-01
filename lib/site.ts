const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const siteConfig = {
  name: "Deltech",
  description:
    "Technology consulting, product design, web and app development, AI systems, and cloud engineering for teams ready to build with confidence.",
  siteUrl: configuredSiteUrl.replace(/\/$/, ""),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "deltex@gmail.com",
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || "0793472960",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL?.trim() || "",
};

export const primaryContactHref = siteConfig.bookingUrl || "#contact";

export function projectEmailHref(service = "a new project") {
  if (!siteConfig.contactEmail) return "#contact";
  const subject = encodeURIComponent(`Project enquiry: ${service}`);
  const body = encodeURIComponent(
    "Hello Deltech,\n\nWhat we want to build:\n\nWho it is for:\n\nTarget timeline:\n\nBudget range (optional):\n",
  );
  return `mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`;
}
