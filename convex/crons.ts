import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Drain the notificationQueue every minute. Picks up `pending` rows
 * whose `scheduledFor` is due and dispatches them. See
 * convex/actions/notifications.ts for the per-channel logic and
 * env-awareness (TwilioConfigError → skip-without-burning-retries).
 */
crons.interval(
  "process-notification-queue",
  { minutes: 1 },
  internal.actions.notifications.processQueue,
  { batchSize: 20 },
);

export default crons;
