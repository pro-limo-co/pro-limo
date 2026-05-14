import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { CustomerManagementPanel } from "@/components/admin/CustomerManagementPanel";

export const metadata: Metadata = {
  title: "ProLimo OS - Customers",
  robots: { index: false, follow: false },
};

export default function CustomersPage() {
  return (
    <>
      <Nav minimal tone="light" />
      <main className="min-h-[100svh]">
        <CustomerManagementPanel />
      </main>
    </>
  );
}
