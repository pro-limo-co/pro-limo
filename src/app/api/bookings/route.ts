import { ConvexHttpClient } from "convex/browser";
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
      airportTrip: readOptionalString(formData, "airportTrip"),
      pickupDate,
      pickupTime,
      duration,
      flightNumber: readOptionalString(formData, "flightNumber"),
      passengerCount,
      luggage,
      customerName,
      customerEmail,
      customerPhone,
      notes: readOptionalString(formData, "notes"),
    });

    return Response.json({
      status: "success",
      message: "Request received. Dispatch will confirm pricing and availability.",
      publicReference: result.publicReference,
    });
  } catch (error) {
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
