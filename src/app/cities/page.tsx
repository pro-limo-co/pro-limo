import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { cities } from "@/data/cities";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Locations - Portland Chauffeur Service Area",
  description:
    "Browse Professional Limousine Driver location pages for Portland, Seattle, Eugene, Cannon Beach, Seaside, Astoria, and high-demand metro cities.",
  alternates: { canonical: "/cities" },
  openGraph: {
    title: "Locations - Professional Limousine Driver",
    description: "Private chauffeur and airport car service across the current Portland-centered service area.",
    url: `${siteConfig.url}/cities`,
    images: [{ url: `/api/og?title=${encodeURIComponent("Portland service area locations")}`, width: 1200, height: 630 }],
  },
};

export default function CitiesIndex() {
  const grouped = cities.reduce<Record<string, typeof cities>>((acc, c) => {
    (acc[c.region] ||= []).push(c);
    return acc;
  }, {});

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: cities.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            url: `${siteConfig.url}/cities/${c.slug}`,
          })),
        }}
      />
      <Nav />
      <main>
        <PageHeader
          eyebrow="Index - Locations"
          title={
            <>
              Portland-centered,
              <span className="block italic text-[color:var(--color-champagne-bright)]">route by route.</span>
            </>
          }
          subtitle="Current location pages focus on cities within roughly 250 miles of Portland, including Seattle, Eugene, Cannon Beach, Seaside, Astoria, and high-demand communities around the metro."
        />

        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 pb-24">
          {Object.entries(grouped).map(([region, list]) => (
            <Reveal key={region} as="section" className="mt-16 first:mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-[color:var(--color-divider-soft)] pt-10">
                <h2 className="lg:col-span-3 font-mono text-[0.78rem] tracking-[0.2em] uppercase text-[color:var(--color-pewter)]">
                  {region}
                </h2>
                <ul className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-3">
                  {list.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/cities/${c.slug}`}
                        className="group flex items-baseline justify-between border-b border-[color:var(--color-divider-soft)] py-3 hover:border-[color:var(--color-champagne)] transition-colors"
                      >
                        <span className="font-display text-[1.5rem] text-[color:var(--color-bone)] group-hover:text-[color:var(--color-champagne-bright)] transition-colors">
                          {c.name}
                        </span>
                        <span className="font-mono text-[0.72rem] tracking-[0.2em] text-[color:var(--color-pewter)]">
                          {c.stateCode} · {c.airports[0]?.code}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}

          <p className="mt-16 text-[color:var(--color-bone-dim)] text-[0.95rem]">
            Each location page links to airport transfer, hourly chauffeur,
            city-to-city, business, and event service pages for the same market.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
