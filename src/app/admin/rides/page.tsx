import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { DispatchDashboard } from "@/components/admin/DispatchDashboard";

export const metadata: Metadata = {
  title: "ProLimo OS - Rides",
  robots: { index: false, follow: false },
};

export default function RidesPage() {
  return (
    <>
      <Nav minimal tone="light" />
      <main className="min-h-[100svh]">
        <DispatchDashboard title="Rides" />
      </main>
    </>
  );
}
