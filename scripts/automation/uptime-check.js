'use strict';

// ─── DevToolsmith Uptime Monitor ─────────────────────────────────────────────
// Checks all 5 SaaS sites. Sends Brevo alert email if any are DOWN.
// Runs every 5 minutes via GitHub Actions. Zero npm dependencies.

const https  = require('https');
const { SITES, OWNER } = require('./config');
const { sendAndLog }   = require('./brevo');

// ── HTTP check with timeout ───────────────────────────────────────────────────
function checkSite(site) {
  return new Promise((resolve) => {
    const startMs = Date.now();
    const parsed  = new URL(site.url);

    const req = https.get(
      {
        hostname: parsed.hostname,
        path:     parsed.pathname || '/',
        port:     443,
        headers:  { 'User-Agent': 'DevToolsmith-UptimeMonitor/1.0' },
      },
      (res) => {
        const ms = Date.now() - startMs;
        res.resume(); // consume body so connection closes
        resolve({ name: site.name, url: site.url, status: res.statusCode, ms, ok: res.statusCode < 400 });
      }
    );

    req.on('error', (err) => {
      resolve({ name: site.name, url: site.url, status: 0, ms: Date.now() - startMs, ok: false, error: err.message });
    });

    req.setTimeout(12000, () => {
      req.destroy();
      resolve({ name: site.name, url: site.url, status: 0, ms: 12000, ok: false, error: 'Timeout (12s)' });
    });
  });
}

// ── Build HTML alert email ────────────────────────────────────────────────────
function buildAlertHtml(down, up, timestamp) {
  const row = (r, color) => `
    <tr>
      <td style="padding:10px 14px;font-weight:bold;color:${color}">${r.name}</td>
      <td style="padding:10px 14px"><a href="${r.url}" style="color:#3b82f6">${r.url}</a></td>
      <td style="padding:10px 14px;font-family:monospace">${r.status || '—'}</td>
      <td style="padding:10px 14px;font-family:monospace">${r.ms}ms${r.error ? ' · ' + r.error : ''}</td>
    </tr>`;

  return `
  <div style="font-family:system-ui,sans-serif;max-width:700px;margin:0 auto">
    <div style="background:#dc2626;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:20px">🚨 Site DOWN — DevToolsmith Alert</h1>
      <p style="margin:6px 0 0;opacity:.85;font-size:14px">${timestamp}</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <p style="margin:0 0 16px;font-size:15px">
        <strong style="color:#dc2626">${down.length} site${down.length > 1 ? 's' : ''} down</strong>,
        ${up.length} operational.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0"
             style="border-collapse:collapse;font-size:14px;border:1px solid #fca5a5">
        <thead>
          <tr style="background:#fee2e2">
            <th style="padding:10px 14px;text-align:left">Site</th>
            <th style="padding:10px 14px;text-align:left">URL</th>
            <th style="padding:10px 14px;text-align:left">HTTP</th>
            <th style="padding:10px 14px;text-align:left">Details</th>
          </tr>
        </thead>
        <tbody>${down.map(r => row(r, '#dc2626')).join('')}</tbody>
      </table>

      ${up.length > 0 ? `
      <p style="margin:20px 0 8px;font-size:14px;color:#374151">
        <strong>✅ Operational sites:</strong>
      </p>
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border-collapse:collapse;font-size:14px;border:1px solid #bbf7d0">
        <tbody>${up.map(r => row(r, '#16a34a')).join('')}</tbody>
      </table>` : ''}

      <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">
        DevToolsmith Uptime Monitor · GitHub Actions ·
        <a href="https://github.com/antonioalt3000-cyber/toolkit-online/actions"
           style="color:#6b7280">View Workflow</a>
      </p>
    </div>
  </div>`;
}

// ── Build recovery email (all OK after being down) ────────────────────────────
function buildRecoveryHtml(results, timestamp) {
  const rows = results.map(r => `
    <tr>
      <td style="padding:10px 14px;color:#16a34a;font-weight:bold">${r.name}</td>
      <td style="padding:10px 14px"><a href="${r.url}" style="color:#3b82f6">${r.url}</a></td>
      <td style="padding:10px 14px;font-family:monospace">${r.status}</td>
      <td style="padding:10px 14px;font-family:monospace">${r.ms}ms</td>
    </tr>`).join('');

  return `
  <div style="font-family:system-ui,sans-serif;max-width:700px;margin:0 auto">
    <div style="background:#16a34a;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:20px">✅ All Sites Operational — DevToolsmith</h1>
      <p style="margin:6px 0 0;opacity:.85;font-size:14px">${timestamp}</p>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border-collapse:collapse;font-size:14px;border:1px solid #bbf7d0">
        <thead>
          <tr style="background:#dcfce7">
            <th style="padding:10px 14px;text-align:left">Site</th>
            <th style="padding:10px 14px;text-align:left">URL</th>
            <th style="padding:10px 14px;text-align:left">HTTP</th>
            <th style="padding:10px 14px;text-align:left">Response</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const timestamp = new Date().toUTCString();
  console.log(`\n[${timestamp}] DevToolsmith Uptime Check`);
  console.log('─'.repeat(60));

  const results = await Promise.all(SITES.map(checkSite));

  const down = results.filter(r => !r.ok);
  const up   = results.filter(r => r.ok);

  results.forEach(r => {
    const icon = r.ok ? '✅' : '🔴';
    const info = r.error ? ` — ${r.error}` : '';
    console.log(`  ${icon}  ${r.name.padEnd(14)} HTTP ${r.status || 'ERR'} · ${r.ms}ms${info}`);
  });

  console.log('─'.repeat(60));

  const prevStatus = process.env.PREV_STATUS || '';

  if (down.length > 0) {
    if (prevStatus === 'down') {
      // Already notified on a previous run — skip duplicate alert & email
      console.log(`\n⚠️  ${down.length} SITE(S) STILL DOWN (already notified) — skipping duplicate alert`);
      // Exit 0: workflow stays green, no repeated GitHub failure emails
      process.exit(0);
    } else {
      // First detection of this outage — send alert
      console.log(`\n🔴 NEW DOWNTIME: ${down.length} SITE(S) DOWN — sending alert to ${OWNER.email}`);
      await sendAndLog({
        to:          [{ email: OWNER.email, name: OWNER.name }],
        subject:     `🔴 DOWN: ${down.map(r => r.name).join(', ')} — DevToolsmith`,
        htmlContent: buildAlertHtml(down, up, timestamp),
      });
      // Exit 1 only on NEW downtime — one GitHub failure email per outage event
      process.exit(1);
    }

  } else {
    // Check if this is a recovery run (PREV_STATUS env var = 'down')
    if (prevStatus === 'down') {
      console.log('\n🟢 All sites recovered — sending recovery notification');
      await sendAndLog({
        to:          [{ email: OWNER.email, name: OWNER.name }],
        subject:     '✅ RECOVERED: All DevToolsmith sites are operational',
        htmlContent: buildRecoveryHtml(results, timestamp),
      });
    } else {
      console.log('\n✅ All sites operational — no action needed');
    }
    process.exit(0);
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error in uptime-check:', err.message);
  process.exit(2);
});
