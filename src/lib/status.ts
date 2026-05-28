const statusLabels: Record<string, string> = {
  accepted: "Accepted",
  airport: "Airport",
  arrived: "Arrived",
  assigned: "Assigned",
  assignment_updated: "Assignment updated",
  canceled: "Canceled",
  completed: "Completed",
  declined: "Declined",
  driver_en_route: "Driver on the way",
  driver_status_updated: "Driver status updated",
  failed: "Failed",
  handoff_accepted: "Handoff accepted",
  handoff_completed: "Handoff completed",
  handoff_declined: "Handoff declined",
  handoff_sent: "Handoff sent",
  hourly: "Hourly",
  in_progress: "Passenger onboard",
  new: "New",
  not_started: "Not started",
  note_added: "Note added",
  oneway: "One-way",
  paid: "Paid",
  payment_updated: "Payment updated",
  pending: "Pending",
  quote_required: "Quote required",
  quoted: "Quoted",
  refunded: "Refunded",
  sent: "Sent",
  status_changed: "Status changed",
  submitted: "Submitted",
  unavailable: "Unavailable",
};

export function formatStatus(status: string) {
  return statusLabels[status] ?? sentenceCase(status.replaceAll("_", " "));
}

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Visual tone for a booking status — drives the dispatch row accent bar,
 * status dots, and badge coloring (UI refresh, Variant B).
 *
 * - info: live / in-motion states (assigned, en route, arrived, onboard)
 * - success: settled-good (completed, paid)
 * - warning: needs attention (new, quote required)
 * - danger: terminal-bad (canceled, declined, failed, refunded)
 * - neutral: everything else (quoted, pending, …)
 *
 * Map each tone to a CSS color with `statusToneColor()` (var(--status-*)).
 */
export type StatusTone = "info" | "success" | "warning" | "danger" | "neutral";

const statusTones: Record<string, StatusTone> = {
  new: "warning",
  quote_required: "warning",
  quoted: "neutral",
  pending: "neutral",
  not_started: "neutral",
  assigned: "info",
  accepted: "info",
  driver_en_route: "info",
  arrived: "info",
  in_progress: "info",
  completed: "success",
  paid: "success",
  handoff_completed: "success",
  canceled: "danger",
  declined: "danger",
  failed: "danger",
  refunded: "danger",
  unavailable: "danger",
};

export function getStatusTone(status: string): StatusTone {
  return statusTones[status] ?? "neutral";
}

/** CSS color for a status tone, resolving to the theme's status custom properties. */
export function statusToneColor(tone: StatusTone): string {
  switch (tone) {
    case "info":
      return "var(--info)";
    case "success":
      return "var(--success)";
    case "warning":
      return "var(--warning)";
    case "danger":
      return "var(--destructive)";
    default:
      return "var(--color-pewter)";
  }
}
