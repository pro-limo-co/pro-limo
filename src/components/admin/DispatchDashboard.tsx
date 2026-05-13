"use client";

import type { FunctionReturnType } from "convex/server";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  Copy,
  CreditCard,
  ExternalLink,
  LogOut,
  Mail,
  Phone,
  Plus,
  Save,
  Send,
} from "lucide-react";
import Link from "next/link";
import { type Dispatch, type ReactNode, type SetStateAction, useMemo, useReducer, useState } from "react";
import { api } from "@convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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
type Handoff = FunctionReturnType<typeof api.handoffs.listForBooking>[number];
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
type HandoffChannel = "email" | "sms" | "copy";
type HandoffDraft = {
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  channel: HandoffChannel;
  message: string;
};
type HandoffResult = {
  rideUrl: string;
  message: string;
  recipientEmail?: string;
  recipientPhone?: string;
};

export function DispatchDashboard({
  title = "Dispatch",
}: {
  title?: string;
}) {
  const [status, setStatus] = useState<Status | "all">("all");
  const viewer = useQuery(api.auth.getViewer);
  const claimStaffAccess = useMutation(api.auth.claimStaffAccess);
  const bookings = useQuery(
    api.bookings.listForDispatch,
    viewer?.staff
      ? {
          status: status === "all" ? undefined : status,
          limit: 80,
        }
      : "skip",
  );
  const session = authClient.useSession();

  if (viewer === undefined || session.isPending) {
    return (
      <DispatchShell title="Loading dispatch">
        <Card className="mt-8">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Loading bookings and staff access.
          </CardContent>
        </Card>
      </DispatchShell>
    );
  }

  if (!viewer.identity) {
    return (
      <DispatchShell title="Dispatch sign in">
        <Card className="mt-8 max-w-xl">
          <CardHeader>
            <CardTitle>Staff access required</CardTitle>
            <CardDescription>
              Sign in before using booking, quote, assignment, and driver handoff tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/auth/sign-in?next=/admin/dispatch">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </DispatchShell>
    );
  }

  if (!viewer.staff) {
    return (
      <DispatchShell title="Claim staff access" showSignOut>
        <Card className="mt-8 max-w-xl">
          <CardHeader>
            <CardTitle>Signed in as {viewer.identity.email}</CardTitle>
            <CardDescription>
              Claim access with an email listed in DISPATCH_ADMIN_EMAILS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" size="lg" onClick={() => void claimStaffAccess({})}>
              Claim access
            </Button>
          </CardContent>
        </Card>
      </DispatchShell>
    );
  }

  return (
    <DispatchShell title={title} showSignOut>
      <div className="mt-6 flex flex-wrap items-center gap-2">
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

      <div className="mt-6 grid gap-4">
        {bookings === undefined ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Loading bookings.
            </CardContent>
          </Card>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No bookings in this view.
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => <DispatchBookingRow key={booking._id} booking={booking} />)
        )}
      </div>
    </DispatchShell>
  );
}

