import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/seo";
import { Logo } from "./Logo";

const copyrightYear = "2026";

const cols = [
  {
    label: "Services",
    items: [
      { label: "Airport transfers", href: "/services/airport-transfer" },
      { label: "By the hour", href: "/services/hourly-chauffeur" },
      { label: "City to city", href: "/services/city-to-city" },
      { label: "Events", href: "/services/events-roadshows" },
      { label: "Business travel", href: "/services/for-business" },
    ],
  },
  {
    label: "For business",
    items: [
      { label: "Business travel", href: "/business" },
      { label: "Travel managers", href: "/business" },
      { label: "Duty of care", href: "/business" },
      { label: "Accounts", href: "/business" },
      { label: "Concierge desk", href: "/#reserve" },
    ],
  },
  {
    label: "Locations",
    items: [
      { label: "Portland", href: "/cities/portland" },
      { label: "Seattle", href: "/cities/seattle" },
      { label: "Eugene", href: "/cities/eugene" },
      { label: "Cannon Beach", href: "/cities/cannon-beach" },
      { label: "Service area", href: "/service-area" },
      { label: "All locations", href: "/cities" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "About", href: "/" },
      { label: "Chauffeurs", href: "/#standards" },
      { label: "Experience", href: "/#experience" },
      { label: "Process", href: "/#process" },
      { label: "Reserve", href: "/#book" },
    ],
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
              Professional Limousine Driver is private chauffeur service for
              travelers and businesses around Portland and the current regional
              service area. Crafted by chauffeurs, for the people they drive.
            </p>

            <form className="mt-10 max-w-sm">
              <Label htmlFor="dispatch-email" className="font-condensed text-[0.72rem] tracking-[0.24em] uppercase text-[color:var(--color-pewter)]">
                The dispatch, quarterly
              </Label>
              <div className="mt-3 flex items-center gap-2 border-b border-[color:var(--color-divider)] focus-within:border-[color:var(--color-champagne)] transition-colors">
                <Input
                  id="dispatch-email"
                  type="email"
                  placeholder="you@yourdomain.com"
                  className="h-11 border-0 bg-transparent px-0 text-[0.95rem] text-[color:var(--color-bone)] shadow-none placeholder:text-[color:var(--color-pewter-dim)] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="button"
                  aria-label="Subscribe to The Dispatch"
                  variant="ghost"
                  size="icon"
                  className="text-[color:var(--color-champagne-bright)] hover:text-[color:var(--color-ink)]"
                >
                  <ArrowRight className="size-[18px]" aria-hidden />
                </Button>
              </div>
              <p className="mt-3 text-[0.72rem] text-[color:var(--color-pewter)]">
                Travel essays and city guides, no marketing.
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
                    <li key={`${c.label}-${it.label}`}>
                      <Link
                        href={it.href}
                        className="text-[0.9rem] text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-bone)] transition-colors link-gold"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 lg:mt-24 pt-8 border-t border-[color:var(--color-divider-soft)] flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-[0.78rem] text-[color:var(--color-pewter)]">
            © {copyrightYear} Professional Limousine Driver. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-6 text-[0.78rem] text-[color:var(--color-bone-dim)]">
            <li><Link href="/legal" className="link-gold">Legal</Link></li>
            <li><Link href="/privacy" className="link-gold">Privacy</Link></li>
            <li><Link href="/terms" className="link-gold">Terms</Link></li>
            <li><Link href="/cookies" className="link-gold">Cookies</Link></li>
            <li className="flex items-center gap-3">
              <Social href={siteConfig.socials.instagram} label="Instagram">
                <span className="text-[0.65rem] font-semibold" aria-hidden>IG</span>
              </Social>
              <Social href={siteConfig.socials.x} label="X">
                <span className="text-xs font-semibold" aria-hidden>X</span>
              </Social>
              <Social href={siteConfig.socials.linkedin} label="LinkedIn">
                <span className="text-[0.65rem] font-semibold" aria-hidden>IN</span>
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
      rel="noreferrer"
      target="_blank"
      className="inline-flex size-9 items-center justify-center rounded-full border border-[color:var(--color-divider)] text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-champagne-bright)] hover:border-[color:var(--color-champagne)] transition-colors"
    >
      {children}
    </a>
  );
}
