import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cities, featuredCitySlugs } from "@/data/cities";
import { Reveal } from "./Reveal";

const featured = featuredCitySlugs.reduce<(typeof cities)[number][]>((acc, slug) => {
  const city = cities.find((item) => item.slug === slug);
  if (city) acc.push(city);
  return acc;
}, []);

export function Cities() {
  return (
    <section id="cities" className="section relative bg-[color:var(--color-ink-soft)] border-y border-[color:var(--color-divider-soft)]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14 lg:mb-20">
          <div className="lg:col-span-6">
            <p className="eyebrow">Chapter V - Locations</p>
            <h2 className="display-lg mt-5 max-w-[14ch]">
              A local chauffeur, <span className="italic text-[color:var(--color-bone-dim)]">where you need one now.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-6">
            <p className="text-[1.025rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
              Current location pages cover the Portland metro, north coast,
              Willamette Valley, Puget Sound, Gorge, and Central Oregon routes
              customers ask for most.
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--color-divider-soft)] border border-[color:var(--color-divider-soft)] rounded-2xl overflow-hidden">
          {featured.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60} as="li">
              <Link
                href={`/cities/${c.slug}`}
                className="group flex flex-col gap-3 px-7 py-9 bg-[color:var(--color-ink)] hover:bg-[color:var(--color-ink-raised)] transition-colors"
              >
                <span className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
                  {c.stateCode} · {c.airports[0]?.code}
                </span>
                <h3 className="font-display text-[2.5rem] leading-none text-[color:var(--color-bone)] group-hover:text-[color:var(--color-champagne-bright)] transition-colors">
                  {c.name}
                </h3>
                <p className="text-[0.9rem] text-[color:var(--color-bone-dim)] mt-1">
                  {c.neighborhoods.slice(0, 3).join(" · ")}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-[color:var(--color-bone-dim)] group-hover:text-[color:var(--color-bone)]">
                  Location page
                  <span className="block h-px w-6 bg-[color:var(--color-champagne)] transition-all duration-500 group-hover:w-12" />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 flex items-center justify-between gap-6 flex-wrap">
          <p className="text-[color:var(--color-bone-dim)] text-[0.95rem]">
            Location pages are built for airport, hourly, intercity, business,
            and event search intent in each city.
          </p>
          <Button asChild variant="outline" size="lg" className="font-condensed text-[0.78rem] uppercase tracking-[0.18em]">
            <Link href="/cities">
              View every location
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
