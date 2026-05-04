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
import { services, getService } from "@/data/services";
import { siteConfig } from "@/lib/seo";

type Params = Promise<{ city: string; service: string }>;

export async function generateStaticParams() {
  return cities.flatMap((c) => services.map((s) => ({ city: c.slug, service: s.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;
  const c = getCity(citySlug);
  const s = getService(serviceSlug);
  if (!c || !s) return {};

  const title = `${s.name} in ${c.name} — Pro Limo private chauffeur`;
  const description = `${s.intro.replace(/<[^>]+>|&[^;]+;/g, "")} Available in ${c.name}, ${c.country}.`;
  const url = `${siteConfig.url}/cities/${c.slug}/${s.slug}`;

  return {
    title,
    description,
    alternates: { canonical: `/cities/${c.slug}/${s.slug}` },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(`${s.name} in ${c.name}`)}&eyebrow=${encodeURIComponent(`Pro Limo · ${c.country}`)}&subtitle=${encodeURIComponent(s.tagline)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function CityServicePage({ params }: { params: Params }) {
  const { city: citySlug, service: serviceSlug } = await params;
  const c = getCity(citySlug);
  const s = getService(serviceSlug);
  if (!c || !s) notFound();

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Cities", item: `${siteConfig.url}/cities` },
      { "@type": "ListItem", position: 3, name: c.name, item: `${siteConfig.url}/cities/${c.slug}` },
      { "@type": "ListItem", position: 4, name: s.name, item: `${siteConfig.url}/cities/${c.slug}/${s.slug}` },
    ],
  };

  const serviceLD = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${s.name} in ${c.name}`,
    serviceType: s.name,
    areaServed: { "@type": "City", name: c.name, containedInPlace: { "@type": "Country", name: c.country } },
    provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    description: s.intro.replace(/<[^>]+>|&[^;]+;/g, ""),
  };

  const faqLD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: s.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumbs, serviceLD, faqLD]} />
      <Nav />
      <main>
        <PageHeader
          eyebrow={`${c.name} · ${s.shortName}`}
          title={
            <>
              {s.name}
              <span className="block italic text-[color:var(--color-champagne-bright)]">
                in {c.name}.
              </span>
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

            <Reveal delay={140}>
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

            <Reveal delay={240}>
              <h2 className="display-md mt-16">Other services in {c.name}</h2>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services
                  .filter((o) => o.slug !== s.slug)
                  .map((o) => (
                    <li key={o.slug}>
                      <Link
                        href={`/cities/${c.slug}/${o.slug}`}
                        className="group flex items-baseline justify-between border-b border-[color:var(--color-divider-soft)] py-3 hover:border-[color:var(--color-champagne)] transition-colors"
                      >
                        <span className="font-display text-[1.35rem] text-[color:var(--color-bone)] group-hover:text-[color:var(--color-champagne-bright)] transition-colors">
                          {o.name}
                        </span>
                        <span className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-[color:var(--color-pewter)]">
                          {c.name}
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
                  Reserve · {c.name} · {s.shortName}
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
