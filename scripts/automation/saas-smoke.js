'use strict';

// ─── DevToolsmith Functional Smoke Monitor ───────────────────────────────────
// Sibling of uptime-check.js. Uptime answers "is the site up?"; THIS answers
// "can a customer actually USE the product?". For each of the 10 SaaS it runs:
//   1. Core service via API key  (F1/F4/B7): a lightweight authenticated GET
//      with a long-lived monitor key must return 200 (proves auth + engine).
//   2. Redeem-funnel liveness    (all 5): POST /api/redeem with a deliberately
//      invalid coupon must return 400 (proves the signup funnel endpoint and
//      its validation are alive — not 500, not a timeout).
// Sends ONE Brevo digest to the owner: green when all pass, red with the exact
// failing check otherwise. Runs daily via GitHub Actions. Zero npm dependencies.
//
// Secrets (GitHub Actions env): BREVO_API_KEY, MONITOR_F1_KEY, MONITOR_F4_KEY,
// MONITOR_B7_KEY. F2/F3 expose no public API-key product, so their functional
// coverage is the redeem-liveness check here + the 5-minute uptime monitor.

const https = require('https');
const { SITES, OWNER } = require('./config');
const { sendAndLog } = require('./brevo');

// Per-tool authenticated core check. Tools absent here are funnel-only.
const CORE = {
  F1: { path: '/api/auth/me', envKey: 'MONITOR_F1_KEY' },
  F4: { path: '/api/v1/dashboard', envKey: 'MONITOR_F4_KEY' },
  B7: { path: '/api/v1/usage', envKey: 'MONITOR_B7_KEY' },
};
// Secretless core-route liveness for the round-2 SaaS (no monitor key needed):
// an UNAUTHENTICATED GET to a premium /api/v1 route MUST return 401 — proving the
// route is alive AND the auth gate holds. 200 there = auth bypass; other = down.
// Mirrors the central Sentinel's deep-probe so no long-lived key lands in CI.
const GATE = {
  EG: '/api/v1/monitors',
  SEO: '/api/v1/monitors',
  HSH: '/api/v1/monitors',
  HKL: '/api/v1/endpoints/healthprobe/stats',
  CFG: '/api/v1/cards/history',
};
const TIMEOUT_MS = 20000;

function request(method, url, { headers = {}, body } = {}) {
  return new Promise((resolve) => {
    const startMs = Date.now();
    const u = new URL(url);
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        method,
        hostname: u.hostname,
        path: u.pathname + u.search,
        port: 443,
        headers: {
          'User-Agent': 'DevToolsmith-SmokeMonitor/1.0',
          ...(data
            ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
            : {}),
          ...headers,
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => {
          if (chunks.length < 500) chunks += c;
        });
        res.on('end', () =>
          resolve({ status: res.statusCode, ms: Date.now() - startMs, body: chunks.slice(0, 300) })
        );
      }
    );
    req.on('error', (err) => resolve({ status: 0, ms: Date.now() - startMs, error: err.message }));
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      resolve({ status: 0, ms: TIMEOUT_MS, error: `Timeout (${TIMEOUT_MS / 1000}s)` });
    });
    if (data) req.write(data);
    req.end();
  });
}

async function checkSaaS(site) {
  const checks = [];

  // 1. Core authenticated service (F1/F4/B7 only)
  const core = CORE[site.tool];
  if (core) {
    const key = process.env[core.envKey];
    if (!key) {
      checks.push({ name: 'core', ok: false, detail: `missing env ${core.envKey}` });
    } else {
      const r = await request('GET', site.url + core.path, { headers: { 'x-api-key': key } });
      checks.push({
        name: `core GET ${core.path}`,
        ok: r.status === 200,
        detail: `${r.status || r.error} (${r.ms}ms)`,
      });
    }
  }

  // 1b. Secretless auth-gate liveness (round-2 SaaS): premium route must 401.
  const gate = GATE[site.tool];
  if (gate) {
    const g = await request('GET', site.url + gate);
    checks.push({
      name: `auth-gate GET ${gate} (→401)`,
      ok: g.status === 401,
      detail: `${g.status || g.error} (${g.ms}ms)`,
    });
  }

  // 2. Redeem-funnel liveness (all): invalid coupon must be a clean 400
  const r = await request('POST', site.url + '/api/redeem', {
    body: { email: 'monitor@devtoolsmith.invalid', coupon: 'MONITOR-LIVENESS-0000' },
  });
  checks.push({
    name: 'redeem funnel (invalid→400)',
    ok: r.status === 400,
    detail: `${r.status || r.error} (${r.ms}ms)`,
  });

  const ok = checks.every((c) => c.ok);
  return { name: site.name, tool: site.tool, url: site.url, ok, checks };
}

