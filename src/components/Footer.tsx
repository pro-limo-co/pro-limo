import { Logo } from "./Logo";

const cols = [
  {
    label: "Services",
    items: ["Airport transfers", "By the hour", "City to city", "Events", "Roadshows"],
  },
  {
    label: "For business",
    items: ["Pro Limo for Business", "Travel managers", "Duty of care", "API & integrations", "Concierge desk"],
  },
  {
    label: "Cities",
    items: ["London", "New York", "Paris", "Tokyo", "Dubai", "All cities"],
  },
  {
    label: "Company",
    items: ["About", "Chauffeurs", "Sustainability", "Press", "Careers"],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-[color:var(--color-ink-soft)] border-t border-[color:var(--color-divider-soft)] grain">
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-6 max-w-sm text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
              Pro Limo is private chauffeur service for travelers and businesses
              in 500+ cities. Crafted by chauffeurs, for the people they drive.
            </p>

            <form className="mt-10 max-w-sm">
              <label className="font-condensed text-[0.72rem] tracking-[0.24em] uppercase text-[color:var(--color-pewter)]">
                The dispatch — quarterly
              </label>
              <div className="mt-3 flex items-center gap-2 border-b border-[color:var(--color-divider)] focus-within:border-[color:var(--color-champagne)] transition-colors">
                <input
                  type="email"
                  placeholder="you@yourdomain.com"
                  className="field h-11 bg-transparent text-[0.95rem]"
                />
                <button type="submit" className="text-[color:var(--color-champagne-bright)] hover:text-[color:var(--color-champagne)] transition-colors p-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p className="mt-3 text-[0.72rem] text-[color:var(--color-pewter)]">
                Travel essays and city guides — no marketing.
              </p>
            </form>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-10">
            {cols.map((c) => (
              <div key={c.label}>
                <h4 className="font-condensed text-[0.72rem] tracking-[0.24em] uppercase text-[color:var(--color-pewter)]">
                  {c.label}
                </h4>
                <ul className="mt-5 space-y-3">
                  {c.items.map((it) => (
                    <li key={it}>
                      <a
                        href={`#${it.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-[0.9rem] text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-bone)] transition-colors link-gold"
                      >
                        {it}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 lg:mt-24 pt-8 border-t border-[color:var(--color-divider-soft)] flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-[0.78rem] text-[color:var(--color-pewter)]">
            © {new Date().getFullYear()} Pro Limo. A Corvus Inc. service. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-6 text-[0.78rem] text-[color:var(--color-bone-dim)]">
            <li><a href="#legal" className="link-gold">Legal</a></li>
            <li><a href="#privacy" className="link-gold">Privacy</a></li>
            <li><a href="#terms" className="link-gold">Terms</a></li>
            <li><a href="#cookies" className="link-gold">Cookies</a></li>
            <li className="flex items-center gap-3">
              <Social href="#instagram" label="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
                </svg>
              </Social>
              <Social href="#x" label="X">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18 3h3l-7.5 8.6L22 21h-6.6l-5.2-6.3L4.4 21H1.4l8-9.2L1 3h6.7l4.7 5.7L18 3zm-2.4 16h1.7L7.2 5H5.4L15.6 19z" />
                </svg>
              </Social>
              <Social href="#linkedin" label="LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4 4a2 2 0 110 4 2 2 0 010-4zm-1 6h2v10H3V10zm5 0h2v1.5h.05c.3-.55 1.1-1.5 2.55-1.5 2.7 0 3.4 1.7 3.4 4V20h-2v-4.6c0-1.1-.05-2.5-1.55-2.5s-1.8 1.2-1.8 2.45V20H8V10z" />
                </svg>
              </Social>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-divider)] text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-champagne-bright)] hover:border-[color:var(--color-champagne)] transition-colors"
    >
      {children}
    </a>
  );
}
