'use strict';

// ─── Brevo key health-check ──────────────────────────────────────────────────
// Closes gap G7a. Every monitor emails through ONE Brevo key; if it is revoked
// or expires (the real 401), the whole email-alert channel goes silent and no
// monitor notices. This probes GET /v3/account each canary cycle and, on a dead
// key, escalates through the INDEPENDENT GitHub Issue channel so the blind spot
// surfaces before an actual incident needs the (now-dead) email path.

const https = require('https');
const { openOrUpdateIssue } = require('./alert-fallback');

function getAccount() {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return resolve({ missing: true });
    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path: '/v3/account',
        method: 'GET',
        headers: { accept: 'application/json', 'api-key': apiKey },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Brevo /account timeout'));
    });
    req.end();
  });
}

async function main() {
  let res;
  try {
    res = await getAccount();
  } catch (e) {
    res = { status: 0, body: String((e && e.message) || e) };
  }

  if (res.missing) {
    console.log('BREVO_API_KEY not set — skipping health-check.');
    return;
  }
  if (res.status === 200) {
    console.log('🟢 Brevo key healthy (HTTP 200 on /v3/account).');
    return;
  }

  const title = `🔴 Watchdog: Brevo API key unhealthy (HTTP ${res.status})`;
  const body =
    `The Brevo API key returned HTTP ${res.status} on GET /v3/account.\n\n` +
    'All email-based watchdog alerts (Sentinel, Watchtower, Smoke, Uptime, Ouroboros, Weekly Quality) rely on ' +
    'this single key — while it is down, email alerting is silently disabled.\n\n' +
    'Action: rotate/refresh the BREVO_API_KEY secret in the repo settings.\n\n' +
    `Response: ${String(res.body).slice(0, 300)}`;

  const issue = await openOrUpdateIssue({ title, body }).catch((e) => ({
    action: 'error',
    error: e.message,
  }));
  console.error(
    `🔴 Brevo unhealthy (HTTP ${res.status}) — escalated via GitHub Issue: ${issue.action || 'error'} #${issue.number || '-'}`
  );
  process.exitCode = 1;
}

main().catch((e) => {
  console.error('brevo-health fatal:', e);
  process.exitCode = 1;
});
