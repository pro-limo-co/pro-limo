"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const links = [
  { label: "Services", href: "/#services" },
  { label: "Fleet", href: "/#fleet" },
  { label: "Locations", href: "/service-area" },
  { label: "Business", href: "/business" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "backdrop-blur-md bg-[color:color-mix(in_oklab,var(--color-ink)_82%,transparent)] border-b border-[color:var(--color-divider-soft)]"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      {/* Monocle-style metadata strip */}
      <div className="hidden md:block border-b border-[color:var(--color-divider-soft)]/80">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-7 flex items-center justify-between text-[10px] tracking-[0.28em] uppercase text-[color:var(--color-pewter-dim)] font-condensed">
          <div className="flex items-center gap-5">
            <span className="text-[color:var(--color-champagne)]">★</span>
            <span>Filed under · Private chauffeur</span>
            <span className="hidden lg:inline">Portland-centered service area</span>
            <span className="hidden xl:inline">Issue 01 / 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden lg:inline">PDX · SEA · EUG · Coast · Valley</span>
            <span>Concierge · 24 / 7</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 lg:px-10 h-[68px]">
        <Link href="/#top" aria-label="Professional Limousine Driver home" className="text-[color:var(--color-bone)]">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-9 font-condensed text-[0.78rem] tracking-[0.16em] uppercase">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="link-gold text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-bone)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/sign-in?next=/admin/dispatch"
            className="hidden sm:inline-flex font-condensed text-[0.78rem] tracking-[0.16em] uppercase text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-bone)] transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link href="/#book" className="btn btn-primary !h-10 !px-5 !text-[0.7rem]">
            Reserve
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden ml-1 inline-flex size-10 items-center justify-center rounded-full border border-[color:var(--color-divider)] text-[color:var(--color-bone-dim)]"
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[color:var(--color-divider-soft)] bg-[color:var(--color-ink-soft)]">
          <ul className="flex flex-col px-6 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-condensed tracking-[0.14em] uppercase text-[0.85rem] text-[color:var(--color-bone-dim)] border-b border-[color:var(--color-divider-soft)] last:border-b-0"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/auth/sign-in?next=/admin/dispatch"
                onClick={() => setOpen(false)}
                className="block py-3 font-condensed tracking-[0.14em] uppercase text-[0.85rem] text-[color:var(--color-bone-dim)]"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
