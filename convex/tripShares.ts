import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { requireStaff } from "./lib/staff";
import { formatStatus } from "./lib/statusMachine";

const DEFAULT_SHARE_TTL_DAYS = 14;

/**
 * Generate a 24-character base36 share token using Web Crypto. Lifted
 * from the mobile reference; works in the Convex V8 runtime.
 */
function generateShareToken(): string {
  const array = new Uint8Array(18);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 24);
}

export const create = mutation({
  args: {
    bookingId: v.id("bookings"),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const [{ identity, staff }, booking] = await Promise.all([
      requireStaff(ctx, "dispatcher"),
      ctx.db.get(args.bookingId),
    ]);
    if (!booking) throw new Error("Booking not found");

    const now = Date.now();
    const ttlMs =
      Math.max(1, args.expiresInDays ?? DEFAULT_SHARE_TTL_DAYS) * 24 * 60 * 60 * 1000;
    const shareToken = generateShareToken();
    const actorName = staff.name ?? staff.email;

    const shareId = await ctx.db.insert("tripShares", {
      bookingId: args.bookingId,
      shareToken,
      createdByTokenIdentifier: identity.tokenIdentifier,
      createdByName: actorName,
      expiresAt: now + ttlMs,
      isActive: true,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    await logAudit(ctx, {
      actor: {
        tokenIdentifier: identity.tokenIdentifier,
        name: actorName,
      },
      action: "tripShares.create",
      entityType: "tripShares",
      entityId: shareId,
      newValues: { bookingId: args.bookingId, expiresAt: now + ttlMs },
    });

    return {
      shareId,
      shareToken,
      expiresAt: now + ttlMs,
    };
  },
});

export const listForBooking = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await requireStaff(ctx, "viewer");
    return await ctx.db
      .query("tripShares")
      .withIndex("by_bookingId", (q) => q.eq("bookingId", args.bookingId))
      .order("desc")
      .take(20);
  },
});

/**
 * Public read by token. No auth required — this is what /share/[token]
 * uses to render a sanitized snapshot of the trip. Returns a typed
 * error variant when the share is missing, expired, or deactivated so
 * the page can render the right empty state.
 */
export const getByToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("tripShares")
      .withIndex("by_shareToken", (q) => q.eq("shareToken", args.shareToken))
      .unique();

    if (!share) return { error: "not_found" as const };
    if (!share.isActive) return { error: "deactivated" as const };
    if (share.expiresAt < Date.now()) return { error: "expired" as const };

    const booking = await ctx.db.get(share.bookingId);
    if (!booking) return { error: "not_found" as const };

    // Sanitized projection — omit customerEmail/Phone, dispatcher notes,
    // payment internals. Show what a recipient needs to know: where /
    // when / who's driving / current state.
    return {
      share: {
        viewCount: share.viewCount,
        expiresAt: share.expiresAt,
      },
      booking: {
        publicReference: booking.publicReference,
        bookingMode: booking.bookingMode,
        status: booking.status,
        statusLabel: formatStatus(booking.status),
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        airportTrip: booking.airportTrip,
        pickupDate: booking.pickupDate,
        pickupTime: booking.pickupTime,
        duration: booking.duration,
        flightNumber: booking.flightNumber,
        passengerCount: booking.passengerCount,
        assignedChauffeurName: booking.assignedChauffeurName,
        vehicleLabel: booking.vehicleLabel,
        customerName: booking.customerName,
        updatedAt: booking.updatedAt,
      },
    };
  },
});

/**
 * Bump view counter. Separate mutation so reads stay pure queries
 * (Convex query handlers can't mutate). Called from the public share
 * page on render.
 */
export const recordView = mutation({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("tripShares")
      .withIndex("by_shareToken", (q) => q.eq("shareToken", args.shareToken))
      .unique();

    if (!share || !share.isActive || share.expiresAt < Date.now()) return;

    const now = Date.now();
    await ctx.db.patch(share._id, {
      viewCount: share.viewCount + 1,
      lastViewedAt: now,
      updatedAt: now,
    });
  },
});

export const deactivate = mutation({
  args: { shareId: v.id("tripShares") },
  handler: async (ctx, args) => {
    const [{ identity, staff }, share] = await Promise.all([
      requireStaff(ctx, "dispatcher"),
      ctx.db.get(args.shareId),
    ]);
    if (!share) throw new Error("Share not found");
    if (!share.isActive) return;

    const now = Date.now();
    await ctx.db.patch(args.shareId, { isActive: false, updatedAt: now });
    await logAudit(ctx, {
      actor: {
        tokenIdentifier: identity.tokenIdentifier,
        name: staff.name ?? staff.email,
      },
      action: "tripShares.deactivate",
      entityType: "tripShares",
      entityId: args.shareId,
    });
  },
});
