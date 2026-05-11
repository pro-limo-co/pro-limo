import { BookingCard } from "./BookingCard";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative min-h-[100svh] grain spotlight overflow-hidden pt-[100px] lg:pt-[140px]"
    >
      {/* Atmospheric halo */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[800px] flex items-start justify-center" aria-hidden>
        <div className="halo h-[800px] w-[1200px] max-w-[160%] rounded-full blur-[120px] opacity-70"
             style={{
               background:
                 "radial-gradient(50% 50% at 50% 50%, rgba(200,169,106,0.18) 0%, rgba(30,45,38,0.18) 45%, transparent 70%)",
             }} />
      </div>

      {/* Faint horizon line */}
      <div className="pointer-events-none absolute left-0 right-0 top-[58%] h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_oklab,var(--color-bone)_18%,transparent)] to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end pt-10 lg:pt-20 pb-16 lg:pb-24">
          <div className="lg:col-span-7 xl:col-span-7">
            <p className="eyebrow rise rise-1">
              <span className="mr-2 text-[color:var(--color-champagne)]">·</span>
              Chapter I - Professional Limousine Driver
            </p>

            <h1 id="hero-heading" className="display-xl mt-6 rise rise-2">
              Arrive in
              <span className="block italic font-display font-light text-[color:var(--color-champagne)]">composure.</span>
            </h1>

            <p className="mt-8 max-w-xl text-[1.05rem] leading-[1.65] text-[color:var(--color-bone-dim)] rise rise-3">
              A private chauffeur, a quiet vehicle, a flawless arrival.
              Serving Portland and regional routes as far as Seattle, Eugene,
              Astoria, Seaside, and Cannon Beach - for travelers who measure a
              journey by what they did not have to think about.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 rise rise-4">
              <a href="#book" className="btn btn-primary">
                Reserve a chauffeur
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#fleet"
                className="link-gold text-[0.9rem] tracking-wide text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-champagne-bright)] transition-colors"
              >
                See the fleet
              </a>
            </div>

            <dl className="mt-14 grid grid-cols-3 max-w-md rise rise-5 border-t hairline pt-6">
              <Fact value="250mi" label="Service radius" />
              <Fact value="60s" label="Pickup change window" />
              <Fact value="24/7" label="Concierge desk" />
            </dl>
          </div>

          <div className="lg:col-span-5 xl:col-span-5 lg:pt-12 rise rise-6" id="book">
            <BookingCard />
          </div>
        </div>

        {/* Scroll cue */}
        <div className="hidden lg:flex items-center gap-3 absolute bottom-10 left-10 text-[0.72rem] tracking-[0.2em] uppercase text-[color:var(--color-pewter)]">
          <span>Scroll</span>
          <span className="block h-px w-12 bg-gradient-to-r from-[color:var(--color-pewter)] to-transparent" />
        </div>
      </div>

      {/* Decorative car silhouette */}
      <CarSilhouette className="pointer-events-none absolute right-0 -bottom-6 lg:-bottom-10 w-[140%] sm:w-[80%] lg:w-[55%] xl:w-[48%] opacity-[0.18] mix-blend-screen" />
    </section>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-condensed font-light text-[2.4rem] leading-none text-[color:var(--color-bone)] tabular tracking-tight">
        {value}
      </dt>
      <dd className="mt-2 font-condensed text-[0.68rem] tracking-[0.24em] uppercase text-[color:var(--color-pewter)]">
        {label}
      </dd>
    </div>
  );
}

function CarSilhouette({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 1200 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E5C98F" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#E5C98F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M40 230 L160 232 C 200 200 270 160 360 152 L640 138 C 760 132 870 144 950 168 C 1010 186 1060 210 1110 232 L1170 232"
        stroke="url(#carBody)"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M40 240 L1170 240"
        stroke="#C8A96A"
        strokeWidth="0.6"
        strokeOpacity="0.4"
        fill="none"
      />
      <path
        d="M210 232 C 240 196 320 168 410 162 L630 150 C 740 146 830 158 900 178 L 980 232"
        fill="#C8A96A"
        fillOpacity="0.10"
        stroke="#C8A96A"
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />
      <circle cx="280" cy="240" r="22" stroke="#E5C98F" strokeOpacity="0.6" strokeWidth="1" fill="none" />
      <circle cx="280" cy="240" r="9" fill="#C8A96A" fillOpacity="0.4" />
      <circle cx="900" cy="240" r="22" stroke="#E5C98F" strokeOpacity="0.6" strokeWidth="1" fill="none" />
      <circle cx="900" cy="240" r="9" fill="#C8A96A" fillOpacity="0.4" />
    </svg>
  );
}
