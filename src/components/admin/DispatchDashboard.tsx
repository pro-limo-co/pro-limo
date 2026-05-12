"use client";

import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useMemo, useReducer, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { authClient } from "@/lib/auth-client";

const statuses = [
  "new",
  "quoted",
  "assigned",
  "driver_en_route",
  "in_progress",
  "completed",
  "canceled",
] as const;

type Status = (typeof statuses)[number];
type Booking = FunctionReturnType<typeof api.bookings.listForDispatch>[number];
type DispatchDraft = {
  status: Status;
  quote: string;
  driver: string;
  vehicle: string;
  notes: string;
  staffNote: string;
};
type DispatchDraftAction =
  | { type: "status"; value: Status }
  | { type: "quote" | "driver" | "vehicle" | "notes" | "staffNote"; value: string }
  | { type: "clearStaffNote" };

export function DispatchDashboard() {
  const [status, setStatus] = useState<Status | "all">("new");
  const viewer = useQuery(api.auth.getViewer);
  const claimStaffAccess = useMutation(api.auth.claimStaffAccess);
  const bookings = useQuery(api.bookings.listForDispatch, {
    status: status === "all" ? undefined : status,
    limit: 80,
  });
  const session = authClient.useSession();

  if (viewer === undefined || session.isPending) {
    return <DispatchShell title="Loading dispatch" />;
  }

  if (!viewer.identity) {
    return (
      <DispatchShell title="Dispatch sign in">
        <p className="mt-4 max-w-xl text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
          Staff sign in is required before booking, quote, assignment, and payment tools are available.
        </p>
        <Link href="/auth/sign-in?next=/admin/dispatch" className="btn btn-primary mt-8">
          Sign in
        </Link>
      </DispatchShell>
    );
  }

  if (!viewer.staff) {
    return (
      <DispatchShell title="Claim staff access" showSignOut>
        <p className="mt-4 max-w-xl text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
          Signed in as {viewer.identity.email}. Claiming access is limited to emails listed in DISPATCH_ADMIN_EMAILS.
        </p>
        <button type="button" className="btn btn-primary mt-8" onClick={() => void claimStaffAccess({})}>
          Claim access
        </button>
      </DispatchShell>
    );
  }

  return (
    <DispatchShell title="Dispatch" showSignOut>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <FilterButton label="All" active={status === "all"} onClick={() => setStatus("all")} />
        {statuses.map((item) => (
          <FilterButton
            key={item}
            label={formatStatus(item)}
            active={status === item}
            onClick={() => setStatus(item)}
          />
        ))}
      </div>

      <div className="mt-8 overflow-hidden border border-[color:var(--color-divider-soft)]">
        <div className="grid grid-cols-[1fr_0.8fr_0.8fr_1fr] gap-px bg-[color:var(--color-divider-soft)] max-lg:hidden">
          {["Booking", "Trip", "Dispatch", "Payment"].map((header) => (
            <div key={header} className="bg-[color:var(--color-ink-soft)] px-5 py-3 font-condensed text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
              {header}
            </div>
          ))}
        </div>

        <div className="divide-y divide-[color:var(--color-divider-soft)]">
          {bookings === undefined ? (
            <div className="p-6 text-[color:var(--color-bone-dim)]">Loading bookings</div>
          ) : bookings.length === 0 ? (
            <div className="p-6 text-[color:var(--color-bone-dim)]">No bookings in this view</div>
          ) : (
            bookings.map((booking) => <DispatchBookingRow key={booking._id} booking={booking} />)
          )}
        </div>
      </div>
    </DispatchShell>
  );
}

