"use client";

import { MapPin, Navigation } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { MapOptions, MarkerConfig, VectorMap as VectorMapInstance } from "ts-maps";
import { cn } from "@/lib/utils";

type Location = {
  lat: number;
  lng: number;
};

type Props = {
  pickup?: Location;
  dropoff?: Location;
  mapId?: string;
  className?: string;
};

type UsMapModule = {
  default?: unknown;
  us_merc_en?: unknown;
};

type RouteVectorMap = VectorMapInstance & {
  destroy?: () => void;
  setFocus?: (config: { coords: [number, number]; scale?: number; animate?: boolean }) => void;
  updateSize?: () => void;
};

const DEFAULT_MAP_ID = "pro-limo-booking";
const ROUTE_MAP_NAME = "booking-route-us";

let routeMapRegistered = false;

export function BookingMapPreview({ pickup, dropoff, mapId = DEFAULT_MAP_ID, className }: Props) {
  const rawId = useId();
  const elementId = `${mapId}-${rawId}`.replace(/[^a-zA-Z0-9_-]/g, "");
  const mapRef = useRef<RouteVectorMap | null>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");
  const pickupLat = pickup?.lat;
  const pickupLng = pickup?.lng;
  const dropoffLat = dropoff?.lat;
  const dropoffLng = dropoff?.lng;

  const markers = useMemo(() => {
    const nextMarkers: MarkerConfig[] = [];
    if (pickupLat !== undefined && pickupLng !== undefined) {
      nextMarkers.push({ name: "Pickup", coords: [pickupLat, pickupLng] });
    }
    if (dropoffLat !== undefined && dropoffLng !== undefined) {
      nextMarkers.push({ name: "Drop-off", coords: [dropoffLat, dropoffLng] });
    }
    return nextMarkers;
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  const focus = useMemo(() => {
    if (markers.length === 0) return null;
    const lat = markers.reduce((sum, marker) => sum + marker.coords[0], 0) / markers.length;
    const lng = markers.reduce((sum, marker) => sum + marker.coords[1], 0) / markers.length;
    return {
      coords: [lat, lng] as [number, number],
      scale: markers.length > 1 ? 8 : 6,
    };
  }, [markers]);

  const hasRouteLine = markers.length > 1;

  useEffect(() => {
    if (!focus) return;
    const focusConfig = focus;
    let disposed = false;

    async function initMap() {
      try {
        const [{ VectorMap }, usMapModule] = await Promise.all([
          import("ts-maps"),
          import("ts-maps/us-merc-en") as Promise<UsMapModule>,
        ]);
        if (disposed) return;

        const mapData = usMapModule.default ?? usMapModule.us_merc_en;
        if (!routeMapRegistered) {
          try {
            VectorMap.addMap(ROUTE_MAP_NAME, mapData);
          } finally {
            routeMapRegistered = true;
          }
        }

        const options: MapOptions = {
          selector: `#${elementId}`,
          map: { name: ROUTE_MAP_NAME, projection: "mercator" },
          backgroundColor: "transparent",
          bindTouchEvents: false,
          draggable: false,
          markers,
          markerStyle: {
            initial: {
              fill: "#050505",
              r: 7,
              stroke: "#ffffff",
              strokeOpacity: 1,
              strokeWidth: 5,
            },
            hover: {
              cursor: "default",
              fill: "#050505",
            },
            selected: {
              fill: "#050505",
            },
            selectedHover: {},
          },
          regionStyle: {
            initial: {
              fill: "#eef2f3",
              stroke: "#c9d3d8",
              strokeOpacity: 0.82,
              strokeWidth: 0.9,
            },
            hover: {
              cursor: "default",
              fill: "#e5ecef",
            },
            selected: {
              fill: "#e5ecef",
            },
            selectedHover: {},
          },
          lines: hasRouteLine
            ? {
                curvature: 0.18,
                elements: [
                  {
                    from: "Pickup",
                    to: "Drop-off",
                    style: {
                      stroke: "#050505",
                      strokeLinecap: "round",
                      strokeWidth: 6,
                    },
                  },
                ],
                style: {
                  stroke: "#050505",
                  strokeLinecap: "round",
                  strokeWidth: 6,
                },
              }
            : undefined,
          showTooltip: false,
          zoomButtons: false,
          zoomOnScroll: false,
        };

        const map = new VectorMap(options) as RouteVectorMap;

        mapRef.current = map;

        requestAnimationFrame(() => {
          if (disposed) return;
          map.updateSize?.();
          map.setFocus?.({ coords: focusConfig.coords, scale: focusConfig.scale, animate: false });
          setMapStatus("ready");
        });
      } catch {
        if (!disposed) setMapStatus("error");
      }
    }

    void initMap();

    return () => {
      disposed = true;
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
  }, [elementId, focus, hasRouteLine, markers]);

  if (!focus) return null;

  return (
    <div
      className={cn(
        "relative min-h-[260px] w-full overflow-hidden rounded-[24px] border border-black/10 bg-[#e7ecef] text-black",
        className,
      )}
    >
      <div className="absolute inset-0">
        <div
          id={elementId}
          className="size-full opacity-95 [&_.jvm-container]:size-full [&_.jvm-label]:hidden [&_.jvm-line]:drop-shadow-sm [&_.jvm-marker]:drop-shadow-sm [&_.jvm-zoom-btn]:hidden [&_svg]:size-full"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.26)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent_38%,rgba(255,255,255,0.16))]" />

      {mapStatus !== "ready" ? (
        <div className="absolute inset-0 grid place-items-center bg-[#e7ecef]/75 text-sm font-black text-black/44">
          {mapStatus === "error" ? "Route map unavailable" : "Loading route map"}
        </div>
      ) : null}

      <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.14)]">
        <Navigation className="size-4 shrink-0" aria-hidden />
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-black/40">Ride route</p>
          <p className="truncate text-sm font-black">
            {hasRouteLine ? "Pickup to drop-off" : "Saved location"}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 grid gap-2 rounded-[22px] bg-white p-3 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:grid-cols-2">
        <LocationPill label="Pickup" active={pickup !== undefined} />
        <LocationPill label="Drop-off" active={dropoff !== undefined} />
      </div>
    </div>
  );
}

function LocationPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-black/10 bg-[#f3f3f3] px-3 py-2">
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", active ? "bg-[#050505] text-white" : "bg-[#050505]/10 text-black/38")}>
        <MapPin className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase text-black/42">{label}</p>
        <p className="truncate text-sm font-semibold text-black">{active ? "Geocoded" : "Not set"}</p>
      </div>
    </div>
  );
}
