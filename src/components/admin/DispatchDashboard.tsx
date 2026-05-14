"use client";

import type { FunctionReturnType } from "convex/server";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  Calculator,
  ChevronDown,
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
import { type ReactNode, useEffect, useMemo, useReducer, useState } from "react";
import { api } from "@convex/_generated/api";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import {
  calculateRateQuote,
  formatMoneyFromCents,
  type RateProfileForCalculator,
} from "@/lib/rate-calculator";
import { formatStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

const statuses = [
  "new",
  "quoted",
  "assigned",
  "driver_en_route",
  "arrived",
  "in_progress",
  "completed",
  "canceled",
] as const;

const statusSet = new Set<string>(statuses);

const eventTimestampFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type Status = (typeof statuses)[number];
type StatusView = "active" | "all" | Status;
type Booking = FunctionReturnType<typeof api.bookings.listForDispatch>[number];
type Handoff = FunctionReturnType<typeof api.handoffs.listForBooking>[number];
type BookingEvent = FunctionReturnType<typeof api.bookings.listEvents>[number];
type RateProfile = FunctionReturnType<typeof api.rates.list>[number];
type DriverProfile = FunctionReturnType<typeof api.fleet.listDrivers>[number];
type VehicleProfile = FunctionReturnType<typeof api.fleet.listVehicles>[number];
type DispatchDraft = {
  status: Status;
  quote: string;
  driver: string;
  vehicle: string;
  notes: string;
  staffNote: string;
};
type DispatchDraftSync = Pick<DispatchDraft, "status" | "quote" | "driver" | "vehicle" | "notes">;
type DashboardStat = {
  label: string;
  value: string;
};
const EMPTY_DASHBOARD_STATS: DashboardStat[] = [];
type DispatchDraftAction =
  | { type: "status"; value: Status }
  | { type: "quote" | "driver" | "vehicle" | "notes" | "staffNote"; value: string }
  | { type: "clearStaffNote" }
  | { type: "syncBooking"; value: DispatchDraftSync };
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
type RowUiState = {
  expanded: boolean;
  handoffDraft: HandoffDraft;
  handoffResult: HandoffResult | null;
  message: string;
  pending: boolean;
};
type RowUiAction =
  | { type: "toggleExpanded" }
  | { type: "handoffDraft"; value: Partial<HandoffDraft> }
  | { type: "setMessage"; message: string }
  | { type: "setPending"; pending: boolean }
  | { type: "startHandoff" }
  | { type: "handoffSuccess"; result: HandoffResult }
  | { type: "handoffError"; message: string };
type RateQuoteDraft = {
  profileKey: string;
  distanceMiles: string;
  billableHours: string;
  extraStops: string;
  includeAirportFee: string;
  includeMeetAndGreet: string;
  includePeakSurcharge: string;
};
type RateQuoteDraftAction = {
  type: keyof RateQuoteDraft;
  value: string;
};
const UNASSIGNED_SELECT_VALUE = "__unassigned";
const CUSTOM_SELECT_VALUE = "__custom";

export function DispatchDashboard({
  title = "Staff queue",
}: {
  title?: string;
}) {
  const [status, setStatus] = useState<StatusView>("active");
  const [claimAccessMessage, setClaimAccessMessage] = useState("");
  const [claimAccessPending, setClaimAccessPending] = useState(false);
  const viewer = useQuery(api.auth.getViewer);
  const claimStaffAccess = useMutation(api.auth.claimStaffAccess);
  const rateProfiles = useQuery(api.rates.list, viewer?.staff ? {} : "skip");
  const driverProfiles = useQuery(api.fleet.listDrivers, viewer?.staff ? {} : "skip");
  const vehicleProfiles = useQuery(api.fleet.listVehicles, viewer?.staff ? {} : "skip");
  const bookings = useQuery(
    api.bookings.listForDispatch,
    viewer?.staff
      ? {
          status: isStatus(status) ? status : undefined,
          statusGroup: status === "active" ? "active" : undefined,
          limit: 80,
        }
      : "skip",
  );
  const session = authClient.useSession();

  async function handleClaimStaffAccess() {
    setClaimAccessPending(true);
    setClaimAccessMessage("");
    try {
      await claimStaffAccess({});
      setClaimAccessMessage("Staff access enabled. Loading the queue.");
    } catch (error) {
      setClaimAccessMessage(error instanceof Error ? error.message : "Could not claim staff access.");
    } finally {
      setClaimAccessPending(false);
    }
  }

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
          <CardContent className="grid gap-3">
            <Button type="button" size="lg" disabled={claimAccessPending} onClick={() => void handleClaimStaffAccess()}>
              {claimAccessPending ? "Checking access" : "Claim access"}
            </Button>
            {claimAccessMessage && (
              <Alert aria-live="polite" role="status">
                {claimAccessMessage}
              </Alert>
            )}
          </CardContent>
        </Card>
      </DispatchShell>
    );
  }

  const visibleBookingCount = bookings?.length;
  const queueLabel = getQueueLabel(status);
  const fleetLabel = getFleetLabel(driverProfiles, vehicleProfiles);

  return (
    <DispatchShell
      title={title}
      showSignOut
      stats={[
        { label: "Queue", value: queueLabel },
        { label: "Visible rides", value: visibleBookingCount === undefined ? "Loading" : String(visibleBookingCount) },
        { label: "Fleet", value: fleetLabel },
      ]}
    >
      <div className="no-scrollbar mt-6 flex items-center gap-2 overflow-x-auto pb-1">
        <FilterButton label="Active" active={status === "active"} onClick={() => setStatus("active")} />
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
          <EmptyQueueState
            status={status}
            onViewActive={() => setStatus("active")}
            onViewAll={() => setStatus("all")}
          />
        ) : (
          bookings.map((booking, index) => (
            <DispatchBookingRow
              key={booking._id}
              booking={booking}
              initialOpen={index === 0}
              driverProfiles={driverProfiles ?? []}
              rateProfiles={rateProfiles ?? []}
              vehicleProfiles={vehicleProfiles ?? []}
            />
          ))
        )}
      </div>
    </DispatchShell>
  );
}

