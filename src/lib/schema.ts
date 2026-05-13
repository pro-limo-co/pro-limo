import { siteConfig } from "./seo";
import type { City } from "@/data/cities";
import type { Service } from "@/data/services";

type WithContext<T> = T & { "@context": "https://schema.org" };

const organizationSchema: WithContext<Record<string, unknown>> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  legalName: siteConfig.legalName,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.svg`,
  description: siteConfig.description,
  foundingDate: siteConfig.founded,
  sameAs: Object.values(siteConfig.socials),
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Concierge",
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    availableLanguage: ["English"],
    areaServed: ["Portland metro", "Oregon Coast", "Willamette Valley", "Puget Sound"],
  },
};

const websiteSchema: WithContext<Record<string, unknown>> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
};

export const homePageSchemas: WithContext<Record<string, unknown>>[] = [
  organizationSchema,
  websiteSchema,
  {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Private Chauffeur Service",
    provider: { "@id": siteConfig.url },
    areaServed: ["Portland metro", "Oregon Coast", "Willamette Valley", "Puget Sound"],
    description: siteConfig.description,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "75",
      highPrice: "1500",
      offerCount: "1000+",
    },
  },
];

export function citySchemas(city: City): WithContext<Record<string, unknown>>[] {
  const url = `${siteConfig.url}/cities/${city.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": url,
      name: `${siteConfig.name} ${city.name}`,
      url,
      image: `${siteConfig.url}/api/og?title=${encodeURIComponent(city.name)}`,
      description: `Private chauffeur and airport car service in ${city.name}, ${city.state}. Flat rates, professional drivers, and a flawless arrival every time.`,
      telephone: siteConfig.contact.phone,
      priceRange: "$$$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: city.name,
        addressRegion: city.stateCode,
        addressCountry: city.countryCode,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.lat,
        longitude: city.lng,
      },
      areaServed: {
        "@type": "City",
        name: city.name,
        containedInPlace: {
          "@type": "State",
          name: city.state,
        },
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Cities", item: `${siteConfig.url}/cities` },
        { "@type": "ListItem", position: 3, name: city.name, item: url },
      ],
    },
  ];
}

export function serviceSchemas(service: Service): WithContext<Record<string, unknown>>[] {
  const url = `${siteConfig.url}/services/${service.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": url,
      serviceType: service.name,
      name: service.name,
      url,
      description: service.intro.replace(/<[^>]+>|&[^;]+;/g, ""),
      provider: { "@id": siteConfig.url },
      areaServed: ["Portland metro", "Oregon Coast", "Willamette Valley", "Puget Sound"],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: service.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Services", item: `${siteConfig.url}/services` },
        { "@type": "ListItem", position: 3, name: service.name, item: url },
      ],
    },
  ];
}

export function serviceAreaSchemas(cities: City[], services: Service[]): WithContext<Record<string, unknown>>[] {
  const url = `${siteConfig.url}/service-area`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Service Area",
      url,
      description:
        "Regional chauffeur service area for Professional Limousine Driver, with city and service pages for airport transfers, hourly chauffeurs, business travel, events, and city-to-city rides.",
      isPartOf: { "@id": siteConfig.url },
      about: services.map((service) => service.name),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Service Area", item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Professional Limousine Driver service cities",
      numberOfItems: cities.length,
      itemListElement: cities.map((city, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: city.name,
        url: `${siteConfig.url}/cities/${city.slug}`,
      })),
    },
  ];
}
