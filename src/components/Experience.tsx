import { Reveal } from "./Reveal";

const pillars = [
  {
    no: "I",
    title: "A welcome by name",
    body: "Your chauffeur arrives in advance, in a freshly detailed vehicle, and greets you by name with a softly held door — never a hurried hand on the wheel.",
  },
  {
    no: "II",
    title: "You set the tone",
    body: "Climate, music, conversation — or none. Save your preferences once and they travel with you across cities, fleets, and continents.",
  },
  {
    no: "III",
    title: "Recharge in transit",
    body: "Still water, fresh phone chargers, ambient cabin light, and a quiet that lets the journey itself become the rest.",
  },
];

export function Experience() {
  return (
    <section
      id="experience"
      className="section relative overflow-hidden"
      aria-labelledby="exp-heading"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16 lg:mb-24">
          <div className="lg:col-span-5">
            <p className="eyebrow">Chapter IV — The Experience</p>
            <h2 id="exp-heading" className="display-lg mt-5">
              Step in.
              <span className="block italic text-[color:var(--color-champagne-bright)]">Breathe out.</span>
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
            <p className="text-[1.025rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
              The drive is the rest, the prep, the breath between two important
              moments. Three quiet promises hold every Pro Limo journey to that
              standard.
            </p>
          </div>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--color-divider-soft)] border border-[color:var(--color-divider-soft)] rounded-2xl overflow-hidden">
          {pillars.map((p, i) => (
            <Reveal key={p.no} delay={i * 90} as="li">
              <article className="h-full bg-[color:var(--color-ink)] p-8 lg:p-12 flex flex-col gap-6 min-h-[340px]">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-[3.5rem] leading-none text-[color:var(--color-champagne)]">
                    {p.no}
                  </span>
                  <span className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-[color:var(--color-pewter)]">
                    Promise
                  </span>
                </div>
                <h3 className="font-display text-[1.875rem] leading-[1.1] text-[color:var(--color-bone)]">
                  {p.title}
                </h3>
                <p className="text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
                  {p.body}
                </p>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
