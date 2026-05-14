import { Reveal } from "./Reveal";

const services = [
  {
    no: "01",
    title: "Airport transfers",
    sub: "Arrivals and departures.",
    body: "Airport pickup, airport drop-off, live flight tracking for arrivals, and terminal-aware departure timing.",
    href: "/services/airport-transfer",
    icon: PlaneIcon,
  },
  {
    no: "02",
    title: "By the hour",
    sub: "Your day, on retainer.",
    body: "Reserve a chauffeur and vehicle for two hours or twelve. Stops, detours, and changes of plan are part of the package.",
    href: "/services/hourly-chauffeur",
    icon: ClockIcon,
  },
  {
    no: "03",
    title: "City to city",
    sub: "Between cities, done better.",
    body: "Regional private transfers between Portland, Seattle, Eugene, the coast, the valley, and the Gorge.",
    href: "/services/city-to-city",
    icon: RouteIcon,
  },
  {
    no: "04",
    title: "For business",
    sub: "Corporate travel, simplified.",
    body: "Centralized billing, traveler profiles, duty-of-care reporting, and a dedicated account director.",
    href: "/services/for-business",
    icon: BriefcaseIcon,
  },
];

export function Services() {
  return (
    <section id="services" className="section relative">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 lg:mb-24">
          <div className="lg:col-span-5">
            <p className="eyebrow">Chapter II - Services</p>
            <h2 className="display-lg mt-5">
              The way you travel,
              <br />
              <span className="italic text-[color:var(--color-bone-dim)]">considered.</span>
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
            <p className="text-[1.025rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
              Four ways to move with Professional Limousine Driver - each priced as a flat, all-inclusive
              fare with no surge, no traffic surcharge, and no surprise on the receipt.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[color:var(--color-divider-soft)] border border-[color:var(--color-divider-soft)] rounded-2xl overflow-hidden">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.no} delay={i * 80} as="article">
                <a
                  href={s.href}
                  className="group flex flex-col gap-7 p-8 lg:p-12 bg-[color:var(--color-ink)] hover:bg-[color:var(--color-ink-soft)] transition-colors min-h-[340px]"
                >
                  <div className="flex items-start justify-between gap-6">
                    <span className="font-mono text-[0.72rem] tracking-[0.2em] text-[color:var(--color-pewter)]">
                      {s.no} / 04
                    </span>
                    <Icon />
                  </div>

                  <div className="mt-auto">
                    <h3 className="font-display text-[2.25rem] leading-[1.05] text-[color:var(--color-bone)]">
                      {s.title}
                    </h3>
                    <p className="mt-2 font-display italic text-[1.15rem] text-[color:var(--color-champagne-bright)]">
                      {s.sub}
                    </p>
                    <p className="mt-5 max-w-md text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
                      {s.body}
                    </p>

                    <span className="mt-7 inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.16em] text-[color:var(--color-bone)]">
                      Learn more
                      <span className="block h-px w-8 bg-[color:var(--color-champagne)] transition-all duration-500 group-hover:w-14" />
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex size-12 items-center justify-center rounded-full border border-[color:var(--color-divider)] bg-[color:var(--color-ink-soft)] text-[color:var(--color-champagne-bright)] transition-colors group-hover:border-[color:var(--color-champagne)]">
      {children}
    </span>
  );
}

function PlaneIcon() {
  return (
    <IconBase>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 16l9-2 4 7 2-1-2-7 7-2-1-2-7 1L9 3 7 4l3 6L2 12z" />
      </svg>
    </IconBase>
  );
}
function ClockIcon() {
  return (
    <IconBase>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    </IconBase>
  );
}
function RouteIcon() {
  return (
    <IconBase>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="6" cy="5" r="2" />
        <circle cx="18" cy="19" r="2" />
        <path d="M6 7v4a4 4 0 004 4h4a4 4 0 014 4" />
      </svg>
    </IconBase>
  );
}
function BriefcaseIcon() {
  return (
    <IconBase>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" />
      </svg>
    </IconBase>
  );
}
