import { cities } from "@/data/cities";

const marqueeCities = cities.map((city) => city.name);
const marqueeItems = [
  ...marqueeCities.map((name) => ({ name, loop: "primary" })),
  ...marqueeCities.map((name) => ({ name, loop: "repeat" })),
];

export function Trust() {
  return (
    <section
      aria-label="Current service area"
      className="relative border-y border-[color:var(--color-divider-soft)] bg-[color:var(--color-ink-soft)]/40 py-7 overflow-hidden"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 flex items-center gap-8 lg:gap-12">
        <p className="shrink-0 eyebrow text-[color:var(--color-pewter)]">
          Current service area
        </p>
        <div className="relative flex-1 min-w-0 mask-fade">
          <div className="marquee-track flex items-center gap-12 whitespace-nowrap will-change-transform">
            {marqueeItems.map((item) => (
              <span
                key={`${item.loop}-${item.name}`}
                className="font-display text-[1.65rem] leading-none text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-champagne-bright)] transition-colors"
              >
                {item.name}
                <span className="inline-block mx-6 align-middle size-[6px] rounded-full bg-[color:var(--color-champagne)]/60" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .mask-fade {
          mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
        }
      `}</style>
    </section>
  );
}