function DispatchBookingRow({ booking }: { booking: Booking }) {
  const updateDispatch = useMutation(api.bookings.updateDispatch);
  const addNote = useMutation(api.bookings.addNote);
  const createCheckoutSession = useAction(api.payments.createCheckoutSession);
  const [draft, dispatchDraft] = useReducer(dispatchDraftReducer, booking, createDispatchDraft);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const summary = useMemo(() => {
    const parts = [booking.pickupLocation];
    if (booking.dropoffLocation) parts.push(booking.dropoffLocation);
    if (booking.duration) parts.push(booking.duration);
    return parts.join(" → ");
  }, [booking.dropoffLocation, booking.duration, booking.pickupLocation]);

  async function saveDispatch() {
    setPending(true);
    setMessage("");
    const quotedAmountCents = draft.quote ? Math.round(Number.parseFloat(draft.quote) * 100) : undefined;
    await updateDispatch({
      bookingId: booking._id,
      status: draft.status,
      quotedAmountCents: Number.isFinite(quotedAmountCents) ? quotedAmountCents : undefined,
      assignedChauffeurName: emptyToUndefined(draft.driver),
      vehicleLabel: emptyToUndefined(draft.vehicle),
      dispatchNotes: emptyToUndefined(draft.notes),
    });
    setPending(false);
    setMessage("Saved");
  }

  async function saveNote() {
    const note = draft.staffNote.trim();
    if (!note) return;
    await addNote({ bookingId: booking._id, note });
    dispatchDraft({ type: "clearStaffNote" });
    setMessage("Note added");
  }

  async function openCheckout() {
    setPending(true);
    setMessage("");
    const result = await createCheckoutSession({
      bookingId: booking._id,
      successPath: `/booking/${booking.publicReference}`,
      cancelPath: `/admin/dispatch`,
    });
    setPending(false);
    if (result.checkoutUrl) {
      window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
      setMessage("Checkout opened");
      return;
    }
    setMessage(result.status === "quote_required" ? "Add a quote first" : "Stripe is not configured");
  }

  return (
    <article className="grid grid-cols-1 gap-px bg-[color:var(--color-divider-soft)] lg:grid-cols-[1fr_0.8fr_0.8fr_1fr]">
      <section className="bg-[color:var(--color-ink)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[0.72rem] tracking-[0.18em] uppercase text-[color:var(--color-champagne)]">
              {booking.publicReference}
            </p>
            <h2 className="mt-2 font-display text-[1.55rem] leading-tight">
              {booking.customerName}
            </h2>
            <p className="mt-2 text-[0.85rem] text-[color:var(--color-bone-dim)]">
              {booking.customerEmail} · {booking.customerPhone}
            </p>
          </div>
          <span className="rounded-full border border-[color:var(--color-divider)] px-3 py-1 font-condensed text-[0.65rem] tracking-[0.16em] uppercase text-[color:var(--color-bone-dim)]">
            {formatStatus(booking.status)}
          </span>
        </div>
      </section>

      <section className="bg-[color:var(--color-ink)] p-5">
        <p className="font-condensed text-[0.68rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
          {booking.pickupDate} · {booking.pickupTime}
        </p>
        <p className="mt-3 text-[0.92rem] leading-[1.6] text-[color:var(--color-bone-dim)]">
          {summary}
        </p>
        <p className="mt-3 text-[0.82rem] text-[color:var(--color-pewter)]">
          {booking.passengerCount} pax · {booking.luggage}
        </p>
      </section>

      <section className="grid gap-3 bg-[color:var(--color-ink)] p-5">
        <CompactSelect value={draft.status} onChange={(value) => dispatchDraft({ type: "status", value })} />
        <CompactInput label="Quote USD" value={draft.quote} onChange={(value) => dispatchDraft({ type: "quote", value })} inputMode="decimal" />
        <CompactInput label="Chauffeur" value={draft.driver} onChange={(value) => dispatchDraft({ type: "driver", value })} />
        <CompactInput label="Vehicle" value={draft.vehicle} onChange={(value) => dispatchDraft({ type: "vehicle", value })} />
      </section>

      <section className="bg-[color:var(--color-ink)] p-5">
        <textarea
          value={draft.notes}
          onChange={(event) => dispatchDraft({ type: "notes", value: event.target.value })}
          placeholder="Dispatch notes"
          className="field min-h-20 border-b border-[color:var(--color-divider)] pb-3 text-[0.9rem]"
        />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button type="button" disabled={pending} className="btn btn-primary !h-11 !px-4 !text-[0.68rem] disabled:opacity-60" onClick={() => void saveDispatch()}>
            Save
          </button>
          <button type="button" disabled={pending} className="btn btn-ghost !h-11 !px-4 !text-[0.68rem] disabled:opacity-60" onClick={() => void openCheckout()}>
            Payment link
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={draft.staffNote}
            onChange={(event) => dispatchDraft({ type: "staffNote", value: event.target.value })}
            placeholder="Internal note"
            className="field h-10 border-b border-[color:var(--color-divider)] text-[0.86rem]"
          />
          <button type="button" className="font-condensed text-[0.68rem] tracking-[0.16em] uppercase text-[color:var(--color-champagne-bright)]" onClick={() => void saveNote()}>
            Add
          </button>
        </div>
        {message && <p className="mt-3 text-[0.78rem] text-[color:var(--color-champagne-bright)]">{message}</p>}
      </section>
    </article>
  );
}

function DispatchShell({
  title,
  children,
  showSignOut = false,
}: {
  title: string;
  children?: React.ReactNode;
  showSignOut?: boolean;
}) {
  return (
    <section className="mx-auto max-w-[1500px] px-6 pt-32 pb-20 lg:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Professional Limousine Driver</p>
          <h1 className="display-md mt-5">{title}</h1>
        </div>
        {showSignOut && (
          <button
            type="button"
            className="btn btn-ghost self-start md:self-auto"
            onClick={async () => {
              await authClient.signOut();
              window.location.href = "/";
            }}
          >
            Sign out
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-10 rounded-full border px-4 font-condensed text-[0.68rem] tracking-[0.16em] uppercase transition-colors",
        active
          ? "border-[color:var(--color-bone)] bg-[color:var(--color-bone)] text-[color:var(--color-ink)]"
          : "border-[color:var(--color-divider)] text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-bone)]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function CompactInput({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: "decimal";
}) {
  return (
    <label>
      <span className="font-condensed text-[0.62rem] tracking-[0.18em] uppercase text-[color:var(--color-pewter)]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        className="field mt-1 h-9 border-b border-[color:var(--color-divider)] text-[0.88rem]"
      />
    </label>
  );
}

function CompactSelect({ value, onChange }: { value: Status; onChange: (value: Status) => void }) {
  return (
    <label>
      <span className="font-condensed text-[0.62rem] tracking-[0.18em] uppercase text-[color:var(--color-pewter)]">
        Status
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Status)}
        className="field mt-1 h-9 border-b border-[color:var(--color-divider)] bg-transparent text-[0.88rem]"
      >
        {statuses.map((status) => (
          <option key={status} value={status} className="bg-[color:var(--color-ink)]">
            {formatStatus(status)}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function createDispatchDraft(booking: Booking): DispatchDraft {
  return {
    status: booking.status,
    quote: booking.quotedAmountCents ? String(booking.quotedAmountCents / 100) : "",
    driver: booking.assignedChauffeurName ?? "",
    vehicle: booking.vehicleLabel ?? "",
    notes: booking.dispatchNotes ?? "",
    staffNote: "",
  };
}

function dispatchDraftReducer(state: DispatchDraft, action: DispatchDraftAction): DispatchDraft {
  if (action.type === "clearStaffNote") {
    return { ...state, staffNote: "" };
  }
  return {
    ...state,
    [action.type]: action.value,
  };
}
