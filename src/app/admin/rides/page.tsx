import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { DispatchDashboard } from "@/components/admin/DispatchDashboard";

export const metadata: Metadata = {
  title: "Rides",
  robots: { index: false, follow: false },
};

export default function RidesPage() {
  return (
    <>
      <Nav />
      <main className="min-h-[100svh]">
        <DispatchDashboard title="Rides" />
      </main>
      <Footer />
    </>
  );
}
