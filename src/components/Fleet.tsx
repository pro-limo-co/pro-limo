import { Reveal } from "./Reveal";

const fleet = [
  {
    tier: "Business",
    examples: "Mercedes-Benz E-Class · BMW 5 Series",
    seats: "3 passengers · 2 large bags",
    blurb:
      "An understated saloon for the working day, refined, brisk, and effortless to step in and out of.",
  },
  {
    tier: "First",
    examples: "Mercedes-Benz S-Class · BMW 7 Series",
    seats: "3 passengers · 3 large bags",
    blurb:
      "A long-wheelbase flagship with executive rear suite, climate-zoned air, and a near-silent ride.",
  },
  {
    tier: "Sprinter",
    examples: "Mercedes-Benz V-Class · Sprinter Premium",
    seats: "Up to 7 passengers · 7 bags",
    blurb:
      "Captain's seats, lounge bench, and a working table, the boardroom that keeps moving.",
  },
  {
    tier: "Electric",
    examples: "Mercedes-Benz EQS · BMW i7 · Lucid Air",
    seats: "3 passengers · 2 large bags",
    blurb:
      "A whisper-quiet flagship EV with massage seating, ambient light, and a 0g cabin.",
  },
];

export function Fleet() {
  return (
    <section id="fleet" className="section relative scroll-mt-24 bg-[color:var(--color-ink-soft)] border-y border-[color:var(--color-divider-soft)] grain overflow-hidden lg:scroll-mt-28">
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-20">
          <div>
            <p className="eyebrow">Chapter III - The Fleet</p>
            <h2 className="display-lg mt-5 max-w-[18ch]">
              Recent models, <span className="italic text-[color:var(--color-champagne-bright)]">never older than three years.</span>
            </h2>
          </div>
          <p className="max-w-md text-[1.025rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
            Every vehicle in our fleet is privately owned by the chauffeur driving it,
            inspected weekly, and presented in pristine condition, interiors detailed
            between every fare.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {fleet.map((v, i) => (
            <Reveal key={v.tier} delay={i * 90} as="li">
              <div className="surface-raised relative rounded-2xl p-8 lg:p-10 overflow-hidden h-full transition-transform duration-700 hover:-translate-y-1">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <span className="font-mono text-[0.7rem] tracking-[0.22em] text-[color:var(--color-champagne)]">
                      Class
                    </span>
                    <h3 className="font-display text-[2.5rem] leading-none mt-2 text-[color:var(--color-bone)]">
                      {v.tier}
                    </h3>
                  </div>
                  <span className="font-mono text-[0.72rem] tracking-[0.2em] text-[color:var(--color-pewter)] mt-2">
                    {String(i + 1).padStart(2, "0")} / 04
                  </span>
                </div>

                <CarShape variant={v.tier} />

                <dl className="mt-6 space-y-2 text-[0.875rem] text-[color:var(--color-bone-dim)]">
                  <Row k="Examples" v={v.examples} />
                  <Row k="Capacity" v={v.seats} />
                </dl>
                <p className="mt-5 text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
                  {v.blurb}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-[color:var(--color-divider-soft)] py-2">
      <dt className="font-mono w-24 shrink-0 text-[0.7rem] tracking-[0.18em] uppercase text-[color:var(--color-pewter)]">
        {k}
      </dt>
      <dd>{v}</dd>
    </div>
  );
}

function CarShape({ variant }: { variant: string }) {
  const isVan = variant === "Sprinter";
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 200"
      className="mt-10 w-full text-[color:var(--color-champagne)]"
      fill="none"
    >
      <defs>
        <linearGradient id={`shadow-${variant}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* shadow */}
      <ellipse cx="300" cy="172" rx="240" ry="6" fill="currentColor" fillOpacity="0.10" />

      {isVan ? (
        <>
          <path
            d="M70 150 V 90 C 70 70 90 60 110 60 H 480 C 510 60 530 80 530 100 V 150"
            stroke="currentColor"
            strokeOpacity="0.85"
            strokeWidth="1.4"
            fill="url(#shadow-Sprinter)"
            fillOpacity="0.08"
          />
          <path d="M70 150 H 530" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
          {/* windows */}
          <path d="M120 70 H 470 V 110 H 120 Z" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.8" />
          <path d="M180 70 V 110 M250 70 V 110 M320 70 V 110 M390 70 V 110" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.6" />
        </>
      ) : (
        <>
          <path
            d="M40 150 C 70 110 130 90 200 86 L 320 80 C 380 78 440 92 480 110 C 510 124 540 138 560 150"
            stroke="currentColor"
            strokeOpacity="0.85"
            strokeWidth="1.4"
            fill={`url(#shadow-${variant})`}
            fillOpacity="0.08"
          />
          <path d="M40 150 H 560" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
          <path
            d="M170 96 C 200 74 280 70 350 78 C 400 84 430 100 460 116"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="0.8"
            fill="none"
          />
          <path d="M260 78 V 92" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.6" />
        </>
      )}

      <circle cx="160" cy="150" r="22" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1" fill="none" />
      <circle cx="160" cy="150" r="9" fill="currentColor" fillOpacity="0.45" />
      <circle cx="440" cy="150" r="22" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1" fill="none" />
      <circle cx="440" cy="150" r="9" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}
