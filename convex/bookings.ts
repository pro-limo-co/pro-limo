import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireStaff } from "./lib/staff";

const bookingMode = v.union(v.literal("oneway"), v.literal("hourly"), v.literal("airport"));
const bookingStatus = v.union(
  v.literal("new"),
  v.literal("quoted"),
  v.literal("assigned"),
  v.literal("driver_en_route"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("canceled"),
);

const optionalString = v.optional(v.string());

export const create = mutation({
  args: {
    bookingMode,
    sourcePath: optionalString,
    sourceLabel: optionalString,
    citySlug: optionalString,
    serviceSlug: optionalString,
    pickupLocation: v.string(),
    dropoffLocation: optionalString,
    airportTrip: optionalString,
    pickupDate: v.string(),
    pickupTime: v.string(),
    duration: optionalString,
    flightNumber: optionalString,
    passengerCount: v.number(),
    luggage: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    notes: optionalString,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const bookingId = await ctx.db.insert("bookings", {
      ...args,
      publicReference: "pending",
      status: "new",
      paymentStatus: "not_started",
      createdAt: now,
      updatedAt: now,
    });
    const publicReference = `PLD-${bookingId.slice(-8).toUpperCase()}`;

    await ctx.db.patch(bookingId, {
      publicReference,
      updatedAt: now,
    });
    await ctx.db.insert("bookingEvents", {
      bookingId,
      kind: "submitted",
      message: `Booking ${publicReference} submitted by ${args.customerName}.`,
      createdAt: now,
    });

    return {
      bookingId,
      publicReference,
      status: "new" as const,
    };
  },
});

export const getByReference = query({
  args: {
    publicReference: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_publicReference", (q) => q.eq("publicReference", args.publicReference))
      .unique();
  },
});

export const listForDispatch = query({
  args: {
    status: v.optional(bookingStatus),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, "viewer");
    const limit = Math.min(args.limit ?? 80, 120);

    const status = args.status;
    if (status) {
      return await ctx.db
        .query("bookings")
        .withIndex("by_status_and_createdAt", (q) => q.eq("status", status))
        .order("desc")
        .take(limit);
    }

    return await ctx.db.query("bookings").order("desc").take(limit);
  },
});

export const listEvents = query({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, "viewer");
    return await ctx.db
      .query("bookingEvents")
      .withIndex("by_bookingId_and_createdAt", (q) => q.eq("bookingId", args.bookingId))
      .order("desc")
      .take(50);
  },
});

export const updateDispatch = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: bookingStatus,
    quotedAmountCents: v.optional(v.number()),
    assignedChauffeurName: optionalString,
    vehicleLabel: optionalString,
    dispatchNotes: optionalString,
  },
  handler: async (ctx, args) => {
    const [{ identity, staff }, booking] = await Promise.all([
      requireStaff(ctx, "dispatcher"),
      ctx.db.get(args.bookingId),
    ]);
    if (!booking) throw new Error("Booking not found");

    const now = Date.now();
    const patch: Partial<typeof booking> = {
      status: args.status,
      updatedAt: now,
    };

    if (args.quotedAmountCents !== undefined) {
      patch.quotedAmountCents = args.quotedAmountCents;
      patch.currency = "usd";
      patch.paymentStatus =
        booking.paymentStatus === "not_started" || booking.paymentStatus === "quote_required"
          ? "quote_required"
          : booking.paymentStatus;
    }
    if (args.assignedChauffeurName !== undefined) patch.assignedChauffeurName = args.assignedChauffeurName;
    if (args.vehicleLabel !== undefined) patch.vehicleLabel = args.vehicleLabel;
    if (args.dispatchNotes !== undefined) patch.dispatchNotes = args.dispatchNotes;

    await Promise.all([
      ctx.db.patch(args.bookingId, patch),
      ctx.db.insert("bookingEvents", {
        bookingId: args.bookingId,
        kind: args.status === booking.status ? "assignment_updated" : "status_changed",
        message: `Dispatch updated ${booking.publicReference} to ${args.status}.`,
        actorTokenIdentifier: identity.tokenIdentifier,
        actorName: staff.name ?? staff.email,
        createdAt: now,
      }),
    ]);
  },
});

export const addNote = mutation({
  args: {
    bookingId: v.id("bookings"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const [{ identity, staff }, booking] = await Promise.all([
      requireStaff(ctx, "dispatcher"),
      ctx.db.get(args.bookingId),
    ]);
    if (!booking) throw new Error("Booking not found");

    await ctx.db.insert("bookingEvents", {
      bookingId: args.bookingId,
      kind: "note_added",
      message: args.note,
      actorTokenIdentifier: identity.tokenIdentifier,
      actorName: staff.name ?? staff.email,
      createdAt: Date.now(),
    });
  },
});
