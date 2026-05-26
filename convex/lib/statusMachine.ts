/**
 * Booking status state machine.
 *
 * Centralizes transition rules and status formatting that were
 * previously scattered across convex/bookings.ts (formatStatus,
 * implicit any-to-any staff transitions) and convex/handoffs.ts
 * (requiredPreviousBookingStatus, formatStatus duplicate, ad-hoc
 * terminal-state guards).
 */

export const BOOKING_STATUSES = [
  "new",
  "quoted",
  "assigned",
  "driver_en_route",
  "arrived",
  "in_progress",
  "completed",
  "canceled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const TERMINAL_BOOKING_STATUSES = ["completed", "canceled"] as const satisfies readonly BookingStatus[];

export function isTerminalBookingStatus(status: BookingStatus): boolean {
  return TERMINAL_BOOKING_STATUSES.includes(status as (typeof TERMINAL_BOOKING_STATUSES)[number]);
}

export function canCancelFromStatus(status: BookingStatus): boolean {
  return !isTerminalBookingStatus(status);
}

/**
 * Driver-controlled status sub-machine (en-route → arrived → in-progress → completed).
 * Lifted verbatim from convex/handoffs.ts and exported here so handoffs.ts
 * can import a single source of truth.
 */
export type DriverRideStatus = "driver_en_route" | "arrived" | "in_progress" | "completed";

export const requiredPreviousBookingStatusForDriverUpdate: Record<DriverRideStatus, readonly BookingStatus[]> = {
  driver_en_route: ["assigned"],
  arrived: ["driver_en_route"],
  in_progress: ["arrived"],
  completed: ["in_progress"],
};

/**
 * Whole booking-status transition table — superset of the driver sub-machine
 * plus the staff-only edges (quoted, assigned, canceled). Not enforced on
 * staff mutations today (preserves existing behavior); exposed here so
 * future work can opt in via `isValidTransition()`.
 */
const ALLOWED_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  new: ["quoted", "assigned", "canceled"],
  quoted: ["assigned", "canceled"],
  assigned: ["driver_en_route", "canceled"],
  driver_en_route: ["arrived", "canceled"],
  arrived: ["in_progress", "canceled"],
  in_progress: ["completed", "canceled"],
  completed: [],
  canceled: [],
};

export function isValidTransition(from: BookingStatus, to: BookingStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "New",
  quoted: "Quoted",
  assigned: "Assigned",
  driver_en_route: "Driver on the way",
  arrived: "Arrived",
  in_progress: "Passenger onboard",
  completed: "Completed",
  canceled: "Canceled",
};

export function formatStatus(status: string): string {
  return STATUS_LABELS[status as BookingStatus] ?? status.replaceAll("_", " ");
}
