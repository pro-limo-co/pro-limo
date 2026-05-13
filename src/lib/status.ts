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
  in_progress: "In progress",
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
