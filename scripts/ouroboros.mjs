// ============================================================
// Ouroboros — self-optimization scanner for the 17-property network
// ============================================================
// The portfolio audits itself: our own SaaS (HeaderShield, SEOScope,
// CompliPilot, CaptureAPI) scan every one of our 17 live domains internally-
// for-free via God-Mode creator keys (x-api-key bypasses quota, not auth).
// READ-ONLY against the targets. Zero-dep (Node 20+ fetch), mirrors the style
// of sentinel.mjs. Runs weekly on free public-repo GitHub Actions.
//
// Per (domain, scanner) it calls the SaaS's real audit route, normalizes the
// result to {ok, score, grade, findings[]}, diffs against last week's baseline
// (read from the `ouroboros-heartbeat` orphan branch), and emails ONE weekly
// digest — green when nothing regressed, red with a regression table otherwise.
// The FIRST run has no baseline, so it seeds silently (never a false alert).
//
// Resilience: each scanner runs sequentially over its own targets (self-
// throttle), all scanners run under Promise.allSettled, and every call is
// wrapped so one SaaS being down degrades coverage but never crashes the run —
// a partial network_health.json still publishes (same doctrine as sentinel.mjs).

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { NETWORK, SCANNERS } = require('./automation/network.js');
const { sendAndLog } = require('./automation/brevo.js');
const { OWNER } = require('./automation/config.js');

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_JSON = resolve(HERE, '..', 'logs', 'network_health.json');
const OUT_HTML = resolve(HERE, '..', 'logs', 'network_health.html');
const PROBE_TIMEOUT_MS = 20000;
const SCORE_DROP = Number(process.env.OUROBOROS_SCORE_DROP || 5); // pts before a drop is a regression
const ALERT_TO = process.env.ALERT_EMAIL || OWNER.email;

// ── HTTP with timeout — returns {ok,status,ct,body,json,ms}, never throws ─────
async function timedFetch(url, init) {
  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      redirect: 'follow',
    });
    const body = await res.text();
    let json = null;
    try {
      json = JSON.parse(body);
    } catch {
      /* non-JSON (binary/HTML) */
    }
    return {
      ok: true,
      status: res.status,
      ct: res.headers.get('content-type') || '',
      body,
      json,
      ms: Math.round(performance.now() - t0),
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      ct: '',
      body: '',
      json: null,
      ms: Math.round(performance.now() - t0),
      err: e?.name === 'TimeoutError' ? 'timeout' : e?.message || 'network',
    };
  }
}

// ── Per-kind normalizers: SaaS response → {score, grade, findings[]} ──────────
// Defensive: unknown/missing fields degrade to null/[] rather than throw, so a
// SaaS changing its payload shape can never crash the scan.
const NORMALIZE = {
  headers(j) {
    const findings = Array.isArray(j?.findings)
      ? j.findings
          .filter((f) => (f?.severity || f?.level || '').toLowerCase() !== 'positive')
          .map((f) => `hdr:${f.id || f.key || f.header || f.title || 'issue'}`)
      : [];
    return { score: numOrNull(j?.score), grade: j?.grade ?? null, findings };
  },
  seo(j) {
    const findings = Array.isArray(j?.checks)
      ? j.checks.filter((c) => c?.status === 'fail').map((c) => `seo:${c.id || c.name || 'fail'}`)
      : [];
    return { score: numOrNull(j?.score), grade: null, findings };
  },
  gdpr(j) {
    // Only critical compliance issues become findings (warnings/info are noise).
    const findings = Array.isArray(j?.issues)
      ? j.issues
          .filter((i) => i?.severity === 'critical')
          .map((i) => `gdpr:${i.title || i.category || 'critical'}`)
      : [];
    return { score: numOrNull(j?.overallScore ?? j?.score), grade: null, findings };
  },
  a11y(j) {
    // Only serious/critical WCAG issues become findings (moderate/minor are noise).
    const findings = Array.isArray(j?.issues)
      ? j.issues
          .filter((i) => i?.severity === 'critical' || i?.severity === 'serious')
          .map((i) => `a11y:${i.wcagCriterion || i.title || 'issue'}`)
      : [];
    return { score: numOrNull(j?.score), grade: null, findings };
  },
  snapshot(j) {
    const ok = j?.success === true || (j?.data && typeof j.data.size !== 'undefined');
    return {
      score: null,
      grade: null,
      findings: ok ? [] : ['snapshot:failed'],
      size: j?.data?.size ?? null,
    };
  },
};

