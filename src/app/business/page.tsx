import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pro Limo for Business — Corporate chauffeur service",
  description:
    "Centralize ground transportation for your company. Single dashboard, traveler profiles, duty-of-care reporting, and a dedicated account director.",
  alternates: { canonical: "/business" },
  openGraph: {
    title: "Pro Limo for Business",
    description: "Corporate chauffeur travel, simplified.",
    url: `${siteConfig.url}/business`,
    images: [{ url: `/api/og?title=${encodeURIComponent("For Business")}&subtitle=${encodeURIComponent("Centralized travel · Duty of care · One concierge desk")}`, width: 1200, height: 630 }],
  },
};

const features = [
  {
    title: "Centralized billing",
    body: "One invoice per cycle, one cost center, one reconciled spreadsheet — VAT-compliant in 30+ jurisdictions.",
  },
  {
    title: "Traveler profiles",
    body: "Once-saved chauffeur preferences, climate, music, and dietary notes travel with each employee globally.",
  },
  {
    title: "Duty-of-care reports",
    body: "Live trip status, automatic check-ins, and audit-ready logs for compliance and security teams.",
  },
  {
    title: "Dedicated concierge",
    body: "A real person, named, on a direct line — for every traveler, every booking, every contingency.",
  },
  {
    title: "GDS & travel platforms",
    body: "Integrate with Concur, TravelPerk, Egencia, Amex GBT, and any GDS via the partner API.",
  },
  {
    title: "Roadshow logistics",
    body: "Multi-vehicle, multi-day, multi-city dispatch — with an on-site coordinator for the full duration.",
  },
];

export default function BusinessPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Pro Limo for Business",
          serviceType: "Corporate chauffeur service",
          provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          description: "Centralized chauffeur travel for businesses worldwide.",
          areaServed: "Worldwide",
        }}
      />
      <Nav />
      <main>
        <PageHeader
          eyebrow="For Business"
          title={
            <>
              Corporate travel,
              <span className="block italic text-[color:var(--color-champagne-bright)]">simplified.</span>
            </>
          }
          subtitle="A single dispatch desk for the entire company. Traveler profiles travel globally, invoices land monthly, and duty-of-care is auditable in real time."
        />

        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 pb-20">
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--color-divider-soft)] border border-[color:var(--color-divider-soft)] rounded-2xl overflow-hidden">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 50} as="li">
                <article className="bg-[color:var(--color-ink)] p-8 lg:p-10 h-full flex flex-col gap-4">
                  <span className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--color-champagne)]">
                    {String(i + 1).padStart(2, "0")} / 06
                  </span>
                  <h3 className="font-display text-[1.85rem] leading-tight">{f.title}</h3>
                  <p className="text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
                    {f.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </ol>

          <Reveal>
            <div className="mt-20 surface-raised rounded-3xl p-10 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <p className="eyebrow">Talk to sales</p>
                <h2 className="display-md mt-4 max-w-[18ch]">
                  A single line for every chauffeur,
                  <span className="italic text-[color:var(--color-champagne-bright)]"> in every city.</span>
                </h2>
              </div>
              <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3 lg:justify-end">
                <a href="mailto:business@prolimo.com" className="btn btn-gold">
                  Email business desk
                </a>
                <Link href="/services" className="btn btn-ghost">View all services</Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
