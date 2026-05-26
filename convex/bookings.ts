import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { limitBookingSubmission } from "./lib/rateLimits";
import { requireStaff } from "./lib/staff";
import { locationValidator } from "./lib/validators";

const bookingMode = v.union(v.literal("oneway"), v.literal("hourly"), v.literal("airport"));
const bookingStatus = v.union(
  v.literal("new"),
  v.literal("quoted"),
  v.literal("assigned"),
  v.literal("driver_en_route"),
  v.literal("arrived"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("canceled"),
);

const activeBookingStatuses = [
  "new",
  "quoted",
  "assigned",
  "driver_en_route",
  "arrived",
  "in_progress",
] as const;

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
    pickupLocationDetails: v.optional(locationValidator),
    dropoffLocationDetails: v.optional(locationValidator),
    airportTrip: optionalString,
    pickupDate: v.string(),
    pickupTime: v.string(),
    duration: optionalString,
    flightNumber: optionalString,
    passengerCount: v.number(),
    luggage: v.string(),
    requestedVehicleLabel: optionalString,
    paymentPreference: optionalString,
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    notes: optionalString,
    idempotencyKey: optionalString,
  },
  handler: async (ctx, args) => {
    const { idempotencyKey, ...bookingArgs } = args;

    if (idempotencyKey) {
      const existingKey = await ctx.db
        .query("idempotencyKeys")
        .withIndex("by_key", (q) => q.eq("key", idempotencyKey))
        .unique();
      if (existingKey) {
        const existingBooking = await ctx.db.get(existingKey.resourceId as Id<"bookings">);
        if (existingBooking) {
          return {
            bookingId: existingBooking._id,
            publicReference: existingBooking.publicReference,
            status: existingBooking.status,
            replayed: true as const,
          };
        }
      }
    }

    await limitBookingSubmission(ctx, {
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
    });

    const now = Date.now();
    const bookingId = await ctx.db.insert("bookings", {
      ...bookingArgs,
      publicReference: "pending",
      status: "new",
      paymentStatus: "not_started",
      createdAt: now,
      updatedAt: now,
    });
    const publicReference = `PLD-${bookingId.slice(-8).toUpperCase()}`;

    const sideEffects: Promise<unknown>[] = [
      ctx.db.patch(bookingId, {
        publicReference,
        updatedAt: now,
      }),
      ctx.db.insert("bookingEvents", {
        bookingId,
        kind: "submitted",
        message: `Booking ${publicReference} submitted by ${args.customerName}.`,
        createdAt: now,
      }),
      upsertCustomerProfile(ctx, args, now),
    ];
    if (idempotencyKey) {
      sideEffects.push(
        ctx.db.insert("idempotencyKeys", {
          key: idempotencyKey,
          resourceType: "booking",
          resourceId: bookingId,
          createdAt: now,
        }),
      );
    }
    await Promise.all(sideEffects);

    return {
      bookingId,
      publicReference,
      status: "new" as const,
      replayed: false as const,
    };
  },
});

export const getByReference = query({
  args: {
    publicReference: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_publicReference", (q) => q.eq("publicReference", args.publicReference))
      .unique();

    if (!booking) return null;

    return {
      publicReference: booking.publicReference,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      bookingMode: booking.bookingMode,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      pickupLocationDetails: booking.pickupLocationDetails,
      dropoffLocationDetails: booking.dropoffLocationDetails,
      airportTrip: booking.airportTrip,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      duration: booking.duration,
      flightNumber: booking.flightNumber,
      passengerCount: booking.passengerCount,
      luggage: booking.luggage,
      requestedVehicleLabel: booking.requestedVehicleLabel,
      paymentPreference: booking.paymentPreference,
      customerName: booking.customerName,
      assignedChauffeurName: booking.assignedChauffeurName,
      vehicleLabel: booking.vehicleLabel,
      updatedAt: booking.updatedAt,
    };
  },
});

