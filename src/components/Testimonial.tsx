import { Reveal } from "./Reveal";

export function Testimonial() {
  return (
    <section
      aria-labelledby="testimonial-heading"
      className="section relative overflow-hidden bg-[color:var(--color-ink-soft)] grain border-y border-[color:var(--color-divider-soft)]"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full blur-[120px] opacity-40"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(200,169,106,0.32) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 lg:px-10 text-center">
        <Reveal>
          <p className="eyebrow mb-10">Chapter VII — In their words</p>
        </Reveal>
        <Reveal delay={120}>
          <span className="font-display italic text-[5rem] leading-none text-[color:var(--color-champagne)]">
            “
          </span>
        </Reveal>
        <Reveal delay={200}>
          <h2
            id="testimonial-heading"
            className="font-display font-light text-balance text-[clamp(1.65rem,3.4vw,2.85rem)] leading-[1.2] text-[color:var(--color-bone)] -mt-6"
          >
            Of every vendor my team uses on the road, Pro Limo is the one I never
            have to think about. The car is there before I am — and somehow,
            so is exactly the silence I needed.
          </h2>
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-12 flex items-center justify-center gap-4">
            <span className="block h-px w-12 bg-[color:var(--color-champagne)]" />
            <p className="font-mono text-[0.75rem] tracking-[0.22em] uppercase text-[color:var(--color-bone-dim)]">
              Aria Kessler · Chief of Staff, Lévy &amp; Côté
            </p>
            <span className="block h-px w-12 bg-[color:var(--color-champagne)]" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
