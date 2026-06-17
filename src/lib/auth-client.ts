"use client";

import { convexClient } from "@convex-dev/better-auth/client/plugins";
import type { AuthClient } from "@convex-dev/better-auth/react";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [convexClient()],
});

// @convex-dev/better-auth expects its exported AuthClient union at the provider
// boundary, while better-auth keeps a narrower inferred client type.
export const convexAuthClient = authClient as unknown as AuthClient;
