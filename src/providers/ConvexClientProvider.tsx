"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { convexAuthClient } from "@/lib/auth-client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is required.");
}

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: ReactNode;
  initialToken?: string | null;
}) {
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={convexAuthClient}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}
