import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
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
      <Nav />
      <main className="min-h-[100svh] px-6 pt-32 pb-20 lg:px-10">
        <div className="mx-auto max-w-xl">
          <Suspense fallback={<div className="surface-raised rounded-2xl p-8">Loading</div>}>
            <AuthPanel next={next} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
