import type { Metadata } from "next";

type SearchParams = Promise<{ throw?: string | string[] }>;

export const metadata: Metadata = {
  title: "Sentry Test",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SentryTestPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const value = (await searchParams).throw;
  const shouldThrow = Array.isArray(value)
    ? value.includes("server-component")
    : value === "server-component";

  if (shouldThrow) {
    throw new Error("PRO-5 Sentry server component test");
  }

  return (
    <main className="min-h-[100svh] px-6 py-24 text-[color:var(--color-bone)]">
      <p className="font-mono text-sm">Sentry server component test route ready.</p>
    </main>
  );
}

