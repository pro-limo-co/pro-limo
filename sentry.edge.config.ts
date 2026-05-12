import * as Sentry from "@sentry/nextjs";

const dsn =
  process.env.SENTRY_DSN ??
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  "https://776ebbbf4fdd1310b59bc5905579d3c6@o4511334920683520.ingest.us.sentry.io/4511345599709184";

Sentry.init({
  dsn,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});
