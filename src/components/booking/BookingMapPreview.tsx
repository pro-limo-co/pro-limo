"use client";

import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

type Location = {
  lat: number;
  lng: number;
};

type Props = {
  pickup?: Location;
  dropoff?: Location;
  /**
   * Stable map ID; required when using AdvancedMarker. We share one
   * ID across both consumer sites; Google still serves correctly.
   */
  mapId?: string;
  className?: string;
};

const DEFAULT_MAP_ID = "pro-limo-booking";

/**
 * Renders pickup + dropoff markers on a Google Map. Auto-fits bounds
 * to whichever markers exist. Returns null silently when there's no
 * usable lat/lng or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is unset, so
 * callers can drop it into any layout without conditional wrappers.
 */
export function BookingMapPreview({ pickup, dropoff, mapId = DEFAULT_MAP_ID, className }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) return null;
  if (!pickup && !dropoff) return null;

  // Default center: mid-point of available markers (or single marker).
  const points = [pickup, dropoff].filter((point): point is Location => Boolean(point));
  const center = {
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length,
  };

  return (
    <div className={className ?? "aspect-[16/9] w-full overflow-hidden rounded-md border"}>
      <APIProvider apiKey={apiKey}>
        <Map
          mapId={mapId}
          defaultCenter={center}
          defaultZoom={12}
          gestureHandling="greedy"
          disableDefaultUI
          clickableIcons={false}
          className="size-full"
        >
          {pickup ? <AdvancedMarker position={pickup} title="Pickup" /> : null}
          {dropoff ? <AdvancedMarker position={dropoff} title="Drop-off" /> : null}
          <FitBounds pickup={pickup} dropoff={dropoff} />
        </Map>
      </APIProvider>
    </div>
  );
}

/**
 * Imperative fitBounds when both markers exist. Lives inside the
 * APIProvider so useMap() resolves. Idempotent — re-runs only when
 * the coordinates change.
 */
function FitBounds({ pickup, dropoff }: { pickup?: Location; dropoff?: Location }) {
  const map = useMap();
  const pickupLat = pickup?.lat;
  const pickupLng = pickup?.lng;
  const dropoffLat = dropoff?.lat;
  const dropoffLng = dropoff?.lng;

  useEffect(() => {
    if (!map || pickupLat === undefined || pickupLng === undefined) return;
    if (dropoffLat === undefined || dropoffLng === undefined) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: pickupLat, lng: pickupLng });
    bounds.extend({ lat: dropoffLat, lng: dropoffLng });
    map.fitBounds(bounds, 64);
  }, [map, pickupLat, pickupLng, dropoffLat, dropoffLng]);
  return null;
}