function DispatchBookingRow({ booking }: { booking: Booking }) {
  const updateDispatch = useMutation(api.bookings.updateDispatch);
  const addNote = useMutation(api.bookings.addNote);
  const createHandoff = useMutation(api.handoffs.create);
  const createCheckoutSession = useAction(api.payments.createCheckoutSession);
  const handoffs = useQuery(api.handoffs.listForBooking, { bookingId: booking._id });
  const [draft, dispatchDraft] = useReducer(dispatchDraftReducer, booking, createDispatchDraft);
  const [handoffDraft, setHandoffDraft] = useState<HandoffDraft>(() => createHandoffDraft(booking));
  const [handoffResult, setHandoffResult] = useState<HandoffResult | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const routeSummary = useMemo(() => {
    const parts = [booking.pickupLocation];
    if (booking.dropoffLocation) parts.push(booking.dropoffLocation);
    if (booking.duration) parts.push(booking.duration);
    return parts.join(" -> ");
  }, [booking.dropoffLocation, booking.duration, booking.pickupLocation]);

  async function saveDispatch() {
    setPending(true);
    setMessage("");
    try {
      const quotedAmountCents = draft.quote ? Math.round(Number.parseFloat(draft.quote) * 100) : undefined;
      const validQuote =
        typeof quotedAmountCents === "number" && Number.isFinite(quotedAmountCents)
          ? quotedAmountCents
          : undefined;
      await updateDispatch({
        bookingId: booking._id,
        status: draft.status,
        quotedAmountCents: validQuote,
        assignedChauffeurName: emptyToUndefined(draft.driver),
        vehicleLabel: emptyToUndefined(draft.vehicle),
        dispatchNotes: emptyToUndefined(draft.notes),
      });
      setMessage("Dispatch saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save dispatch.");
    } finally {
      setPending(false);
    }
  }

  async function saveNote() {
    const note = draft.staffNote.trim();
    if (!note) return;
    setMessage("");
    try {
      await addNote({ bookingId: booking._id, note });
      dispatchDraft({ type: "clearStaffNote" });
      setMessage("Note added.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add note.");
    }
  }

  async function openCheckout() {
    setPending(true);
    setMessage("");
    try {
      const result = await createCheckoutSession({
        bookingId: booking._id,
        successPath: `/booking/${booking.publicReference}`,
        cancelPath: "/admin/dispatch",
      });
      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
        setMessage("Checkout opened.");
        return;
      }
      setMessage(result.status === "quote_required" ? "Add a quote first." : "Stripe is not configured.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create payment link.");
    } finally {
      setPending(false);
    }
  }

  async function prepareHandoff() {
    setPending(true);
    setMessage("");
    setHandoffResult(null);
    try {
      const result = await createHandoff({
        bookingId: booking._id,
        recipientName: handoffDraft.recipientName,
        recipientEmail: emptyToUndefined(handoffDraft.recipientEmail),
        recipientPhone: emptyToUndefined(handoffDraft.recipientPhone),
        channel: handoffDraft.channel,
        message: emptyToUndefined(handoffDraft.message),
      });
      const rideUrl = new URL(result.routePath, window.location.origin).toString();
      setHandoffResult({
        rideUrl,
        message: buildHandoffMessage(booking, rideUrl, handoffDraft.message),
        recipientEmail: emptyToUndefined(handoffDraft.recipientEmail),
        recipientPhone: emptyToUndefined(handoffDraft.recipientPhone),
      });
      setMessage("Driver ride link ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create ride link.");
    } finally {
      setPending(false);
    }
  }

  const latestHandoffs = handoffs?.slice(0, 2) ?? [];

  return (
    <Card className="overflow-hidden">
      <DispatchBookingHeader booking={booking} />

      <CardContent className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr_1.1fr]">
        <BookingDetailsSection booking={booking} routeSummary={routeSummary} />
        <DispatchEditorSection
          booking={booking}
          dispatchDraft={dispatchDraft}
          draft={draft}
          onOpenCheckout={openCheckout}
          onSaveDispatch={saveDispatch}
          onSaveNote={saveNote}
          pending={pending}
        />
        <DriverLinkSection
          booking={booking}
          handoffDraft={handoffDraft}
          handoffResult={handoffResult}
          handoffs={latestHandoffs}
          message={message}
          onPrepareHandoff={prepareHandoff}
          pending={pending}
          setHandoffDraft={setHandoffDraft}
        />
      </CardContent>
    </Card>
  );
}

function DispatchBookingHeader({ booking }: { booking: Booking }) {
  return (
    <CardHeader className="border-b bg-muted/30">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={booking.status === "canceled" ? "destructive" : "secondary"}>
              {formatStatus(booking.status)}
            </Badge>
            <span className="font-mono text-xs font-medium text-muted-foreground">
              {booking.publicReference}
            </span>
          </div>
          <CardTitle className="mt-3 text-2xl">{booking.customerName}</CardTitle>
          <CardDescription className="mt-2">
            {booking.customerEmail} / {booking.customerPhone}
          </CardDescription>
        </div>
        <div className="rounded-md border bg-background px-4 py-3 text-sm">
          <p className="font-medium text-foreground">{booking.pickupDate} at {booking.pickupTime}</p>
          <p className="mt-1 text-muted-foreground">{booking.passengerCount} passengers / {booking.luggage}</p>
        </div>
      </div>
    </CardHeader>
  );
}

