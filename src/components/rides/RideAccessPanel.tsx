"use client";

import { useMutation, useQuery } from "convex/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { api } from "@convex/_generated/api";

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
        <p className="mt-4 text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
          This ride link is expired or was entered incorrectly.
        </p>
      </RideShell>
    );
  }

  const { booking, handoff } = ride;
  const route = [booking.pickupLocation, booking.dropoffLocation ?? booking.duration]
    .filter(Boolean)
    .join(" → ");

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
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <StatusPill label={formatStatus(handoff.status)} />
        <StatusPill label={formatStatus(booking.status)} muted />
      </div>

      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[color:var(--color-divider-soft)] bg-[color:var(--color-divider-soft)] md:grid-cols-2">
        <RideFact label="Pickup" value={`${booking.pickupDate} · ${booking.pickupTime}`} />
        <RideFact label="Passenger" value={booking.customerName} />
        <RideFact label="Phone" value={booking.customerPhone} href={`tel:${booking.customerPhone}`} />
        <RideFact label="Email" value={booking.customerEmail} href={`mailto:${booking.customerEmail}`} />
      </div>

      <section className="mt-8 border-y border-[color:var(--color-divider-soft)] py-6">
        <p className="font-condensed text-[0.68rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
          Route
        </p>
        <p className="mt-3 text-[1rem] leading-[1.7] text-[color:var(--color-bone)]">{route}</p>
        <div className="mt-5 grid gap-3 text-[0.9rem] text-[color:var(--color-bone-dim)] sm:grid-cols-2">
          <p>{booking.passengerCount} passengers</p>
          <p>{booking.luggage}</p>
          {booking.flightNumber && <p>Flight {booking.flightNumber}</p>}
          {booking.vehicleLabel && <p>{booking.vehicleLabel}</p>}
        </div>
        {(booking.notes || booking.dispatchNotes || handoff.message) && (
          <p className="mt-5 text-[0.92rem] leading-[1.65] text-[color:var(--color-bone-dim)]">
            {[booking.notes, booking.dispatchNotes, handoff.message].filter(Boolean).join(" ")}
          </p>
        )}
      </section>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={Boolean(pending) || handoff.status === "accepted" || handoff.status === "completed"}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void answer("accepted")}
        >
          {pending === "accepted" ? "Accepting" : "Accept ride"}
        </button>
        <button
          type="button"
          disabled={Boolean(pending) || handoff.status === "declined" || handoff.status === "completed"}
          className="btn btn-ghost disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void answer("declined")}
        >
          {pending === "declined" ? "Declining" : "Decline"}
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {rideStatuses.map((status) => (
          <button
            key={status.value}
            type="button"
            disabled={Boolean(pending) || handoff.status === "declined"}
            className="h-12 border border-[color:var(--color-divider)] px-4 font-condensed text-[0.7rem] tracking-[0.16em] uppercase text-[color:var(--color-bone-dim)] transition-colors hover:text-[color:var(--color-bone)] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void updateStatus(status.value)}
          >
            {pending === status.value ? "Saving" : status.label}
          </button>
        ))}
      </div>

      {message && (
        <p className="mt-5 text-[0.86rem] text-[color:var(--color-champagne-bright)]" aria-live="polite">
          {message}
        </p>
      )}
    </RideShell>
  );
}

function RideShell({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-4xl px-6 pt-32 pb-20 lg:px-10">
      <p className="eyebrow">Ride access</p>
      <h1 className="display-md mt-5">{title}</h1>
      {children}
    </section>
  );
}

function RideFact({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <p className="mt-2 text-[1rem] text-[color:var(--color-bone)]">{value}</p>
  );

  return (
    <div className="bg-[color:var(--color-ink)] p-6">
      <p className="font-condensed text-[0.68rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
        {label}
      </p>
      {href ? (
        <a href={href} className="block transition-colors hover:text-[color:var(--color-champagne-bright)]">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

function StatusPill({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span
      className={[
        "rounded-full border px-3 py-1 font-condensed text-[0.65rem] tracking-[0.16em] uppercase",
        muted
          ? "border-[color:var(--color-divider)] text-[color:var(--color-bone-dim)]"
          : "border-[color:var(--color-champagne-dim)] text-[color:var(--color-champagne-bright)]",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}
