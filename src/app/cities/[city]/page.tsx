import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { BookingCard } from "@/components/BookingCard";
import { JsonLd } from "@/components/JsonLd";
import { cities, getCity } from "@/data/cities";
import { services } from "@/data/services";
import { citySchemas } from "@/lib/schema";
import { siteConfig } from "@/lib/seo";

type Params = Promise<{ city: string }>;

export async function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city: slug } = await params;
  const c = getCity(slug);
  if (!c) return {};
  const title = `${c.name}, ${c.stateCode} Chauffeur Service`;
  const description = `Hire a private chauffeur in ${c.name}, ${c.state}. Flat rates, professional drivers, airport pickup and drop-off from ${c.airports.map((a) => a.code).join(", ")}, and intercity routes.`;
  const url = `${siteConfig.url}/cities/${c.slug}`;

  return {
    title,
    description,
    alternates: { canonical: `/cities/${c.slug}` },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(`${c.name} chauffeur service`)}&eyebrow=${encodeURIComponent(`${c.stateCode} location`)}&subtitle=${encodeURIComponent(c.tagline)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CityPage({ params }: { params: Params }) {
  const { city: slug } = await params;
  const c = getCity(slug);
  if (!c) notFound();

  return (
    <>
      <JsonLd data={citySchemas(c)} />
      <Nav />
      <main>
        <PageHeader
          eyebrow={`Location · ${c.stateCode}`}
          title={
            <>
              {c.name} chauffeur service,
              <span className="block italic text-[color:var(--color-champagne-bright)]">
                in cabin silence.
              </span>
            </>
          }
          subtitle={c.intro}
        />

        <section className="relative -mt-8 mx-auto max-w-[1400px] px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="font-display italic text-[1.5rem] text-[color:var(--color-bone-dim)] max-w-[28ch]">
                {c.tagline}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-12 border-t border-[color:var(--color-divider-soft)] pt-8 grid grid-cols-2 gap-y-8 gap-x-10">
                <Stat label="Airports served" items={c.airports.map((a) => `${a.code} · ${a.name}`)} />
                <Stat label="Areas served" items={c.neighborhoods} />
                <Stat label="Popular routes" items={c.popularRoutes} />
                <Stat label="Local time zone" items={[c.timezone]} />
              </div>
            </Reveal>

            <Reveal delay={240}>
              <h2 className="display-md mt-20">Services in {c.name}</h2>
              <p className="mt-3 text-[color:var(--color-bone-dim)] max-w-xl">
                Each service is a flat fare, with no surge pricing or hidden surcharge.
              </p>
              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-[color:var(--color-divider-soft)] border border-[color:var(--color-divider-soft)] rounded-2xl overflow-hidden">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/cities/${c.slug}/${s.slug}`}
                      className="group flex flex-col gap-3 px-6 py-7 bg-[color:var(--color-ink)] hover:bg-[color:var(--color-ink-soft)] transition-colors h-full"
                    >
                      <span className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--color-champagne)]">
                        {c.name} ·{" "}
                        <span className="text-[color:var(--color-pewter)]">{s.shortName}</span>
                      </span>
                      <span className="font-display text-[1.75rem] leading-tight text-[color:var(--color-bone)] group-hover:text-[color:var(--color-champagne-bright)] transition-colors">
                        {s.name}
                      </span>
                      <span className="text-[0.875rem] text-[color:var(--color-bone-dim)]">
                        {s.tagline}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-28 self-start">
            <Reveal delay={180}>
              <div className="surface-raised rounded-2xl p-2">
                <p className="px-4 pt-3 pb-1 font-mono text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
                  Reserve in {c.name}
                </p>
                <BookingCard
                  citySlug={c.slug}
                  sourceLabel={`Location · ${c.name}`}
                  sourcePath={`/cities/${c.slug}`}
                />
              </div>
            </Reveal>
          </aside>
        </section>

        <section className="bg-[color:var(--color-ink-soft)] border-y border-[color:var(--color-divider-soft)] section">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <p className="eyebrow">Nearby</p>
              <h2 className="display-md mt-5">More cities, same standard.</h2>
            </div>
            <ul className="lg:col-span-7 grid grid-cols-2 gap-3 self-end">
              {cities
                .filter((other) => other.slug !== c.slug && other.region === c.region)
                .slice(0, 6)
                .map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/cities/${other.slug}`}
                      className="group flex items-baseline justify-between border-b border-[color:var(--color-divider-soft)] py-3 hover:border-[color:var(--color-champagne)] transition-colors"
                    >
                      <span className="font-display text-[1.4rem] text-[color:var(--color-bone)] group-hover:text-[color:var(--color-champagne-bright)] transition-colors">
                        {other.name}
                      </span>
                      <span className="font-mono text-[0.72rem] tracking-[0.18em] text-[color:var(--color-pewter)]">
                        {other.airports[0]?.code}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
        {label}
      </p>
      <ul className="mt-3 space-y-1.5">
        {items.map((it) => (
          <li
            key={it}
            className="text-[0.95rem] text-[color:var(--color-bone)]"
          >
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
