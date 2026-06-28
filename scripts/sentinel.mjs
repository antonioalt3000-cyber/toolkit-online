// ============================================================
// Perpetual Sentinel — synthetic core-action monitor for the 10 SaaS
// ============================================================
// Zero-dep (Node 20+ fetch + tls). Runs daily on GitHub Actions (free) and/or
// locally. For each SaaS it does a SYNTHETIC check that exercises the REAL core
// route (not just the homepage) — the gap the old homepage/health pings missed:
// it catches HookLab/CardForge whose /api/redeem is 404/HTML-shell while the
// homepage stays green.
//
// Per app, two probes (no secret needed — empty body, validation-only):
//   1. GET  /api/health   -> expect 2xx + JSON          (liveness)
//   2. POST /api/redeem {} -> expect 4xx + JSON envelope (core route ALIVE)
//      A healthy revenue route rejects an empty body with a 4xx JSON error.
//      404 OR an HTML body => the route is DEAD => HARD failure.
// Plus TLS cert days-left and latency (latency is a SOFT warning, never a page —
// a 1.2s cold-start is not "down"; only structural/transient faults page).
//
// Status = DEGRADED only on HARD failures (404 / HTML-shell / 5xx / timeout /
// network / non-JSON health / cert < 7d). SOFT warnings (slow / cert < 30d) are
// recorded but keep the app NOMINAL — so the owner is never woken for noise.
//
// Self-heal: a TRANSIENT hard failure (5xx/timeout/network) triggers the app's
// Vercel deploy hook (env DEPLOY_HOOK_<CODE>), wait, re-probe. STRUCTURAL faults
// (404/HTML-shell) are NOT self-healed — a redeploy can't fix a routing/env bug.
// Brevo alert fires only if an app is still HARD-down AFTER self-heal.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tls from "node:tls";

const HERE = dirname(fileURLToPath(import.meta.url));
const HEARTBEAT = resolve(HERE, "..", "logs", "daily_sentinel_heartbeat.json");
const LATENCY_WARN_MS = Number(process.env.LATENCY_WARN_MS || 1500);
const PROBE_TIMEOUT_MS = 12000;
const SELF_HEAL_WAIT_MS = Number(process.env.SELF_HEAL_WAIT_MS || 90000);
const BREVO = process.env.BREVO_API_KEY;
const ALERT_TO = process.env.ALERT_EMAIL || "antonio.alt3000@gmail.com";

const APPS = [
  { code: "F1", brand: "CompliPilot", domain: "complipilot.dev" },
  { code: "F2", brand: "FixMyWeb", domain: "fixmyweb.dev" },
  { code: "F3", brand: "PaymentRescue", domain: "paymentrescue.dev" },
  { code: "F4", brand: "ParseFlow", domain: "parseflow.dev" },
  { code: "B7", brand: "CaptureAPI", domain: "captureapi.dev" },
  { code: "EG", brand: "EmailGuard", domain: "emailguard.dev" },
  { code: "SEO", brand: "SEOScope", domain: "seoscope.dev" },
  { code: "HSH", brand: "HeaderShield", domain: "headershield.dev" },
  { code: "HKL", brand: "HookLab", domain: "hooklab.dev" },
  { code: "CFG", brand: "CardForge", domain: "cardforge.dev" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function timedFetch(url, init) {
  const t0 = performance.now();
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(PROBE_TIMEOUT_MS), redirect: "manual" });
    const body = await res.text();
    return { ok: true, status: res.status, ct: res.headers.get("content-type") || "", body, ms: Math.round(performance.now() - t0) };
  } catch (e) {
    return { ok: false, status: 0, ct: "", body: "", ms: Math.round(performance.now() - t0), err: e?.name === "TimeoutError" ? "timeout" : (e?.message || "network") };
  }
}

function certDaysLeft(host) {
  return new Promise((res) => {
    try {
      const sock = tls.connect({ host, port: 443, servername: host, timeout: 8000 }, () => {
        const c = sock.getPeerCertificate(); sock.end();
        res(c && c.valid_to ? Math.floor((Date.parse(c.valid_to) - Date.now()) / 86400000) : null);
      });
      sock.on("error", () => res(null));
      sock.on("timeout", () => { sock.destroy(); res(null); });
    } catch { res(null); }
  });
}

const isHtml = (ct, body) => ct.includes("text/html") || /^\s*<!doctype html/i.test(body);

