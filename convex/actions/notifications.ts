"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";
import { TwilioConfigError, TwilioSendError } from "./twilio";

const DEFAULT_BATCH_SIZE = 20;

/**
 * Cron-driven processor for the notificationQueue. Picks up `pending`
 * rows whose `scheduledFor` is due, dispatches each to its channel's
 * sender, and marks the row sent or failed (with exponential backoff
 * retry baked into SI1's markFailed helper).
 *
 * Env-aware: if Twilio isn't configured, SMS rows fail with a
 * descriptive error and retry per the queue's backoff schedule until
 * they hit max retries — never silently drained. Email is not wired
 * yet (no Resend integration on web); email rows fail with the same
 * pattern.
 */
export const processQueue = internalAction({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? DEFAULT_BATCH_SIZE;
    const pending: Doc<"notificationQueue">[] = await ctx.runQuery(
      internal.notifications.internalListPending,
      { limit: batchSize },
    );

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const notification of pending) {
      try {
        if (notification.channel === "sms") {
          if (!notification.recipientPhone) {
            throw new Error("Missing recipientPhone on SMS notification");
          }
          if (!notification.body) {
            throw new Error("Missing body on SMS notification");
          }
          // oxlint-disable-next-line react-doctor/async-await-in-loop -- Keep provider sends sequential to avoid bursty SMS dispatch.
          await ctx.runAction(internal.actions.twilio.sendSms, {
            to: notification.recipientPhone,
            body: notification.body,
          });
        } else if (notification.channel === "email") {
          throw new Error("Email channel not yet wired (Resend integration pending).");
        } else {
          throw new Error(`Unknown channel: ${notification.channel}`);
        }

        // oxlint-disable-next-line react-doctor/async-await-in-loop -- Marking sent depends on the channel send succeeding.
        await ctx.runMutation(internal.notifications.internalMarkSent, {
          notificationId: notification._id,
        });
        sent += 1;
      } catch (error) {
        if (error instanceof TwilioConfigError) {
          // Don't burn retries when env is missing on purpose — just
          // skip this tick. Next cron run will try again.
          skipped += 1;
          continue;
        }
        const message =
          error instanceof TwilioSendError
            ? `${error.message}${error.code ? ` (code ${error.code})` : ""}`
            : error instanceof Error
              ? error.message
              : "Unknown send error";
        // oxlint-disable-next-line react-doctor/async-await-in-loop -- Retry state depends on each notification's send failure.
        await ctx.runMutation(internal.notifications.internalMarkFailed, {
          notificationId: notification._id,
          error: message,
        });
        failed += 1;
      }
    }

    return { picked: pending.length, sent, failed, skipped };
  },
});
