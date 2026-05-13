import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  bookingSubmissionByContact: {
    kind: "token bucket",
    rate: 8,
    period: HOUR,
    capacity: 4,
  },
  bookingSubmissionGlobal: {
    kind: "fixed window",
    rate: 180,
    period: HOUR,
    shards: 10,
  },
  driverHandoffResponseByToken: {
    kind: "token bucket",
    rate: 12,
    period: MINUTE,
    capacity: 6,
  },
  driverStatusUpdateByToken: {
    kind: "token bucket",
    rate: 24,
    period: MINUTE,
    capacity: 8,
  },
});

export async function limitBookingSubmission(
  ctx: MutationCtx,
  args: { customerEmail: string; customerPhone: string },
) {
  await rateLimiter.limit(ctx, "bookingSubmissionByContact", {
    key: normalizeContactKey(args.customerEmail, args.customerPhone),
    throws: true,
  });
  await rateLimiter.limit(ctx, "bookingSubmissionGlobal", { throws: true });
}

export async function limitDriverHandoffResponse(ctx: MutationCtx, token: string) {
  await rateLimiter.limit(ctx, "driverHandoffResponseByToken", {
    key: normalizeToken(token),
    throws: true,
  });
}

export async function limitDriverStatusUpdate(ctx: MutationCtx, token: string) {
  await rateLimiter.limit(ctx, "driverStatusUpdateByToken", {
    key: normalizeToken(token),
    throws: true,
  });
}

function normalizeContactKey(email: string, phone: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.replace(/[^\d+]/g, "").slice(-16);
  return `${normalizedEmail || "unknown-email"}:${normalizedPhone || "unknown-phone"}`;
}

function normalizeToken(token: string) {
  return token.trim().toLowerCase();
}