const numOrNull = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// ── Call one scanner against one target domain. Never throws. ─────────────────
async function runScanner(scanner, target) {
  const key = process.env[scanner.keyEnv];
  if (!key) {
    return {
      scanner: scanner.code,
      ok: false,
      score: null,
      grade: null,
      findings: [],
      err: `no ${scanner.keyEnv}`,
      skipped: true,
    };
  }
  const targetUrl = target.url;
  const headers = { 'x-api-key': key, 'user-agent': 'Ouroboros/1.0 (+toolkitonline.vip)' };
  let url = scanner.base + scanner.path;
  let init = { method: scanner.method, headers };

  if (scanner.method === 'GET') {
    const qs = new URLSearchParams({
      [scanner.urlParam]: targetUrl,
      ...(scanner.extraQuery || {}),
    });
    url += `?${qs.toString()}`;
  } else {
    headers['content-type'] = 'application/json';
    init.body = JSON.stringify({ [scanner.bodyParam]: targetUrl });
  }

  const res = await timedFetch(url, init);
  if (!res.ok)
    return {
      scanner: scanner.code,
      ok: false,
      score: null,
      grade: null,
      findings: [],
      err: res.err,
      ms: res.ms,
    };
  if (res.status === 401 || res.status === 403)
    return {
      scanner: scanner.code,
      ok: false,
      score: null,
      grade: null,
      findings: [],
      err: `auth-${res.status}`,
      ms: res.ms,
    };
  if (res.status >= 400)
    return {
      scanner: scanner.code,
      ok: false,
      score: null,
      grade: null,
      findings: [],
      err: `HTTP${res.status}`,
      ms: res.ms,
    };
  if (scanner.kind !== 'snapshot' && !res.json)
    return {
      scanner: scanner.code,
      ok: false,
      score: null,
      grade: null,
      findings: [],
      err: 'non-json',
      ms: res.ms,
    };

  const norm = NORMALIZE[scanner.kind](res.json || {});
  return { scanner: scanner.code, ok: true, ...norm, ms: res.ms };
}

// ── Baseline: last week's grid, read from the orphan branch (no DB, zero cost) ─
// Source order: OUROBOROS_BASELINE_FILE (local testing / explicit path) →
// the ouroboros-heartbeat orphan branch (what CI uses). Missing → null (first run).
function loadBaseline() {
  try {
    const raw = process.env.OUROBOROS_BASELINE_FILE
      ? readFileSync(process.env.OUROBOROS_BASELINE_FILE, 'utf8')
      : execSync('git show origin/ouroboros-heartbeat:logs/network_health.json', {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        });
    const prev = JSON.parse(raw);
    const map = new Map();
    for (const row of prev.grid || []) {
      for (const [code, r] of Object.entries(row.scanners || {}))
        map.set(`${row.domain}|${code}`, r);
    }
    return map;
  } catch {
    return null;
  } // first-ever run
}

// ── Regression decision (pure): current vs baseline for one (domain,scanner) ──
// Alert-worthy = a score drop >= threshold, OR a brand-new finding that wasn't
// in the baseline (a security header lost, a new GDPR-critical, or a snapshot
// that started failing). regressionFor is only called on ok results, so a
// broken snapshot surfaces as the `snapshot:failed` finding — hence snapshot is
// folded into the new-findings check, not a separate ok→fail flip. SEO finding
// churn is intentionally NOT alerted (noisy); only its score drop is.
function regressionFor(cur, base, kind) {
  if (!base) return null; // new target/scanner — no baseline to regress from
  const reasons = [];
  if (cur.score != null && base.score != null && base.score - cur.score >= SCORE_DROP) {
    reasons.push({
      type: 'score-drop',
      was: base.score,
      now: cur.score,
      delta: cur.score - base.score,
    });
  }
  if (kind === 'headers' || kind === 'gdpr' || kind === 'snapshot') {
    const prev = new Set(base.findings || []);
    const fresh = (cur.findings || []).filter((f) => !prev.has(f));
    if (fresh.length) reasons.push({ type: 'new-findings', findings: fresh });
  }
  return reasons.length ? reasons : null;
}

