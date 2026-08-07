import { NextResponse } from "next/server";
import { OptInSchema, upsertCard, revokeCard } from "@/lib/card/service";
import { isDbConfigured } from "@/lib/db";

/**
 * The opt-in endpoint. This is the wire the trifecta was missing.
 *
 * skill.supply calls POST here at the end of a free report ("add me to the
 * pool"), which creates a consented card that darktalent can then sell access
 * to. Seekers never pay for this and are never sold to, per ECOSYSTEM.md.
 *
 * DELETE revokes. The right to leave has to be as easy as the right to join.
 *
 * This is called cross-origin from the browser (skill.supply's own site, and
 * later company.university's), so it needs real CORS: an allowlist, not a
 * wildcard, because unlike a read-only endpoint this one writes real records.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ORIGINS = [
  "https://skill.supply",
  "https://www.skill.supply",
  "https://company.university",
  "https://www.company.university",
  "http://localhost:3000",
  "http://localhost:3001",
];

function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin");
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]!;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: { ...corsHeaders(req), ...init?.headers },
  });
}

function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

/** Health check, so a caller can tell whether opt-ins are being accepted. */
export async function GET(req: Request) {
  return json(req, {
    accepting: isDbConfigured(),
    note: isDbConfigured()
      ? "Opt-ins are being accepted."
      : "No DATABASE_URL configured, so opt-ins are rejected and the hiring pool falls back to labeled composites.",
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(req, { ok: false, error: "Body must be JSON." }, { status: 400 });
  }

  const parsed = OptInSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      req,
      {
        ok: false,
        error: "Invalid opt-in.",
        detail: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 400 },
    );
  }

  const result = await upsertCard(parsed.data, { ip: clientIp(req) });
  if (!result.ok) {
    const status = result.code === "NO_DB" ? 503 : result.code === "INGEST_FAILED" ? 422 : 500;
    return json(req, result, { status });
  }
  return json(req, result, { status: result.created ? 201 : 200 });
}

export async function DELETE(req: Request) {
  const handle = new URL(req.url).searchParams.get("handle");
  if (!handle) {
    return json(req, { ok: false, error: "Pass ?handle=" }, { status: 400 });
  }
  const result = await revokeCard(handle);
  return json(req, result, { status: result.ok ? 200 : 400 });
}
