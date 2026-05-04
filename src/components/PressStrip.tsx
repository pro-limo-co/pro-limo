const press = [
  { name: "Robb Report", source: "2026 Travel Awards" },
  { name: "Financial Times", source: "How to Spend It" },
  { name: "Condé Nast Traveler", source: "Gold List" },
  { name: "Monocle", source: "The Forecast" },
  { name: "Bloomberg Pursuits", source: "Best of Class" },
  { name: "Wallpaper*", source: "City Editions" },
];

export function PressStrip() {
  return (
    <section
      aria-label="Press"
      className="relative border-y border-[color:var(--color-divider-soft)] py-10 lg:py-12 bg-[color:var(--color-ink)]"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <p className="metastrip text-center mb-7">As filed in</p>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-6 items-baseline">
          {press.map((p) => (
            <li key={p.name} className="text-center group">
              <p className="font-display text-[1.4rem] lg:text-[1.55rem] leading-none text-[color:var(--color-bone-dim)] group-hover:text-[color:var(--color-bone)] transition-colors">
                {p.name}
              </p>
              <p className="mt-2 font-condensed text-[0.62rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter-dim)]">
                {p.source}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
