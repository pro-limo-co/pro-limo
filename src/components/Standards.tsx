import { Reveal } from "./Reveal";

const standards = [
  {
    no: "01",
    label: "Chauffeur",
    title: "Five interviews, one hire.",
    body:
      "Every chauffeur is screened across five conversations, references, defensive-driving certification, and a discretion test before they ever take a fare.",
  },
  {
    no: "02",
    label: "Vehicle",
    title: "Younger than your watch.",
    body:
      "No vehicle in the Professional Limousine Driver fleet is older than 36 months. Each is detailed weekly, audited monthly, and quietly retired before its third birthday.",
  },
  {
    no: "03",
    label: "Privacy",
    title: "What stays in the car.",
    body:
      "Cabins are camera-free, conversations are confidential, and chauffeur agreements forbid disclosure — by name, by face, by route.",
  },
  {
    no: "04",
    label: "Sustainability",
    title: "Carbon-neutral, by design.",
    body:
      "Every fare is offset by Gold Standard certified projects, with full electric available in 60+ cities — at the same flat fare.",
  },
];

export function Standards() {
  return (
    <section id="standards" className="section relative" aria-label="Our standards">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14 lg:mb-20">
          <div className="lg:col-span-5">
            <p className="eyebrow">Chapter VI — Standards</p>
            <h2 className="display-lg mt-5">
              Expect <span className="italic text-[color:var(--color-champagne-bright)]">excellence.</span>
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
            <p className="text-[1.025rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
              Four standards run the length of every Professional Limousine Driver journey, from the
              quiet of the cabin to the kilowatt-hour of the engine that moved it.
            </p>
          </div>
        </div>

        <ol className="divide-y divide-[color:var(--color-divider-soft)] border-y border-[color:var(--color-divider-soft)]">
          {standards.map((s, i) => (
            <Reveal key={s.no} delay={i * 70} as="li">
              <article className="grid grid-cols-12 gap-6 lg:gap-10 py-10 lg:py-14 group">
                <div className="col-span-2 lg:col-span-1">
                  <span className="font-mono text-[0.72rem] tracking-[0.22em] text-[color:var(--color-champagne)]">
                    {s.no}
                  </span>
                </div>
                <div className="col-span-10 lg:col-span-3">
                  <span className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[color:var(--color-pewter)]">
                    {s.label}
                  </span>
                </div>
                <div className="col-span-12 lg:col-span-8">
                  <h3 className="font-display text-[2rem] lg:text-[2.6rem] leading-[1.05] text-[color:var(--color-bone)] max-w-[24ch]">
                    {s.title}
                  </h3>
                  <p className="mt-5 max-w-2xl text-[0.975rem] leading-[1.75] text-[color:var(--color-bone-dim)]">
                    {s.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