// ── HTML dashboard (self-contained, inline CSS — matches uptime/smoke style) ──
function buildHtml(report) {
  const cell = (r) => {
    if (!r) return '<td style="padding:8px 10px;color:#cbd5e1;text-align:center">—</td>';
    if (r.skipped)
      return '<td style="padding:8px 10px;color:#94a3b8;text-align:center" title="no key">skip</td>';
    if (!r.ok)
      return `<td style="padding:8px 10px;background:#fef3c7;color:#92400e;text-align:center" title="${r.err || ''}">warn</td>`;
    const s = r.score;
    const bg = s == null ? '#e0f2fe' : s >= 85 ? '#dcfce7' : s >= 60 ? '#fef9c3' : '#fee2e2';
    const fg = s == null ? '#075985' : s >= 85 ? '#166534' : s >= 60 ? '#854d0e' : '#991b1b';
    const val =
      s == null
        ? r.findings?.length
          ? `${r.findings.length}⚠`
          : 'ok'
        : `${s}${r.grade ? ' ' + r.grade : ''}`;
    return `<td style="padding:8px 10px;background:${bg};color:${fg};text-align:center;font-weight:600" title="${(r.findings || []).join(', ')}">${val}</td>`;
  };
  const cols = Object.values(SCANNERS);
  const head = cols
    .map((s) => `<th style="padding:8px 10px;text-align:center;font-size:12px">${s.brand}</th>`)
    .join('');
  const rows = report.grid
    .map(
      (row) => `
    <tr>
      <td style="padding:8px 12px;font-weight:600">${row.name}<div style="font-size:11px;color:#64748b">${row.domain} · ${row.group}</div></td>
      ${cols.map((s) => cell(row.scanners[s.code])).join('')}
    </tr>`
    )
    .join('');

  const banner =
    report.status === 'REGRESSION'
      ? `<div style="background:#dc2626;color:#fff;padding:14px 18px;border-radius:8px;margin-bottom:16px"><strong>⚠ ${report.regressions.length} regression(s)</strong> vs last week — see table below.</div>`
      : `<div style="background:#16a34a;color:#fff;padding:14px 18px;border-radius:8px;margin-bottom:16px"><strong>✓ Network nominal</strong> — no regressions vs baseline.</div>`;

  const regTable = report.regressions.length
    ? `
    <h3 style="font-size:15px;margin:20px 0 8px">Regressions</h3>
    <table style="border-collapse:collapse;font-size:13px;width:100%;border:1px solid #fca5a5">
      <thead><tr style="background:#fee2e2"><th style="padding:8px 10px;text-align:left">Domain</th><th style="padding:8px 10px;text-align:left">Scanner</th><th style="padding:8px 10px;text-align:left">What changed</th></tr></thead>
      <tbody>${report.regressions.map((x) => `<tr><td style="padding:8px 10px">${x.domain}</td><td style="padding:8px 10px">${x.scanner}</td><td style="padding:8px 10px;font-family:monospace">${x.reasons.map(fmtReason).join(' · ')}</td></tr>`).join('')}</tbody>
    </table>`
    : '';

  return `<div style="font-family:system-ui,sans-serif;max-width:920px;margin:0 auto;color:#0f172a">
    <h1 style="font-size:20px">🐍 Ouroboros — Network Health</h1>
    <p style="color:#64748b;font-size:13px;margin:0 0 16px">${report.summary} · ${report.scannedAt}</p>
    ${banner}
    <table style="border-collapse:collapse;font-size:13px;width:100%;border:1px solid #e2e8f0">
      <thead><tr style="background:#f1f5f9"><th style="padding:8px 12px;text-align:left">Property</th>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${regTable}
    <p style="margin:20px 0 0;font-size:11px;color:#94a3b8">Ouroboros · weekly self-audit of 17 properties · read-only · GitHub Actions (free public repo)</p>
  </div>`;
}

