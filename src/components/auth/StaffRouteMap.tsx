"use client";

import { ArrowRight, CarFront } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TsMapInstance = {
  destroy?: () => void;
  updateSize?: () => void;
  setFocus?: (config: { coords: [number, number]; scale?: number; animate?: boolean }) => void;
  _setScale?: (scale: number, x: number, y: number, isDrag?: boolean, animate?: boolean) => void;
  scale?: number;
  _width?: number;
  _height?: number;
};

type StaffRouteMapProps = {
  className?: string;
};

const routeMarkers = [
  {
    name: "PDX arrivals",
    coords: [45.5898, -122.5951] as [number, number],
  },
  {
    name: "Pearl District",
    coords: [45.5306, -122.6823] as [number, number],
  },
  {
    name: "Dispatch desk",
    coords: [45.5152, -122.6784] as [number, number],
  },
];

export function StaffRouteMap({ className }: StaffRouteMapProps) {
  const rawId = useId();
  const mapId = `staff-route-map-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const mapRef = useRef<TsMapInstance | null>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let disposed = false;

    async function initMap() {
      try {
        const [{ VectorMap }, usMapModule] = await Promise.all([
          import("ts-maps"),
          import("ts-maps/us-merc-en"),
        ]);
        if (disposed) return;

        const mapData = usMapModule.default ?? usMapModule.us_merc_en;
        VectorMap.addMap("staff-route-us", mapData);

        const map = new VectorMap({
          selector: `#${mapId}`,
          map: { name: "staff-route-us", projection: "mercator" },
          backgroundColor: "transparent",
          bindTouchEvents: false,
          draggable: false,
          markers: routeMarkers,
          markerStyle: {
            initial: {
              fill: "#050505",
              stroke: "#ffffff",
              strokeOpacity: 1,
              strokeWidth: 5,
              r: 7,
            },
            hover: {
              fill: "#050505",
              cursor: "default",
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
              fill: "#e5ecef",
              cursor: "default",
            },
            selected: {
              fill: "#e5ecef",
            },
            selectedHover: {},
          },
          lines: {
            curvature: 0.18,
            elements: [
              {
                from: "PDX arrivals",
                to: "Pearl District",
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
          },
          showTooltip: false,
          zoomButtons: false,
          zoomOnScroll: false,
        }) as TsMapInstance;

        mapRef.current = map;

        requestAnimationFrame(() => {
          if (disposed) return;
          map.updateSize?.();
          map.setFocus?.({ coords: [45.55, -122.64], scale: 8, animate: false });
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
  }, [mapId]);

  function zoomMap(direction: "in" | "out") {
    const map = mapRef.current;
    if (!map?._setScale || !map.scale || !map._width || !map._height) return;
    const factor = direction === "in" ? 1.35 : 1 / 1.35;
    map._setScale(map.scale * factor, map._width / 2, map._height / 2, false, true);
  }

  return (
    <Card
      className={cn(
        "relative min-h-[360px] w-full min-w-0 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-[30px] border-white/10 bg-[#e7ecef] text-black sm:max-w-full",
        className,
      )}
    >
      <div className="absolute inset-0">
        <div
          id={mapId}
          className="size-full opacity-95 [&_.jvm-container]:size-full [&_.jvm-label]:hidden [&_.jvm-line]:drop-shadow-sm [&_.jvm-marker]:drop-shadow-sm [&_.jvm-zoom-btn]:hidden [&_svg]:size-full"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_72%,rgba(57,151,91,0.18),transparent_17%),radial-gradient(circle_at_76%_23%,rgba(57,151,91,0.14),transparent_15%),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:100%_100%,100%_100%,64px_64px,64px_64px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent_36%,rgba(255,255,255,0.18))]" />

      {mapStatus !== "ready" ? (
        <div className="absolute inset-0 grid place-items-center bg-[#e7ecef]/70 text-sm font-black text-black/44">
          {mapStatus === "error" ? "Map unavailable" : "Loading route map"}
        </div>
      ) : null}

      <div className="absolute left-4 top-4 max-w-[calc(100%-5.5rem)] rounded-2xl bg-white px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.14)] sm:left-5 sm:top-5">
        <p className="text-xs font-black uppercase text-black/40">Live route</p>
        <p className="mt-1 truncate text-lg font-black">PDX to Pearl District</p>
      </div>

      <div className="absolute right-4 top-4 overflow-hidden rounded-2xl bg-white shadow-[0_12px_34px_rgba(0,0,0,0.16)] sm:right-5 sm:top-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Zoom route map in"
          className="rounded-none border-b border-black/10 text-2xl font-black text-black hover:bg-[#f2f2f2]"
          onClick={() => zoomMap("in")}
        >
          +
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Zoom route map out"
          className="rounded-none text-2xl font-black text-black hover:bg-[#f2f2f2]"
          onClick={() => zoomMap("out")}
        >
          -
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 rounded-[24px] bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:bottom-5 sm:left-5 sm:right-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#050505] text-white">
              <CarFront className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black/45">From PDX arrivals</p>
              <p className="truncate text-xl font-black">To Pearl District hotel</p>
            </div>
          </div>
          <ArrowRight className="size-5 shrink-0" aria-hidden />
        </div>
      </div>
    </Card>
  );
}
