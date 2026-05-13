import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { sanitizeInternalPath } from "@/lib/redirects";

export const metadata: Metadata = {
  title: "Dispatch Sign In",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string | string[] }>;

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const next = sanitizeInternalPath((await searchParams).next);

  return (
    <>
      <Nav tone="light" />
      <main className="pld-ui min-h-[100svh] bg-background px-6 pt-32 pb-20 text-foreground lg:px-10">
        <div className="mx-auto max-w-xl">
          <Suspense fallback={<div className="rounded-lg border bg-card p-8 text-card-foreground">Loading</div>}>
            <AuthPanel next={next} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