function DispatchBookingRow({
  booking,
  driverProfiles,
  initialOpen,
  rateProfiles,
  vehicleProfiles,
}: {
  booking: Booking;
  driverProfiles: DriverProfile[];
  initialOpen: boolean;
  rateProfiles: RateProfile[];
  vehicleProfiles: VehicleProfile[];
}) {
  const updateDispatch = useMutation(api.bookings.updateDispatch);
  const addNote = useMutation(api.bookings.addNote);
  const createHandoff = useMutation(api.handoffs.create);
  const createCheckoutSession = useAction(api.payments.createCheckoutSession);
  const [rowUi, dispatchRowUi] = useReducer(rowUiReducer, { booking, initialOpen }, createRowUiState);
  const { expanded, handoffDraft, handoffResult, message, pending } = rowUi;
  const handoffs = useQuery(api.handoffs.listForBooking, expanded ? { bookingId: booking._id } : "skip");
  const events = useQuery(api.bookings.listEvents, expanded ? { bookingId: booking._id } : "skip");
  const [draft, dispatchDraft] = useReducer(dispatchDraftReducer, booking, createDispatchDraft);
  const bookingStatus = booking.status;
  const bookingQuote = booking.quotedAmountCents ? String(booking.quotedAmountCents / 100) : "";
  const bookingDriver = booking.assignedChauffeurName ?? "";
  const bookingVehicle = booking.vehicleLabel ?? "";
  const bookingNotes = booking.dispatchNotes ?? "";

  useEffect(() => {
    dispatchDraft({
      type: "syncBooking",
      value: {
        status: bookingStatus,
        quote: bookingQuote,
        driver: bookingDriver,
        vehicle: bookingVehicle,
        notes: bookingNotes,
      },
    });
  }, [bookingDriver, bookingNotes, bookingQuote, bookingStatus, bookingVehicle]);

  const routeSummary = useMemo(() => {
    const parts = [booking.pickupLocation];
    if (booking.dropoffLocation) parts.push(booking.dropoffLocation);
    if (booking.duration) parts.push(booking.duration);
    return parts.join(" to ");
  }, [booking.dropoffLocation, booking.duration, booking.pickupLocation]);

  async function saveDispatch() {
    dispatchRowUi({ type: "setPending", pending: true });
    dispatchRowUi({ type: "setMessage", message: "" });
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
      syncHandoffRecipientFromDriver({
        currentDriver: booking.assignedChauffeurName,
        driverDraft: draft.driver,
        handoffRecipient: handoffDraft.recipientName,
        onSync: (recipientName) => dispatchRowUi({ type: "handoffDraft", value: { recipientName } }),
      });
      dispatchRowUi({ type: "setMessage", message: "Dispatch saved." });
    } catch (error) {
      dispatchRowUi({ type: "setMessage", message: error instanceof Error ? error.message : "Could not save dispatch." });
    } finally {
      dispatchRowUi({ type: "setPending", pending: false });
    }
  }

  async function saveNote() {
    const note = draft.staffNote.trim();
    if (!note) return;
    dispatchRowUi({ type: "setMessage", message: "" });
    try {
      await addNote({ bookingId: booking._id, note });
      dispatchDraft({ type: "clearStaffNote" });
      dispatchRowUi({ type: "setMessage", message: "Note added." });
    } catch (error) {
      dispatchRowUi({ type: "setMessage", message: error instanceof Error ? error.message : "Could not add note." });
    }
  }

  async function openCheckout() {
    if (isTerminalBooking(booking.status)) {
      dispatchRowUi({
        type: "setMessage",
        message: `Payment links are closed for ${formatStatusInSentence(booking.status)} rides.`,
      });
      return;
    }

    dispatchRowUi({ type: "setPending", pending: true });
    dispatchRowUi({ type: "setMessage", message: "" });
    try {
      const result = await createCheckoutSession({
        bookingId: booking._id,
        successPath: `/booking/${booking.publicReference}`,
        cancelPath: "/admin/dispatch",
      });
      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
        dispatchRowUi({ type: "setMessage", message: "Checkout opened." });
        return;
      }
      dispatchRowUi({
        type: "setMessage",
        message:
          result.status === "quote_required"
            ? "Add a quote first."
            : result.status === "closed"
              ? `Payment links are closed for ${formatStatusInSentence(booking.status)} rides.`
              : "Stripe is not configured.",
      });
    } catch (error) {
      dispatchRowUi({ type: "setMessage", message: error instanceof Error ? error.message : "Could not create payment link." });
    } finally {
      dispatchRowUi({ type: "setPending", pending: false });
    }
  }

  async function prepareHandoff() {
    const validationMessage = getHandoffValidationMessage(handoffDraft);
    if (validationMessage) {
      dispatchRowUi({ type: "setMessage", message: validationMessage });
      return;
    }

    dispatchRowUi({ type: "startHandoff" });
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
      dispatchRowUi({
        type: "handoffSuccess",
        result: {
          rideUrl,
          message: buildHandoffMessage(booking, rideUrl, handoffDraft.message),
          recipientEmail: emptyToUndefined(handoffDraft.recipientEmail),
          recipientPhone: emptyToUndefined(handoffDraft.recipientPhone),
        },
      });
    } catch (error) {
      dispatchRowUi({ type: "handoffError", message: error instanceof Error ? error.message : "Could not create ride link." });
    }
  }

  const latestHandoffs = handoffs?.slice(0, 2) ?? [];
  const rowMessage = getRowMessage(message, latestHandoffs[0]);

  return (
    <Card className="overflow-hidden">
      <DispatchBookingHeader
        booking={booking}
        expanded={expanded}
        onToggle={() => dispatchRowUi({ type: "toggleExpanded" })}
        routeSummary={routeSummary}
      />

      {expanded && (
        <CardContent className="grid min-w-0 gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)]">
          <BookingDetailsSection booking={booking} routeSummary={routeSummary} />
          <DispatchEditorSection
            booking={booking}
            driverProfiles={driverProfiles}
            dispatchDraft={dispatchDraft}
            draft={draft}
            onSelectDriverProfile={(driver) => {
              dispatchDraft({ type: "driver", value: driver?.name ?? "" });
              dispatchRowUi({
                type: "handoffDraft",
                value: {
                  recipientEmail: driver?.email ?? "",
                  recipientName: driver?.name ?? "",
                  recipientPhone: driver?.phone ?? "",
                },
              });
            }}
            onOpenCheckout={openCheckout}
            onSaveDispatch={saveDispatch}
            onSaveNote={saveNote}
            pending={pending}
            rateProfiles={rateProfiles}
            vehicleProfiles={vehicleProfiles}
          />
          <DriverLinkSection
            booking={booking}
            handoffDraft={handoffDraft}
            handoffResult={handoffResult}
            handoffs={latestHandoffs}
            onHandoffDraftChange={(value) => dispatchRowUi({ type: "handoffDraft", value })}
            onPrepareHandoff={prepareHandoff}
            pending={pending}
          />
          {rowMessage && <RowMessage tone={rowMessage.tone}>{rowMessage.message}</RowMessage>}
          <OperationsLogSection events={events ?? []} loading={events === undefined} />
        </CardContent>
      )}
    </Card>
  );
}

