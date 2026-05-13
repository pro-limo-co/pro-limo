import { ConvexHttpClient } from "convex/browser";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { BookingStatusPanel } from "@/components/booking/BookingStatusPanel";
import { api } from "@convex/_generated/api";

type Params = Promise<{ reference: string }>;

export const metadata: Metadata = {
  title: "Booking",
  robots: { index: false, follow: false },
};

export default async function BookingReferencePage({ params }: { params: Params }) {
  const { reference } = await params;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  if (!convexUrl) notFound();

  const convex = new ConvexHttpClient(convexUrl);
  const booking = await convex.query(api.bookings.getByReference, {
    publicReference: reference.toUpperCase(),
  });

  if (!booking) notFound();

  return (
    <>
      <Nav minimal tone="light" />
      <main className="pld-ui min-h-[100svh] bg-background px-6 pt-32 pb-20 text-foreground lg:px-10">
        <BookingStatusPanel reference={booking.publicReference} />
      </main>
    </>
  );
}