function BookingDetailsSection({
  booking,
  routeSummary,
}: {
  booking: Booking;
  routeSummary: string;
}) {
  return (
    <section className="grid content-start gap-4">
      <SectionHeading title="Booking" description={routeSummary} />
      <InfoRow label="Mode" value={booking.bookingMode} />
      {booking.flightNumber && <InfoRow label="Flight" value={booking.flightNumber} />}
      {booking.notes && <InfoBlock label="Passenger notes">{booking.notes}</InfoBlock>}
    </section>
  );
}

function DispatchEditorSection({
  booking,
  dispatchDraft,
  draft,
  onOpenCheckout,
  onSaveDispatch,
  onSaveNote,
  pending,
}: {
  booking: Booking;
  dispatchDraft: (action: DispatchDraftAction) => void;
  draft: DispatchDraft;
  onOpenCheckout: () => Promise<void>;
  onSaveDispatch: () => Promise<void>;
  onSaveNote: () => Promise<void>;
  pending: boolean;
}) {
  return (
    <section className="grid content-start gap-4">
      <SectionHeading title="Dispatch" description="Set quote, driver, vehicle, and status." />
      <StatusSelect
        id={`status-${booking._id}`}
        value={draft.status}
        onChange={(value) => dispatchDraft({ type: "status", value })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id={`quote-${booking._id}`}
          label="Quote USD"
          value={draft.quote}
          onChange={(value) => dispatchDraft({ type: "quote", value })}
          inputMode="decimal"
        />
        <TextField
          id={`vehicle-${booking._id}`}
          label="Vehicle"
          value={draft.vehicle}
          onChange={(value) => dispatchDraft({ type: "vehicle", value })}
          placeholder="Escalade"
        />
      </div>
      <TextField
        id={`driver-${booking._id}`}
        label="Chauffeur"
        value={draft.driver}
        onChange={(value) => dispatchDraft({ type: "driver", value })}
        placeholder="Driver name"
      />
      <div>
        <Label htmlFor={`notes-${booking._id}`}>Dispatch notes</Label>
        <Textarea
          id={`notes-${booking._id}`}
          value={draft.notes}
          onChange={(event) => dispatchDraft({ type: "notes", value: event.target.value })}
          placeholder="Internal dispatch notes"
          className="mt-2 min-h-24"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" disabled={pending} onClick={() => void onSaveDispatch()}>
          <Save className="size-4" aria-hidden />
          Save
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={() => void onOpenCheckout()}>
          <CreditCard className="size-4" aria-hidden />
          Payment link
        </Button>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`staff-note-${booking._id}`}>Internal note</Label>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            id={`staff-note-${booking._id}`}
            value={draft.staffNote}
            onChange={(event) => dispatchDraft({ type: "staffNote", value: event.target.value })}
            placeholder="Add note"
          />
          <Button type="button" variant="secondary" onClick={() => void onSaveNote()}>
            <Plus className="size-4" aria-hidden />
            Add
          </Button>
        </div>
      </div>
    </section>
  );
}