function DispatchBookingHeader({
  booking,
  expanded,
  onToggle,
  routeSummary,
}: {
  booking: Booking;
  expanded: boolean;
  onToggle: () => void;
  routeSummary: string;
}) {
  return (
    <CardHeader className={cn("bg-muted/30", expanded && "border-b")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={booking.status === "canceled" ? "destructive" : "secondary"}>
              {formatStatus(booking.status)}
            </Badge>
            <span className="font-mono text-xs font-medium text-muted-foreground">
              {booking.publicReference}
            </span>
          </div>
          <CardTitle className="mt-3 text-2xl">{booking.customerName}</CardTitle>
          <CardDescription className="mt-2 break-words [overflow-wrap:anywhere]">
            {booking.customerEmail} / {booking.customerPhone}
          </CardDescription>
          <p className="mt-2 break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
            {routeSummary}
          </p>
          <DriverSummary booking={booking} />
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] lg:min-w-[26rem]">
          <div className="rounded-md border bg-background px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{booking.pickupDate} at {booking.pickupTime}</p>
            <p className="mt-1 text-muted-foreground">{formatPassengerCount(booking.passengerCount)} / {booking.luggage}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="justify-center"
            aria-label={`${expanded ? "Hide" : "Open"} ${booking.publicReference}`}
            aria-expanded={expanded}
            onClick={onToggle}
          >
            {expanded ? "Hide" : "Open"}
            <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} aria-hidden />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}

function DriverSummary({ booking }: { booking: Booking }) {
  const driverName = booking.assignedChauffeurName ?? booking.latestHandoff?.recipientName;

  if (!driverName && !booking.latestHandoff) {
    return (
      <p className="mt-3 text-sm font-medium text-muted-foreground">
        Driver link not created
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
      {driverName && (
        <span className="rounded-md border bg-background px-2.5 py-1 font-medium text-foreground">
          Driver: {driverName}
        </span>
      )}
      {booking.latestHandoff && (
        <Badge variant={booking.latestHandoff.status === "declined" ? "destructive" : "outline"}>
          Link {formatStatus(booking.latestHandoff.status)}
        </Badge>
      )}
    </div>
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
    <section className="grid min-w-0 content-start gap-4">
      <SectionHeading title="Booking" description={routeSummary} />
      <InfoRow label="Mode" value={booking.bookingMode} />
      {booking.requestedVehicleLabel && <InfoRow label="Requested car" value={booking.requestedVehicleLabel} />}
      {booking.paymentPreference && <InfoRow label="Payment" value={booking.paymentPreference} />}
      {booking.flightNumber && <InfoRow label="Flight" value={booking.flightNumber} />}
      {booking.notes && <InfoBlock label="Passenger notes">{booking.notes}</InfoBlock>}
    </section>
  );
}

function DispatchEditorSection({
  booking,
  driverProfiles,
  dispatchDraft,
  draft,
  onSelectDriverProfile,
  onOpenCheckout,
  onSaveDispatch,
  onSaveNote,
  pending,
  rateProfiles,
  vehicleProfiles,
}: {
  booking: Booking;
  driverProfiles: DriverProfile[];
  dispatchDraft: (action: DispatchDraftAction) => void;
  draft: DispatchDraft;
  onSelectDriverProfile: (driver: DriverProfile | null) => void;
  onOpenCheckout: () => Promise<void>;
  onSaveDispatch: () => Promise<void>;
  onSaveNote: () => Promise<void>;
  pending: boolean;
  rateProfiles: RateProfile[];
  vehicleProfiles: VehicleProfile[];
}) {
  const terminalBooking = isTerminalBooking(booking.status);
  const activeDrivers = driverProfiles.filter((driver) => driver.active);
  const activeVehicles = vehicleProfiles.filter((vehicle) => vehicle.active);

  if (terminalBooking) {
    return (
      <section className="grid min-w-0 content-start gap-4">
        <SectionHeading
          title="Dispatch"
          description="This ride is closed. Dispatch details are locked; add an internal note if the record needs more context."
        />
        <InfoRow label="Status" value={booking.status} />
        <InfoRow label="Payment" value={formatPaymentStatus(booking.paymentStatus)} />
        {booking.quotedAmountCents !== undefined && (
          <InfoRow label="Quote USD" value={formatQuote(booking.quotedAmountCents)} />
        )}
        {booking.vehicleLabel && <InfoRow label="Vehicle" value={booking.vehicleLabel} />}
        {booking.assignedChauffeurName && <InfoRow label="Chauffeur" value={booking.assignedChauffeurName} />}
        {booking.dispatchNotes && <InfoBlock label="Dispatch notes">{booking.dispatchNotes}</InfoBlock>}
        <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Payment links and dispatch changes are closed for {formatStatusInSentence(booking.status)} rides.
        </p>
        <StaffNoteEditor
          bookingId={booking._id}
          note={draft.staffNote}
          onChange={(value) => dispatchDraft({ type: "staffNote", value })}
          onSaveNote={onSaveNote}
        />
      </section>
    );
  }

  return (
    <section className="grid min-w-0 content-start gap-4">
      <SectionHeading
        title="Dispatch"
        description="Set quote, driver, vehicle, and status."
      />
      <InfoRow label="Payment" value={formatPaymentStatus(booking.paymentStatus)} />
      <RateQuoteCalculator
        booking={booking}
        profiles={rateProfiles}
        onApplyQuote={({ note, quote, vehicle }) => {
          dispatchDraft({ type: "quote", value: quote });
          dispatchDraft({ type: "vehicle", value: vehicle });
          dispatchDraft({ type: "notes", value: appendDispatchNote(draft.notes, note) });
        }}
      />
      <StatusSelect
        id={`status-${booking._id}`}
        value={draft.status}
        onChange={(value) => dispatchDraft({ type: "status", value })}
      />
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <TextField
          id={`quote-${booking._id}`}
          label="Quote USD"
          value={draft.quote}
          onChange={(value) => dispatchDraft({ type: "quote", value })}
          inputMode="decimal"
        />
        <DriverProfileSelect
          bookingId={booking._id}
          drivers={activeDrivers}
          value={draft.driver}
          onChange={onSelectDriverProfile}
        />
        <VehicleProfileSelect
          bookingId={booking._id}
          vehicles={activeVehicles}
          value={draft.vehicle}
          onChange={(vehicle) => dispatchDraft({ type: "vehicle", value: vehicle?.label ?? "" })}
        />
        <TextField
          id={`vehicle-${booking._id}`}
          label="Vehicle label"
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
      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        <Button type="button" disabled={pending} onClick={() => void onSaveDispatch()}>
          <Save className="size-4" aria-hidden />
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => void onOpenCheckout()}
        >
          <CreditCard className="size-4" aria-hidden />
          Payment link
        </Button>
      </div>
      <StaffNoteEditor
        bookingId={booking._id}
        note={draft.staffNote}
        onChange={(value) => dispatchDraft({ type: "staffNote", value })}
        onSaveNote={onSaveNote}
      />
    </section>
  );
}

