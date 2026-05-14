import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { RateManagementPanel } from "@/components/admin/RateManagementPanel";

export const metadata: Metadata = {
  title: "ProLimo OS - Rates",
  robots: { index: false, follow: false },
};

export default function RatesPage() {
  return (
    <>
      <Nav minimal tone="light" />
      <main className="min-h-[100svh]">
        <RateManagementPanel />
      </main>
    </>
  );
}
