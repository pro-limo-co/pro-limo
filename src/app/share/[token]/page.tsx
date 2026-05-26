import { ConvexHttpClient } from "convex/browser";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock, CarFront, MapPin, UserRound } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@convex/_generated/api";
import { ShareViewRecorder } from "@/components/share/ShareViewRecorder";

type Params = Promise<{ token: string }>;

export const metadata: Metadata = {
  title: "Shared trip",
  robots: { index: false, follow: false },
};

export default async function ShareTokenPage({ params }: { params: Params }) {
  const { token } = await params;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  if (!convexUrl) notFound();

  const convex = new ConvexHttpClient(convexUrl);
  const result = await convex.query(api.tripShares.getByToken, {
    shareToken: token,
  });

  if (!result || "error" in result) {
    const message = !result || result.error === "not_found"
      ? "This trip link is not valid."
      : result.error === "expired"
        ? "This trip link has expired."
        : "This trip link has been deactivated.";

    return (
      <>
        <Nav minimal tone="light" />
        <main className="pld-ui min-h-[100svh] bg-background px-6 pt-32 pb-20 text-foreground lg:px-10">
          <div className="mx-auto max-w-xl">
            <Card>
              <CardHeader>
                <CardTitle>Trip unavailable</CardTitle>
                <CardDescription>{message}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </>
    );
  }

  const { booking } = result;
  const route = [booking.pickupLocation, booking.dropoffLocation ?? booking.duration]
    .filter(Boolean)
    .join(" to ");
  const canceled = booking.status === "canceled";

  return (
    <>
      <Nav minimal tone="light" />
      <ShareViewRecorder shareToken={token} />
      <main className="pld-ui min-h-[100svh] bg-background px-6 pt-32 pb-20 text-foreground lg:px-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={canceled ? "destructive" : "default"}>
              {booking.statusLabel}
            </Badge>
            <Badge variant="outline">Ref {booking.publicReference}</Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{booking.customerName}&rsquo;s trip</CardTitle>
              <CardDescription>
                Shared by Pro Limo dispatch. This page updates as the trip progresses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <div className="font-medium">{route || "Route TBD"}</div>
                  {booking.airportTrip ? (
                    <div className="text-muted-foreground">Airport: {booking.airportTrip}</div>
                  ) : null}
                  {booking.flightNumber ? (
                    <div className="text-muted-foreground">Flight: {booking.flightNumber}</div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {booking.pickupDate} &middot; {booking.pickupTime}
                  </div>
                  {booking.duration ? (
                    <div className="text-muted-foreground">Duration: {booking.duration}</div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <div className="font-medium">{booking.passengerCount} passenger{booking.passengerCount === 1 ? "" : "s"}</div>
                </div>
              </div>

              {booking.assignedChauffeurName || booking.vehicleLabel ? (
                <div className="flex items-start gap-3">
                  <CarFront className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    {booking.assignedChauffeurName ? (
                      <div className="font-medium">Chauffeur: {booking.assignedChauffeurName}</div>
                    ) : null}
                    {booking.vehicleLabel ? (
                      <div className="text-muted-foreground">Vehicle: {booking.vehicleLabel}</div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
