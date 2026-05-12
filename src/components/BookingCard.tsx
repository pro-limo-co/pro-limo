"use client";

import { FormEvent, useId, useState } from "react";

const tabs = [
  { id: "oneway", label: "One-way" },
  { id: "hourly", label: "By the hour" },
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
  const [selectedTab, setSelectedTab] = useState<TabId | null>(null);
  const fromId = useId();
  const toId = useId();
  const dateId = useId();
  const timeId = useId();
  const paxId = useId();
  const flightId = useId();
  const durationId = useId();
  const luggageId = useId();
  const airportDirectionId = useId();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const notesId = useId();
  const tab = selectedTab ?? defaultTab;
  const isAirport = tab === "airport";
  const isHourly = tab === "hourly";

  return (
    <form onSubmit={handleSubmit} className="surface-raised rounded-2xl p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
      <input type="hidden" name="bookingMode" value={tab} />
      <input type="hidden" name="sourceLabel" value={sourceLabel} />
      <input type="hidden" name="sourcePath" value={sourcePath} />
      {citySlug && <input type="hidden" name="citySlug" value={citySlug} />}
      {serviceSlug && <input type="hidden" name="serviceSlug" value={serviceSlug} />}

      <div role="tablist" aria-label="Booking type" className="flex gap-1 p-1 bg-[color:var(--color-ink)]/40 rounded-xl">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedTab(t.id)}
              className={[
                "flex-1 h-11 rounded-lg font-condensed text-[0.78rem] tracking-[0.16em] uppercase font-medium transition-colors",
                active
                  ? "bg-[color:var(--color-bone)] text-[color:var(--color-ink)]"
                  : "text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-bone)]",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px mt-2 bg-[color:var(--color-divider-soft)] rounded-xl overflow-hidden">
        <Field
          id={fromId}
          name="pickupLocation"
          label={isAirport ? "Pickup location" : "Pickup"}
          placeholder={isAirport ? "Airport, home, hotel, or office" : "Address, airport, or hotel"}
          icon="pin"
          required
        />
        {isHourly ? (
          <Field
            id={durationId}
            name="duration"
            label="Duration"
            placeholder="Choose hours"
            type="select"
            options={["2 hours", "3 hours", "4 hours", "6 hours", "Full day (8h)", "Full day (10h)"]}
            icon="clock"
            required
          />
        ) : (
          <Field
            id={toId}
            name="dropoffLocation"
            label={isAirport ? "Drop-off location" : "Drop-off"}
            placeholder={isAirport ? "Airport terminal, home, hotel, or office" : "Final destination"}
            icon="flag"
            required
          />
        )}
        {isAirport && (
          <Field
            id={airportDirectionId}
            name="airportTrip"
            label="Airport trip"
            placeholder="Choose pickup or drop-off"
            type="select"
            options={["Airport pickup", "Airport drop-off", "Round trip", "Private terminal"]}
            icon="plane"
            required
          />
        )}
        <Field id={dateId} name="pickupDate" label="Date" placeholder="Pick a date" type="date" icon="cal" required />
        <Field id={timeId} name="pickupTime" label="Pickup time" placeholder="HH:MM" type="time" icon="clock" required />
        {isAirport && (
          <Field id={flightId} name="flightNumber" label="Flight number" placeholder="e.g. BA 286" icon="plane" />
        )}
        <Field id={paxId} name="passengerCount" label="Passengers" type="select" options={["1", "2", "3", "4", "5", "6", "7"]} icon="user" required />
        <Field id={luggageId} name="luggage" label="Luggage" type="select" options={["Carry-on only", "1 large bag", "2 large bags", "3 large bags", "4 large bags", "5+ large bags"]} icon="bag" required />
        <Field id={nameId} name="customerName" label="Name" placeholder="Passenger name" icon="user" required />
        <Field id={emailId} name="customerEmail" label="Email" placeholder="you@example.com" type="email" icon="mail" required />
        <Field id={phoneId} name="customerPhone" label="Phone" placeholder="+1 503 555 0100" type="tel" icon="phone" required />
        <Field id={notesId} name="notes" label="Notes" placeholder="Arrival details or preferences" type="textarea" icon="note" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-3 px-2 sm:px-3">
        <button type="submit" disabled={submitting} className="btn btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "Submitting" : "See prices & reserve"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <a href="#concierge" className="btn btn-ghost sm:flex-[0.5]">
          Concierge
        </a>
      </div>

      {state.status !== "idle" && (
        <div
          className={[
            "mx-3 mt-4 rounded-lg border px-4 py-3 text-[0.86rem] leading-[1.55]",
            state.status === "success"
              ? "border-[color:var(--color-champagne-dim)] bg-[color:color-mix(in_oklab,var(--color-champagne)_12%,transparent)] text-[color:var(--color-bone)]"
              : "border-red-400/40 bg-red-950/20 text-red-100",
          ].join(" ")}
          aria-live="polite"
        >
          {state.message}
          {state.publicReference && (
            <span className="ml-2 font-mono text-[color:var(--color-champagne-bright)]">
              {state.publicReference}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 px-3 pt-4 pb-2 font-condensed text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
        <span className="inline-flex size-1.5 rounded-full bg-[color:var(--color-champagne)]" />
        Airport pickup and drop-off · Free 60-min wait on arrivals
      </div>
    </form>
  );

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

type FieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "date" | "time" | "select" | "textarea";
  options?: string[];
  icon?: "pin" | "flag" | "cal" | "clock" | "plane" | "user" | "bag" | "mail" | "phone" | "note";
  required?: boolean;
};

function Field({ id, name, label, placeholder, type = "text", options, icon, required }: FieldProps) {
  return (
    <label
      htmlFor={id}
      className="group relative bg-[color:var(--color-ink-soft)] px-5 py-4 cursor-text"
    >
      <div className="flex items-center gap-3">
        <Icon name={icon} />
        <div className="flex-1 min-w-0">
          <span className="block font-condensed text-[0.68rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
            {label}
          </span>
          {type === "select" ? (
            <select
              id={id}
              name={name}
              className="field mt-1 text-[0.95rem] bg-transparent appearance-none pr-6 cursor-pointer"
              defaultValue=""
              required={required}
            >
              <option value="" disabled className="text-[color:var(--color-pewter-dim)]">
                {placeholder ?? "Select"}
              </option>
              {options?.map((o) => (
                <option key={o} value={o} className="bg-[color:var(--color-ink)]">
                  {o}
                </option>
              ))}
            </select>
          ) : type === "textarea" ? (
            <textarea
              id={id}
              name={name}
              placeholder={placeholder}
              className="field mt-1 min-h-12 resize-none text-[0.95rem]"
              required={required}
            />
          ) : (
            <input
              id={id}
              name={name}
              type={type}
              placeholder={placeholder}
              className="field mt-1 text-[0.95rem]"
              required={required}
            />
          )}
        </div>
        {type === "select" && (
          <svg
            aria-hidden
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[color:var(--color-pewter)] -ml-5 pointer-events-none"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </label>
  );
}

function Icon({ name }: { name?: FieldProps["icon"] }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "text-[color:var(--color-champagne)] shrink-0",
  };
  switch (name) {
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case "flag":
      return (
        <svg {...common}>
          <path d="M5 22V4h11l-2 4 2 4H5" />
        </svg>
      );
    case "cal":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "plane":
      return (
        <svg {...common}>
          <path d="M2 16l9-2 4 7 2-1-2-7 7-2-1-2-7 1L9 3 7 4l3 6L2 12z" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0116 0" />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <rect x="4" y="7" width="16" height="14" rx="2" />
          <path d="M9 7V5a3 3 0 016 0v2M4 12h16" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M4 7l8 6 8-6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.11 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.9.33 1.77.62 2.61a2 2 0 01-.45 2.11L8 9.72a16 16 0 006.28 6.28l1.28-1.28a2 2 0 012.11-.45c.84.29 1.71.5 2.61.62A2 2 0 0122 16.92z" />
        </svg>
      );
    case "note":
      return (
        <svg {...common}>
          <path d="M4 4h16v16H4z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    default:
      return null;
  }
}
