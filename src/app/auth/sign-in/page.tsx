import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { sanitizeInternalPath } from "@/lib/redirects";

export const metadata: Metadata = {
  title: "Staff Sign In",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string | string[] }>;

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const next = sanitizeInternalPath((await searchParams).next);

  return (
    <main className="min-h-[100svh] bg-[#050505] text-white">
      <Suspense fallback={<AuthLoading />}>
        <AuthPanel next={next} />
      </Suspense>
    </main>
  );
}

function AuthLoading() {
  return (
    <div className="grid min-h-[100svh] place-items-center px-6">
      <div className="h-40 w-full max-w-md rounded-[28px] border border-white/10 bg-white/5" />
    </div>
  );
}
