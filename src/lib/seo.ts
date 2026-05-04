export const siteConfig = {
  name: "Pro Limo",
  legalName: "Pro Limo, a Corvus Inc. service",
  url: "https://prolimo.com",
  ogImage: "/api/og",
  description:
    "Private chauffeur service in 500+ cities. Flat all-inclusive rates, professional drivers, and a flawless arrival every time.",
  shortDescription:
    "Private chauffeur, worldwide.",
  socials: {
    instagram: "https://instagram.com/prolimo",
    x: "https://x.com/prolimo",
    linkedin: "https://www.linkedin.com/company/prolimo",
  },
  contact: {
    email: "concierge@prolimo.com",
    phone: "+1-844-PROLIMO",
  },
  founded: "2026",
} as const;

export type SiteConfig = typeof siteConfig;
