import { ConvexHttpClient } from "convex/browser";
import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import Stripe from "stripe";

export const runtime = "nodejs";

const checkoutEvents = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
]);

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const syncSecret = process.env.STRIPE_WEBHOOK_SYNC_SECRET;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!stripeSecretKey || !webhookSecret || !syncSecret || !convexUrl) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (!checkoutEvents.has(event.type)) {
    return Response.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const status = toPaymentStatus(event.type, session);
  const bookingId = typeof session.metadata?.bookingId === "string"
    ? (session.metadata.bookingId as Id<"bookings">)
    : null;

  const convex = new ConvexHttpClient(convexUrl);
  await convex.mutation(api.paymentRecords.syncStripeCheckoutSession, {
    syncSecret,
    bookingId,
    providerSessionId: session.id,
    status,
  });

  return Response.json({ received: true });
}

function toPaymentStatus(eventType: string, session: Stripe.Checkout.Session) {
  if (eventType === "checkout.session.async_payment_failed" || eventType === "checkout.session.expired") {
    return "failed" as const;
  }
  if (session.payment_status === "paid") {
    return "paid" as const;
  }
  return "pending" as const;
}

