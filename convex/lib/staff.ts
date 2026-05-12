import type { MutationCtx, QueryCtx } from "../_generated/server";

type StaffCtx = QueryCtx | MutationCtx;

const allowedRoles = {
  admin: ["admin"],
  dispatcher: ["admin", "dispatcher"],
  viewer: ["admin", "dispatcher", "viewer"],
} as const;

export async function requireStaff(ctx: StaffCtx, minimumRole: keyof typeof allowedRoles = "viewer") {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const staff = await ctx.db
    .query("staffProfiles")
    .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  const roles = allowedRoles[minimumRole] as readonly string[];
  if (!staff || !roles.includes(staff.role)) {
    throw new Error("Unauthorized");
  }

  return {
    identity,
    staff,
  };
}

export function getBootstrapAdminEmails() {
  const value = process.env.DISPATCH_ADMIN_EMAILS ?? "";
  const emails = value.split(",");
  const normalized: string[] = [];
  for (const email of emails) {
    const trimmed = email.trim().toLowerCase();
    if (trimmed) normalized.push(trimmed);
  }
  return normalized;
}
