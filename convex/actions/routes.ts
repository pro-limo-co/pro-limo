"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";

const ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

export class RoutesConfigError extends Error {
  constructor() {
    super("Google Routes is not configured (GOOGLE_ROUTES_API_KEY).");
    this.name = "RoutesConfigError";
  }
}

export class RoutesApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "RoutesApiError";
  }
}

const latLngArgs = v.object({
  lat: v.number(),
  lng: v.number(),
});

/**
 * Compute driving distance + duration between two coordinates via the
 * Google Routes API v2. Returns meters + seconds; caller converts to
 * miles / minutes for display. Field-masked so we only fetch what we
 * use (cheaper per request).
 *
 * Env: GOOGLE_ROUTES_API_KEY (server-side; no domain restriction).
 * Throws RoutesConfigError when env is missing — callers (cron-style
 * computation, on-demand recompute) decide whether to skip or surface.
 */
export const computeRoute = internalAction({
  args: {
    origin: latLngArgs,
    destination: latLngArgs,
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.GOOGLE_ROUTES_API_KEY?.trim();
    if (!apiKey) throw new RoutesConfigError();

    const body = {
      origin: {
        location: {
          latLng: { latitude: args.origin.lat, longitude: args.origin.lng },
        },
      },
      destination: {
        location: {
          latLng: { latitude: args.destination.lat, longitude: args.destination.lng },
        },
      },
      travelMode: "DRIVE" as const,
      routingPreference: "TRAFFIC_AWARE" as const,
    };

    const response = await fetch(ROUTES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let message = `Routes API request failed (${response.status})`;
      try {
        const errorBody = (await response.json()) as { error?: { message?: string } };
        if (errorBody.error?.message) message = errorBody.error.message;
      } catch {
        // body wasn't json
      }
      throw new RoutesApiError(message, response.status);
    }

    const payload = (await response.json()) as {
      routes?: Array<{ distanceMeters?: number; duration?: string }>;
    };
    const route = payload.routes?.[0];
    if (!route || typeof route.distanceMeters !== "number" || !route.duration) {
      throw new RoutesApiError("Routes API returned no usable route");
    }

    // duration is a Protobuf Duration string like "1234s".
    const durationSeconds = Number.parseInt(route.duration.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(durationSeconds)) {
      throw new RoutesApiError(`Unparseable duration: ${route.duration}`);
    }

    return {
      distanceMeters: route.distanceMeters,
      durationSeconds,
    };
  },
});

/**
 * Booking-scoped orchestrator. Reads the booking, calls computeRoute
 * if both lat/lng pairs are present, patches the row with the result.
 * Designed to be scheduled by bookings.create via ctx.scheduler so
 * the mutation stays fast and the network call doesn't block the
 * client response.
 *
 * Env-aware: silently skips when GOOGLE_ROUTES_API_KEY is unset.
 * Other failures are logged (Convex captures action logs) but don't
 * surface to the customer — distance is a quoting hint, not a
 * blocking field.
 */
export const computeForBooking = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking: Doc<"bookings"> | null = await ctx.runQuery(
      internal.bookings.internalGetBooking,
      { bookingId: args.bookingId },
    );
    if (!booking) return { skipped: "missing-booking" as const };

    const origin = booking.pickupLocationDetails;
    const destination = booking.dropoffLocationDetails;
    if (!origin || !destination) {
      return { skipped: "missing-coords" as const };
    }

    let result: { distanceMeters: number; durationSeconds: number };
    try {
      result = await ctx.runAction(internal.actions.routes.computeRoute, {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
      });
    } catch (error) {
      if (error instanceof RoutesConfigError) {
        return { skipped: "no-env" as const };
      }
      throw error;
    }

    await ctx.runMutation(internal.bookings.internalSetRoute, {
      bookingId: args.bookingId as Id<"bookings">,
      distanceMeters: result.distanceMeters,
      durationSeconds: result.durationSeconds,
    });

    return { ok: true as const, ...result };
  },
});
