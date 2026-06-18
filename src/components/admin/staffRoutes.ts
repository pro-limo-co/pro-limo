export type StaffNavKey = "dispatch" | "rides" | "fleet" | "rates" | "customers";

export const staffRouteItems: Array<{ key: StaffNavKey; label: string; href: string; description: string }> = [
  {
    key: "dispatch",
    label: "Dispatch",
    href: "/admin/dispatch",
    description: "Open booking requests, quotes, payment links, assignments, and driver handoffs.",
  },
  {
    key: "rides",
    label: "Rides",
    href: "/admin/rides",
    description: "Review the complete ride ledger and resend passenger or driver links.",
  },
  {
    key: "fleet",
    label: "Fleet",
    href: "/admin/fleet",
    description: "Maintain saved chauffeurs and vehicles used by dispatch.",
  },
  {
    key: "rates",
    label: "Rates",
    href: "/admin/rates",
    description: "Update rate profiles used by the staff quote calculator.",
  },
  {
    key: "customers",
    label: "Customers",
    href: "/admin/customers",
    description: "Check customer history, saved addresses, preferences, and staff notes.",
  },
];

export const staffRoutePaths = staffRouteItems.map((item) => item.href);
