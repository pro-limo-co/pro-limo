import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { requireStaff } from "./lib/staff";

const notificationChannel = v.union(v.literal("email"), v.literal("sms"));
const optionalString = v.optional(v.string());

const DEFAULT_MAX_RETRIES = 3;

export const internalEnqueue = internalMutation({
  args: {
    bookingId: v.optional(v.id("bookings")),
    channel: notificationChannel,
    type: v.string(),
    recipientEmail: optionalString,
    recipientPhone: optionalString,
    subject: optionalString,
    body: optionalString,
    payload: v.optional(v.any()),
    scheduledFor: v.optional(v.number()),
    maxRetries: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("notificationQueue", {
      bookingId: args.bookingId,
      channel: args.channel,
      type: args.type,
      status: "pending",
      recipientEmail: args.recipientEmail,
      recipientPhone: args.recipientPhone,
      subject: args.subject,
      body: args.body,
      payload: args.payload,
      scheduledFor: args.scheduledFor ?? now,
      retryCount: 0,
      maxRetries: args.maxRetries ?? DEFAULT_MAX_RETRIES,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const internalListPending = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db
      .query("notificationQueue")
      .withIndex("by_status_and_scheduledFor", (q) =>
        q.eq("status", "pending").lte("scheduledFor", now),
      )
      .take(args.limit);
  },
});

export const internalMarkSent = internalMutation({
  args: { notificationId: v.id("notificationQueue") },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.notificationId, {
      status: "sent",
      sentAt: now,
      error: undefined,
      updatedAt: now,
    });
  },
});

export const internalMarkFailed = internalMutation({
  args: {
    notificationId: v.id("notificationQueue"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");

    const now = Date.now();
    const nextRetryCount = notification.retryCount + 1;

    if (nextRetryCount >= notification.maxRetries) {
      await ctx.db.patch(args.notificationId, {
        status: "failed",
        error: args.error,
        retryCount: nextRetryCount,
        updatedAt: now,
      });
      return;
    }

    // Exponential backoff in minutes: 1, 4, 9, 16…
    const backoffMs = nextRetryCount * nextRetryCount * 60 * 1000;
    await ctx.db.patch(args.notificationId, {
      error: args.error,
      retryCount: nextRetryCount,
      scheduledFor: now + backoffMs,
      updatedAt: now,
    });
  },
});

export const internalCancelForBooking = internalMutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query("notificationQueue")
      .withIndex("by_bookingId_and_status", (q) =>
        q.eq("bookingId", args.bookingId).eq("status", "pending"),
      )
      .collect();

    const now = Date.now();
    for (const notification of pending) {
      await ctx.db.patch(notification._id, {
        status: "cancelled",
        updatedAt: now,
      });
    }
    return { cancelledCount: pending.length };
  },
});

export const listByBooking = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await requireStaff(ctx, "viewer");
    return await ctx.db
      .query("notificationQueue")
      .withIndex("by_bookingId", (q) => q.eq("bookingId", args.bookingId))
      .order("desc")
      .take(50);
  },
});
