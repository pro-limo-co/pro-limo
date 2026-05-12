import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";

const paymentStatus = v.union(
  v.literal("not_started"),
  v.literal("quote_required"),
  v.literal("pending"),
  v.literal("requires_action"),
  v.literal("paid"),
  v.literal("refunded"),
  v.literal("failed"),
  v.literal("unavailable"),
);

export const getBookingForCheckout = internalQuery({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId);
  },
});

export const markCheckoutUnavailable = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.bookingId, {
      paymentStatus: "unavailable",
      updatedAt: now,
    });
    await ctx.db.insert("bookingEvents", {
      bookingId: args.bookingId,
      kind: "payment_updated",
      message: args.reason,
      createdAt: now,
    });
  },
});

export const recordCheckoutSession = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    providerSessionId: v.string(),
    checkoutUrl: v.string(),
    amountCents: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await Promise.all([
      ctx.db.insert("paymentIntents", {
        bookingId: args.bookingId,
        provider: "stripe",
        providerSessionId: args.providerSessionId,
        status: "pending",
        amountCents: args.amountCents,
        currency: args.currency,
        checkoutUrl: args.checkoutUrl,
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.patch(args.bookingId, {
        stripeCheckoutSessionId: args.providerSessionId,
        paymentStatus: "pending",
        updatedAt: now,
      }),
      ctx.db.insert("bookingEvents", {
        bookingId: args.bookingId,
        kind: "payment_updated",
        message: "Stripe checkout session created.",
        createdAt: now,
      }),
    ]);
  },
});

export const syncStripeCheckoutSession = mutation({
  args: {
    syncSecret: v.string(),
    bookingId: v.union(v.id("bookings"), v.null()),
    providerSessionId: v.string(),
    status: paymentStatus,
  },
  handler: async (ctx, args) => {
    const configuredSecret = process.env.STRIPE_WEBHOOK_SYNC_SECRET;
    if (!configuredSecret || args.syncSecret !== configuredSecret) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    const intent = await ctx.db
      .query("paymentIntents")
      .withIndex("by_providerSessionId", (q) => q.eq("providerSessionId", args.providerSessionId))
      .unique();

    const bookingId = intent?.bookingId ?? args.bookingId;
    if (!bookingId) return;

    if (intent) {
      await ctx.db.patch(intent._id, {
        status: args.status,
        updatedAt: now,
      });
    }

    await ctx.db.patch(bookingId, {
      paymentStatus: args.status,
      updatedAt: now,
    });
    await ctx.db.insert("bookingEvents", {
      bookingId,
      kind: "payment_updated",
      message: `Stripe checkout session ${args.providerSessionId} synced as ${args.status}.`,
      createdAt: now,
    });
  },
});