function DriverLinkSection({
  booking,
  handoffDraft,
  handoffResult,
  handoffs,
  message,
  onPrepareHandoff,
  pending,
  setHandoffDraft,
}: {
  booking: Booking;
  handoffDraft: HandoffDraft;
  handoffResult: HandoffResult | null;
  handoffs: Handoff[];
  message: string;
  onPrepareHandoff: () => Promise<void>;
  pending: boolean;
  setHandoffDraft: Dispatch<SetStateAction<HandoffDraft>>;
}) {
  return (
    <section className="grid content-start gap-4">
      <SectionHeading title="Driver link" description="Create the link the driver opens for ride status updates." />
      <TextField
        id={`handoff-recipient-${booking._id}`}
        label="Recipient"
        value={handoffDraft.recipientName}
        onChange={(value) => setHandoffDraft((current) => ({ ...current, recipientName: value }))}
        placeholder="Driver name"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id={`handoff-email-${booking._id}`}
          label="Email"
          type="email"
          value={handoffDraft.recipientEmail}
          onChange={(value) => setHandoffDraft((current) => ({ ...current, recipientEmail: value }))}
          placeholder="driver@example.com"
        />
        <TextField
          id={`handoff-phone-${booking._id}`}
          label="Phone"
          type="tel"
          value={handoffDraft.recipientPhone}
          onChange={(value) => setHandoffDraft((current) => ({ ...current, recipientPhone: value }))}
          placeholder="+1 503 555 0100"
        />
      </div>
      <DriverLinkControls
        booking={booking}
        handoffDraft={handoffDraft}
        handoffResult={handoffResult}
        handoffs={handoffs}
        message={message}
        onPrepareHandoff={onPrepareHandoff}
        pending={pending}
        setHandoffDraft={setHandoffDraft}
      />
    </section>
  );
}

function DriverLinkControls({
  booking,
  handoffDraft,
  handoffResult,
  handoffs,
  message,
  onPrepareHandoff,
  pending,
  setHandoffDraft,
}: {
  booking: Booking;
  handoffDraft: HandoffDraft;
  handoffResult: HandoffResult | null;
  handoffs: Handoff[];
  message: string;
  onPrepareHandoff: () => Promise<void>;
  pending: boolean;
  setHandoffDraft: Dispatch<SetStateAction<HandoffDraft>>;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[0.9fr_1fr]">
        <ChannelSelect
          id={`handoff-channel-${booking._id}`}
          value={handoffDraft.channel}
          onChange={(value) => setHandoffDraft((current) => ({ ...current, channel: value }))}
        />
        <Button type="button" disabled={pending} onClick={() => void onPrepareHandoff()}>
          <Send className="size-4" aria-hidden />
          Prepare link
        </Button>
      </div>
      <div>
        <Label htmlFor={`handoff-message-${booking._id}`}>Driver note</Label>
        <Textarea
          id={`handoff-message-${booking._id}`}
          value={handoffDraft.message}
          onChange={(event) => setHandoffDraft((current) => ({ ...current, message: event.target.value }))}
          placeholder="Optional pickup instructions"
          className="mt-2 min-h-20"
        />
      </div>
      {handoffResult && (
        <RideLinkActions
          booking={booking}
          email={handoffResult.recipientEmail}
          message={handoffResult.message}
          phone={handoffResult.recipientPhone}
          rideUrl={handoffResult.rideUrl}
        />
      )}
      <RecentHandoffs booking={booking} excludedRideUrl={handoffResult?.rideUrl} handoffs={handoffs} />
      {message && (
        <p className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground" aria-live="polite">
          {message}
        </p>
      )}
    </>
  );
}

function RecentHandoffs({
  booking,
  excludedRideUrl,
  handoffs,
}: {
  booking: Booking;
  excludedRideUrl?: string;
  handoffs: Handoff[];
}) {
  const visibleHandoffs = handoffs.filter((handoff) => getRideUrl(`/rides/${handoff.token}`) !== excludedRideUrl);
  if (visibleHandoffs.length === 0) return null;

  return (
    <div className="grid gap-3 rounded-md border bg-muted/30 p-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        Recent links
      </p>
      {visibleHandoffs.map((handoff) => {
        const rideUrl = getRideUrl(`/rides/${handoff.token}`);
        const handoffMessage = buildHandoffMessage(booking, rideUrl, handoff.message ?? "");
        return (
          <div key={handoff._id} className="grid gap-2 rounded-md bg-background p-3">
            <div className="flex items-center justify-between gap-3">
              <a href={rideUrl} className="truncate font-mono text-xs text-primary">
                {rideUrl}
              </a>
              <Badge variant="outline">{formatStatus(handoff.status)}</Badge>
            </div>
            <RideLinkActions
              booking={booking}
              compact
              email={handoff.recipientEmail}
              message={handoffMessage}
              phone={handoff.recipientPhone}
              rideUrl={rideUrl}
            />
          </div>
        );
      })}
    </div>
  );
}

