import { Reveal } from "./Reveal";

const featured = [
  { city: "London", country: "United Kingdom", quartier: "Mayfair · Heathrow · City" },
  { city: "New York", country: "United States", quartier: "Manhattan · JFK · Hamptons" },
  { city: "Paris", country: "France", quartier: "1er · CDG · Versailles" },
  { city: "Tokyo", country: "Japan", quartier: "Ginza · Haneda · Hakone" },
  { city: "Dubai", country: "UAE", quartier: "DIFC · DXB · Abu Dhabi" },
  { city: "Zürich", country: "Switzerland", quartier: "Bahnhofstrasse · ZRH · Davos" },
];

export function Cities() {
  return (
    <section id="cities" className="section relative bg-[color:var(--color-ink-soft)] border-y border-[color:var(--color-divider-soft)]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14 lg:mb-20">
          <div className="lg:col-span-6">
            <p className="eyebrow">Chapter V — Cities</p>
            <h2 className="display-lg mt-5 max-w-[14ch]">
              A local chauffeur, <span className="italic text-[color:var(--color-bone-dim)]">wherever you land.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-6">
            <p className="text-[1.025rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
              Vetted, trained, and locally licensed — every Pro Limo chauffeur lives
              in the city you’re visiting. Their map is older than any algorithm.
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--color-divider-soft)] border border-[color:var(--color-divider-soft)] rounded-2xl overflow-hidden">
          {featured.map((c, i) => (
            <Reveal key={c.city} delay={i * 60} as="li">
              <a
                href={`#${c.city.toLowerCase().replace(/\s/g, "-")}`}
                className="group flex flex-col gap-3 px-7 py-9 bg-[color:var(--color-ink)] hover:bg-[color:var(--color-ink-raised)] transition-colors"
              >
                <span className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
                  {c.country}
                </span>
                <h3 className="font-display text-[2.5rem] leading-none text-[color:var(--color-bone)] group-hover:text-[color:var(--color-champagne-bright)] transition-colors">
                  {c.city}
                </h3>
                <p className="text-[0.9rem] text-[color:var(--color-bone-dim)] mt-1">
                  {c.quartier}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-[color:var(--color-bone-dim)] group-hover:text-[color:var(--color-bone)]">
                  Routes
                  <span className="block h-px w-6 bg-[color:var(--color-champagne)] transition-all duration-500 group-hover:w-12" />
                </span>
              </a>
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 flex items-center justify-between gap-6 flex-wrap">
          <p className="text-[color:var(--color-bone-dim)] text-[0.95rem]">
            Plus 494 more — from Aspen to Seoul, Cape Town to Reykjavík.
          </p>
          <a href="#all-cities" className="btn btn-ghost !h-12">
            View every city
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
