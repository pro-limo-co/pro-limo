import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { locationValidator } from "./lib/validators";

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

const handoffStatus = v.union(
  v.literal("sent"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("completed"),
);

const handoffChannel = v.union(v.literal("email"), v.literal("sms"), v.literal("copy"));

const notificationChannel = v.union(v.literal("email"), v.literal("sms"));

const notificationStatus = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
  v.literal("cancelled"),
);

export default defineSchema({
  rateProfiles: defineTable({
    key: v.string(),
    name: v.string(),
    vehicleType: v.string(),
    active: v.boolean(),
    baseFeeCents: v.number(),
    minimumFareCents: v.number(),
    includedMiles: v.number(),
    perMileCents: v.number(),
    perHourCents: v.number(),
    airportFeeCents: v.number(),
    meetAndGreetCents: v.number(),
    extraStopCents: v.number(),
    gratuityPercent: v.number(),
    taxPercent: v.number(),
    peakSurchargePercent: v.number(),
    notes: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_active_and_sortOrder", ["active", "sortOrder"])
    .index("by_sortOrder", ["sortOrder"]),

  driverProfiles: defineTable({
    key: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    active: v.boolean(),
    notes: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_active_and_sortOrder", ["active", "sortOrder"])
    .index("by_sortOrder", ["sortOrder"]),

  vehicleProfiles: defineTable({
    key: v.string(),
    label: v.string(),
    vehicleType: v.string(),
    capacity: v.number(),
    luggageCapacity: v.string(),
    licensePlate: v.optional(v.string()),
    active: v.boolean(),
    notes: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_active_and_sortOrder", ["active", "sortOrder"])
    .index("by_sortOrder", ["sortOrder"]),

  customerProfiles: defineTable({
    emailKey: v.string(),
    phoneKey: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    pickupLocations: v.array(v.string()),
    dropoffLocations: v.array(v.string()),
    preferredVehicle: v.optional(v.string()),
    preferredDrivingStyle: v.optional(v.string()),
    notes: v.optional(v.string()),
    marketingOptIn: v.boolean(),
    bookingCount: v.number(),
    lastBookingAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_emailKey", ["emailKey"])
    .index("by_phoneKey", ["phoneKey"])
    .index("by_lastBookingAt", ["lastBookingAt"]),

  bookings: defineTable({
    publicReference: v.string(),
    bookingMode: v.union(v.literal("oneway"), v.literal("hourly"), v.literal("airport")),
    status: bookingStatus,
    paymentStatus,
    sourcePath: v.optional(v.string()),
    sourceLabel: v.optional(v.string()),
    citySlug: v.optional(v.string()),
    serviceSlug: v.optional(v.string()),
    pickupLocation: v.string(),
    dropoffLocation: v.optional(v.string()),
    pickupLocationDetails: v.optional(locationValidator),
    dropoffLocationDetails: v.optional(locationValidator),
    airportTrip: v.optional(v.string()),
    pickupDate: v.string(),
    pickupTime: v.string(),
    duration: v.optional(v.string()),
    flightNumber: v.optional(v.string()),
    passengerCount: v.number(),
    luggage: v.string(),
    requestedVehicleLabel: v.optional(v.string()),
    paymentPreference: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    notes: v.optional(v.string()),
    quotedAmountCents: v.optional(v.number()),
    currency: v.optional(v.string()),
    assignedChauffeurName: v.optional(v.string()),
    vehicleLabel: v.optional(v.string()),
    dispatchNotes: v.optional(v.string()),
    latestHandoffToken: v.optional(v.string()),
    latestHandoffStatus: v.optional(handoffStatus),
    latestHandoffRecipientName: v.optional(v.string()),
    latestHandoffUpdatedAt: v.optional(v.number()),
    stripeCheckoutSessionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_publicReference", ["publicReference"])
    .index("by_status_and_createdAt", ["status", "createdAt"])
    .index("by_paymentStatus_and_createdAt", ["paymentStatus", "createdAt"])
    .index("by_pickupDate_and_pickupTime", ["pickupDate", "pickupTime"]),

  bookingEvents: defineTable({
    bookingId: v.id("bookings"),
    kind: v.union(
      v.literal("submitted"),
      v.literal("status_changed"),
      v.literal("assignment_updated"),
      v.literal("note_added"),
      v.literal("payment_updated"),
      v.literal("handoff_sent"),
      v.literal("handoff_accepted"),
      v.literal("handoff_declined"),
      v.literal("driver_status_updated"),
    ),
    message: v.string(),
    actorTokenIdentifier: v.optional(v.string()),
    actorName: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_bookingId_and_createdAt", ["bookingId", "createdAt"]),

  staffProfiles: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("dispatcher"), v.literal("viewer")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  paymentIntents: defineTable({
    bookingId: v.id("bookings"),
    provider: v.literal("stripe"),
    providerSessionId: v.optional(v.string()),
    status: paymentStatus,
    amountCents: v.number(),
    currency: v.string(),
    checkoutUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_bookingId_and_createdAt", ["bookingId", "createdAt"])
    .index("by_providerSessionId", ["providerSessionId"])
    .index("by_status_and_createdAt", ["status", "createdAt"]),

  rideHandoffs: defineTable({
    bookingId: v.id("bookings"),
    token: v.string(),
    recipientName: v.string(),
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    channel: handoffChannel,
    status: handoffStatus,
    message: v.optional(v.string()),
    createdByTokenIdentifier: v.optional(v.string()),
    createdByName: v.optional(v.string()),
    acceptedAt: v.optional(v.number()),
    declinedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_bookingId_and_createdAt", ["bookingId", "createdAt"])
    .index("by_status_and_createdAt", ["status", "createdAt"]),

  idempotencyKeys: defineTable({
    key: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    createdAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_createdAt", ["createdAt"]),

  notificationQueue: defineTable({
    bookingId: v.optional(v.id("bookings")),
    channel: notificationChannel,
    type: v.string(),
    status: notificationStatus,
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    payload: v.optional(v.any()),
    scheduledFor: v.number(),
    sentAt: v.optional(v.number()),
    error: v.optional(v.string()),
    retryCount: v.number(),
    maxRetries: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status_and_scheduledFor", ["status", "scheduledFor"])
    .index("by_bookingId", ["bookingId"])
    .index("by_bookingId_and_status", ["bookingId", "status"])
    .index("by_type_and_status", ["type", "status"]),
});
