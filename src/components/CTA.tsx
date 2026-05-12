import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section
      id="reserve"
      className="relative section spotlight grain overflow-hidden"
      aria-labelledby="cta-heading"
    >
      <div className="relative z-10 mx-auto max-w-[1100px] px-6 lg:px-10 text-center">
        <Reveal>
          <p className="eyebrow">Réserver</p>
        </Reveal>
        <Reveal delay={120}>
          <h2 id="cta-heading" className="display-xl mt-6">
            Until then,
            <span className="block italic text-[color:var(--color-champagne-bright)]">your driver is waiting.</span>
          </h2>
        </Reveal>
        <Reveal delay={260}>
          <p className="mt-8 mx-auto max-w-xl text-[1.025rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
            Reserve a Professional Limousine Driver chauffeur for Portland,
            Seattle, Eugene, Cannon Beach, Seaside, Astoria, and the most
            requested metro routes.
          </p>
        </Reveal>
        <Reveal delay={360}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#book" className="btn btn-gold">
              Reserve a chauffeur
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#concierge" className="btn btn-ghost">Speak with concierge</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
