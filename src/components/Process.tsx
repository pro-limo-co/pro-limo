import { Reveal } from "./Reveal";

const steps = [
  {
    no: "I",
    label: "Reserve",
    title: "Three taps, three minutes.",
    body:
      "Pickup, drop-off, time. Professional Limousine Driver confirms a flat fare and assigns a chauffeur - no auctions, no surge pricing.",
  },
  {
    no: "II",
    label: "Track",
    title: "Watch the cabin arrive.",
    body:
      "Live arrival map, chauffeur identity card, and vehicle plate, surfaced in your inbox the moment the car begins its run to you.",
  },
  {
    no: "III",
    label: "Arrive",
    title: "A quiet, by-name welcome.",
    body:
      "Your chauffeur is curbside in advance, in a freshly detailed vehicle, with chilled water at 7°C and your saved cabin preferences live.",
  },
  {
    no: "IV",
    label: "Reconcile",
    title: "An invoice, not a receipt.",
    body:
      "VAT-ready, automatically routed to your business account, and reconciled to your travel platform. Tip already included.",
  },
];

export function Process() {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="section relative scroll-mt-24 bg-[color:var(--color-ink-soft)] border-y border-[color:var(--color-divider-soft)] lg:scroll-mt-28"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14 lg:mb-20">
          <div className="lg:col-span-5">
            <p className="eyebrow">Chapter VI - How it runs</p>
            <h2 id="process-heading" className="display-lg mt-5">
              Four steps,
              <span className="block italic text-[color:var(--color-champagne-bright)]">
                from the curb to the cost center.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
            <p className="text-[1.025rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
              Most chauffeur services hide complexity. Professional Limousine Driver removes it. Every
              step from booking to invoice runs as a single quiet protocol.
            </p>
          </div>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[color:var(--color-divider-soft)] border border-[color:var(--color-divider-soft)] rounded-2xl overflow-hidden">
          {steps.map((s, i) => (
            <Reveal key={s.no} delay={i * 70} as="li">
              <article className="bg-[color:var(--color-ink)] p-8 lg:p-10 h-full flex flex-col gap-5 min-h-[320px]">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-[3rem] leading-none text-[color:var(--color-champagne)]">
                    {s.no}
                  </span>
                  <span className="font-condensed text-[0.7rem] tracking-[0.24em] uppercase text-[color:var(--color-pewter)]">
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <span className="font-condensed text-[0.78rem] tracking-[0.18em] uppercase text-[color:var(--color-bone-dim)]">
                  {s.label}
                </span>
                <h3 className="font-display text-[1.65rem] leading-[1.1] text-[color:var(--color-bone)]">
                  {s.title}
                </h3>
                <p className="text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)] mt-auto">
                  {s.body}
                </p>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
