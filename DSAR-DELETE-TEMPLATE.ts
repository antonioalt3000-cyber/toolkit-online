import { NextRequest, NextResponse } from "next/server";

/**
 * GDPR Art. 17 — Right to Erasure (Right to be Forgotten)
 *
 * User submits {email, confirm}. We log the request and respond within 30 days.
 * Founder processes manually: redis SCAN for user keys, DEL + session revoke.
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
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      confirm?: boolean;
    };
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const confirm = body.confirm === true;

    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    if (!confirm) {
      return NextResponse.json(
        {
          error:
            "Deletion requires explicit confirmation. Set confirm:true in request body. This action is irreversible.",
        },
        { status: 400 },
      );
    }

    const reqId = crypto.randomUUID();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    const record = {
      requestId: reqId,
      email,
      type: "delete",
      service: "__SERVICE_NAME__",
      requestedAt: new Date().toISOString(),
      ip,
      userAgent: request.headers.get("user-agent")?.slice(0, 200) ?? "unknown",
    };

    await redisSet(
      `dsar:delete:${reqId}`,
      JSON.stringify(record),
      60 * 60 * 24 * 90,
    );

    return NextResponse.json(
      {
        success: true,
        requestId: reqId,
        message:
          "Deletion request received. All personal data will be removed within 30 days (GDPR Art. 17). We may retain anonymized aggregate data and logs required by law.",
        maxResponseDays: 30,
      },
      { status: 202 },
    );
  } catch (err) {
    console.error("[dsar/delete] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/user/delete",
    description:
      "GDPR Art. 17 erasure request. Send {email: string, confirm: true} in JSON body. Irreversible.",
    maxResponseDays: 30,
  });
}
