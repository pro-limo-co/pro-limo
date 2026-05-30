import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  },
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const configuredOrigins = [
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
  ].filter((origin): origin is string => Boolean(origin));

  // Dev-only convenience: when this deployment is configured for localhost
  // (i.e. SITE_URL points at localhost), the Next dev server's port often
  // drifts (3000 taken -> autoport), which otherwise trips Better Auth's
  // "Invalid origin" check. Trust any localhost port in that case ONLY.
  // In production SITE_URL is a real domain, so this wildcard is never added
  // and origins stay strict.
  const isLocalDeployment = configuredOrigins.some((origin) =>
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin),
  );
  const devOrigins = isLocalDeployment
    ? ["http://localhost:*", "http://127.0.0.1:*"]
    : [];

  const trustedOrigins = [...configuredOrigins, ...devOrigins];

  return {
    appName: "Professional Limousine Driver",
    baseURL: process.env.SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [convex({ authConfig })],
  } satisfies BetterAuthOptions;
};

export const options = createAuthOptions({} as GenericCtx<DataModel>);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
