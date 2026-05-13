import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { DispatchDashboard } from "@/components/admin/DispatchDashboard";

export const metadata: Metadata = {
  title: "ProLimo OS - Dispatch",
  robots: { index: false, follow: false },
};

export default function DispatchPage() {
  return (
    <>
      <Nav minimal tone="light" />
      <main className="min-h-[100svh]">
        <DispatchDashboard />
      </main>
    </>
  );
}
