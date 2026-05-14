"use client";

import { CheckCircle2, Mail, MapPin, Navigation, Phone, UserRound, XCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatStatus } from "@/lib/status";

const rideStatuses = [
  { value: "driver_en_route", label: "Driver on the way" },
  { value: "arrived", label: "Driver arrived" },
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
    .join(" to ");
  const canceled = booking.status === "canceled";
  const closed =
    canceled ||
    booking.status === "completed" ||
    handoff.status === "declined" ||
    handoff.status === "completed";
  const nextRideStatus = getNextRideStatus(booking.status, handoff.status);
  const actionHint = getActionHint(booking.status, handoff.status, nextRideStatus);
  const terminalAction = getTerminalActionLabel(booking.status, handoff.status);
  const showHandoffBadge = !canceled && handoff.status !== booking.status;

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
              <Badge variant={canceled ? "destructive" : "default"}>
                {formatStatus(booking.status)}
              </Badge>
              {showHandoffBadge && <Badge variant="outline">{formatStatus(handoff.status)}</Badge>}
            </div>
            <CardTitle className="break-words pt-2 [overflow-wrap:anywhere]">
              {booking.customerName}
            </CardTitle>
            <CardDescription>{booking.pickupDate} at {booking.pickupTime}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">Route</p>
                  <p className="mt-1 break-words text-base font-medium [overflow-wrap:anywhere]">
                    {route}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <RideFact icon={<UserRound className="size-4" />} label="Passengers" value={formatPassengerCount(booking.passengerCount)} />
              <RideFact label="Luggage" value={booking.luggage} />
              {booking.vehicleLabel && <RideFact label="Vehicle" value={booking.vehicleLabel} />}
              {booking.flightNumber && <RideFact label="Flight" value={booking.flightNumber} />}
            </div>

            {(booking.notes || booking.dispatchNotes || handoff.message) && (
              <div className="break-words rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
                {[booking.notes, booking.dispatchNotes, handoff.message].filter(Boolean).join(" ")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="order-first lg:order-none">
          <CardHeader>
            <CardTitle className="text-lg">Driver actions</CardTitle>
            <CardDescription>Update dispatch from this ride link.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {actionHint}
            </p>
            {handoff.status === "sent" && (
              <div className="grid gap-3">
                <Button
                  type="button"
                  disabled={Boolean(pending) || closed}
                  onClick={() => void answer("accepted")}
                >
                  <CheckCircle2 className="size-4" aria-hidden />
                  {pending === "accepted" ? "Accepting" : "Accept ride"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={Boolean(pending) || closed}
                  onClick={() => void answer("declined")}
                >
                  <XCircle className="size-4" aria-hidden />
                  {pending === "declined" ? "Declining" : "Decline ride"}
                </Button>
              </div>
            )}
            {nextRideStatus && (
              <Button
                type="button"
                disabled={Boolean(pending) || closed}
                onClick={() => void updateStatus(nextRideStatus)}
              >
                <Navigation className="size-4" aria-hidden />
                {pending === nextRideStatus ? "Saving" : getRideStatusActionLabel(nextRideStatus)}
              </Button>
            )}
            {terminalAction && (
              <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium text-foreground">
                {canceled || handoff.status === "declined" ? (
                  <XCircle className="size-4 text-destructive" aria-hidden />
                ) : (
                  <CheckCircle2 className="size-4 text-primary" aria-hidden />
                )}
                {terminalAction}
              </div>
            )}
            {!canceled && (
              <div className="grid gap-2 border-t pt-3">
                {rideStatuses.map((status) => (
                  <div
                    key={status.value}
                    className="flex items-center justify-between gap-3 text-sm text-muted-foreground"
                  >
                    <span>{status.label}</span>
                    <Badge variant={isRideStepReached(booking.status, status.value) ? "default" : "outline"}>
                      {isRideStepReached(booking.status, status.value) ? "Done" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
          <Button asChild variant="outline" className="min-w-0 justify-start whitespace-normal text-left">
            <a href={`tel:${booking.customerPhone}`}>
              <Phone className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">{booking.customerPhone}</span>
            </a>
          </Button>
          <Button asChild variant="outline" className="min-w-0 justify-start whitespace-normal text-left">
            <a href={`mailto:${booking.customerEmail}`}>
              <Mail className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">{booking.customerEmail}</span>
            </a>
          </Button>
        </CardContent>
      </Card>

      {message && (
        <p className="mt-4 rounded-md border bg-muted px-4 py-3 text-sm text-muted-foreground" aria-live="polite">
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
      <p className="mt-2 break-words text-sm font-medium [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}

function getNextRideStatus(
  bookingStatus: string,
  handoffStatus: string,
): RideStatus | null {
  if (handoffStatus !== "accepted") return null;

  if (bookingStatus === "assigned") return "driver_en_route";
  if (bookingStatus === "driver_en_route") return "arrived";
  if (bookingStatus === "arrived") return "in_progress";
  if (bookingStatus === "in_progress") return "completed";

  return null;
}

function getActionHint(
  bookingStatus: string,
  handoffStatus: string,
  nextRideStatus: RideStatus | null,
) {
  if (bookingStatus === "canceled") return "This ride was canceled by dispatch.";
  if (handoffStatus === "sent") return "Accept the ride to unlock live status updates.";
  if (handoffStatus === "declined") return "This ride was declined.";
  if (handoffStatus === "completed" || bookingStatus === "completed") return "This ride is completed.";
  if (!nextRideStatus) return "Dispatch controls are current. No driver update is available.";

  return `Next: ${getRideStatusHint(nextRideStatus)}.`;
}

function getTerminalActionLabel(bookingStatus: string, handoffStatus: string) {
  if (bookingStatus === "canceled") return "Ride canceled";
  if (handoffStatus === "declined") return "Ride declined";
  if (handoffStatus === "completed" || bookingStatus === "completed") return "Ride completed";
  if (handoffStatus === "accepted" && !getNextRideStatus(bookingStatus, handoffStatus)) {
    return "Ride accepted";
  }
  return null;
}

function getRideStatusActionLabel(status: RideStatus) {
  const labels: Record<RideStatus, string> = {
    arrived: "Mark driver arrived",
    completed: "Complete ride",
    driver_en_route: "Mark driver on the way",
    in_progress: "Mark passenger onboard",
  };

  return labels[status];
}

function getRideStatusHint(status: RideStatus) {
  const hints: Record<RideStatus, string> = {
    arrived: "mark driver arrived",
    completed: "complete the ride",
    driver_en_route: "mark driver on the way",
    in_progress: "mark passenger onboard",
  };

  return hints[status];
}

function isRideStepReached(bookingStatus: string, status: RideStatus) {
  const currentIndex = rideStatuses.findIndex((item) => item.value === bookingStatus);
  const stepIndex = rideStatuses.findIndex((item) => item.value === status);
  return currentIndex >= stepIndex && stepIndex >= 0;
}

function formatPassengerCount(count: number) {
  return `${count} ${count === 1 ? "passenger" : "passengers"}`;
}
