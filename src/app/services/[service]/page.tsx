import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { BookingCard } from "@/components/BookingCard";
import { JsonLd } from "@/components/JsonLd";
import { services, getService } from "@/data/services";
import { cities, featuredCitySlugs } from "@/data/cities";
import { serviceSchemas } from "@/lib/schema";
import { siteConfig } from "@/lib/seo";

type Params = Promise<{ service: string }>;

export async function generateStaticParams() {
  return services.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { service: slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  const title = `${s.name} — Pro Limo private chauffeur`;
  const description = s.intro.replace(/<[^>]+>|&[^;]+;/g, "");
  const url = `${siteConfig.url}/services/${s.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(s.name)}&eyebrow=${encodeURIComponent("Pro Limo")}&subtitle=${encodeURIComponent(s.tagline)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function ServicePage({ params }: { params: Params }) {
  const { service: slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  return (
    <>
      <JsonLd data={serviceSchemas(s)} />
      <Nav />
      <main>
        <PageHeader
          eyebrow={`Service · ${s.shortName}`}
          title={
            <>
              {s.name}
              <span className="block italic text-[color:var(--color-champagne-bright)]">— {s.tagline}</span>
            </>
          }
          subtitle={s.intro}
        />

        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
          <div className="lg:col-span-7">
            <Reveal>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[color:var(--color-divider-soft)] border border-[color:var(--color-divider-soft)] rounded-2xl overflow-hidden">
                {s.bullets.map((b, i) => (
                  <li
                    key={b.title}
                    className="bg-[color:var(--color-ink)] p-7 flex flex-col gap-3"
                  >
                    <span className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--color-champagne)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-[1.65rem] leading-tight">{b.title}</h3>
                    <p className="text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
                      {b.body}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120}>
              <h2 className="display-md mt-16">Frequently asked</h2>
              <dl className="mt-8 divide-y divide-[color:var(--color-divider-soft)] border-y border-[color:var(--color-divider-soft)]">
                {s.faqs.map((f) => (
                  <div key={f.q} className="py-6">
                    <dt className="font-display text-[1.35rem] text-[color:var(--color-bone)]">
                      {f.q}
                    </dt>
                    <dd className="mt-3 text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)] max-w-2xl">
                      {f.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={220}>
              <h2 className="display-md mt-16">{s.shortName} in featured cities</h2>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {featuredCitySlugs
                  .map((slug) => cities.find((c) => c.slug === slug))
                  .filter((c): c is NonNullable<typeof c> => Boolean(c))
                  .map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/cities/${c.slug}/${s.slug}`}
                        className="group flex items-baseline justify-between border-b border-[color:var(--color-divider-soft)] py-3 hover:border-[color:var(--color-champagne)] transition-colors"
                      >
                        <span className="font-display text-[1.4rem] text-[color:var(--color-bone)] group-hover:text-[color:var(--color-champagne-bright)] transition-colors">
                          {c.name}
                        </span>
                        <span className="font-mono text-[0.72rem] tracking-[0.18em] text-[color:var(--color-pewter)]">
                          {c.airports[0]?.code}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </Reveal>
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-28 self-start">
            <Reveal delay={120}>
              <div className="surface-raised rounded-2xl p-2">
                <p className="px-4 pt-3 pb-1 font-mono text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
                  Reserve · {s.shortName}
                </p>
                <BookingCard />
              </div>
            </Reveal>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
