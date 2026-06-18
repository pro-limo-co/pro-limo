"use client";

import { LogOut, RadioTower } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { type StaffNavKey, staffRouteItems } from "@/components/admin/staffRoutes";
import { useStaffRoutePrefetch } from "@/components/admin/useStaffRoutePrefetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type StaffMetric = {
  label: string;
  value: string;
  detail?: string;
};

type StaffOpsShellProps = {
  actions?: ReactNode;
  children?: ReactNode;
  current: StaffNavKey;
  description?: string;
  eyebrow?: string;
  showSignOut?: boolean;
  stats?: StaffMetric[];
  title: string;
};

const EMPTY_STAFF_METRICS: StaffMetric[] = [];

export function StaffOpsShell({
  actions,
  children,
  current,
  description,
  eyebrow = "Staff operations",
  showSignOut = false,
  stats = EMPTY_STAFF_METRICS,
  title,
}: StaffOpsShellProps) {
  useStaffRoutePrefetch();

  return (
    <section className="pld-ui flex min-h-[100svh] flex-col overflow-x-clip bg-[#050505] text-white">
      <header className="relative z-10 flex min-h-20 items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-xl font-black text-black">
            PL
          </span>
          <span className="hidden text-sm font-semibold text-white sm:block">
            Professional Limousine Driver
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm text-white/70 md:flex">
          {staffRouteItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 transition",
                current === item.key ? "bg-white text-black" : "hover:bg-white hover:text-black",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {showSignOut ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-white/15 bg-transparent text-white hover:border-white hover:bg-white hover:text-black"
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/";
              }}
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="hidden rounded-full border-white/15 bg-transparent text-white hover:border-white hover:bg-white hover:text-black sm:inline-flex"
            >
              <Link href="/">Public site</Link>
            </Button>
          )}
        </div>
      </header>

      <nav className="no-scrollbar relative z-10 mx-5 flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm text-white/70 sm:mx-8 md:hidden">
        {staffRouteItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 transition",
              current === item.key ? "bg-white text-black" : "hover:bg-white hover:text-black",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="relative z-10 px-5 pb-10 pt-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <Badge
                variant="outline"
                className="mb-5 gap-2 rounded-full border-white/10 bg-white/[0.06] px-4 py-2 text-xs uppercase text-white/70"
              >
                <RadioTower className="size-4" aria-hidden />
                {eyebrow}
              </Badge>
              <h1 className="max-w-5xl text-5xl font-semibold leading-[0.94] text-white sm:text-7xl sm:leading-[0.9]">
                {title}
              </h1>
              {description ? (
                <p className="mt-5 max-w-3xl text-lg leading-8 text-white/64">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
          </div>

          {stats.length > 0 ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <StaffMetricCard key={stat.label} {...stat} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 bg-[#f5f4f0] px-5 py-6 text-black sm:px-8 lg:px-12 lg:py-8">
        <div className="mx-auto max-w-[1500px]">{children}</div>
      </div>
    </section>
  );
}

function StaffMetricCard({ detail, label, value }: StaffMetric) {
  return (
    <div className="min-w-0 rounded-[24px] border border-white/10 bg-white/[0.06] p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <p className="text-xs font-black uppercase text-white/46">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      {detail ? <p className="mt-1 text-sm leading-5 text-white/54">{detail}</p> : null}
    </div>
  );
}

export function StaffPanelStat({ label, value }: Pick<StaffMetric, "label" | "value">) {
  return (
    <div className="rounded-[22px] border border-black/10 bg-white p-5 shadow-none">
      <p className="text-xs font-black uppercase text-black/42">{label}</p>
      <p className="mt-2 text-2xl font-black text-black">{value}</p>
    </div>
  );
}
