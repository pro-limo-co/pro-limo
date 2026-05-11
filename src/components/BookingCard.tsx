"use client";

import { useId, useState } from "react";

const tabs = [
  { id: "oneway", label: "One-way" },
  { id: "hourly", label: "By the hour" },
  { id: "airport", label: "Airport" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type BookingCardProps = {
  defaultTab?: TabId;
};

export function BookingCard({ defaultTab = "oneway" }: BookingCardProps) {
  const [tab, setTab] = useState<TabId>(defaultTab);
  const fromId = useId();
  const toId = useId();
  const dateId = useId();
  const timeId = useId();
  const paxId = useId();
  const flightId = useId();
  const durationId = useId();
  const luggageId = useId();
  const airportDirectionId = useId();
  const isAirport = tab === "airport";

  return (
    <div className="surface-raised rounded-2xl p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
      <div role="tablist" aria-label="Booking type" className="flex gap-1 p-1 bg-[color:var(--color-ink)]/40 rounded-xl">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
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

      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-px mt-2 bg-[color:var(--color-divider-soft)] rounded-xl overflow-hidden"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Field
          id={fromId}
          label={isAirport ? "Pickup location" : "Pickup"}
          placeholder={isAirport ? "Airport, home, hotel, or office" : "Address, airport, or hotel"}
          icon="pin"
        />
        {tab === "hourly" ? (
          <Field id={durationId} label="Duration" placeholder="Choose hours" type="select" options={["2 hours", "3 hours", "4 hours", "6 hours", "Full day (8h)", "Full day (10h)"]} icon="clock" />
        ) : (
          <Field
            id={toId}
            label={isAirport ? "Drop-off location" : "Drop-off"}
            placeholder={isAirport ? "Airport terminal, home, hotel, or office" : "Final destination"}
            icon="flag"
          />
        )}
        {isAirport && (
          <Field
            id={airportDirectionId}
            label="Airport trip"
            placeholder="Choose pickup or drop-off"
            type="select"
            options={["Airport pickup", "Airport drop-off", "Round trip", "Private terminal"]}
            icon="plane"
          />
        )}
        <Field id={dateId} label="Date" placeholder="Pick a date" type="date" icon="cal" />
        <Field id={timeId} label="Pickup time" placeholder="HH:MM" type="time" icon="clock" />
        {isAirport && (
          <Field id={flightId} label="Flight number" placeholder="e.g. BA 286" icon="plane" />
        )}
        <Field id={paxId} label="Passengers" type="select" options={["1", "2", "3", "4", "5", "6", "7"]} icon="user" />
        <Field id={luggageId} label="Luggage" type="select" options={["Carry-on only", "1 large bag", "2 large bags", "3 large bags", "4 large bags", "5+ large bags"]} icon="bag" />
      </form>

      <div className="flex flex-col sm:flex-row gap-3 mt-3 px-2 sm:px-3">
        <button type="submit" className="btn btn-primary flex-1">
          See prices & reserve
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <a href="#concierge" className="btn btn-ghost sm:flex-[0.5]">
          Concierge
        </a>
      </div>

      <div className="flex items-center gap-3 px-3 pt-4 pb-2 font-condensed text-[0.7rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-champagne)]" />
        Airport pickup and drop-off · Free 60-min wait on arrivals
      </div>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  type?: "text" | "date" | "time" | "select";
  options?: string[];
  icon?: "pin" | "flag" | "cal" | "clock" | "plane" | "user" | "bag";
};

function Field({ id, label, placeholder, type = "text", options, icon }: FieldProps) {
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
              className="field mt-1 text-[0.95rem] bg-transparent appearance-none pr-6 cursor-pointer"
              defaultValue=""
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
          ) : (
            <input
              id={id}
              type={type}
              placeholder={placeholder}
              className="field mt-1 text-[0.95rem]"
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
    default:
      return null;
  }
}
