import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Lightweight liveness probe used by Corvus post-deploy smoke tests
 * and uptime monitors. Returns 200 with a JSON body so both HTTP-level
 * and JSON-parsing checks pass.
 */
export const runtime = "edge";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "local",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
