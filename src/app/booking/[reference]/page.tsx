import { ConvexHttpClient } from "convex/browser";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
      <Nav tone="light" />
      <main className="pld-ui min-h-[100svh] bg-background px-6 pt-32 pb-20 text-foreground lg:px-10">
        <section className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{booking.status.replaceAll("_", " ")}</Badge>
            <Badge variant="outline">{booking.paymentStatus.replaceAll("_", " ")}</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">{booking.publicReference}</h1>
          <p className="mt-3 text-muted-foreground">
            Dispatch has the request. Save this reference for any follow-up.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <BookingFact label="Status" value={booking.status.replaceAll("_", " ")} />
            <BookingFact label="Payment" value={booking.paymentStatus.replaceAll("_", " ")} />
            <BookingFact label="Pickup" value={`${booking.pickupDate} · ${booking.pickupTime}`} />
            <BookingFact label="Passenger" value={booking.customerName} />
          </div>
          <Card className="mt-6">
            <CardContent className="pt-6">
              <p className="text-sm leading-6 text-muted-foreground">
              {booking.pickupLocation}
              {booking.dropoffLocation ? ` to ${booking.dropoffLocation}` : ""}
              {booking.duration ? ` · ${booking.duration}` : ""}
            </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}

function BookingFact({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">{label}</p>
        <p className="mt-2 text-base font-medium capitalize text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
