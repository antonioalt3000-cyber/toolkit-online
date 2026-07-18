'use strict';

// ─── Watchdog Dead-Man's-Switch (canary) ─────────────────────────────────────
// Closes gap G2: nothing was watching the WATCHERS. If a monitor's cron stops
// (Actions disabled, repo made private, YAML drift), no alert ever fired — the
// last incident (dead per-SaaS watchdogs, 30 Jun) was found via a GitHub billing
// email, not the monitoring. This canary reads each monitor's PUBLIC heartbeat
// from its orphan branch and, if a heartbeat is stale beyond its cadence, opens
// a GitHub Issue — a channel INDEPENDENT of Brevo (so a dead key can't hide it).
// Free on the public repo's Actions.

const { GITHUB } = require('./config');
const { openOrUpdateIssue, repoSlug } = require('./alert-fallback');

const RAW = `https://raw.githubusercontent.com/${GITHUB.owner}/${GITHUB.repo}`;

// maxAgeH is generous on purpose: it must exceed the cron cadence + GitHub's
// schedule throttling so a single missed run never false-alarms. It fires only
// when a monitor has clearly STOPPED (missed multiple cycles).
const CHECKS = [
  {
    name: 'sentinel',
    url: `${RAW}/sentinel-heartbeat/logs/daily_sentinel_heartbeat.json`,
    field: 'checkedAt', // cron '0 5,16 * * *' → ~13h overnight gap
    maxAgeH: 26,
  },
  {
    name: 'ouroboros',
    url: `${RAW}/ouroboros-heartbeat/logs/network_health.json`,
    field: 'scannedAt', // cron '0 6 * * 1' → weekly
    maxAgeH: 24 * 9,
  },
];

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function checkOne(c, now) {
  try {
    const data = await fetchJson(`${c.url}?t=${now}`);
    const ts = Date.parse(data[c.field]);
    if (!Number.isFinite(ts))
      return { ...c, stale: true, reason: `missing/invalid field '${c.field}'` };
    const ageH = Math.round(((now - ts) / 3.6e6) * 10) / 10;
    return { ...c, ageH, stale: ageH > c.maxAgeH, status: data.status };
  } catch (e) {
    // A heartbeat branch that 404s / is unreachable is itself a dead-man signal.
    return { ...c, stale: true, reason: String((e && e.message) || e) };
  }
}

async function main() {
  const now = Date.now();
  const results = await Promise.all(CHECKS.map((c) => checkOne(c, now)));
  for (const r of results) {
    const tag = r.stale ? '🔴 STALE' : '🟢 fresh';
    console.log(
      `${tag} ${r.name} — age ${r.ageH != null ? r.ageH + 'h' : '?'} (max ${r.maxAgeH}h)${r.reason ? ' — ' + r.reason : ''}`
    );
  }

  const stale = results.filter((r) => r.stale);
  if (!stale.length) {
    console.log('Canary OK — all monitor heartbeats fresh.');
    return;
  }

  const title = `🔴 Watchdog canary: ${stale.map((s) => s.name).join(', ')} heartbeat stale`;
  const body =
    'The watchdog canary detected stale monitor heartbeat(s) — a monitor may have stopped running.\n\n' +
    stale
      .map(
        (s) =>
          `- **${s.name}**: age ${s.ageH != null ? s.ageH + 'h' : '?'} > ${s.maxAgeH}h${s.reason ? ` (${s.reason})` : ''}\n  ${s.url}`
      )
      .join('\n') +
    `\n\nChecked at ${new Date(now).toISOString()} by scripts/automation/canary-check.js.`;

  const issue = await openOrUpdateIssue({ title, body }).catch((e) => ({
    action: 'error',
    error: e.message,
  }));
  console.error(
    `Escalated via GitHub Issue (${repoSlug()}): ${issue.action || 'error'} #${issue.number || '-'} (HTTP ${issue.status || '?'})`
  );
  process.exitCode = 1;
}

main().catch((e) => {
  console.error('canary-check fatal:', e);
  process.exitCode = 1;
});
