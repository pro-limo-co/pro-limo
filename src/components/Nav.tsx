"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

const links = [
  { label: "Services", href: "/#services" },
  { label: "Fleet", href: "/#fleet" },
  { label: "Locations", href: "/service-area" },
  { label: "Business", href: "/business" },
];

export function Nav({
  minimal = false,
  tone = "dark",
}: {
  minimal?: boolean;
  tone?: "dark" | "light";
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const light = tone === "light";

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
        light
          ? "pld-ui border-b border-border bg-background/95 text-foreground shadow-sm backdrop-blur-md"
          : scrolled
            ? "backdrop-blur-md bg-[color:color-mix(in_oklab,var(--color-ink)_82%,transparent)] border-b border-[color:var(--color-divider-soft)]"
            : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      {/* Monocle-style metadata strip */}
      {!minimal && (
        <div className={["hidden md:block border-b", light ? "border-border" : "border-[color:var(--color-divider-soft)]/80"].join(" ")}>
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
      )}

      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 lg:px-10 h-[68px]">
        <Link href="/#top" aria-label="Professional Limousine Driver home" className="text-[color:var(--color-bone)]">
          <Logo />
        </Link>

        {!minimal && (
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
        )}

        {!minimal && (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/sign-in?next=/admin/dispatch"
              className="hidden px-3 py-2 font-condensed text-[0.78rem] uppercase tracking-[0.16em] text-[color:var(--color-bone-dim)] transition-colors hover:text-[color:var(--color-bone)] sm:inline-flex"
            >
              Sign in
            </Link>
            <Button asChild size="sm" className="font-condensed text-[0.7rem] uppercase tracking-[0.18em]">
              <Link href="/#book">
                Reserve
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setOpen((o) => !o)}
              className="ml-1 text-[color:var(--color-bone-dim)] md:hidden"
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
            </Button>
          </div>
        )}
      </div>

      {!minimal && open && (
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
