const cities = [
  "London", "New York", "Paris", "Tokyo", "Dubai", "Hong Kong",
  "Singapore", "Zürich", "Milan", "Geneva", "Frankfurt", "Sydney",
  "Los Angeles", "São Paulo", "Vienna", "Madrid", "Doha", "Riyadh",
];

export function Trust() {
  return (
    <section
      aria-label="In service worldwide"
      className="relative border-y border-[color:var(--color-divider-soft)] bg-[color:var(--color-ink-soft)]/40 py-7 overflow-hidden"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 flex items-center gap-8 lg:gap-12">
        <p className="shrink-0 eyebrow text-[color:var(--color-pewter)]">
          In service · 500+ cities
        </p>
        <div className="relative flex-1 min-w-0 mask-fade">
          <div className="marquee-track flex items-center gap-12 whitespace-nowrap will-change-transform">
            {[...cities, ...cities].map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="font-display text-[1.65rem] leading-none text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-champagne-bright)] transition-colors"
              >
                {c}
                <span className="inline-block mx-6 align-middle h-[6px] w-[6px] rounded-full bg-[color:var(--color-champagne)]/60" />
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
