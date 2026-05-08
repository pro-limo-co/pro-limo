import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // The Sentry org and project slugs are inferred from SENTRY_ORG / SENTRY_PROJECT env vars
  // set in your deployment environment (Vercel env vars).
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/

  // Silences the Sentry CLI output during build
  silent: !process.env.CI,

  // Upload source maps only from CI to keep local builds fast
  disableSourceMapUpload: !process.env.CI,

  // Route Sentry requests through a Next.js tunnel to avoid ad-blockers
  tunnelRoute: "/monitoring-tunnel",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enable automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
});
