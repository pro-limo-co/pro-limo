import { ConvexHttpClient } from "convex/browser";
import { isRateLimitError } from "@convex-dev/rate-limiter";
import { api } from "@convex/_generated/api";

const bookingModes = ["oneway", "hourly", "airport"] as const;

export async function POST(request: Request) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  if (!convexUrl) {
    return Response.json(
      {
        status: "error",
        message: "Booking is not configured yet. Please call the concierge desk.",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const bookingMode = readString(formData, "bookingMode");
  if (!isBookingMode(bookingMode)) {
    return bookingError("Choose a valid booking type.");
  }

  const passengerCount = Number.parseInt(readString(formData, "passengerCount"), 10);
  if (!Number.isFinite(passengerCount) || passengerCount < 1) {
    return bookingError("Passenger count is required.");
  }

  const pickupLocation = readString(formData, "pickupLocation");
  const dropoffLocation = readOptionalString(formData, "dropoffLocation");
  const duration = readOptionalString(formData, "duration");
  if (!pickupLocation || (bookingMode === "hourly" ? !duration : !dropoffLocation)) {
    return bookingError("Pickup details and either drop-off or duration are required.");
  }

  const pickupDate = readString(formData, "pickupDate");
  const pickupTime = readString(formData, "pickupTime");
  const customerName = readString(formData, "customerName");
  const customerEmail = readString(formData, "customerEmail").toLowerCase();
  const customerPhone = readString(formData, "customerPhone");
  const luggage = readString(formData, "luggage");

  if (!pickupDate || !pickupTime || !customerName || !customerEmail || !customerPhone || !luggage) {
    return bookingError("Trip date, time, contact, and luggage details are required.");
  }

  const idempotencyKey =
    request.headers.get("Idempotency-Key")?.trim() ||
    readOptionalString(formData, "idempotencyKey");

  try {
    const convex = new ConvexHttpClient(convexUrl);
    const result = await convex.mutation(api.bookings.create, {
      bookingMode,
      sourcePath: readOptionalString(formData, "sourcePath"),
      sourceLabel: readOptionalString(formData, "sourceLabel"),
      citySlug: readOptionalString(formData, "citySlug"),
      serviceSlug: readOptionalString(formData, "serviceSlug"),
      pickupLocation,
      dropoffLocation,
      pickupLocationDetails: readOptionalLocation(formData, "pickupLocationDetails"),
      dropoffLocationDetails: readOptionalLocation(formData, "dropoffLocationDetails"),
      airportTrip: readOptionalString(formData, "airportTrip"),
      pickupDate,
      pickupTime,
      duration,
      flightNumber: readOptionalString(formData, "flightNumber"),
      passengerCount,
      luggage,
      requestedVehicleLabel: readOptionalString(formData, "requestedVehicleLabel"),
      paymentPreference: readOptionalString(formData, "paymentPreference"),
      customerName,
      customerEmail,
      customerPhone,
      notes: readOptionalString(formData, "notes"),
      idempotencyKey: idempotencyKey || undefined,
    });

    return Response.json({
      status: "success",
      message: result.replayed
        ? "Request already received. Dispatch will confirm pricing and availability."
        : "Request received. Dispatch will confirm pricing and availability.",
      publicReference: result.publicReference,
      replayed: result.replayed,
    });
  } catch (error) {
    if (isRateLimitError(error)) {
      return Response.json(
        {
          status: "error",
          message: "Too many booking attempts. Please wait a few minutes before trying again.",
        },
        { status: 429 },
      );
    }

    console.error("Booking submission failed", error);
    return Response.json(
      {
        status: "error",
        message: "We could not submit this request. Please call the concierge desk.",
      },
      { status: 500 },
    );
  }
}

function bookingError(message: string) {
  return Response.json({ status: "error", message }, { status: 400 });
}

function isBookingMode(value: string): value is (typeof bookingModes)[number] {
  return bookingModes.some((mode) => mode === value);
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value.length > 0 ? value : undefined;
}

function readOptionalLocation(formData: FormData, key: string) {
  const raw = readString(formData, key);
  if (!raw) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return undefined;
    const candidate = parsed as Record<string, unknown>;
    if (typeof candidate.lat !== "number" || typeof candidate.lng !== "number") return undefined;
    return {
      lat: candidate.lat,
      lng: candidate.lng,
      address: typeof candidate.address === "string" ? candidate.address : undefined,
      city: typeof candidate.city === "string" ? candidate.city : undefined,
      state: typeof candidate.state === "string" ? candidate.state : undefined,
      zip: typeof candidate.zip === "string" ? candidate.zip : undefined,
      placeId: typeof candidate.placeId === "string" ? candidate.placeId : undefined,
      name: typeof candidate.name === "string" ? candidate.name : undefined,
    };
  } catch {
    return undefined;
  }
}
