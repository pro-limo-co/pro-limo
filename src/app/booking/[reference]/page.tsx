import { ConvexHttpClient } from "convex/browser";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { api } from "@convex/_generated/api";

type Params = Promise<{ reference: string }>;

export const metadata: Metadata = {
  title: "Booking",
  robots: { index: false, follow: false },
};

export default async function BookingReferencePage({ params }: { params: Params }) {
  const { reference } = await params;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) notFound();

  const convex = new ConvexHttpClient(convexUrl);
  const booking = await convex.query(api.bookings.getByReference, {
    publicReference: reference.toUpperCase(),
  });

  if (!booking) notFound();

  return (
    <>
      <Nav />
      <main className="min-h-[100svh] px-6 pt-32 pb-20 lg:px-10">
        <section className="mx-auto max-w-3xl">
          <p className="eyebrow">Booking</p>
          <h1 className="display-md mt-5">{booking.publicReference}</h1>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[color:var(--color-divider-soft)] bg-[color:var(--color-divider-soft)] sm:grid-cols-2">
            <BookingFact label="Status" value={booking.status.replaceAll("_", " ")} />
            <BookingFact label="Payment" value={booking.paymentStatus.replaceAll("_", " ")} />
            <BookingFact label="Pickup" value={`${booking.pickupDate} · ${booking.pickupTime}`} />
            <BookingFact label="Passenger" value={booking.customerName} />
          </div>
          <div className="mt-8 border-y border-[color:var(--color-divider-soft)] py-6">
            <p className="text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
              {booking.pickupLocation}
              {booking.dropoffLocation ? ` to ${booking.dropoffLocation}` : ""}
              {booking.duration ? ` · ${booking.duration}` : ""}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function BookingFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[color:var(--color-ink)] p-6">
      <p className="font-condensed text-[0.68rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
        {label}
      </p>
      <p className="mt-2 text-[1rem] capitalize text-[color:var(--color-bone)]">{value}</p>
    </div>
  );
}

