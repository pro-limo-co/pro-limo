export function GET() {
  return Response.json({
    ok: true,
    ts: Date.now(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
  });
}
