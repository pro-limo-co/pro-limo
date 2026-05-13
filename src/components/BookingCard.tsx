"use client";

import { ArrowRight, CheckCircle2, Headphones } from "lucide-react";
import { FormEvent, type ReactNode, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "oneway", label: "One-way" },
  { id: "hourly", label: "Hourly" },
  { id: "airport", label: "Airport" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type BookingCardProps = {
  defaultTab?: TabId;
  citySlug?: string;
  serviceSlug?: string;
  sourceLabel?: string;
  sourcePath?: string;
};

const initialState: BookingSubmissionState = {
  status: "idle",
  message: "",
};

type BookingSubmissionState = {
  status: "idle" | "success" | "error";
  message: string;
  publicReference?: string;
};

export function BookingCard({
  defaultTab = "oneway",
  citySlug,
  serviceSlug,
  sourceLabel = "Website",
  sourcePath = "/",
}: BookingCardProps) {
  const [state, setState] = useState<BookingSubmissionState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [tab, setTab] = useReducer((_current: TabId, next: TabId) => next, defaultTab);
  const isAirport = tab === "airport";
  const isHourly = tab === "hourly";
  const isSubmitted = state.status === "success" && Boolean(state.publicReference);

  return (
    <Card className="pld-ui border-border bg-card text-card-foreground shadow-2xl shadow-black/20">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-normal">Book a ride</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Send the request. Dispatch confirms price and availability.
            </CardDescription>
          </div>
          <div className="hidden rounded-md bg-accent px-3 py-2 text-xs font-medium text-accent-foreground sm:block">
            24/7 desk
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form key={formKey} onSubmit={handleSubmit} className="grid gap-5">
          <input type="hidden" name="bookingMode" value={tab} />
          <input type="hidden" name="sourceLabel" value={sourceLabel} />
          <input type="hidden" name="sourcePath" value={sourcePath} />
          {citySlug && <input type="hidden" name="citySlug" value={citySlug} />}
          {serviceSlug && <input type="hidden" name="serviceSlug" value={serviceSlug} />}

          <Tabs value={tab} onValueChange={(value) => setTab(value as TabId)}>
            <TabsList className="grid h-11 w-full grid-cols-3 bg-muted">
              {tabs.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="text-sm">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid gap-4">
            <SectionTitle>Trip</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={isAirport ? "Pickup location" : "Pickup"} name="pickupLocation" placeholder="Address, airport, or hotel" required />
              {isHourly ? (
                <SelectField
                  label="Duration"
                  name="duration"
                  placeholder="Choose hours"
                  options={["2 hours", "3 hours", "4 hours", "6 hours", "Full day (8h)", "Full day (10h)"]}
                  required
                />
              ) : (
                <Field label={isAirport ? "Drop-off location" : "Drop-off"} name="dropoffLocation" placeholder="Final destination" required />
              )}
              {isAirport && (
                <SelectField
                  label="Airport trip"
                  name="airportTrip"
                  placeholder="Pickup or drop-off"
                  options={["Airport pickup", "Airport drop-off", "Round trip", "Private terminal"]}
                  required
                />
              )}
              <Field label="Date" name="pickupDate" type="date" required />
              <Field label="Time" name="pickupTime" type="time" required />
              {isAirport && <Field label="Flight number" name="flightNumber" placeholder="AS 342" />}
            </div>
          </div>

          <div className="grid gap-4">
            <SectionTitle>Passengers</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField label="Passengers" name="passengerCount" placeholder="Select" options={["1", "2", "3", "4", "5", "6", "7"]} required />
              <SelectField
                label="Luggage"
                name="luggage"
                placeholder="Select"
                options={["Carry-on only", "1 large bag", "2 large bags", "3 large bags", "4 large bags", "5+ large bags"]}
                required
              />
            </div>
          </div>

          <div className="grid gap-4">
            <SectionTitle>Contact</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" name="customerName" placeholder="Passenger name" required />
              <Field label="Email" name="customerEmail" type="email" placeholder="you@example.com" required />
              <Field label="Phone" name="customerPhone" type="tel" placeholder="+1 503 555 0100" required />
              <div className="sm:col-span-2">
                <Label htmlFor="booking-notes">Notes</Label>
                <Textarea id="booking-notes" name="notes" placeholder="Arrival details or preferences" className="mt-2 min-h-20" />
              </div>
            </div>
          </div>

          {state.status !== "idle" && (
            <div
              className={cn(
                "rounded-md border px-4 py-3 text-sm",
                state.status === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-red-200 bg-red-50 text-red-900",
              )}
              aria-live="polite"
            >
              <div className="flex gap-3">
                {state.status === "success" && <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />}
                <div className="min-w-0">
                  <p>{state.message}</p>
                  {state.publicReference && (
                    <>
                      <strong className="mt-1 block font-mono text-emerald-700">
                        {state.publicReference}
                      </strong>
                      <p className="mt-1 text-emerald-800">
                        Dispatch can see it now in ProLimo OS.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {isSubmitted && state.publicReference ? (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Button asChild size="lg" className="w-full">
                <a href={`/booking/${encodeURIComponent(state.publicReference)}`}>
                  View request
                  <ArrowRight className="size-4" aria-hidden />
                </a>
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={handleStartAnother}>
                New request
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Button type="submit" disabled={submitting} size="lg" className="w-full">
                {submitting ? "Submitting" : "Submit booking"}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#concierge">
                  <Headphones className="size-4" aria-hidden />
                  Concierge
                </a>
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );

  function handleStartAnother() {
    setState(initialState);
    setFormKey((key) => key + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setState(initialState);
    const response = await fetch("/api/bookings", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    const result = (await response.json()) as BookingSubmissionState;
    setSubmitting(false);
    setState(result);
  }
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
      {children}
    </p>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} required={required} className="mt-2" />
    </div>
  );
}

function SelectField({
  label,
  name,
  placeholder,
  options,
  required,
}: {
  label: string;
  name: string;
  placeholder: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} required={required}>
        <SelectTrigger id={name} className="mt-2">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="pld-ui">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
