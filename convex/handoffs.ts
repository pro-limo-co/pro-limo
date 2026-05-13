import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { limitDriverHandoffResponse, limitDriverStatusUpdate } from "./lib/rateLimits";
import { requireStaff } from "./lib/staff";

const handoffChannel = v.union(v.literal("email"), v.literal("sms"), v.literal("copy"));
const handoffResponse = v.union(v.literal("accepted"), v.literal("declined"));
const driverRideStatus = v.union(
  v.literal("driver_en_route"),
  v.literal("arrived"),
  v.literal("in_progress"),
  v.literal("completed"),
);
type DriverRideStatus = "driver_en_route" | "arrived" | "in_progress" | "completed";
const requiredPreviousBookingStatus: Record<DriverRideStatus, readonly string[]> = {
  driver_en_route: ["assigned"],
  arrived: ["driver_en_route"],
  in_progress: ["arrived"],
  completed: ["in_progress"],
};

export const create = mutation({
  args: {
    bookingId: v.id("bookings"),
    recipientName: v.string(),
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    channel: handoffChannel,
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const [{ identity, staff }, booking] = await Promise.all([
      requireStaff(ctx, "dispatcher"),
      ctx.db.get(args.bookingId),
    ]);
    if (!booking) throw new Error("Booking not found");
    if (booking.status === "completed") throw new Error("Ride is already completed");
    if (booking.status === "canceled") throw new Error("Ride was canceled");

    const recipientName = args.recipientName.trim();
    if (!recipientName) throw new Error("Recipient name is required");
    if (args.channel === "email" && !args.recipientEmail) {
      throw new Error("Recipient email is required");
    }
    if (args.channel === "sms" && !args.recipientPhone) {
      throw new Error("Recipient phone is required");
    }

    const now = Date.now();
    const handoffId = await ctx.db.insert("rideHandoffs", {
      bookingId: args.bookingId,
      token: "pending",
      recipientName,
      recipientEmail: normalizeOptional(args.recipientEmail),
      recipientPhone: normalizeOptional(args.recipientPhone),
      channel: args.channel,
      status: "sent",
      message: normalizeOptional(args.message),
      createdByTokenIdentifier: identity.tokenIdentifier,
      createdByName: staff.name ?? staff.email,
      createdAt: now,
      updatedAt: now,
    });
    const token = `ride-${handoffId.slice(-12).toLowerCase()}`;

    await Promise.all([
      ctx.db.patch(handoffId, { token, updatedAt: now }),
      ctx.db.insert("bookingEvents", {
        bookingId: args.bookingId,
        kind: "handoff_sent",
        message: `Ride ${booking.publicReference} sent to ${recipientName}.`,
        actorTokenIdentifier: identity.tokenIdentifier,
        actorName: staff.name ?? staff.email,
        createdAt: now,
      }),
    ]);

    return {
      handoffId,
      token,
      routePath: `/rides/${token}`,
      status: "sent" as const,
    };
  },
});

export const getByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const handoff = await ctx.db
      .query("rideHandoffs")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!handoff) return null;

    const booking = await ctx.db.get(handoff.bookingId);
    if (!booking) return null;

    return {
      handoff,
      booking: {
        _id: booking._id,
        publicReference: booking.publicReference,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        bookingMode: booking.bookingMode,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        airportTrip: booking.airportTrip,
        pickupDate: booking.pickupDate,
        pickupTime: booking.pickupTime,
        duration: booking.duration,
        flightNumber: booking.flightNumber,
        passengerCount: booking.passengerCount,
        luggage: booking.luggage,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        notes: booking.notes,
        assignedChauffeurName: booking.assignedChauffeurName,
        vehicleLabel: booking.vehicleLabel,
        dispatchNotes: booking.dispatchNotes,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    };
  },
});

export const listForBooking = query({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, "viewer");
    return await ctx.db
      .query("rideHandoffs")
      .withIndex("by_bookingId_and_createdAt", (q) => q.eq("bookingId", args.bookingId))
      .order("desc")
      .take(20);
  },
});

export const respond = mutation({
  args: {
    token: v.string(),
    response: handoffResponse,
  },
  handler: async (ctx, args) => {
    await limitDriverHandoffResponse(ctx, args.token);

    const handoff = await ctx.db
      .query("rideHandoffs")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!handoff) throw new Error("Ride link not found");

    const booking = await ctx.db.get(handoff.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (handoff.status === "completed") {
      throw new Error("Ride is already completed");
    }

    const now = Date.now();
    const accepted = args.response === "accepted";
    await Promise.all([
      ctx.db.patch(handoff._id, {
        status: accepted ? "accepted" : "declined",
        acceptedAt: accepted ? now : handoff.acceptedAt,
        declinedAt: accepted ? handoff.declinedAt : now,
        updatedAt: now,
      }),
      accepted
        ? ctx.db.patch(handoff.bookingId, {
            status: booking.status === "new" || booking.status === "quoted" ? "assigned" : booking.status,
            assignedChauffeurName: booking.assignedChauffeurName ?? handoff.recipientName,
            updatedAt: now,
          })
        : Promise.resolve(),
      ctx.db.insert("bookingEvents", {
        bookingId: handoff.bookingId,
        kind: accepted ? "handoff_accepted" : "handoff_declined",
        message: `${handoff.recipientName} ${accepted ? "accepted" : "declined"} ride ${booking.publicReference}.`,
        createdAt: now,
      }),
    ]);
  },
});

export const updateRideStatus = mutation({
  args: {
    token: v.string(),
    status: driverRideStatus,
  },
  handler: async (ctx, args) => {
    await limitDriverStatusUpdate(ctx, args.token);

    const handoff = await ctx.db
      .query("rideHandoffs")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!handoff) throw new Error("Ride link not found");
    if (handoff.status === "declined") throw new Error("Ride was declined");
    if (handoff.status === "sent") throw new Error("Accept the ride before updating status");
    if (handoff.status === "completed") throw new Error("Ride is already completed");

    const booking = await ctx.db.get(handoff.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status === "canceled") throw new Error("Ride was canceled");
    if (booking.status === "completed") throw new Error("Ride is already completed");

    const allowedPreviousStatuses = requiredPreviousBookingStatus[args.status];
    if (!allowedPreviousStatuses.includes(booking.status)) {
      throw new Error(
        `Ride must be ${allowedPreviousStatuses.map(formatStatus).join(" or ")} before ${formatStatus(args.status)}`,
      );
    }

    const now = Date.now();
    await Promise.all([
      ctx.db.patch(handoff._id, {
        status: args.status === "completed" ? "completed" : "accepted",
        acceptedAt: handoff.acceptedAt ?? now,
        completedAt: args.status === "completed" ? now : handoff.completedAt,
        updatedAt: now,
      }),
      ctx.db.patch(handoff.bookingId, {
        status: args.status,
        assignedChauffeurName: booking.assignedChauffeurName ?? handoff.recipientName,
        updatedAt: now,
      }),
      ctx.db.insert("bookingEvents", {
        bookingId: handoff.bookingId,
        kind: "driver_status_updated",
        message: `${handoff.recipientName} updated ${booking.publicReference} to ${formatStatus(args.status)}.`,
        createdAt: now,
      }),
    ]);
  },
});

function normalizeOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    arrived: "Arrived",
    completed: "Completed",
    driver_en_route: "Driver on the way",
    in_progress: "Passenger onboard",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}
