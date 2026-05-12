import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { RideAccessPanel } from "@/components/rides/RideAccessPanel";

type Params = Promise<{ token: string }>;

export const metadata: Metadata = {
  title: "Ride Access",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RidePage({ params }: { params: Params }) {
  const { token } = await params;

  return (
    <>
      <Nav />
      <main className="min-h-[100svh]">
        <RideAccessPanel token={token} />
      </main>
      <Footer />
    </>
  );
}
