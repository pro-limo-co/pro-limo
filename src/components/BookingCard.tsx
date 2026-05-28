"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CarFront,
  CheckCircle2,
  CreditCard,
  Headphones,
  MapPin,
  UserRound,
} from "lucide-react";
import { FormEvent, useMemo, useReducer } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AddressAutocomplete,
  type AddressDetails,
} from "@/components/booking/AddressAutocomplete";
import { siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";

const serviceOptions = [
  {
    id: "airport",
    label: "Airport transfer",
    description: "Pickup or drop-off at PDX, private terminals, hotels, and homes.",
  },
  {
    id: "oneway",
    label: "Point-to-point",
    description: "Direct private ride between two addresses, venues, or cities.",
  },
  {
    id: "hourly",
    label: "Hourly chauffeur",
    description: "Keep the car and chauffeur available for meetings, dinners, or events.",
  },
] as const;

const steps = [
  { label: "Service", icon: CarFront },
  { label: "Address", icon: MapPin },
  { label: "Date & time", icon: CalendarClock },
  { label: "Car", icon: CarFront },
  { label: "Details", icon: UserRound },
  { label: "Payment", icon: CreditCard },
] as const;

const vehicleOptions = [
  {
    label: "Executive Sedan",
    detail: "1-3 passengers / 2 bags",
  },
  {
    label: "Premium SUV",
    detail: "1-6 passengers / 5 bags",
  },
  {
    label: "Executive Sprinter",
    detail: "Up to 12 passengers / group luggage",
  },
  {
    label: "Stretch Limousine",
    detail: "Event-ready option, dispatch confirmed",
  },
] as const;

const passengerOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];
const luggageOptions = ["Carry-on only", "1 large bag", "2 large bags", "3 large bags", "4 large bags", "5+ large bags"];
const durationOptions = ["2 hours", "3 hours", "4 hours", "6 hours", "Full day (8h)", "Full day (10h)"];
const airportTripOptions = ["Airport pickup", "Airport drop-off", "Round trip", "Private terminal"];
const paymentOptions = ["Secure payment link", "Pay after dispatch call", "Corporate account", "Cash or card with chauffeur"];

type TabId = (typeof serviceOptions)[number]["id"];
type BookingCardProps = {
  defaultTab?: TabId;
  citySlug?: string;
  serviceSlug?: string;
  sourceLabel?: string;
  sourcePath?: string;
};

type BookingSubmissionState = {
  status: "idle" | "success" | "error";
  message: string;
  publicReference?: string;
};

type BookingFormState = {
  bookingMode: TabId;
  pickupLocation: string;
  dropoffLocation: string;
  pickupLocationDetails?: AddressDetails;
  dropoffLocationDetails?: AddressDetails;
  airportTrip: string;
  duration: string;
  pickupDate: string;
  pickupTime: string;
  flightNumber: string;
  requestedVehicleLabel: string;
  passengerCount: string;
  luggage: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  paymentPreference: string;
};

type BookingUiState = {
  form: BookingFormState;
  step: number;
  submitting: boolean;
  submission: BookingSubmissionState;
};

type BookingUiAction =
  | { type: "field"; field: keyof BookingFormState; value: string }
  | {
      type: "addressDetails";
      field: "pickupLocationDetails" | "dropoffLocationDetails";
      value: AddressDetails | undefined;
    }
  | { type: "service"; value: TabId }
  | { type: "goToStep"; step: number }
  | { type: "next" }
  | { type: "back" }
  | { type: "submitting"; value: boolean }
  | { type: "submission"; value: BookingSubmissionState }
  | { type: "reset"; defaultTab: TabId };

const initialSubmission: BookingSubmissionState = {
  status: "idle",
  message: "",
};

