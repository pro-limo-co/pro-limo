export type Service = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  intro: string;
  bullets: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "airport-transfer",
    name: "Airport transfer",
    shortName: "Airport",
    tagline: "Arrivals and departures, handled.",
    intro:
      "A Professional Limousine Driver airport transfer works both ways: your chauffeur can meet you at arrivals or stage your departure ride for a calm curbside drop-off.",
    bullets: [
      { title: "Airport pickup and drop-off", body: "Book arrivals, departures, round trips, and private terminal transfers." },
      { title: "Live flight tracking", body: "For arrivals, your driver adjusts to delays without you lifting a finger." },
      { title: "60 minutes free wait", body: "From your scheduled landing at supported commercial airports." },
      { title: "Departure staging", body: "For airport drop-offs, pickup timing accounts for luggage, traffic, and terminal distance." },
      { title: "Flat fare", body: "No surge, no traffic surcharge, no late-night premium." },
    ],
    faqs: [
      {
        q: "What if my flight is delayed?",
        a: "Your chauffeur tracks the flight live. The 60-minute free wait clock starts when your wheels touch down, not at your scheduled time.",
      },
      {
        q: "Can I book airport pickup and airport drop-off?",
        a: "Yes. Choose an arrival pickup, departure drop-off, round trip, or private terminal transfer.",
      },
      {
        q: "Will you meet me inside the terminal?",
        a: "Yes. For arrivals, a chauffeur or greeter can meet you inside with a discreet name card when airport rules allow it.",
      },
      {
        q: "Can you handle multiple bags?",
        a: "First-class fares accommodate three large pieces; Sprinter fares handle up to seven plus carry-ons.",
      },
    ],
  },
  {
    slug: "hourly-chauffeur",
    name: "Hourly chauffeur",
    shortName: "By the hour",
    tagline: "Your day, on retainer.",
    intro:
      "Reserve Professional Limousine Driver for two hours or twelve. Your chauffeur stays with you for the entire booking, every stop, change of plan, and unscheduled detour included on a single flat fare.",
    bullets: [
      { title: "Unlimited stops", body: "Add or remove stops without changing the fare." },
      { title: "Unlimited mileage (within metro)", body: "We never count kilometers inside the city." },
      { title: "Stays with you", body: "Same chauffeur, same vehicle, start to finish." },
      { title: "From two hours", body: "Two-hour minimum. Twelve-hour maximum per booking." },
    ],
    faqs: [
      {
        q: "Can I extend on the day?",
        a: "Yes, your chauffeur can extend by the half-hour, billed at the published prorated rate.",
      },
      {
        q: "Can I leave bags in the vehicle?",
        a: "Always. The car remains yours for the duration of the booking.",
      },
    ],
  },
  {
    slug: "city-to-city",
    name: "City-to-city",
    shortName: "Intercity",
    tagline: "Between cities, done better.",
    intro:
      "Move between regional cities without the airport. A Professional Limousine Driver intercity transfer moves you privately, on your own clock, in a quiet vehicle with a chauffeur briefed on your route.",
    bullets: [
      { title: "Door-to-door", body: "From your address to theirs, no transfers, no terminals." },
      { title: "Scenic routing", body: "Choose the working route, or the one with a lake stop." },
      { title: "Regional corridors", body: "Portland-Seattle, Portland-Eugene, coast, Gorge, and valley routes on a single fare." },
      { title: "Stops included", body: "Coffee, lunch, a view, all part of the fare." },
    ],
    faqs: [
      {
        q: "Can we make stops along the way?",
        a: "Of course. Tell your chauffeur on the day, or pre-program stops in your booking.",
      },
      {
        q: "What about cross-border fees?",
        a: "All tolls, road tax, and border fees are included in your flat all-inclusive fare.",
      },
    ],
  },
  {
    slug: "for-business",
    name: "Professional Limousine Driver for Business",
    shortName: "Business",
    tagline: "Corporate travel, simplified.",
    intro:
      "Centralize ground transportation for your company. Travel managers get clear booking records, traveler profiles, duty-of-care reporting, and a dedicated account director.",
    bullets: [
      { title: "Centralized billing", body: "One invoice, one cost center, one reconciled spreadsheet." },
      { title: "Traveler profiles", body: "Once-saved preferences travel with each employee across the service area." },
      { title: "Duty-of-care reports", body: "Live trip status, automatic check-ins, audit-ready logs." },
      { title: "Dedicated concierge", body: "A real person, named, on a direct line, always." },
    ],
    faqs: [
      {
        q: "Do you integrate with our travel platform?",
        a: "Yes. Professional Limousine Driver can support Concur, TravelPerk, Egencia, and GDS workflows through account setup.",
      },
      {
        q: "What about VAT and receipts?",
        a: "VAT-compliant invoices are issued automatically per booking, per traveler, or consolidated monthly.",
      },
    ],
  },
  {
    slug: "events-roadshows",
    name: "Events & roadshows",
    shortName: "Events",
    tagline: "Choreographed, on the day.",
    intro:
      "Multi-vehicle, multi-day, multi-city. A Professional Limousine Driver events team plans the run-of-show with you and runs it on the day from a single dispatch desk.",
    bullets: [
      { title: "Multi-vehicle dispatch", body: "Five cars, fifty cars, one quiet command desk." },
      { title: "On-site coordinator", body: "An on-the-ground producer for the duration of your event." },
      { title: "Branded fleet (option)", body: "Subtle, removable livery for sponsorship moments." },
      { title: "Confidential", body: "NDAs and chauffeur briefings as standard." },
    ],
    faqs: [
      {
        q: "Smallest event you handle?",
        a: "A two-car ride to a wedding rehearsal counts as an event for us.",
      },
      {
        q: "Largest?",
        a: "Large event programs are scoped by vehicle count, venue spread, staging windows, and on-site coordination needs.",
      },
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
