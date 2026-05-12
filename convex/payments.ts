"use node";

import Stripe from "stripe";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const createCheckoutSession = action({
  args: {
    bookingId: v.id("bookings"),
    successPath: v.optional(v.string()),
    cancelPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.runQuery(internal.paymentRecords.getBookingForCheckout, {
      bookingId: args.bookingId,
    });
    if (!booking) throw new Error("Booking not found");

    if (!booking.quotedAmountCents || booking.quotedAmountCents <= 0) {
      return {
        status: "quote_required" as const,
        checkoutUrl: null,
      };
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
    if (!secretKey || !siteUrl) {
      await ctx.runMutation(internal.paymentRecords.markCheckoutUnavailable, {
        bookingId: args.bookingId,
        reason: "Stripe checkout is not configured.",
      });
      return {
        status: "configuration_required" as const,
        checkoutUrl: null,
      };
    }

    const stripe = new Stripe(secretKey);
    const successUrl = new URL(args.successPath ?? `/booking/${booking.publicReference}`, siteUrl);
    successUrl.searchParams.set("checkout", "success");
    const cancelUrl = new URL(args.cancelPath ?? `/booking/${booking.publicReference}`, siteUrl);
    cancelUrl.searchParams.set("checkout", "canceled");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: booking.customerEmail,
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      metadata: {
        bookingId: args.bookingId,
        publicReference: booking.publicReference,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: booking.currency ?? "usd",
            unit_amount: booking.quotedAmountCents,
            product_data: {
              name: `Professional Limousine Driver ${booking.publicReference}`,
              description: `${booking.pickupLocation} to ${booking.dropoffLocation ?? booking.duration ?? "reserved chauffeur"}`,
            },
          },
        },
      ],
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    await ctx.runMutation(internal.paymentRecords.recordCheckoutSession, {
      bookingId: args.bookingId,
      providerSessionId: session.id,
      checkoutUrl: session.url,
      amountCents: booking.quotedAmountCents,
      currency: booking.currency ?? "usd",
    });

    return {
      status: "pending" as const,
      checkoutUrl: session.url,
    };
  },
});
