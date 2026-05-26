import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { logAudit } from "./lib/audit";
import { requireStaff } from "./lib/staff";

const rateProfileArgs = {
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
};

type RateProfileInput = {
  key: string;
  name: string;
  vehicleType: string;
  active: boolean;
  baseFeeCents: number;
  minimumFareCents: number;
  includedMiles: number;
  perMileCents: number;
  perHourCents: number;
  airportFeeCents: number;
  meetAndGreetCents: number;
  extraStopCents: number;
  gratuityPercent: number;
  taxPercent: number;
  peakSurchargePercent: number;
  notes?: string;
  sortOrder: number;
};

const defaultRateProfiles: RateProfileInput[] = [
  {
    key: "executive-sedan",
    name: "Executive Sedan",
    vehicleType: "Sedan",
    active: true,
    baseFeeCents: 3500,
    minimumFareCents: 9500,
    includedMiles: 8,
    perMileCents: 325,
    perHourCents: 9500,
    airportFeeCents: 1500,
    meetAndGreetCents: 3500,
    extraStopCents: 2500,
    gratuityPercent: 20,
    taxPercent: 0,
    peakSurchargePercent: 15,
    notes: "Default sedan profile for airport and point-to-point work.",
    sortOrder: 10,
  },
  {
    key: "premium-suv",
    name: "Premium SUV",
    vehicleType: "SUV",
    active: true,
    baseFeeCents: 4500,
    minimumFareCents: 12500,
    includedMiles: 8,
    perMileCents: 425,
    perHourCents: 12500,
    airportFeeCents: 2000,
    meetAndGreetCents: 4000,
    extraStopCents: 3000,
    gratuityPercent: 20,
    taxPercent: 0,
    peakSurchargePercent: 15,
    notes: "Default Escalade/Suburban profile.",
    sortOrder: 20,
  },
  {
    key: "sprinter",
    name: "Executive Sprinter",
    vehicleType: "Sprinter",
    active: true,
    baseFeeCents: 7500,
    minimumFareCents: 22500,
    includedMiles: 10,
    perMileCents: 650,
    perHourCents: 22500,
    airportFeeCents: 3000,
    meetAndGreetCents: 5000,
    extraStopCents: 4500,
    gratuityPercent: 20,
    taxPercent: 0,
    peakSurchargePercent: 20,
    notes: "Group and event profile.",
    sortOrder: 30,
  },
  {
    key: "stretch-limo",
    name: "Stretch Limousine",
    vehicleType: "Limousine",
    active: false,
    baseFeeCents: 9000,
    minimumFareCents: 30000,
    includedMiles: 10,
    perMileCents: 800,
    perHourCents: 30000,
    airportFeeCents: 3000,
    meetAndGreetCents: 5000,
    extraStopCents: 5000,
    gratuityPercent: 20,
    taxPercent: 0,
    peakSurchargePercent: 20,
    notes: "Keep inactive until the fleet supports it.",
    sortOrder: 40,
  },
];

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx, "viewer");

    const profiles = await ctx.db.query("rateProfiles").withIndex("by_sortOrder").take(50);
    if (profiles.length === 0) {
      return defaultRateProfiles.map((profile) => normalizeRateProfile(null, profile, "default" as const));
    }

    return profiles.map((profile) =>
      normalizeRateProfile(profile._id, profile, "saved" as const),
    );
  },
});

export const ensureDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx, "admin");

    const existing = await ctx.db.query("rateProfiles").take(1);
    if (existing.length > 0) {
      return { inserted: 0 };
    }

    const now = Date.now();
    await Promise.all(
      defaultRateProfiles.map((profile) =>
        ctx.db.insert("rateProfiles", {
          ...profile,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    );

    return { inserted: defaultRateProfiles.length };
  },
});

export const upsert = mutation({
  args: {
    profileId: v.union(v.id("rateProfiles"), v.null()),
    ...rateProfileArgs,
  },
  handler: async (ctx, args) => {
    const { identity, staff } = await requireStaff(ctx, "admin");
    const actor = {
      tokenIdentifier: identity.tokenIdentifier,
      name: staff.name ?? staff.email,
    };

    const profile = normalizeInput(args);
    const now = Date.now();

    if (args.profileId) {
      const before = await ctx.db.get(args.profileId);
      await ctx.db.patch(args.profileId, {
        ...profile,
        updatedAt: now,
      });
      await logAudit(ctx, {
        actor,
        action: "rates.upsert",
        entityType: "rateProfiles",
        entityId: args.profileId,
        oldValues: before ?? undefined,
        newValues: profile,
      });
      return args.profileId;
    }

    const existing = await ctx.db
      .query("rateProfiles")
      .withIndex("by_key", (q) => q.eq("key", profile.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...profile,
        updatedAt: now,
      });
      await logAudit(ctx, {
        actor,
        action: "rates.upsert",
        entityType: "rateProfiles",
        entityId: existing._id,
        oldValues: existing,
        newValues: profile,
      });
      return existing._id;
    }

    const insertedId = await ctx.db.insert("rateProfiles", {
      ...profile,
      createdAt: now,
      updatedAt: now,
    });
    await logAudit(ctx, {
      actor,
      action: "rates.upsert",
      entityType: "rateProfiles",
      entityId: insertedId,
      newValues: profile,
    });
    return insertedId;
  },
});

function normalizeRateProfile(
  profileId: Id<"rateProfiles"> | null,
  profile: RateProfileInput,
  source: "default" | "saved",
) {
  return {
    profileId,
    source,
    key: profile.key,
    name: profile.name,
    vehicleType: profile.vehicleType,
    active: profile.active,
    baseFeeCents: profile.baseFeeCents,
    minimumFareCents: profile.minimumFareCents,
    includedMiles: profile.includedMiles,
    perMileCents: profile.perMileCents,
    perHourCents: profile.perHourCents,
    airportFeeCents: profile.airportFeeCents,
    meetAndGreetCents: profile.meetAndGreetCents,
    extraStopCents: profile.extraStopCents,
    gratuityPercent: profile.gratuityPercent,
    taxPercent: profile.taxPercent,
    peakSurchargePercent: profile.peakSurchargePercent,
    notes: profile.notes ?? null,
    sortOrder: profile.sortOrder,
  };
}

function normalizeInput(input: RateProfileInput): RateProfileInput {
  return {
    key: slugify(input.key || input.name),
    name: input.name.trim(),
    vehicleType: input.vehicleType.trim(),
    active: input.active,
    baseFeeCents: clampCents(input.baseFeeCents),
    minimumFareCents: clampCents(input.minimumFareCents),
    includedMiles: clampNumber(input.includedMiles),
    perMileCents: clampCents(input.perMileCents),
    perHourCents: clampCents(input.perHourCents),
    airportFeeCents: clampCents(input.airportFeeCents),
    meetAndGreetCents: clampCents(input.meetAndGreetCents),
    extraStopCents: clampCents(input.extraStopCents),
    gratuityPercent: clampNumber(input.gratuityPercent),
    taxPercent: clampNumber(input.taxPercent),
    peakSurchargePercent: clampNumber(input.peakSurchargePercent),
    notes: input.notes?.trim() || undefined,
    sortOrder: Math.round(clampNumber(input.sortOrder)),
  };
}

function clampCents(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function clampNumber(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "rate-profile";
}