const fmtReason = (r) =>
  r.type === 'score-drop'
    ? `score ${r.was}→${r.now} (${r.delta})`
    : r.type === 'snapshot-broke'
      ? 'snapshot broke'
      : r.type === 'new-findings'
        ? `new: ${r.findings.join(',')}`
        : r.type;

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const scannedAt = new Date().toISOString();
  const baseline = loadBaseline();

  // One job per scanner; sequential over that scanner's targets (self-throttle);
  // all scanners concurrent under allSettled so one failing SaaS never aborts.
  const jobs = Object.values(SCANNERS).map(async (scanner) => {
    const targets = NETWORK.filter((t) => t.scanners.includes(scanner.code));
    const out = [];
    for (const t of targets) out.push({ target: t, result: await runScanner(scanner, t) });
    return { scanner, out };
  });
  const settled = await Promise.allSettled(jobs);

  // Assemble the 17-row grid keyed by domain.
  const byDomain = new Map(
    NETWORK.map((t) => [
      t.domain,
      { code: t.code, name: t.name, domain: t.domain, group: t.group, scanners: {} },
    ])
  );
  const regressions = [];
  for (const s of settled) {
    if (s.status !== 'fulfilled') continue;
    const { scanner, out } = s.value;
    for (const { target, result } of out) {
      byDomain.get(target.domain).scanners[scanner.code] = result;
      const reasons = result.ok
        ? regressionFor(result, baseline?.get(`${target.domain}|${scanner.code}`), scanner.kind)
        : null;
      if (reasons) regressions.push({ domain: target.domain, scanner: scanner.brand, reasons });
    }
  }

  const grid = [...byDomain.values()];
  const okCount = grid.reduce(
    (n, row) => n + Object.values(row.scanners).filter((r) => r.ok).length,
    0
  );
  const total = grid.reduce((n, row) => n + Object.keys(row.scanners).length, 0);
  const status = baseline && regressions.length ? 'REGRESSION' : 'NOMINAL';
  const report = {
    status,
    scannedAt,
    summary: baseline
      ? `${okCount}/${total} scans ok, ${regressions.length} regression(s) vs baseline`
      : `${okCount}/${total} scans ok — baseline seeded (first run, no alert)`,
    regressions,
    grid,
  };

  mkdirSync(dirname(OUT_JSON), { recursive: true });
  writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));
  writeFileSync(OUT_HTML, buildHtml(report));

  console.log(`Ouroboros ${status} — ${report.summary} @ ${scannedAt}`);
  for (const row of grid) {
    const cells = Object.entries(row.scanners)
      .map(([c, r]) => `${c}:${r.skipped ? 'skip' : r.ok ? (r.score ?? 'ok') : 'x'}`)
      .join(' ');
    console.log(`  ${row.name.padEnd(16)} ${cells}`);
  }

  // Alert only on a real regression (baseline exists + something regressed).
  // The job fails (exit 1) on regression REGARDLESS of whether the email sends —
  // email is best-effort, the red CI badge is the durable signal.
  if (status === 'REGRESSION') {
    if (process.env.BREVO_API_KEY) {
      await sendAndLog({
        to: [{ email: ALERT_TO, name: OWNER.name }],
        subject: `🔴 Ouroboros — ${regressions.length} network regression(s)`,
        htmlContent: buildHtml(report),
        sender: { name: 'Ouroboros', email: 'hello@toolkitonline.vip' },
      });
    }
    process.exit(1); // one GitHub red badge per regressing week
  }
  // Optional green weekly digest (default on; set OUROBOROS_DIGEST=off to silence).
  if (
    status === 'NOMINAL' &&
    baseline &&
    process.env.BREVO_API_KEY &&
    (process.env.OUROBOROS_DIGEST || 'on') !== 'off'
  ) {
    await sendAndLog({
      to: [{ email: ALERT_TO, name: OWNER.name }],
      subject: `🟢 Ouroboros — network nominal (${grid.length} properties)`,
      htmlContent: buildHtml(report),
      sender: { name: 'Ouroboros', email: 'hello@toolkitonline.vip' },
    });
  }
  process.exit(0);
}

// Pure decision logic exported for unit tests (vitest). The scan side-effects
// (network calls, file writes, process.exit) run ONLY when invoked as the CLI —
// importing the module for tests must not trigger a live scan.
export { regressionFor, NORMALIZE, numOrNull };

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error('💥 Ouroboros fatal:', err?.message || err);
    process.exit(2);
  });
}
