"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { staffRoutePaths } from "@/components/admin/staffRoutes";

export function useStaffRoutePrefetch(priorityPath?: string) {
  const router = useRouter();

  useEffect(() => {
    const paths = Array.from(
      new Set([
        priorityPath?.startsWith("/admin/") ? priorityPath : undefined,
        ...staffRoutePaths,
      ].filter((path): path is string => Boolean(path))),
    );

    const prefetchStaffRoutes = () => {
      for (const path of paths) {
        router.prefetch(path);
      }
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(prefetchStaffRoutes, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(prefetchStaffRoutes, 250);
    return () => globalThis.clearTimeout(timeoutId);
  }, [priorityPath, router]);
}
