import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { FleetManagementPanel } from "@/components/admin/FleetManagementPanel";

export const metadata: Metadata = {
  title: "ProLimo OS - Fleet",
  robots: { index: false, follow: false },
};

export default function FleetPage() {
  return (
    <>
      <Nav minimal tone="light" />
      <main className="min-h-[100svh]">
        <FleetManagementPanel />
      </main>
    </>
  );
}
