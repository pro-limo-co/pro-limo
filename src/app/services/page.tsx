import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { services } from "@/data/services";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Services - Private Chauffeur, Airport, Hourly, Intercity",
  description:
    "Professional Limousine Driver offers airport pickup and drop-off, hourly chauffeurs, city-to-city rides, business travel, and event coordination at flat all-inclusive rates.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services - Professional Limousine Driver",
    description: "Five services. One standard.",
    url: `${siteConfig.url}/services`,
    images: [{ url: `/api/og?title=${encodeURIComponent("Five services. One standard.")}`, width: 1200, height: 630 }],
  },
};

export default function ServicesIndex() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.name,
            url: `${siteConfig.url}/services/${s.slug}`,
          })),
        }}
      />
      <Nav />
      <main>
        <PageHeader
          eyebrow="Index — Services"
          title={
            <>
              Five services,
              <span className="block italic text-[color:var(--color-champagne-bright)]">one standard.</span>
            </>
          }
          subtitle="Whether you are landing at midnight, departing before dawn, or chairing a board meeting at noon, Professional Limousine Driver runs five flat-fare services to take you there."
        />

        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 pb-24">
          <ol className="divide-y divide-[color:var(--color-divider-soft)] border-y border-[color:var(--color-divider-soft)]">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={i * 60} as="li">
                <Link
                  href={`/services/${s.slug}`}
                  className="group grid grid-cols-12 gap-6 lg:gap-10 py-10 lg:py-14 transition-colors hover:bg-[color:var(--color-ink-soft)]/40"
                >
                  <span className="col-span-2 lg:col-span-1 font-mono text-[0.72rem] tracking-[0.22em] text-[color:var(--color-champagne)] pt-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="col-span-10 lg:col-span-7">
                    <h2 className="font-display text-[2rem] lg:text-[3rem] leading-[1.05] text-[color:var(--color-bone)] group-hover:text-[color:var(--color-champagne-bright)] transition-colors">
                      {s.name}
                    </h2>
                    <p className="mt-3 font-display italic text-[1.25rem] text-[color:var(--color-bone-dim)]">
                      {s.tagline}
                    </p>
                  </div>
                  <p className="hidden lg:block lg:col-span-4 text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
                    {s.intro}
                  </p>
                </Link>
              </Reveal>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
