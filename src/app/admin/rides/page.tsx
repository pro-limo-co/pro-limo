import type { Metadata } from "next";
import { DispatchDashboard } from "@/components/admin/DispatchDashboard";

export const metadata: Metadata = {
  title: "ProLimo OS - Rides",
  robots: { index: false, follow: false },
};

export default function RidesPage() {
  return (
    <main className="min-h-[100svh] bg-[#050505]">
      <DispatchDashboard title="Rides" />
    </main>
  );
}