export function BookingCard({
  defaultTab = "oneway",
  citySlug,
  serviceSlug,
  sourceLabel = "Website",
  sourcePath = "/",
}: BookingCardProps) {
  const [state, dispatch] = useReducer(bookingUiReducer, defaultTab, createBookingUiState);
  const isSubmitted = state.submission.status === "success" && Boolean(state.submission.publicReference);
  const activeStep = steps[state.step];
  const stepComplete = isStepComplete(state.form, state.step);
  const canGoNext = stepComplete && state.step < steps.length - 1;
  const canSubmit = steps.every((_, index) => isStepComplete(state.form, index));

  return (
    <Card className="pld-ui overflow-hidden border-border bg-card text-card-foreground shadow-2xl shadow-black/20">
      <CardHeader className="space-y-4 border-b bg-muted/30 p-5 pb-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-normal">Book a ride</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Six quick steps. Dispatch confirms availability, quote, and final payment link.
            </CardDescription>
          </div>
          <div className="hidden rounded-md bg-accent px-3 py-2 text-xs font-medium text-accent-foreground sm:block">
            24/7 desk
          </div>
        </div>
        <StepProgress currentStep={state.step} onStepChange={(step) => dispatch({ type: "goToStep", step })} />
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-1">
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Step {state.step + 1} / {steps.length}
            </p>
            <h3 className="text-xl font-semibold text-foreground">
              {activeStep.label}
            </h3>
          </div>

          <div className="min-h-[22rem]">
            {state.step === 0 && (
              <ServiceStep
                value={state.form.bookingMode}
                onChange={(value) => dispatch({ type: "service", value })}
              />
            )}
            {state.step === 1 && (
              <AddressStep
                form={state.form}
                onFieldChange={(field, value) => dispatch({ type: "field", field, value })}
                onAddressDetailsChange={(field, value) =>
                  dispatch({ type: "addressDetails", field, value })
                }
              />
            )}
            {state.step === 2 && (
              <DateTimeStep
                form={state.form}
                onFieldChange={(field, value) => dispatch({ type: "field", field, value })}
              />
            )}
            {state.step === 3 && (
              <VehicleStep
                form={state.form}
                onFieldChange={(field, value) => dispatch({ type: "field", field, value })}
              />
            )}
            {state.step === 4 && (
              <DetailsStep
                form={state.form}
                onFieldChange={(field, value) => dispatch({ type: "field", field, value })}
              />
            )}
            {state.step === 5 && (
              <PaymentStep
                form={state.form}
                onFieldChange={(field, value) => dispatch({ type: "field", field, value })}
              />
            )}
          </div>

          {state.submission.status !== "idle" && (
            <Alert
              variant={state.submission.status === "success" ? "success" : "destructive"}
              role={state.submission.status === "success" ? "status" : "alert"}
              aria-live="polite"
            >
              <div className="flex gap-3">
                {state.submission.status === "success" && <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />}
                <div className="min-w-0">
                  <p>{state.submission.message}</p>
                  {state.submission.publicReference && (
                    <>
                      <strong className="mt-1 block font-mono text-success">
                        {state.submission.publicReference}
                      </strong>
                      <p className="mt-1 text-muted-foreground">
                        Dispatch can see it now in ProLimo OS.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Alert>
          )}

          {isSubmitted && state.submission.publicReference ? (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Button asChild size="lg" className="w-full">
                <a href={`/booking/${encodeURIComponent(state.submission.publicReference)}`}>
                  Track request
                  <ArrowRight className="size-4" aria-hidden />
                </a>
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => dispatch({ type: "reset", defaultTab })}>
                New request
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {!stepComplete && (
                <p className="text-sm text-muted-foreground">
                  Complete this step to continue.
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={state.step === 0 || state.submitting}
                  onClick={() => dispatch({ type: "back" })}
                  className="press-tap"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Back
                </Button>
                {state.step < steps.length - 1 ? (
                  <Button
                    type="button"
                    size="lg"
                    disabled={!canGoNext || state.submitting}
                    onClick={() => dispatch({ type: "next" })}
                    className="press-tap w-full"
                  >
                    Continue
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                ) : (
                  <Button type="submit" disabled={!canSubmit || state.submitting} size="lg" className="press-tap w-full">
                    {state.submitting ? "Sending request" : "Submit booking"}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                )}
                <Button asChild variant="outline" size="lg">
                  <a href={`mailto:${siteConfig.contact.email}`}>
                    <Headphones className="size-4" aria-hidden />
                    Concierge
                  </a>
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      dispatch({ type: "goToStep", step: getFirstIncompleteStep(state.form) });
      return;
    }

    dispatch({ type: "submitting", value: true });
    dispatch({ type: "submission", value: initialSubmission });
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        body: createBookingFormData({
          citySlug,
          form: state.form,
          serviceSlug,
          sourceLabel,
          sourcePath,
        }),
      });
      const result = (await response.json()) as BookingSubmissionState;
      dispatch({ type: "submission", value: result });
    } catch {
      dispatch({
        type: "submission",
        value: {
          status: "error",
          message: "We could not submit this request. Please call the concierge desk.",
        },
      });
    } finally {
      dispatch({ type: "submitting", value: false });
    }
  }
}

function StepProgress({
  currentStep,
  onStepChange,
}: {
  currentStep: number;
  onStepChange: (step: number) => void;
}) {
  return (
    <div className="flex items-start gap-1.5" role="list" aria-label="Booking progress">
      {steps.map((step, index) => {
        const active = index === currentStep;
        const complete = index < currentStep;
        return (
          <button
            key={step.label}
            type="button"
            role="listitem"
            onClick={() => onStepChange(index)}
            className="group flex flex-1 flex-col items-center gap-1.5 press-tap"
            aria-current={active ? "step" : undefined}
            aria-label={`Step ${index + 1}: ${step.label}${complete ? " (complete)" : active ? " (current)" : ""}`}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all duration-300",
                complete && "bg-primary",
                active && "h-3.5 w-3.5 border-2 border-primary bg-transparent ring-4 ring-primary/15",
                !active && !complete && "bg-muted-foreground/35 group-hover:bg-muted-foreground/60",
              )}
            />
            <span
              className={cn(
                "font-condensed text-[0.58rem] uppercase leading-tight tracking-[0.12em] transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
                "hidden sm:block",
              )}
            >
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ServiceStep({
  onChange,
  value,
}: {
  onChange: (value: TabId) => void;
  value: TabId;
}) {
  return (
    <div className="grid gap-3">
      {serviceOptions.map((option) => (
        <Button
          key={option.id}
          type="button"
          variant={value === option.id ? "default" : "outline"}
          className="h-auto justify-start whitespace-normal p-4 text-left"
          onClick={() => onChange(option.id)}
        >
          <span className="grid gap-1">
            <span className="text-base font-semibold">{option.label}</span>
            <span className={cn("text-sm leading-6", value === option.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
              {option.description}
            </span>
          </span>
        </Button>
      ))}
    </div>
  );
}

function AddressStep({
  form,
  onFieldChange,
  onAddressDetailsChange,
}: {
  form: BookingFormState;
  onFieldChange: FieldChangeHandler;
  onAddressDetailsChange: (
    field: "pickupLocationDetails" | "dropoffLocationDetails",
    value: AddressDetails | undefined,
  ) => void;
}) {
  const isAirport = form.bookingMode === "airport";
  const isHourly = form.bookingMode === "hourly";

  return (
    <div className="grid gap-4">
      <AddressAutocomplete
        id="booking-pickupLocation"
        label={isAirport ? "Airport or pickup address" : "Pickup address"}
        value={form.pickupLocation}
        placeholder="Address, airport, hotel, or venue"
        required
        onChange={(value) => onFieldChange("pickupLocation", value)}
        onDetailsChange={(value) => onAddressDetailsChange("pickupLocationDetails", value)}
      />
      {isHourly ? (
        <OptionGroup
          label="Duration"
          name="duration"
          value={form.duration}
          options={durationOptions}
          required
          onChange={(value) => onFieldChange("duration", value)}
        />
      ) : (
        <AddressAutocomplete
          id="booking-dropoffLocation"
          label="Drop-off address"
          value={form.dropoffLocation}
          placeholder="Final destination"
          required
          onChange={(value) => onFieldChange("dropoffLocation", value)}
          onDetailsChange={(value) => onAddressDetailsChange("dropoffLocationDetails", value)}
        />
      )}
      {isAirport && (
        <OptionGroup
          label="Airport trip"
          name="airportTrip"
          value={form.airportTrip}
          options={airportTripOptions}
          required
          onChange={(value) => onFieldChange("airportTrip", value)}
        />
      )}
    </div>
  );
}

function DateTimeStep({
  form,
  onFieldChange,
}: {
  form: BookingFormState;
  onFieldChange: FieldChangeHandler;
}) {
  const presets = useMemo(() => buildQuickTimePresets(), []);
  const activePreset = presets.find(
    (preset) => preset.date === form.pickupDate && preset.time === form.pickupTime,
  )?.id;

  return (
    <div className="grid gap-4">
      <QuickTimeCarousel
        presets={presets}
        activeId={activePreset}
        onSelect={(preset) => {
          onFieldChange("pickupDate", preset.date);
          onFieldChange("pickupTime", preset.time);
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Date"
          name="pickupDate"
          value={form.pickupDate}
          placeholder="June 30, 2026"
          required
          onChange={(value) => onFieldChange("pickupDate", value)}
        />
        <Field
          label="Time"
          name="pickupTime"
          value={form.pickupTime}
          placeholder="10:30 AM"
          required
          onChange={(value) => onFieldChange("pickupTime", value)}
        />
        {form.bookingMode === "airport" && (
          <div className="sm:col-span-2">
            <Field
              label="Flight number"
              name="flightNumber"
              value={form.flightNumber}
              placeholder="AS 342"
              onChange={(value) => onFieldChange("flightNumber", value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

type QuickTimePreset = {
  id: string;
  topLabel: string;
  date: string;
  time: string;
};

/**
 * Quick-time carousel (UI refresh, Variant B): one-tap relative pickup presets
 * that fill the date + time fields. Mirrors OptionGroup's chip pattern. The
 * trailing "Custom" chip clears the selection so the fields below take over.
 */
function QuickTimeCarousel({
  presets,
  activeId,
  onSelect,
}: {
  presets: QuickTimePreset[];
  activeId: string | undefined;
  onSelect: (preset: QuickTimePreset) => void;
}) {
  return (
    <div>
      <Label>Quick pick</Label>
      <div
        className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1"
        role="radiogroup"
        aria-label="Quick pickup times"
      >
        {presets.map((preset) => {
          const selected = preset.id === activeId;
          return (
            <Button
              key={preset.id}
              type="button"
              variant={selected ? "default" : "outline"}
              className="press-tap h-auto shrink-0 flex-col items-start gap-0.5 px-3 py-2 text-left"
              aria-pressed={selected}
              onClick={() => onSelect(preset)}
            >
              <span className="font-condensed text-[0.66rem] uppercase tracking-[0.1em]">{preset.topLabel}</span>
              <span className={cn("text-xs", selected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {preset.time || "Pick date & time"}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function buildQuickTimePresets(): QuickTimePreset[] {
  const now = new Date();
  const toDateValue = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (base: Date, days: number) => {
    const next = new Date(base);
    next.setDate(next.getDate() + days);
    return next;
  };
  const today = toDateValue(now);
  const tomorrow = toDateValue(addDays(now, 1));
  // Next Saturday (0 = Sunday … 6 = Saturday)
  const daysToSaturday = (6 - now.getDay() + 7) % 7 || 7;
  const saturday = toDateValue(addDays(now, daysToSaturday));

  return [
    { id: "tonight", topLabel: "Tonight", date: today, time: "19:00" },
    { id: "tomorrow-am", topLabel: "Tomorrow AM", date: tomorrow, time: "08:00" },
    { id: "tomorrow-pm", topLabel: "Tomorrow PM", date: tomorrow, time: "18:00" },
    { id: "weekend", topLabel: "This weekend", date: saturday, time: "09:00" },
    { id: "custom", topLabel: "Custom", date: "", time: "" },
  ];
}

function VehicleStep({
  form,
  onFieldChange,
}: {
  form: BookingFormState;
  onFieldChange: FieldChangeHandler;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        {vehicleOptions.map((vehicle) => (
          <Button
            key={vehicle.label}
            type="button"
            variant={form.requestedVehicleLabel === vehicle.label ? "default" : "outline"}
            className="h-auto justify-between whitespace-normal p-4 text-left"
            onClick={() => onFieldChange("requestedVehicleLabel", vehicle.label)}
          >
            <span className="grid gap-1">
              <span className="text-base font-semibold">{vehicle.label}</span>
              <span
                className={cn(
                  "text-sm leading-6",
                  form.requestedVehicleLabel === vehicle.label ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                {vehicle.detail}
              </span>
            </span>
          </Button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <OptionGroup
          label="Passengers"
          name="passengerCount"
          value={form.passengerCount}
          options={passengerOptions}
          required
          onChange={(value) => onFieldChange("passengerCount", value)}
        />
        <OptionGroup
          label="Luggage"
          name="luggage"
          value={form.luggage}
          options={luggageOptions}
          required
          onChange={(value) => onFieldChange("luggage", value)}
        />
      </div>
    </div>
  );
}

function DetailsStep({
  form,
  onFieldChange,
}: {
  form: BookingFormState;
  onFieldChange: FieldChangeHandler;
}) {
  return (
    <div className="grid gap-4">
      <Field
        label="Name"
        name="customerName"
        value={form.customerName}
        placeholder="Passenger name"
        required
        onChange={(value) => onFieldChange("customerName", value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Email"
          name="customerEmail"
          type="email"
          value={form.customerEmail}
          placeholder="you@example.com"
          required
          onChange={(value) => onFieldChange("customerEmail", value)}
        />
        <Field
          label="Phone"
          name="customerPhone"
          type="tel"
          value={form.customerPhone}
          placeholder="+1 503 555 0100"
          required
          onChange={(value) => onFieldChange("customerPhone", value)}
        />
      </div>
      <div>
        <Label htmlFor="booking-notes">Notes</Label>
        <Textarea
          id="booking-notes"
          value={form.notes}
          onChange={(event) => onFieldChange("notes", event.target.value)}
          placeholder="Arrival details, preferences, child seats, or stops"
          className="mt-2 min-h-24"
        />
      </div>
    </div>
  );
}

function PaymentStep({
  form,
  onFieldChange,
}: {
  form: BookingFormState;
  onFieldChange: FieldChangeHandler;
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-md border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <h4 className="font-semibold text-foreground">Payment is prepared after dispatch confirms the quote.</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              This request goes to ProLimo OS first. Staff confirms the exact fare and then sends a secure payment link from the booking.
            </p>
          </div>
        </div>
      </div>
      <OptionGroup
        label="Payment preference"
        name="paymentPreference"
        value={form.paymentPreference}
        options={paymentOptions}
        required
        onChange={(value) => onFieldChange("paymentPreference", value)}
      />
      <BookingSummary form={form} />
    </div>
  );
}

function BookingSummary({ form }: { form: BookingFormState }) {
  const route = form.bookingMode === "hourly"
    ? `${form.pickupLocation || "Pickup"} / ${form.duration || "duration"}`
    : `${form.pickupLocation || "Pickup"} → ${form.dropoffLocation || "drop-off"}`;

  return (
    <div className="grid grid-cols-2 gap-2 rounded-md border bg-background p-3">
      <SummaryChip label="Service" value={getServiceLabel(form.bookingMode)} />
      <SummaryChip label="When" value={[form.pickupDate, form.pickupTime].filter(Boolean).join(" · ") || "Not set"} />
      <SummaryChip label="Route" value={route} className="col-span-2" />
      <SummaryChip label="Car" value={form.requestedVehicleLabel || "Not set"} />
      <SummaryChip label="Passenger" value={form.customerName || "Not set"} />
    </div>
  );
}

/** Two-line summary chip (UI refresh, Variant B): uppercase label over value. */
function SummaryChip({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("min-w-0 rounded-md border bg-muted/30 px-3 py-2", className)}>
      <div className="font-condensed text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-0.5 break-words text-sm font-medium text-foreground [overflow-wrap:anywhere]">{value}</div>
    </div>
  );
}

type FieldChangeHandler = (field: keyof BookingFormState, value: string) => void;

function Field({
  label,
  name,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: {
  label: string;
  name: keyof BookingFormState;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <div>
      <Label htmlFor={`booking-${name}`}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input
        id={`booking-${name}`}
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
    </div>
  );
}

function OptionGroup({
  label,
  name,
  onChange,
  options,
  required,
  value,
}: {
  label: string;
  name: keyof BookingFormState;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
  value: string;
}) {
  return (
    <div>
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="mt-2 grid gap-2" role="radiogroup" aria-label={label} data-field={name}>
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            variant={value === option ? "default" : "outline"}
            className="h-auto justify-start whitespace-normal px-3 py-2 text-left"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            <span className="text-sm">
              {option}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

function createBookingUiState(defaultTab: TabId): BookingUiState {
  return {
    form: createBookingFormState(defaultTab),
    step: 0,
    submitting: false,
    submission: initialSubmission,
  };
}

function createBookingFormState(defaultTab: TabId): BookingFormState {
  return {
    bookingMode: defaultTab,
    pickupLocation: "",
    dropoffLocation: "",
    airportTrip: defaultTab === "airport" ? "Airport pickup" : "",
    duration: defaultTab === "hourly" ? "3 hours" : "",
    pickupDate: "",
    pickupTime: "",
    flightNumber: "",
    requestedVehicleLabel: "",
    passengerCount: "",
    luggage: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
    paymentPreference: "Secure payment link",
  };
}

function bookingUiReducer(state: BookingUiState, action: BookingUiAction): BookingUiState {
  switch (action.type) {
    case "field":
      return {
        ...state,
        submission: initialSubmission,
        form: { ...state.form, [action.field]: action.value },
      };
    case "addressDetails":
      return {
        ...state,
        submission: initialSubmission,
        form: { ...state.form, [action.field]: action.value },
      };
    case "service":
      return {
        ...state,
        submission: initialSubmission,
        form: normalizeFormForService({
          ...state.form,
          bookingMode: action.value,
        }),
      };
    case "goToStep":
      return { ...state, step: clampStep(action.step) };
    case "next":
      return { ...state, step: clampStep(state.step + 1) };
    case "back":
      return { ...state, step: clampStep(state.step - 1) };
    case "submitting":
      return { ...state, submitting: action.value };
    case "submission":
      return { ...state, submission: action.value };
    case "reset":
      return createBookingUiState(action.defaultTab);
  }
}

function normalizeFormForService(form: BookingFormState): BookingFormState {
  if (form.bookingMode === "hourly") {
    return {
      ...form,
      airportTrip: "",
      duration: form.duration || "3 hours",
    };
  }
  if (form.bookingMode === "airport") {
    return {
      ...form,
      airportTrip: form.airportTrip || "Airport pickup",
      duration: "",
    };
  }
  return {
    ...form,
    airportTrip: "",
    duration: "",
  };
}

function isStepComplete(form: BookingFormState, step: number) {
  if (step === 0) return Boolean(form.bookingMode);
  if (step === 1) {
    const hasRoute = form.bookingMode === "hourly"
      ? Boolean(form.pickupLocation.trim() && form.duration)
      : Boolean(form.pickupLocation.trim() && form.dropoffLocation.trim());
    return form.bookingMode === "airport" ? hasRoute && Boolean(form.airportTrip) : hasRoute;
  }
  if (step === 2) return Boolean(form.pickupDate && form.pickupTime);
  if (step === 3) return Boolean(form.requestedVehicleLabel && form.passengerCount && form.luggage);
  if (step === 4) {
    return Boolean(form.customerName.trim() && form.customerEmail.trim() && form.customerPhone.trim());
  }
  if (step === 5) return Boolean(form.paymentPreference);
  return false;
}

function getFirstIncompleteStep(form: BookingFormState) {
  const index = steps.findIndex((_, step) => !isStepComplete(form, step));
  return index === -1 ? steps.length - 1 : index;
}

function clampStep(step: number) {
  return Math.min(Math.max(step, 0), steps.length - 1);
}

function createBookingFormData({
  citySlug,
  form,
  serviceSlug,
  sourceLabel,
  sourcePath,
}: {
  citySlug?: string;
  form: BookingFormState;
  serviceSlug?: string;
  sourceLabel: string;
  sourcePath: string;
}) {
  const formData = new FormData();
  appendFormValue(formData, "bookingMode", form.bookingMode);
  appendFormValue(formData, "sourceLabel", sourceLabel);
  appendFormValue(formData, "sourcePath", sourcePath);
  appendFormValue(formData, "citySlug", citySlug);
  appendFormValue(formData, "serviceSlug", serviceSlug);
  appendFormValue(formData, "pickupLocation", form.pickupLocation);
  appendFormValue(formData, "dropoffLocation", form.bookingMode === "hourly" ? undefined : form.dropoffLocation);
  appendLocationDetails(formData, "pickupLocationDetails", form.pickupLocationDetails);
  if (form.bookingMode !== "hourly") {
    appendLocationDetails(formData, "dropoffLocationDetails", form.dropoffLocationDetails);
  }
  appendFormValue(formData, "airportTrip", form.bookingMode === "airport" ? form.airportTrip : undefined);
  appendFormValue(formData, "duration", form.bookingMode === "hourly" ? form.duration : undefined);
  appendFormValue(formData, "pickupDate", form.pickupDate);
  appendFormValue(formData, "pickupTime", form.pickupTime);
  appendFormValue(formData, "flightNumber", form.flightNumber);
  appendFormValue(formData, "passengerCount", form.passengerCount);
  appendFormValue(formData, "luggage", form.luggage);
  appendFormValue(formData, "requestedVehicleLabel", form.requestedVehicleLabel);
  appendFormValue(formData, "paymentPreference", form.paymentPreference);
  appendFormValue(formData, "customerName", form.customerName);
  appendFormValue(formData, "customerEmail", form.customerEmail);
  appendFormValue(formData, "customerPhone", form.customerPhone);
  appendFormValue(formData, "notes", form.notes);
  return formData;
}

function appendFormValue(formData: FormData, key: string, value: string | undefined) {
  const trimmed = value?.trim();
  if (trimmed) formData.append(key, trimmed);
}

function appendLocationDetails(
  formData: FormData,
  key: string,
  details: AddressDetails | undefined,
) {
  if (!details) return;
  formData.append(key, JSON.stringify(details));
}

function getServiceLabel(value: TabId) {
  return serviceOptions.find((option) => option.id === value)?.label ?? value;
}