function DispatchShell({
  title,
  children,
  showSignOut = false,
}: {
  title: string;
  children?: ReactNode;
  showSignOut?: boolean;
}) {
  return (
    <section className="pld-ui min-h-[100svh] bg-background text-foreground">
      <div className="mx-auto max-w-[1500px] px-6 pt-28 pb-16 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              ProLimo OS
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-normal text-foreground">
              {title}
            </h1>
          </div>
          {showSignOut && (
            <Button
              type="button"
              variant="outline"
              className="self-start md:self-auto"
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/";
              }}
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </Button>
          )}
        </div>
        {children}
      </div>
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
    <Button type="button" variant={active ? "default" : "outline"} size="sm" onClick={onClick}>
      {label}
    </Button>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{formatStatus(value)}</p>
    </div>
  );
}

function InfoBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{children}</p>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  inputMode,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: "decimal";
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        placeholder={placeholder}
        className="mt-2"
      />
    </div>
  );
}

function StatusSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: Status;
  onChange: (value: Status) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>Status</Label>
      <Select value={value} onValueChange={(next) => onChange(next as Status)}>
        <SelectTrigger id={id} className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="pld-ui">
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {formatStatus(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ChannelSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: HandoffChannel;
  onChange: (value: HandoffChannel) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>Send by</Label>
      <Select value={value} onValueChange={(next) => onChange(next as HandoffChannel)}>
        <SelectTrigger id={id} className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="pld-ui">
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="sms">Text</SelectItem>
          <SelectItem value="copy">Copy</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function RideLinkActions({
  booking,
  compact = false,
  email,
  message,
  phone,
  rideUrl,
}: {
  booking: Booking;
  compact?: boolean;
  email?: string;
  message: string;
  phone?: string;
  rideUrl: string;
}) {
  return (
    <div className="grid gap-2">
      {!compact && (
        <a href={rideUrl} className="truncate rounded-md border bg-background px-3 py-2 font-mono text-xs text-primary">
          {rideUrl}
        </a>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button asChild variant="outline" size="sm">
          <a href={rideUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" aria-hidden />
            Open
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={cn(!email && "pointer-events-none opacity-50")}
        >
          <a href={email ? buildMailto(email, booking, message) : undefined} aria-disabled={!email}>
            <Mail className="size-4" aria-hidden />
            Email
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={cn(!phone && "pointer-events-none opacity-50")}
        >
          <a href={phone ? buildSms(phone, message) : undefined} aria-disabled={!phone}>
            <Phone className="size-4" aria-hidden />
            Text
          </a>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(rideUrl)}>
          <Copy className="size-4" aria-hidden />
          Copy
        </Button>
      </div>
    </div>
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

function createHandoffDraft(booking: Booking): HandoffDraft {
  return {
    recipientName: booking.assignedChauffeurName ?? "",
    recipientEmail: "",
    recipientPhone: "",
    channel: "email",
    message: "",
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

function buildHandoffMessage(booking: Booking, rideUrl: string, note: string) {
  const route = [booking.pickupLocation, booking.dropoffLocation ?? booking.duration]
    .filter(Boolean)
    .join(" to ");
  return [
    `Professional Limousine Driver ride ${booking.publicReference}`,
    `${booking.pickupDate} at ${booking.pickupTime}`,
    route,
    note.trim(),
    `Open ride: ${rideUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMailto(email: string, booking: Booking, body: string) {
  const subject = `Ride ${booking.publicReference}`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildSms(phone: string, body: string) {
  return `sms:${encodeURIComponent(phone)}?&body=${encodeURIComponent(body)}`;
}

function getRideUrl(routePath: string) {
  if (typeof window === "undefined") return routePath;
  return new URL(routePath, window.location.origin).toString();
}
