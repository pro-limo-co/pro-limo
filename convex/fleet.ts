import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireStaff } from "./lib/staff";

const driverArgs = {
  key: v.string(),
  name: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  active: v.boolean(),
  notes: v.optional(v.string()),
  sortOrder: v.number(),
};

const vehicleArgs = {
  key: v.string(),
  label: v.string(),
  vehicleType: v.string(),
  capacity: v.number(),
  luggageCapacity: v.string(),
  licensePlate: v.optional(v.string()),
  active: v.boolean(),
  notes: v.optional(v.string()),
  sortOrder: v.number(),
};

type DriverInput = {
  key: string;
  name: string;
  email?: string;
  phone?: string;
  active: boolean;
  notes?: string;
  sortOrder: number;
};

type VehicleInput = {
  key: string;
  label: string;
  vehicleType: string;
  capacity: number;
  luggageCapacity: string;
  licensePlate?: string;
  active: boolean;
  notes?: string;
  sortOrder: number;
};

const defaultDrivers: DriverInput[] = [
  {
    key: "primary-chauffeur",
    name: "Primary Chauffeur",
    active: true,
    notes: "Replace with the owner or primary staff driver.",
    sortOrder: 10,
  },
  {
    key: "affiliate-chauffeur",
    name: "Affiliate Chauffeur",
    active: true,
    notes: "Use for trusted affiliate or overflow driver assignment.",
    sortOrder: 20,
  },
];

const defaultVehicles: VehicleInput[] = [
  {
    key: "executive-sedan",
    label: "Executive Sedan",
    vehicleType: "Sedan",
    capacity: 3,
    luggageCapacity: "2 large bags",
    active: true,
    notes: "Baseline airport and executive transfer vehicle.",
    sortOrder: 10,
  },
  {
    key: "premium-suv",
    label: "Premium SUV",
    vehicleType: "SUV",
    capacity: 6,
    luggageCapacity: "5 large bags",
    active: true,
    notes: "Default family, VIP, and airport SUV assignment.",
    sortOrder: 20,
  },
  {
    key: "executive-sprinter",
    label: "Executive Sprinter",
    vehicleType: "Sprinter",
    capacity: 12,
    luggageCapacity: "12+ bags",
    active: true,
    notes: "Group, event, and corporate shuttle assignment.",
    sortOrder: 30,
  },
];

export const listDrivers = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx, "viewer");
    const drivers = await ctx.db.query("driverProfiles").withIndex("by_sortOrder").take(100);
    if (drivers.length === 0) {
      return defaultDrivers.map((driver) => normalizeDriver(null, driver, "default" as const));
    }
    return drivers.map((driver) => normalizeDriver(driver._id, driver, "saved" as const));
  },
});

export const listVehicles = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx, "viewer");
    const vehicles = await ctx.db.query("vehicleProfiles").withIndex("by_sortOrder").take(100);
    if (vehicles.length === 0) {
      return defaultVehicles.map((vehicle) => normalizeVehicle(null, vehicle, "default" as const));
    }
    return vehicles.map((vehicle) => normalizeVehicle(vehicle._id, vehicle, "saved" as const));
  },
});

export const ensureDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx, "admin");
    const [drivers, vehicles] = await Promise.all([
      ctx.db.query("driverProfiles").take(1),
      ctx.db.query("vehicleProfiles").take(1),
    ]);

    const now = Date.now();
    let insertedDrivers = 0;
    let insertedVehicles = 0;

    if (drivers.length === 0) {
      await Promise.all(
        defaultDrivers.map((driver) =>
          ctx.db.insert("driverProfiles", {
            ...driver,
            createdAt: now,
            updatedAt: now,
          }),
        ),
      );
      insertedDrivers = defaultDrivers.length;
    }

    if (vehicles.length === 0) {
      await Promise.all(
        defaultVehicles.map((vehicle) =>
          ctx.db.insert("vehicleProfiles", {
            ...vehicle,
            createdAt: now,
            updatedAt: now,
          }),
        ),
      );
      insertedVehicles = defaultVehicles.length;
    }

    return { insertedDrivers, insertedVehicles };
  },
});

export const upsertDriver = mutation({
  args: {
    driverId: v.union(v.id("driverProfiles"), v.null()),
    ...driverArgs,
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, "admin");
    const driver = normalizeDriverInput(args);
    const now = Date.now();

    if (args.driverId) {
      await ctx.db.patch(args.driverId, { ...driver, updatedAt: now });
      return args.driverId;
    }

    const existing = await ctx.db
      .query("driverProfiles")
      .withIndex("by_key", (q) => q.eq("key", driver.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { ...driver, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("driverProfiles", {
      ...driver,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const upsertVehicle = mutation({
  args: {
    vehicleId: v.union(v.id("vehicleProfiles"), v.null()),
    ...vehicleArgs,
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, "admin");
    const vehicle = normalizeVehicleInput(args);
    const now = Date.now();

    if (args.vehicleId) {
      await ctx.db.patch(args.vehicleId, { ...vehicle, updatedAt: now });
      return args.vehicleId;
    }

    const existing = await ctx.db
      .query("vehicleProfiles")
      .withIndex("by_key", (q) => q.eq("key", vehicle.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { ...vehicle, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("vehicleProfiles", {
      ...vehicle,
      createdAt: now,
      updatedAt: now,
    });
  },
});

function normalizeDriver(
  driverId: Id<"driverProfiles"> | null,
  driver: DriverInput,
  source: "default" | "saved",
) {
  return {
    driverId,
    source,
    key: driver.key,
    name: driver.name,
    email: driver.email ?? null,
    phone: driver.phone ?? null,
    active: driver.active,
    notes: driver.notes ?? null,
    sortOrder: driver.sortOrder,
  };
}

function normalizeVehicle(
  vehicleId: Id<"vehicleProfiles"> | null,
  vehicle: VehicleInput,
  source: "default" | "saved",
) {
  return {
    vehicleId,
    source,
    key: vehicle.key,
    label: vehicle.label,
    vehicleType: vehicle.vehicleType,
    capacity: vehicle.capacity,
    luggageCapacity: vehicle.luggageCapacity,
    licensePlate: vehicle.licensePlate ?? null,
    active: vehicle.active,
    notes: vehicle.notes ?? null,
    sortOrder: vehicle.sortOrder,
  };
}

function normalizeDriverInput(input: DriverInput): DriverInput {
  return {
    key: slugify(input.key || input.name),
    name: input.name.trim(),
    email: normalizeOptional(input.email),
    phone: normalizeOptional(input.phone),
    active: input.active,
    notes: normalizeOptional(input.notes),
    sortOrder: Math.round(clampNumber(input.sortOrder)),
  };
}

function normalizeVehicleInput(input: VehicleInput): VehicleInput {
  return {
    key: slugify(input.key || input.label),
    label: input.label.trim(),
    vehicleType: input.vehicleType.trim(),
    capacity: Math.round(clampNumber(input.capacity)),
    luggageCapacity: input.luggageCapacity.trim(),
    licensePlate: normalizeOptional(input.licensePlate),
    active: input.active,
    notes: normalizeOptional(input.notes),
    sortOrder: Math.round(clampNumber(input.sortOrder)),
  };
}

function normalizeOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
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
  return slug || "profile";
}
