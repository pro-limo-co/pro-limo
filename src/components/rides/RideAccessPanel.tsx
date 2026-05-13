"use client";

import { CheckCircle2, Mail, MapPin, Navigation, Phone, UserRound, XCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const rideStatuses = [
  { value: "driver_en_route", label: "On the way" },
  { value: "in_progress", label: "Passenger onboard" },
  { value: "completed", label: "Completed" },
] as const;

type RideStatus = (typeof rideStatuses)[number]["value"];

export function RideAccessPanel({ token }: { token: string }) {
  const ride = useQuery(api.handoffs.getByToken, { token });
  const respond = useMutation(api.handoffs.respond);
  const updateRideStatus = useMutation(api.handoffs.updateRideStatus);
  const [pending, setPending] = useState("");
  const [message, setMessage] = useState("");

  if (ride === undefined) {
    return <RideShell title="Loading ride" />;
  }

  if (!ride) {
    return (
      <RideShell title="Ride link unavailable">
        <Card>
          <CardContent className="pt-6">
            This ride link is expired or was entered incorrectly.
          </CardContent>
        </Card>
      </RideShell>
    );
  }

  const { booking, handoff } = ride;
  const route = [booking.pickupLocation, booking.dropoffLocation ?? booking.duration]
    .filter(Boolean)
    .join(" -> ");
  const accepted = handoff.status === "accepted" || handoff.status === "completed";
  const closed = handoff.status === "declined" || handoff.status === "completed" || booking.status === "completed";

  async function answer(response: "accepted" | "declined") {
    setPending(response);
    setMessage("");
    try {
      await respond({ token, response });
      setMessage(response === "accepted" ? "Ride accepted" : "Ride declined");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update ride");
    } finally {
      setPending("");
    }
  }

  async function updateStatus(status: RideStatus) {
    setPending(status);
    setMessage("");
    try {
      await updateRideStatus({ token, status });
      setMessage(`Ride marked ${formatStatus(status)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update ride");
    } finally {
      setPending("");
    }
  }

  return (
    <RideShell title={booking.publicReference}>
      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{formatStatus(booking.status)}</Badge>
              <Badge variant="outline">{formatStatus(handoff.status)}</Badge>
            </div>
            <CardTitle className="pt-2">{booking.customerName}</CardTitle>
            <CardDescription>{booking.pickupDate} at {booking.pickupTime}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">Route</p>
                  <p className="mt-1 text-base font-medium">{route}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <RideFact icon={<UserRound className="size-4" />} label="Passengers" value={`${booking.passengerCount} passengers`} />
              <RideFact label="Luggage" value={booking.luggage} />
              {booking.vehicleLabel && <RideFact label="Vehicle" value={booking.vehicleLabel} />}
              {booking.flightNumber && <RideFact label="Flight" value={booking.flightNumber} />}
            </div>

            {(booking.notes || booking.dispatchNotes || handoff.message) && (
              <div className="rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground">
                {[booking.notes, booking.dispatchNotes, handoff.message].filter(Boolean).join(" ")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Driver actions</CardTitle>
            <CardDescription>Update dispatch from this ride link.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              type="button"
              disabled={Boolean(pending) || accepted}
              onClick={() => void answer("accepted")}
            >
              <CheckCircle2 className="size-4" aria-hidden />
              {pending === "accepted" ? "Accepting" : "Accept ride"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(pending) || accepted || closed}
              onClick={() => void answer("declined")}
            >
              <XCircle className="size-4" aria-hidden />
              {pending === "declined" ? "Declining" : "Decline"}
            </Button>
            <div className="my-2 h-px bg-border" />
            {rideStatuses.map((status) => (
              <Button
                key={status.value}
                type="button"
                variant={booking.status === status.value ? "default" : "outline"}
                disabled={Boolean(pending) || closed || booking.status === status.value}
                onClick={() => void updateStatus(status.value)}
              >
                <Navigation className="size-4" aria-hidden />
                {pending === status.value ? "Saving" : status.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
          <Button asChild variant="outline">
            <a href={`tel:${booking.customerPhone}`}>
              <Phone className="size-4" aria-hidden />
              {booking.customerPhone}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={`mailto:${booking.customerEmail}`}>
              <Mail className="size-4" aria-hidden />
              {booking.customerEmail}
            </a>
          </Button>
        </CardContent>
      </Card>

      {message && (
        <p className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900" aria-live="polite">
          {message}
        </p>
      )}
    </RideShell>
  );
}

function RideShell({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="pld-ui min-h-[100svh] bg-background px-6 pt-32 pb-20 text-foreground lg:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">Ride access</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function RideFact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}