function StaffNoteEditor({
  bookingId,
  note,
  onChange,
  onSaveNote,
}: {
  bookingId: string;
  note: string;
  onChange: (value: string) => void;
  onSaveNote: () => Promise<void>;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label htmlFor={`staff-note-${bookingId}`}>Internal note</Label>
      <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          id={`staff-note-${bookingId}`}
          value={note}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Add note"
        />
        <Button type="button" variant="secondary" onClick={() => void onSaveNote()}>
          <Plus className="size-4" aria-hidden />
          Add
        </Button>
      </div>
    </div>
  );
}

function RateQuoteCalculator({
  booking,
  onApplyQuote,
  profiles,
}: {
  booking: Booking;
  onApplyQuote: (estimate: { quote: string; vehicle: string; note: string }) => void;
  profiles: RateProfile[];
}) {
  const activeProfiles = profiles.filter((profile) => profile.active);
  const availableProfiles = activeProfiles.length > 0 ? activeProfiles : profiles;
  const [quoteDraft, dispatchQuoteDraft] = useReducer(
    rateQuoteDraftReducer,
    booking,
    createRateQuoteDraft,
  );

  if (availableProfiles.length === 0) {
    return (
      <Alert>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>No rate profiles are available yet.</span>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/rates">Open rates</Link>
          </Button>
        </div>
      </Alert>
    );
  }

  const selectedProfile =
    availableProfiles.find((profile) => profile.key === quoteDraft.profileKey) ?? availableProfiles[0];
  const quote = calculateRateQuote(selectedProfile, {
    distanceMiles: readDecimal(quoteDraft.distanceMiles),
    billableHours: readDecimal(quoteDraft.billableHours),
    extraStops: readDecimal(quoteDraft.extraStops),
    includeAirportFee: quoteDraft.includeAirportFee === "true",
    includeMeetAndGreet: quoteDraft.includeMeetAndGreet === "true",
    includePeakSurcharge: quoteDraft.includePeakSurcharge === "true",
  });

  return (
    <div className="grid gap-3 rounded-md border bg-muted/30 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeading
          title="Rate calculator"
          description="Apply distance, hourly, airport, stop, gratuity, tax, and peak rules from the rate card."
        />
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/rates">Manage rates</Link>
        </Button>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`rate-profile-${booking._id}`}>Rate profile</Label>
          <Select
            value={selectedProfile.key}
            onValueChange={(value) => dispatchQuoteDraft({ type: "profileKey", value })}
          >
            <SelectTrigger id={`rate-profile-${booking._id}`} className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="pld-ui">
              {availableProfiles.map((profile) => (
                <SelectItem key={profile.key} value={profile.key}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <TextField
          id={`distance-${booking._id}`}
          label="Distance miles"
          value={quoteDraft.distanceMiles}
          onChange={(value) => dispatchQuoteDraft({ type: "distanceMiles", value })}
          inputMode="decimal"
          placeholder="18.5"
        />
        <TextField
          id={`hours-${booking._id}`}
          label="Billable hours"
          value={quoteDraft.billableHours}
          onChange={(value) => dispatchQuoteDraft({ type: "billableHours", value })}
          inputMode="decimal"
          placeholder="2"
        />
        <TextField
          id={`extra-stops-${booking._id}`}
          label="Extra stops"
          value={quoteDraft.extraStops}
          onChange={(value) => dispatchQuoteDraft({ type: "extraStops", value })}
          inputMode="decimal"
          placeholder="0"
        />
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-3">
        <BooleanSelect
          id={`airport-fee-${booking._id}`}
          label="Airport fee"
          value={quoteDraft.includeAirportFee}
          onChange={(value) => dispatchQuoteDraft({ type: "includeAirportFee", value })}
        />
        <BooleanSelect
          id={`meet-greet-${booking._id}`}
          label="Meet and greet"
          value={quoteDraft.includeMeetAndGreet}
          onChange={(value) => dispatchQuoteDraft({ type: "includeMeetAndGreet", value })}
        />
        <BooleanSelect
          id={`peak-${booking._id}`}
          label="Peak surcharge"
          value={quoteDraft.includePeakSurcharge}
          onChange={(value) => dispatchQuoteDraft({ type: "includePeakSurcharge", value })}
        />
      </div>

      <div className="rounded-md border bg-background p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Estimate
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatMoneyFromCents(quote.totalCents)}
            </p>
          </div>
          <Button
            type="button"
            onClick={() =>
              onApplyQuote({
                quote: (quote.totalCents / 100).toFixed(2),
                vehicle: selectedProfile.vehicleType,
                note: buildRateNote(selectedProfile, quote, {
                  billableHours: quoteDraft.billableHours,
                  distanceMiles: quoteDraft.distanceMiles,
                  extraStops: quoteDraft.extraStops,
                  includeAirportFee: quoteDraft.includeAirportFee,
                  includeMeetAndGreet: quoteDraft.includeMeetAndGreet,
                  includePeakSurcharge: quoteDraft.includePeakSurcharge,
                }),
              })
            }
          >
            <Calculator className="size-4" aria-hidden />
            Apply estimate
          </Button>
        </div>
        {quote.lineItems.length > 0 && (
          <dl className="mt-3 grid gap-1 text-sm text-muted-foreground">
            {quote.lineItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <dt>{item.label}</dt>
                <dd className="font-medium text-foreground">{formatMoneyFromCents(item.amountCents)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

function DriverLinkSection({
  booking,
  handoffDraft,
  handoffResult,
  handoffs,
  onHandoffDraftChange,
  onPrepareHandoff,
  pending,
}: {
  booking: Booking;
  handoffDraft: HandoffDraft;
  handoffResult: HandoffResult | null;
  handoffs: Handoff[];
  onHandoffDraftChange: (value: Partial<HandoffDraft>) => void;
  onPrepareHandoff: () => Promise<void>;
  pending: boolean;
}) {
  const terminalBooking = isTerminalBooking(booking.status);

  return (
    <section className="grid min-w-0 content-start gap-4">
      <SectionHeading
        title="Driver link"
        description={
          terminalBooking
            ? "This ride is closed. Existing links stay available for review."
            : "Create the ride link. Email and text actions unlock when contact info is present."
        }
      />
      {terminalBooking ? (
        <>
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            New driver links are closed for {formatStatusInSentence(booking.status)} rides.
          </p>
          <RecentHandoffs booking={booking} handoffs={handoffs} />
        </>
      ) : (
        <>
          <TextField
            id={`handoff-recipient-${booking._id}`}
            label="Recipient"
            value={handoffDraft.recipientName}
            onChange={(value) => onHandoffDraftChange({ recipientName: value })}
            placeholder="Driver name"
          />
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <TextField
              id={`handoff-email-${booking._id}`}
              label="Email"
              type="email"
              value={handoffDraft.recipientEmail}
              onChange={(value) => onHandoffDraftChange({ recipientEmail: value })}
              placeholder="driver@example.com"
            />
            <TextField
              id={`handoff-phone-${booking._id}`}
              label="Phone"
              type="tel"
              value={handoffDraft.recipientPhone}
              onChange={(value) => onHandoffDraftChange({ recipientPhone: value })}
              placeholder="+1 503 555 0100"
            />
          </div>
          <DriverLinkControls
            booking={booking}
            handoffDraft={handoffDraft}
            handoffResult={handoffResult}
            handoffs={handoffs}
            onHandoffDraftChange={onHandoffDraftChange}
            onPrepareHandoff={onPrepareHandoff}
            pending={pending}
          />
        </>
      )}
    </section>
  );
}

function OperationsLogSection({
  events,
  loading,
}: {
  events: BookingEvent[];
  loading: boolean;
}) {
  return (
    <section className="grid min-w-0 content-start gap-4 lg:col-span-3">
      <SectionHeading
        title="Operations log"
        description="Live dispatch, payment, handoff, driver-status, and staff-note updates."
      />
      {loading ? (
        <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Loading updates.
        </p>
      ) : events.length === 0 ? (
        <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          No updates recorded yet.
        </p>
      ) : (
        <ol className="grid min-w-0 gap-2">
          {events.slice(0, 8).map((event) => (
            <li key={event._id} className="min-w-0 rounded-md border bg-background p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getEventBadgeVariant(event.kind)}>
                  {formatStatus(event.kind)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(event.createdAt)}
                </span>
                {event.actorName && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {event.actorName}
                  </span>
                )}
              </div>
              <p className="mt-2 break-words text-sm leading-6 text-foreground [overflow-wrap:anywhere]">
                {event.message}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function DriverLinkControls({
  booking,
  handoffDraft,
  handoffResult,
  handoffs,
  onHandoffDraftChange,
  onPrepareHandoff,
  pending,
}: {
  booking: Booking;
  handoffDraft: HandoffDraft;
  handoffResult: HandoffResult | null;
  handoffs: Handoff[];
  onHandoffDraftChange: (value: Partial<HandoffDraft>) => void;
  onPrepareHandoff: () => Promise<void>;
  pending: boolean;
}) {
  const activeHandoffResult = getActiveHandoffResult(handoffResult, handoffs);

  return (
    <>
      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        <ChannelSelect
          id={`handoff-channel-${booking._id}`}
          value={handoffDraft.channel}
          onChange={(value) => onHandoffDraftChange({ channel: value })}
        />
        <Button type="button" disabled={pending} onClick={() => void onPrepareHandoff()}>
          <Send className="size-4" aria-hidden />
          Create link
        </Button>
      </div>
      <div>
        <Label htmlFor={`handoff-message-${booking._id}`}>Driver note</Label>
        <Textarea
          id={`handoff-message-${booking._id}`}
          value={handoffDraft.message}
          onChange={(event) => onHandoffDraftChange({ message: event.target.value })}
          placeholder="Optional pickup instructions"
          className="mt-2 min-h-20"
        />
      </div>
      {activeHandoffResult && (
        <RideLinkActions
          booking={booking}
          email={activeHandoffResult.recipientEmail}
          message={activeHandoffResult.message}
          phone={activeHandoffResult.recipientPhone}
          rideUrl={activeHandoffResult.rideUrl}
        />
      )}
      <RecentHandoffs booking={booking} excludedRideUrl={activeHandoffResult?.rideUrl} handoffs={handoffs} />
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
    <div className="grid min-w-0 gap-3 rounded-md border bg-muted/30 p-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        Recent links
      </p>
      {visibleHandoffs.map((handoff) => {
        const rideUrl = getRideUrl(`/rides/${handoff.token}`);
        const handoffMessage = buildHandoffMessage(booking, rideUrl, handoff.message ?? "");
        return (
          <div key={handoff._id} className="grid min-w-0 gap-2 rounded-md bg-background p-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <a href={rideUrl} className="min-w-0 truncate font-mono text-xs text-primary">
                {rideUrl}
              </a>
              <Badge variant={getHandoffBadgeVariant(handoff.status)}>{formatStatus(handoff.status)}</Badge>
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
  stats = EMPTY_DASHBOARD_STATS,
  showSignOut = false,
}: {
  title: string;
  children?: ReactNode;
  stats?: DashboardStat[];
  showSignOut?: boolean;
}) {
  return (
    <section className="pld-ui min-h-[100svh] bg-muted/30 text-foreground">
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
            <div className="flex flex-col gap-2 sm:flex-row md:self-auto">
              <Button asChild variant="outline" className="self-start sm:self-auto">
                <Link href="/admin/rates">Rates</Link>
              </Button>
              <Button asChild variant="outline" className="self-start sm:self-auto">
                <Link href="/admin/fleet">Fleet</Link>
              </Button>
              <Button asChild variant="outline" className="self-start sm:self-auto">
                <Link href="/admin/customers">Customers</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="self-start sm:self-auto"
                onClick={async () => {
                  await authClient.signOut();
                  window.location.href = "/";
                }}
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            </div>
          )}
        </div>
        {stats.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="shadow-none">
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
    <Button type="button" variant={active ? "default" : "outline"} size="sm" className="shrink-0" onClick={onClick}>
      {label}
    </Button>
  );
}

function EmptyQueueState({
  onViewActive,
  onViewAll,
  status,
}: {
  onViewActive: () => void;
  onViewAll: () => void;
  status: StatusView;
}) {
  const active = status === "active";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {active ? "Active queue is clear" : "No bookings in this view"}
        </CardTitle>
        <CardDescription>
          {getEmptyQueueMessage(status)}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 pt-0 sm:grid-cols-[auto_auto] sm:justify-start">
        {active ? (
          <Button type="button" variant="outline" onClick={onViewAll}>
            View all bookings
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onViewActive}>
            View active queue
          </Button>
        )}
        <Button asChild>
          <Link href="/#book">
            <Plus className="size-4" aria-hidden />
            Open booking form
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function isStatus(value: StatusView): value is Status {
  return statusSet.has(value);
}

function getEmptyQueueMessage(status: StatusView) {
  if (status === "active") return "No active bookings need dispatch right now.";
  return "No bookings in this view.";
}

function getQueueLabel(status: StatusView) {
  if (status === "active") return "Active";
  if (status === "all") return "All rides";
  return formatStatus(status);
}

function getFleetLabel(drivers?: DriverProfile[], vehicles?: VehicleProfile[]) {
  if (!drivers || !vehicles) return "Loading";
  const activeDrivers = drivers.filter((driver) => driver.active).length;
  const activeVehicles = vehicles.filter((vehicle) => vehicle.active).length;
  return `${activeDrivers} drivers / ${activeVehicles} vehicles`;
}

function getDriverProfileSelectValue(value: string, drivers: DriverProfile[]) {
  const trimmed = value.trim();
  if (!trimmed) return UNASSIGNED_SELECT_VALUE;
  return drivers.find((driver) => driver.name === trimmed)?.key ?? CUSTOM_SELECT_VALUE;
}

function getVehicleProfileSelectValue(value: string, vehicles: VehicleProfile[]) {
  const trimmed = value.trim();
  if (!trimmed) return UNASSIGNED_SELECT_VALUE;
  return vehicles.find((vehicle) => vehicle.label === trimmed)?.key ?? CUSTOM_SELECT_VALUE;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 break-words text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">{description}</p>
    </div>
  );
}

function RowMessage({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warning" }) {
  return (
    <Alert
      className="lg:col-span-3"
      variant={tone === "warning" ? "warning" : "default"}
      aria-live="polite"
      role="status"
    >
      {children}
    </Alert>
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

function BooleanSelect({
  id,
  label,
  onChange,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="pld-ui">
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
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

function DriverProfileSelect({
  bookingId,
  drivers,
  onChange,
  value,
}: {
  bookingId: string;
  drivers: DriverProfile[];
  onChange: (driver: DriverProfile | null) => void;
  value: string;
}) {
  const selectValue = getDriverProfileSelectValue(value, drivers);
  const manualLabel = value.trim() ? `Manual: ${value.trim()}` : "Manual";

  return (
    <div>
      <Label htmlFor={`driver-profile-${bookingId}`}>Saved driver</Label>
      <Select
        value={selectValue}
        onValueChange={(nextValue) => {
          if (nextValue === UNASSIGNED_SELECT_VALUE) {
            onChange(null);
            return;
          }
          if (nextValue === CUSTOM_SELECT_VALUE) return;

          onChange(drivers.find((driver) => driver.key === nextValue) ?? null);
        }}
      >
        <SelectTrigger id={`driver-profile-${bookingId}`} className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="pld-ui">
          <SelectItem value={UNASSIGNED_SELECT_VALUE}>No saved driver</SelectItem>
          {drivers.map((driver) => (
            <SelectItem key={driver.key} value={driver.key}>
              {driver.name}
            </SelectItem>
          ))}
          {selectValue === CUSTOM_SELECT_VALUE && (
            <SelectItem value={CUSTOM_SELECT_VALUE}>{manualLabel}</SelectItem>
          )}
        </SelectContent>
      </Select>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Saved drivers fill the handoff name, email, and phone.
      </p>
    </div>
  );
}

function VehicleProfileSelect({
  bookingId,
  onChange,
  value,
  vehicles,
}: {
  bookingId: string;
  onChange: (vehicle: VehicleProfile | null) => void;
  value: string;
  vehicles: VehicleProfile[];
}) {
  const selectValue = getVehicleProfileSelectValue(value, vehicles);
  const manualLabel = value.trim() ? `Manual: ${value.trim()}` : "Manual";

  return (
    <div>
      <Label htmlFor={`vehicle-profile-${bookingId}`}>Saved vehicle</Label>
      <Select
        value={selectValue}
        onValueChange={(nextValue) => {
          if (nextValue === UNASSIGNED_SELECT_VALUE) {
            onChange(null);
            return;
          }
          if (nextValue === CUSTOM_SELECT_VALUE) return;

          onChange(vehicles.find((vehicle) => vehicle.key === nextValue) ?? null);
        }}
      >
        <SelectTrigger id={`vehicle-profile-${bookingId}`} className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="pld-ui">
          <SelectItem value={UNASSIGNED_SELECT_VALUE}>No saved vehicle</SelectItem>
          {vehicles.map((vehicle) => (
            <SelectItem key={vehicle.key} value={vehicle.key}>
              {vehicle.label}
            </SelectItem>
          ))}
          {selectValue === CUSTOM_SELECT_VALUE && (
            <SelectItem value={CUSTOM_SELECT_VALUE}>{manualLabel}</SelectItem>
          )}
        </SelectContent>
      </Select>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Use the freeform label for affiliate or temporary vehicles.
      </p>
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
      <Label htmlFor={id}>Share mode</Label>
      <Select value={value} onValueChange={(next) => onChange(next as HandoffChannel)}>
        <SelectTrigger id={id} className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="pld-ui">
          <SelectItem value="copy">Copy link</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="sms">Text</SelectItem>
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
    <div className="grid min-w-0 gap-2">
      {!compact && (
        <a href={rideUrl} className="min-w-0 truncate rounded-md border bg-background px-3 py-2 font-mono text-xs text-primary">
          {rideUrl}
        </a>
      )}
      <div className="grid min-w-0 gap-2 sm:grid-cols-4">
        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={rideUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" aria-hidden />
            Open
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={cn("w-full", !email && "pointer-events-none opacity-50")}
        >
          <a href={email ? buildMailto(email, booking, message) : undefined} aria-disabled={!email} tabIndex={email ? undefined : -1}>
            <Mail className="size-4" aria-hidden />
            Email
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={cn("w-full", !phone && "pointer-events-none opacity-50")}
        >
          <a href={phone ? buildSms(phone, message) : undefined} aria-disabled={!phone} tabIndex={phone ? undefined : -1}>
            <Phone className="size-4" aria-hidden />
            Text
          </a>
        </Button>
        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => void navigator.clipboard.writeText(rideUrl)}>
          <Copy className="size-4" aria-hidden />
          Copy
        </Button>
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: number) {
  return eventTimestampFormatter.format(new Date(timestamp));
}

function getEventBadgeVariant(kind: BookingEvent["kind"]) {
  if (kind === "handoff_declined") return "destructive";
  if (kind === "note_added") return "outline";
  return "secondary";
}

function getHandoffBadgeVariant(status: Handoff["status"]) {
  if (status === "declined") return "destructive";
  return "outline";
}

function getActiveHandoffResult(result: HandoffResult | null, handoffs: Handoff[]) {
  if (!result) return null;

  const matchingHandoff = handoffs.find((handoff) => getRideUrl(`/rides/${handoff.token}`) === result.rideUrl);
  if (matchingHandoff?.status === "declined") return null;

  return result;
}

function getRowMessage(message: string, latestHandoff?: Handoff) {
  if (latestHandoff?.status === "declined") {
    return {
      message: `${latestHandoff.recipientName} declined this ride. Create a new driver link or cancel the booking.`,
      tone: "warning" as const,
    };
  }
  if (latestHandoff?.status === "accepted") {
    return {
      message: `${latestHandoff.recipientName} accepted this ride. Driver status updates will appear live here.`,
      tone: "neutral" as const,
    };
  }
  if (latestHandoff?.status === "completed") {
    return {
      message: `${latestHandoff.recipientName} completed this ride.`,
      tone: "neutral" as const,
    };
  }

  if (!message) return null;

  return { message, tone: "neutral" as const };
}

function isTerminalBooking(status: string) {
  return status === "completed" || status === "canceled";
}

function formatStatusInSentence(status: string) {
  return formatStatus(status).toLowerCase();
}

function formatPaymentStatus(status: string) {
  if (status === "not_started") return "Payment pending";
  if (status === "quote_required") return "Quote pending";
  return formatStatus(status);
}

function formatPassengerCount(count: number) {
  return `${count} ${count === 1 ? "passenger" : "passengers"}`;
}

function formatQuote(amountCents: number) {
  return `$${(amountCents / 100).toFixed(2)}`;
}

function readDecimal(value: string) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

function parseDurationHours(duration?: string) {
  if (!duration) return 0;
  const match = duration.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  return readDecimal(match[1] ?? "");
}

function appendDispatchNote(existing: string, note: string) {
  const trimmedExisting = existing.trim();
  if (!trimmedExisting) return note;
  if (trimmedExisting.includes(note)) return trimmedExisting;
  return `${trimmedExisting}\n${note}`;
}

function buildRateNote(
  profile: RateProfileForCalculator,
  quote: { totalCents: number },
  inputs: {
    billableHours: string;
    distanceMiles: string;
    extraStops: string;
    includeAirportFee: string;
    includeMeetAndGreet: string;
    includePeakSurcharge: string;
  },
) {
  const flags = [
    inputs.includeAirportFee === "true" ? "airport fee" : "",
    inputs.includeMeetAndGreet === "true" ? "meet-and-greet" : "",
    inputs.includePeakSurcharge === "true" ? "peak surcharge" : "",
  ].filter(Boolean);

  return [
    `Rate estimate: ${profile.name}`,
    inputs.distanceMiles.trim() ? `${inputs.distanceMiles.trim()} mi` : "",
    inputs.billableHours.trim() ? `${inputs.billableHours.trim()} hr` : "",
    readDecimal(inputs.extraStops) > 0 ? `${inputs.extraStops.trim()} extra stop(s)` : "",
    ...flags,
    `quote ${formatMoneyFromCents(quote.totalCents)}`,
  ]
    .filter(Boolean)
    .join(" / ");
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function syncHandoffRecipientFromDriver({
  currentDriver,
  driverDraft,
  handoffRecipient,
  onSync,
}: {
  currentDriver?: string;
  driverDraft: string;
  handoffRecipient: string;
  onSync: (recipientName: string) => void;
}) {
  const nextDriver = driverDraft.trim();
  if (!nextDriver) return;

  const currentRecipient = handoffRecipient.trim();
  const existingDriver = currentDriver?.trim() ?? "";
  if (!currentRecipient || currentRecipient === existingDriver) {
    onSync(nextDriver);
  }
}

function createDispatchDraftSync(booking: Booking): DispatchDraftSync {
  return {
    status: booking.status,
    quote: booking.quotedAmountCents ? String(booking.quotedAmountCents / 100) : "",
    driver: booking.assignedChauffeurName ?? "",
    vehicle: booking.vehicleLabel ?? "",
    notes: booking.dispatchNotes ?? "",
  };
}

function createDispatchDraft(booking: Booking): DispatchDraft {
  return {
    ...createDispatchDraftSync(booking),
    staffNote: "",
  };
}

function createHandoffDraft(booking: Booking): HandoffDraft {
  return {
    recipientName: booking.assignedChauffeurName ?? "",
    recipientEmail: "",
    recipientPhone: "",
    channel: "copy",
    message: "",
  };
}

function createRowUiState({
  booking,
  initialOpen,
}: {
  booking: Booking;
  initialOpen: boolean;
}): RowUiState {
  return {
    expanded: initialOpen,
    handoffDraft: createHandoffDraft(booking),
    handoffResult: null,
    message: "",
    pending: false,
  };
}

function rowUiReducer(state: RowUiState, action: RowUiAction): RowUiState {
  switch (action.type) {
    case "toggleExpanded":
      return { ...state, expanded: !state.expanded };
    case "handoffDraft":
      return {
        ...state,
        handoffDraft: { ...state.handoffDraft, ...action.value },
      };
    case "setMessage":
      return { ...state, message: action.message };
    case "setPending":
      return { ...state, pending: action.pending };
    case "startHandoff":
      return { ...state, handoffResult: null, message: "", pending: true };
    case "handoffSuccess":
      return {
        ...state,
        handoffResult: action.result,
        message: "Driver ride link ready.",
        pending: false,
      };
    case "handoffError":
      return { ...state, message: action.message, pending: false };
  }
}

function getHandoffValidationMessage(draft: HandoffDraft) {
  if (!draft.recipientName.trim()) return "Add the driver name before creating a ride link.";
  if (draft.channel === "email" && !draft.recipientEmail.trim()) {
    return "Add a driver email or switch Share mode to Copy link.";
  }
  if (draft.channel === "sms" && !draft.recipientPhone.trim()) {
    return "Add a driver phone number or switch Share mode to Copy link.";
  }
  return "";
}

function dispatchDraftReducer(state: DispatchDraft, action: DispatchDraftAction): DispatchDraft {
  if (action.type === "clearStaffNote") {
    return { ...state, staffNote: "" };
  }
  if (action.type === "syncBooking") {
    return { ...state, ...action.value };
  }
  return {
    ...state,
    [action.type]: action.value,
  };
}

function createRateQuoteDraft(booking: Booking): RateQuoteDraft {
  const parsedHours = parseDurationHours(booking.duration);
  return {
    profileKey: "",
    distanceMiles: "",
    billableHours: parsedHours > 0 ? String(parsedHours) : booking.bookingMode === "hourly" ? "2" : "",
    extraStops: "0",
    includeAirportFee: booking.bookingMode === "airport" ? "true" : "false",
    includeMeetAndGreet: "false",
    includePeakSurcharge: "false",
  };
}

function rateQuoteDraftReducer(state: RateQuoteDraft, action: RateQuoteDraftAction): RateQuoteDraft {
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
