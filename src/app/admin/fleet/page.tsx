import type { Metadata } from "next";
import { FleetManagementPanel } from "@/components/admin/FleetManagementPanel";

export const metadata: Metadata = {
  title: "ProLimo OS - Fleet",
  robots: { index: false, follow: false },
};

export default function FleetPage() {
  return (
    <main className="min-h-[100svh] bg-[#050505]">
      <FleetManagementPanel />
    </main>
  );
}