export const listForDispatch = query({
  args: {
    status: v.optional(bookingStatus),
    statusGroup: v.optional(v.literal("active")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, "viewer");
    const limit = Math.min(args.limit ?? 80, 120);

    const status = args.status;
    let bookings;
    if (status) {
      bookings = await ctx.db
        .query("bookings")
        .withIndex("by_status_and_createdAt", (q) => q.eq("status", status))
        .order("desc")
        .take(limit);
    } else if (args.statusGroup === "active") {
      const perStatusLimit = Math.max(8, Math.ceil(limit / activeBookingStatuses.length));
      const groups = await Promise.all(
        activeBookingStatuses.map((activeStatus) =>
          ctx.db
            .query("bookings")
            .withIndex("by_status_and_createdAt", (q) => q.eq("status", activeStatus))
            .order("desc")
            .take(perStatusLimit),
        ),
      );
      bookings = groups
        .flat()
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    } else {
      bookings = await ctx.db.query("bookings").order("desc").take(limit);
    }

    return await Promise.all(
      bookings.map(async (booking) => {
        const latestHandoff =
          booking.latestHandoffToken && booking.latestHandoffStatus && booking.latestHandoffRecipientName
            ? {
                recipientName: booking.latestHandoffRecipientName,
                status: booking.latestHandoffStatus,
                token: booking.latestHandoffToken,
                updatedAt: booking.latestHandoffUpdatedAt ?? booking.updatedAt,
              }
            : await ctx.db
                .query("rideHandoffs")
                .withIndex("by_bookingId_and_createdAt", (q) => q.eq("bookingId", booking._id))
                .order("desc")
                .first();

        return {
          ...booking,
          latestHandoff: latestHandoff
            ? {
                recipientName: latestHandoff.recipientName,
                status: latestHandoff.status,
                token: latestHandoff.token,
                updatedAt: latestHandoff.updatedAt,
              }
            : null,
        };
      }),
    );
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
        message: `Dispatch updated ${booking.publicReference} to ${formatStatus(args.status)}.`,
        actorTokenIdentifier: identity.tokenIdentifier,
        actorName: staff.name ?? staff.email,
        createdAt: now,
      }),
    ]);
  },
});

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    arrived: "Arrived",
    assigned: "Assigned",
    canceled: "Canceled",
    completed: "Completed",
    driver_en_route: "Driver on the way",
    in_progress: "Passenger onboard",
    new: "New",
    quoted: "Quoted",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

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

type CustomerProfileBookingInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupLocation: string;
  dropoffLocation?: string;
};

async function upsertCustomerProfile(
  ctx: MutationCtx,
  input: CustomerProfileBookingInput,
  now: number,
) {
  const emailKey = normalizeEmailKey(input.customerEmail);
  const phoneKey = normalizePhoneKey(input.customerPhone);
  const existingByEmail = await ctx.db
    .query("customerProfiles")
    .withIndex("by_emailKey", (q) => q.eq("emailKey", emailKey))
    .unique();
  const existing =
    existingByEmail ??
    (phoneKey
      ? await ctx.db
          .query("customerProfiles")
          .withIndex("by_phoneKey", (q) => q.eq("phoneKey", phoneKey))
          .unique()
      : null);

  if (existing) {
    await ctx.db.patch(existing._id, {
      emailKey,
      phoneKey,
      name: input.customerName.trim(),
      email: input.customerEmail.trim(),
      phone: input.customerPhone.trim(),
      pickupLocations: appendUniqueLocation(existing.pickupLocations, input.pickupLocation),
      dropoffLocations: appendUniqueLocation(existing.dropoffLocations, input.dropoffLocation),
      bookingCount: existing.bookingCount + 1,
      lastBookingAt: now,
      updatedAt: now,
    });
    return;
  }

  await ctx.db.insert("customerProfiles", {
    emailKey,
    phoneKey,
    name: input.customerName.trim(),
    email: input.customerEmail.trim(),
    phone: input.customerPhone.trim(),
    pickupLocations: appendUniqueLocation([], input.pickupLocation),
    dropoffLocations: appendUniqueLocation([], input.dropoffLocation),
    marketingOptIn: true,
    bookingCount: 1,
    lastBookingAt: now,
    createdAt: now,
    updatedAt: now,
  });
}

function appendUniqueLocation(values: string[], nextValue?: string) {
  const trimmed = nextValue?.trim();
  if (!trimmed) return values.slice(0, 8);

  return [
    trimmed,
    ...values.filter((value) => value.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, 8);
}

function normalizeEmailKey(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhoneKey(phone: string) {
  return phone.replace(/\D/g, "") || phone.trim().toLowerCase();
}
