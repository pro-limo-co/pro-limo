export type StaffNavKey = "dispatch" | "rides" | "fleet" | "rates" | "customers";

export const staffRouteItems: Array<{ key: StaffNavKey; label: string; href: string }> = [
  {
    key: "dispatch",
    label: "Dispatch",
    href: "/admin/dispatch",
  },
  {
    key: "rides",
    label: "Rides",
    href: "/admin/rides",
  },
  {
    key: "fleet",
    label: "Fleet",
    href: "/admin/fleet",
  },
  {
    key: "rates",
    label: "Rates",
    href: "/admin/rates",
  },
  {
    key: "customers",
    label: "Customers",
    href: "/admin/customers",
  },
];

export const staffRoutePaths = staffRouteItems.map((item) => item.href);
