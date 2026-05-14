"use client";

import type { FunctionReturnType } from "convex/server";
import { useQuery } from "convex/react";
import { CalendarClock, CarFront, CreditCard, MapPin, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { api } from "@convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

const statusSteps = [
  { value: "new", label: "Request received" },
  { value: "quoted", label: "Dispatch reviewed" },
  { value: "assigned", label: "Chauffeur assigned" },
  { value: "driver_en_route", label: "Driver on the way" },
  { value: "arrived", label: "Driver arrived" },
  { value: "in_progress", label: "Passenger onboard" },
  { value: "completed", label: "Ride completed" },
] as const;

type Booking = NonNullable<FunctionReturnType<typeof api.bookings.getByReference>>;
type BookingStatus = Booking["status"];

export function BookingStatusPanel({ reference }: { reference: string }) {
  const booking = useQuery(api.bookings.getByReference, {
    publicReference: reference.toUpperCase(),
  });

  if (booking === undefined) {
    return (
      <StatusShell reference={reference}>
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Loading live booking status.
          </CardContent>
        </Card>
      </StatusShell>
    );
  }

  if (!booking) {
    return (
      <StatusShell reference={reference}>
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            This booking reference is unavailable.
          </CardContent>
        </Card>
      </StatusShell>
    );
  }

  const route = [booking.pickupLocation, booking.dropoffLocation ?? booking.duration]
    .filter(Boolean)
    .join(" to ");

  return (
    <StatusShell reference={booking.publicReference}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{formatStatus(booking.status)}</Badge>
        <Badge variant="outline">{formatPaymentStatus(booking.paymentStatus)}</Badge>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>{getStatusTitle(booking.status)}</CardTitle>
            <CardDescription>{getStatusDescription(booking)}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-2">
              {statusSteps.map((step) => (
                <StatusStep key={step.value} bookingStatus={booking.status} step={step} />
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <StatusFact
            icon={<CalendarClock className="size-4" />}
            label="Pickup"
            value={`${booking.pickupDate} at ${booking.pickupTime}`}
          />
          <StatusFact icon={<UserRound className="size-4" />} label="Passenger" value={booking.customerName} />
          <StatusFact icon={<UserRound className="size-4" />} label="Chauffeur" value={booking.assignedChauffeurName ?? "Dispatch assigning"} />
          {booking.vehicleLabel && (
            <StatusFact icon={<CarFront className="size-4" />} label="Vehicle" value={booking.vehicleLabel} />
          )}
          <StatusFact icon={<CreditCard className="size-4" />} label="Payment" value={formatPaymentStatus(booking.paymentStatus)} />
        </div>
      </div>

      <Card className="mt-5">
        <CardContent className="grid gap-4 pt-6">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">Route</p>
              <p className="mt-1 break-words text-base font-medium [overflow-wrap:anywhere]">{route}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatPassengerCount(booking.passengerCount)} / {booking.luggage}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">Book another ride</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/services">View services</Link>
        </Button>
      </div>
    </StatusShell>
  );
}

function StatusStep({
  bookingStatus,
  step,
}: {
  bookingStatus: BookingStatus;
  step: (typeof statusSteps)[number];
}) {
  const state = getStepState(bookingStatus, step.value);

  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm",
        state === "current" && "border-primary bg-primary/5 text-foreground",
        state === "done" && "bg-muted/40 text-muted-foreground",
      )}
    >
      <span className="font-medium">{step.label}</span>
      <Badge variant={state === "current" ? "default" : "outline"}>
        {formatStatus(state)}
      </Badge>
    </li>
  );
}

function StatusShell({
  children,
  reference,
}: {
  children: ReactNode;
  reference: string;
}) {
  return (
    <section className="mx-auto max-w-5xl">
      <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        Live booking status
      </p>
      <h1 className="mt-3 break-words text-4xl font-semibold tracking-normal [overflow-wrap:anywhere]">
        {reference.toUpperCase()}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        This page updates from ProLimo OS as dispatch and the driver move the ride forward.
      </p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function StatusFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="mt-2 break-words text-base font-medium text-foreground [overflow-wrap:anywhere]">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function getStatusTitle(status: BookingStatus) {
  if (status === "canceled") return "Ride canceled";
  if (status === "quoted") return "Quote ready";
  return statusSteps.find((step) => step.value === status)?.label ?? formatStatus(status);
}

function getStatusDescription(booking: Booking) {
  if (booking.status === "new") return "Dispatch has the request and is confirming availability.";
  if (booking.status === "quoted") return "Dispatch has reviewed the ride and is preparing final confirmation.";
  if (booking.status === "assigned") return "A chauffeur has been assigned to this ride.";
  if (booking.status === "driver_en_route") return "The chauffeur is on the way to pickup.";
  if (booking.status === "arrived") return "The chauffeur has arrived at pickup.";
  if (booking.status === "in_progress") return "The passenger is onboard.";
  if (booking.status === "completed") return "The ride is complete.";
  return "Dispatch has canceled this ride.";
}

function getStepState(current: BookingStatus, step: (typeof statusSteps)[number]["value"]) {
  if (current === "canceled") return "stopped";
  const currentIndex = statusSteps.findIndex((item) => item.value === current);
  const stepIndex = statusSteps.findIndex((item) => item.value === step);
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "current";
  return "pending";
}

function formatPaymentStatus(status: Booking["paymentStatus"]) {
  if (status === "not_started") return "Payment pending";
  if (status === "quote_required") return "Quote pending";
  return formatStatus(status);
}

function formatPassengerCount(count: number) {
  return `${count} ${count === 1 ? "passenger" : "passengers"}`;
}
