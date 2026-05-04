import type { MetadataRoute } from "next";
import { cities } from "@/data/cities";
import { services } from "@/data/services";
import { siteConfig } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/cities`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/business`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const cityEntries: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${siteConfig.url}/cities/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${siteConfig.url}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // City × Service programmatic combos
  const cityServiceEntries: MetadataRoute.Sitemap = cities.flatMap((c) =>
    services.map((s) => ({
      url: `${siteConfig.url}/cities/${c.slug}/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [...staticEntries, ...cityEntries, ...serviceEntries, ...cityServiceEntries];
}