async function probe(app) {
  const base = `https://${app.domain}`;
  const hard = [];      // structural/transient failures -> DEGRADED
  const warnings = [];  // soft (slow / cert soon) -> stays NOMINAL
  let transient = false;

  const health = await timedFetch(base + "/api/health", { method: "GET" });
  if (!health.ok) { hard.push(`health:${health.err}`); transient = true; }
  else {
    if (health.status >= 500) { hard.push(`health:HTTP${health.status}`); transient = true; }
    else if (health.status >= 300 || isHtml(health.ct, health.body)) hard.push(`health:not-json(${health.status},${health.ct.split(";")[0] || "?"})`);
    if (health.ms > LATENCY_WARN_MS) warnings.push(`health:slow(${health.ms}ms)`);
  }

  const core = await timedFetch(base + "/api/redeem", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  if (!core.ok) { hard.push(`redeem:${core.err}`); transient = true; }
  else if (core.status === 404) hard.push("redeem:DEAD-404");
  else if (isHtml(core.ct, core.body)) hard.push(`redeem:DEAD-html-shell(${core.status})`);
  else if (core.status >= 500) { hard.push(`redeem:HTTP${core.status}`); transient = true; }
  else if (!(core.status >= 400 && core.status < 500)) hard.push(`redeem:unexpected(${core.status})`);
  if (core.ok && core.ms > LATENCY_WARN_MS) warnings.push(`redeem:slow(${core.ms}ms)`);

  const certDays = await certDaysLeft(app.domain);
  if (certDays != null) {
    if (certDays < 7) hard.push(`ssl:expires-in-${certDays}d`);
    else if (certDays < 30) warnings.push(`ssl:expires-in-${certDays}d`);
  }

  return {
    code: app.code, brand: app.brand, domain: app.domain,
    ok: hard.length === 0, transient, hard, warnings,
    detail: { healthStatus: health.status, healthMs: health.ms, redeemStatus: core.status, redeemCt: (core.ct || "").split(";")[0], certDays },
  };
}

async function selfHeal(app) {
  const hook = process.env[`DEPLOY_HOOK_${app.code}`] || process.env.DEPLOY_HOOK_URL;
  if (!hook) return { attempted: false, healed: false, note: "no deploy hook configured" };
  try { await fetch(hook, { method: "POST", signal: AbortSignal.timeout(10000) }); }
  catch (e) { return { attempted: true, healed: false, note: "hook POST failed: " + (e?.message || "err") }; }
  await sleep(SELF_HEAL_WAIT_MS);
  const re = await probe(app);
  return { attempted: true, healed: re.ok, note: re.ok ? "redeploy recovered" : "still down: " + re.hard.join(",") };
}

async function alert(down) {
  if (!BREVO) return;
  const lines = down.map((a) => `- ${a.brand} (${a.domain}): ${a.hard.join("; ")}${a.heal ? " | self-heal: " + a.heal.note : ""}`).join("\n");
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST", headers: { "api-key": BREVO, "content-type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Perpetual Sentinel", email: "hello@toolkitonline.vip" },
        to: [{ email: ALERT_TO }],
        subject: `[Sentinel] ${down.length} SaaS DOWN after self-heal`,
        textContent: "The Perpetual Sentinel could NOT auto-heal these apps:\n\n" + lines + "\n\n(Heartbeat: logs/daily_sentinel_heartbeat.json)",
      }),
    });
  } catch {}
}

(async () => {
  const checkedAt = new Date().toISOString();
  const results = await Promise.all(APPS.map(probe));

  for (const r of results) {
    if (!r.ok && r.transient) {
      r.heal = await selfHeal(APPS.find((a) => a.code === r.code));
      if (r.heal.healed) { r.ok = true; r.hard = []; r.warnings.push("(auto-healed via redeploy)"); }
    }
  }

  const down = results.filter((r) => !r.ok);
  const warned = results.filter((r) => r.ok && r.warnings.length);
  const status = down.length === 0 ? "ALL_SYSTEMS_NOMINAL" : "DEGRADED";
  const heartbeat = {
    status, checkedAt,
    summary: `${results.length - down.length}/${results.length} nominal` + (warned.length ? `, ${warned.length} with warnings` : ""),
    down: down.map((r) => ({ code: r.code, brand: r.brand, hard: r.hard, heal: r.heal?.note })),
    apps: results.map((r) => ({ code: r.code, brand: r.brand, ok: r.ok, hard: r.hard, warnings: r.warnings, ...r.detail })),
  };
  mkdirSync(dirname(HEARTBEAT), { recursive: true });
  writeFileSync(HEARTBEAT, JSON.stringify(heartbeat, null, 2));

  console.log(`Sentinel ${status} — ${heartbeat.summary} @ ${checkedAt}`);
  for (const r of results) console.log(`  ${r.ok ? "✓" : "✗"} ${r.code} ${r.brand}: ${r.ok ? (r.warnings.length ? "nominal (" + r.warnings.join(",") + ")" : "nominal") : "DOWN " + r.hard.join(", ")}`);

  if (down.length) { await alert(down); process.exit(1); }
  process.exit(0);
})();
