"use client";

import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// `Input` is used in the plain fallback path; the Places-backed path
// uses a raw <input> because shadcn Input doesn't forward refs.


// Shadcn Input is unforwarded; for the Places-backed field we render a
// raw <input> with the same class names so Google can attach to the
// real DOM node via ref.
const INPUT_CLASS =
  "flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export type AddressDetails = {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat: number;
  lng: number;
  placeId?: string;
  name?: string;
};

type Props = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  /**
   * Fires on every text change. Mirrors the existing `Field` contract so
   * the form keeps its string-only value source of truth.
   */
  onChange: (value: string) => void;
  /**
   * Fires when the user picks a Places suggestion (or undefined when
   * they clear / retype past the selection).
   */
  onDetailsChange: (details: AddressDetails | undefined) => void;
};

/**
 * Wraps the existing Field UI. When NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is
 * unset, renders the plain text input verbatim — same UX as today.
 * When set, mounts the Maps JS API via APIProvider and decorates the
 * input with a Places Autocomplete widget that populates structured
 * details on selection.
 */
export function AddressAutocomplete(props: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    return <PlainAddressField {...props} />;
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]}>
      <PlacesAddressField {...props} />
    </APIProvider>
  );
}

function PlainAddressField({
  id,
  label,
  required,
  value,
  placeholder,
  onChange,
}: Props) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
    </div>
  );
}

function PlacesAddressField({
  id,
  label,
  required,
  value,
  placeholder,
  onChange,
  onDetailsChange,
}: Props) {
  const places = useMapsLibrary("places");
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!places || !inputRef.current) return;
    // google.maps.places.Autocomplete is the legacy but stable widget
    // supported by react-google-maps. The newer PlaceAutocompleteElement
    // is still beta as of v1.8.
    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "name", "place_id", "address_components"],
      types: ["geocode", "establishment"],
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      if (!location) {
        onDetailsChange(undefined);
        return;
      }

      const address = place.formatted_address ?? place.name ?? "";
      if (address) onChange(address);

      const components = place.address_components ?? [];
      const findComponent = (type: string) =>
        components.find((component) => component.types.includes(type))?.long_name;
      const findShortComponent = (type: string) =>
        components.find((component) => component.types.includes(type))?.short_name;

      onDetailsChange({
        address,
        city: findComponent("locality") ?? findComponent("postal_town"),
        state: findShortComponent("administrative_area_level_1"),
        zip: findComponent("postal_code"),
        lat: location.lat(),
        lng: location.lng(),
        placeId: place.place_id ?? undefined,
        name: place.name ?? undefined,
      });
    });

    setReady(true);
    return () => listener.remove();
  }, [places, onChange, onDetailsChange]);

  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
        {!ready ? (
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Loading suggestions&hellip;
          </span>
        ) : null}
      </Label>
      <input
        ref={inputRef}
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
          // If user edits past the selected place, clear the structured
          // details so we don't ship stale lat/lng to the server.
          onDetailsChange(undefined);
        }}
        className={cn(INPUT_CLASS, "mt-2")}
        autoComplete="off"
      />
    </div>
  );
}
