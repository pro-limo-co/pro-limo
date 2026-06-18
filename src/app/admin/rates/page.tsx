import type { Metadata } from "next";
import { RateManagementPanel } from "@/components/admin/RateManagementPanel";

export const metadata: Metadata = {
  title: "ProLimo OS - Rates",
  robots: { index: false, follow: false },
};

export default function RatesPage() {
  return (
    <main className="min-h-[100svh] bg-[#050505]">
      <RateManagementPanel />
    </main>
  );
}
