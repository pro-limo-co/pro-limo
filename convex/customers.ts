import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logAudit } from "./lib/audit";
import { requireStaff } from "./lib/staff";

const optionalString = v.optional(v.string());

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, "viewer");
    return await ctx.db
      .query("customerProfiles")
      .withIndex("by_lastBookingAt")
      .order("desc")
      .take(Math.min(args.limit ?? 100, 150));
  },
});

export const updatePreferences = mutation({
  args: {
    customerId: v.id("customerProfiles"),
    preferredVehicle: optionalString,
    preferredDrivingStyle: optionalString,
    notes: optionalString,
    marketingOptIn: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { identity, staff } = await requireStaff(ctx, "dispatcher");
    // oxlint-disable-next-line react-doctor/server-sequential-independent-await -- Staff auth must gate customer profile reads.
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error("Customer not found");

    const newValues = {
      preferredVehicle: normalizeOptional(args.preferredVehicle),
      preferredDrivingStyle: normalizeOptional(args.preferredDrivingStyle),
      notes: normalizeOptional(args.notes),
      marketingOptIn: args.marketingOptIn,
    };

    await ctx.db.patch(args.customerId, {
      ...newValues,
      updatedAt: Date.now(),
    });

    await logAudit(ctx, {
      actor: {
        tokenIdentifier: identity.tokenIdentifier,
        name: staff.name ?? staff.email,
      },
      action: "customers.updatePreferences",
      entityType: "customerProfiles",
      entityId: args.customerId,
      oldValues: {
        preferredVehicle: customer.preferredVehicle,
        preferredDrivingStyle: customer.preferredDrivingStyle,
        notes: customer.notes,
        marketingOptIn: customer.marketingOptIn,
      },
      newValues,
    });
  },
});

function normalizeOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
