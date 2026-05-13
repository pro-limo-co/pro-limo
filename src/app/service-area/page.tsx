import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { cities } from "@/data/cities";
import { services } from "@/data/services";
import { serviceAreaSchemas } from "@/lib/schema";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Service Area - Portland Chauffeur Routes",
  description:
    "Browse Professional Limousine Driver service-area coverage for Portland, Seattle, Eugene, Cannon Beach, Astoria, the coast, the valley, Puget Sound, and metro cities.",
  alternates: { canonical: "/service-area" },
  openGraph: {
    title: "Service Area - Professional Limousine Driver",
    description: "Current chauffeur service cities and service combinations.",
    url: `${siteConfig.url}/service-area`,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("Professional Limousine Driver service area")}&subtitle=${encodeURIComponent("Portland-centered regional chauffeur coverage")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function ServiceAreaPage() {
  const grouped = cities.reduce<Record<string, typeof cities>>((acc, city) => {
    (acc[city.region] ||= []).push(city);
    return acc;
  }, {});

  return (
    <>
      <JsonLd data={serviceAreaSchemas(cities, services)} />
      <Nav />
      <main>
        <PageHeader
          eyebrow="Service Area"
          title={
            <>
              Regional routes,
              <span className="block italic text-[color:var(--color-champagne-bright)]">mapped for every service.</span>
            </>
          }
          subtitle="Professional Limousine Driver currently serves a Portland-centered regional network with city pages and service pages for airport transfers, hourly chauffeurs, business travel, event transportation, and city-to-city rides."
        />

        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 pb-24">
          <Reveal>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[color:var(--color-divider-soft)] bg-[color:var(--color-divider-soft)] sm:grid-cols-3">
              <Metric label="Cities" value={cities.length} />
              <Metric label="Services" value={services.length} />
              <Metric label="Service combinations" value={cities.length * services.length} />
            </div>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-14">
            {Object.entries(grouped).map(([region, list], regionIndex) => (
              <Reveal key={region} delay={regionIndex * 60} as="section">
                <div className="grid grid-cols-1 gap-8 border-t border-[color:var(--color-divider-soft)] pt-10 lg:grid-cols-12">
                  <div className="lg:col-span-3">
                    <h2 className="font-mono text-[0.78rem] uppercase tracking-[0.2em] text-[color:var(--color-pewter)]">
                      {region}
                    </h2>
                    <p className="mt-4 max-w-xs text-[0.92rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
                      Each city connects to every active chauffeur service for this part of the current network.
                    </p>
                  </div>

                  <div className="lg:col-span-9">
                    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {list.map((city) => (
                        <li key={city.slug} className="border-b border-[color:var(--color-divider-soft)] pb-6">
                          <Link
                            href={`/cities/${city.slug}`}
                            className="group flex items-baseline justify-between gap-4"
                          >
                            <span className="font-display text-[1.7rem] leading-tight text-[color:var(--color-bone)] transition-colors group-hover:text-[color:var(--color-champagne-bright)]">
                              {city.name}
                            </span>
                            <span className="shrink-0 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[color:var(--color-pewter)]">
                              {city.stateCode}
                            </span>
                          </Link>
                          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                            {services.map((service) => (
                              <li key={service.slug}>
                                <Link
                                  href={`/cities/${city.slug}/${service.slug}`}
                                  className="font-condensed text-[0.76rem] uppercase tracking-[0.16em] text-[color:var(--color-bone-dim)] transition-colors hover:text-[color:var(--color-champagne-bright)]"
                                >
                                  {service.shortName}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[color:var(--color-ink)] p-7 sm:p-8">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[color:var(--color-pewter)]">
        {label}
      </p>
      <p className="mt-3 font-display text-[3rem] leading-none text-[color:var(--color-champagne-bright)]">
        {value}
      </p>
    </div>
  );
}
