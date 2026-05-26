import type { MutationCtx } from "../_generated/server";

type AuditActor = {
  tokenIdentifier?: string;
  name?: string;
};

export type LogAuditArgs = {
  actor?: AuditActor;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string;
  userAgent?: string;
  metadata?: unknown;
};

/**
 * Append a row to the auditLogs table. System-wide audit trail beyond
 * what bookingEvents records (which is booking-scoped). Callers should
 * pass the staff actor from `requireStaff()` when applicable; guest /
 * system actions pass no actor.
 */
export async function logAudit(ctx: MutationCtx, args: LogAuditArgs) {
  await ctx.db.insert("auditLogs", {
    actorTokenIdentifier: args.actor?.tokenIdentifier,
    actorName: args.actor?.name,
    action: args.action,
    entityType: args.entityType,
    entityId: args.entityId,
    oldValues: args.oldValues ?? undefined,
    newValues: args.newValues ?? undefined,
    ipAddress: args.ipAddress,
    userAgent: args.userAgent,
    metadata: args.metadata ?? undefined,
    createdAt: Date.now(),
  });
}