function buildHtml(results, allGreen, dateLabel) {
  const rows = results
    .map((s) => {
      const badge = s.ok ? '🟢' : '🔴';
      const lines = s.checks
        .map(
          (c) =>
            `<div style="margin-left:14px;font-size:13px;color:${c.ok ? '#15803d' : '#b91c1c'}">${c.ok ? '✓' : '✗'} ${c.name} — ${c.detail}</div>`
        )
        .join('');
      return `<tr><td style="padding:8px 10px;border-bottom:1px solid #eee">
      <strong>${badge} ${s.name}</strong> <span style="color:#888;font-size:12px">(${s.tool})</span>
      ${lines}</td></tr>`;
    })
    .join('');
  const headline = allGreen
    ? `🟢 Tutti e ${results.length} i SaaS sono operativi`
    : `🔴 ${results.filter((r) => !r.ok).length} SaaS con problemi — controlla i dettagli`;
  return `<div style="font-family:system-ui,Arial,sans-serif;max-width:560px">
    <h2 style="margin:0 0 4px">${headline}</h2>
    <p style="color:#666;margin:0 0 16px;font-size:13px">Smoke funzionale giornaliero — ${dateLabel}</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden">${rows}</table>
    <p style="color:#999;font-size:11px;margin-top:16px">Verifica: core autenticato (F1/F4/B7) o auth-gate 401 (EG/SEO/HSH/HKL/CFG) + liveness del funnel redeem (10/10). Uptime separato gira ogni 5 min. Reagisci solo se questa mail è rossa.</p>
  </div>`;
}

// ── Pure aggregation (unit-tested) ────────────────────────────────────────────
// Reduce per-SaaS check results to the green/red verdict + the failing tools.
// Kept pure so the smoke loop's reactivity is certifiable by tests.
function summarizeSmoke(results) {
  const allGreen = results.every((r) => r.ok);
  const failingTools = results.filter((r) => !r.ok).map((r) => r.tool);
  return { allGreen, failingTools };
}

function smokeSubject(allGreen, failingTools, dateLabel) {
  return allGreen
    ? `✅ Monitor SaaS — tutti operativi (${dateLabel})`
    : `🔴 Monitor SaaS — problema: ${failingTools.join(', ')} (${dateLabel})`;
}

async function main() {
  const results = [];
  for (const site of SITES) results.push(await checkSaaS(site));
  const { allGreen, failingTools } = summarizeSmoke(results);

  const now = new Date();
  const dateLabel = `${String(now.getUTCDate()).padStart(2, '0')}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${now.getUTCFullYear()} UTC`;
  const subject = smokeSubject(allGreen, failingTools, dateLabel);

  results.forEach((r) => {
    console.log(`${r.ok ? 'OK ' : 'FAIL'} ${r.tool} ${r.name}`);
    r.checks.forEach((c) => console.log(`   ${c.ok ? '✓' : '✗'} ${c.name} — ${c.detail}`));
  });

  if (process.env.BREVO_API_KEY) {
    await sendAndLog({
      to: [{ email: OWNER.email, name: OWNER.name }],
      subject,
      htmlContent: buildHtml(results, allGreen, dateLabel),
      sender: OWNER.sender,
    });
    console.log(`Digest sent to ${OWNER.email}: ${subject}`);
  } else {
    console.log('BREVO_API_KEY not set — skipping email (local dry-run).');
  }

  process.exit(allGreen ? 0 : 1);
}

// Export pure logic for unit tests; only run main() when invoked as a script.
module.exports = { summarizeSmoke, smokeSubject, buildHtml };

if (require.main === module) {
  main().catch((e) => {
    console.error('saas-smoke fatal:', e);
    process.exit(2);
  });
}
