import { NextRequest, NextResponse } from "next/server";

/**
 * GDPR Art. 15 / Art. 20 — Data Access / Portability Request
 *
 * User submits {email}. We log the request to Redis with 90d TTL and respond
 * within 30 days (GDPR deadline). Founder processes manually via
 * `redis GET dsar:export:{requestId}` (or scan keys `dsar:export:*`).
 *
 * Not self-service yet; compliant via documented SLA.
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function redisSet(key: string, value: string, ttlSec: number): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis not configured");
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}?EX=${ttlSec}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": "text/plain" },
    body: value,
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Redis SET failed: ${res.status}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";

    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const reqId = crypto.randomUUID();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    const record = {
      requestId: reqId,
      email,
      type: "export",
      service: "__SERVICE_NAME__",
      requestedAt: new Date().toISOString(),
      ip,
      userAgent: request.headers.get("user-agent")?.slice(0, 200) ?? "unknown",
    };

    await redisSet(
      `dsar:export:${reqId}`,
      JSON.stringify(record),
      60 * 60 * 24 * 90,
    );

    return NextResponse.json(
      {
        success: true,
        requestId: reqId,
        message:
          "Data access request received. We will respond within 30 days (GDPR Art. 15/20).",
        maxResponseDays: 30,
      },
      { status: 202 },
    );
  } catch (err) {
    console.error("[dsar/export] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/user/export",
    description:
      "GDPR Art. 15 data access / Art. 20 portability request. Send {email: string} in JSON body.",
    maxResponseDays: 30,
  });
}
