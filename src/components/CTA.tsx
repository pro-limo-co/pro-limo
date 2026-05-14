import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/seo";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section
      id="reserve"
      className="relative section scroll-mt-24 spotlight grain overflow-hidden lg:scroll-mt-28"
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
            <Button asChild size="lg" className="font-condensed text-[0.78rem] uppercase tracking-[0.18em]">
              <a href="#book">
                Reserve a chauffeur
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-condensed text-[0.78rem] uppercase tracking-[0.18em]">
              <a href={`mailto:${siteConfig.contact.email}`}>Speak with concierge</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
