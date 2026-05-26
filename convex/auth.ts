import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import { logAudit } from "./lib/audit";
import { getBootstrapAdminEmails } from "./lib/staff";

export const { getAuthUser } = authComponent.clientApi();

export const getViewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        identity: null,
        staff: null,
      };
    }

    const staff = await ctx.db
      .query("staffProfiles")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    return {
      identity: {
        tokenIdentifier: identity.tokenIdentifier,
        email: identity.email ?? null,
        name: identity.name ?? null,
      },
      staff,
    };
  },
});

export const claimStaffAccess = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const email = identity.email?.toLowerCase();
    if (!email || !getBootstrapAdminEmails().includes(email)) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("staffProfiles")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        name: identity.name ?? existing.name,
        role: "admin",
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("staffProfiles", {
      tokenIdentifier: identity.tokenIdentifier,
      email,
      name: identity.name,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStaffRole = mutation({
  args: {
    staffId: v.id("staffProfiles"),
    role: v.union(v.literal("admin"), v.literal("dispatcher"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentStaff = await ctx.db
      .query("staffProfiles")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!currentStaff || currentStaff.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const targetStaff = await ctx.db.get(args.staffId);
    if (!targetStaff) throw new Error("Staff not found");

    await ctx.db.patch(args.staffId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    await logAudit(ctx, {
      actor: {
        tokenIdentifier: identity.tokenIdentifier,
        name: currentStaff.name ?? currentStaff.email,
      },
      action: "auth.updateStaffRole",
      entityType: "staffProfiles",
      entityId: args.staffId,
      oldValues: { role: targetStaff.role, email: targetStaff.email },
      newValues: { role: args.role },
    });
  },
});
