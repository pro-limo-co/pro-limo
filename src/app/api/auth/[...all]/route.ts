import { authRouteHandlers } from "@/lib/auth-server";

export const runtime = "nodejs";

export const { GET, POST } = authRouteHandlers;

