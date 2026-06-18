import type { Metadata } from "next";
import { CustomerManagementPanel } from "@/components/admin/CustomerManagementPanel";

export const metadata: Metadata = {
  title: "ProLimo OS - Customers",
  robots: { index: false, follow: false },
};

export default function CustomersPage() {
  return (
    <main className="min-h-[100svh] bg-[#050505]">
      <CustomerManagementPanel />
    </main>
  );
}
