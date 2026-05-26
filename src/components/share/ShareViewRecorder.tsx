"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

/**
 * Fire-and-forget view counter for /share/[token]. Runs once on
 * mount so we don't double-count on re-renders. Failures are
 * silenced — view count is best-effort, not correctness-critical.
 */
export function ShareViewRecorder({ shareToken }: { shareToken: string }) {
  const recordView = useMutation(api.tripShares.recordView);

  useEffect(() => {
    void recordView({ shareToken }).catch(() => {});
  }, [recordView, shareToken]);

  return null;
}
