export const siteConfig = {
  name: "Professional Limousine Driver",
  legalName: "Professional Limousine Driver",
  url: "https://prolimodriver.com",
  ogImage: "/api/og",
  description:
    "Private chauffeur and airport car service centered on Portland, with service across the Portland metro, the coast, the valley, Puget Sound, and other regional routes.",
  shortDescription:
    "Portland-centered private chauffeur service.",
  socials: {
    instagram: "https://instagram.com/prolimodriver",
    x: "https://x.com/prolimodriver",
    linkedin: "https://www.linkedin.com/company/prolimodriver",
  },
  contact: {
    email: "concierge@prolimodriver.com",
    phone: "+1-844-LIMO-DRV",
  },
  founded: "2026",
} as const;

export type SiteConfig = typeof siteConfig;
