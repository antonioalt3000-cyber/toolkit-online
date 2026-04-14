'use strict';

// ─── DevToolsmith Daily Report ────────────────────────────────────────────────
// Compiles a daily summary of automation activity and sends it via Brevo email.
// Reads JSON status files written by the other workflow jobs.
// Runs at 18:00 UTC via GitHub Actions. Zero npm dependencies.
//
// Required env vars:  BREVO_API_KEY
// Status files are passed via environment variables set by GitHub Actions.

const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const { SITES, OWNER } = require('./config');
const { sendAndLog }   = require('./brevo');

// ── Site health check (run inline for the report) ────────────────────────────
function checkSite(site) {
  return new Promise((resolve) => {
    const startMs = Date.now();
    const parsed  = new URL(site.url);

    const req = https.get(
      {
        hostname: parsed.hostname,
        path:     parsed.pathname || '/',
        port:     443,
        headers:  { 'User-Agent': 'DevToolsmith-DailyReport/1.0' },
      },
      (res) => {
        const ms = Date.now() - startMs;
        res.resume();
        resolve({ name: site.name, url: site.url, status: res.statusCode, ms, ok: res.statusCode < 400 });
      }
    );

    req.on('error', (err) => {
      resolve({ name: site.name, url: site.url, status: 0, ms: Date.now() - startMs, ok: false, error: err.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ name: site.name, url: site.url, status: 0, ms: 10000, ok: false, error: 'Timeout' });
    });
  });
}

// ── Read prospects stats ──────────────────────────────────────────────────────
function getProspectStats() {
  try {
    const prospectsPath = path.join(__dirname, 'prospects.json');
    const data = JSON.parse(fs.readFileSync(prospectsPath, 'utf8'));
    const total     = data.prospects.length;
    const contacted = data.prospects.filter(p => p.contacted).length;
    const todayStr  = new Date().toISOString().split('T')[0];
    const sentToday = data.prospects.filter(p => p.contacted_date === todayStr).length;
    return { total, contacted, remaining: total - contacted, sentToday };
  } catch {
    return { total: 0, contacted: 0, remaining: 0, sentToday: 0 };
  }
}

// ── Build report HTML ─────────────────────────────────────────────────────────
function buildReportHtml({ date, siteResults, prospectStats, workflowRunUrl }) {
  const allUp     = siteResults.every(r => r.ok);
  const downSites = siteResults.filter(r => !r.ok);
  const upSites   = siteResults.filter(r => r.ok);

  const statusBadge = allUp
    ? `<span style="background:#dcfce7;color:#15803d;padding:4px 10px;border-radius:99px;font-size:13px;font-weight:600">✅ All Systems Operational</span>`
    : `<span style="background:#fee2e2;color:#dc2626;padding:4px 10px;border-radius:99px;font-size:13px;font-weight:600">🔴 ${downSites.length} Site(s) Down</span>`;

  const siteRows = siteResults.map(r => {
    const icon  = r.ok ? '✅' : '🔴';
    const color = r.ok ? '#15803d' : '#dc2626';
    return `
      <tr style="border-bottom:1px solid #f3f4f6">
        <td style="padding:10px 14px;font-weight:600;color:${color}">${icon} ${r.name}</td>
        <td style="padding:10px 14px"><a href="${r.url}" style="color:#6b7280;font-size:13px">${r.url}</a></td>
        <td style="padding:10px 14px;font-family:monospace;font-size:13px">${r.status || 'ERR'}</td>
        <td style="padding:10px 14px;font-family:monospace;font-size:13px;color:${r.ms < 800 ? '#15803d' : r.ms < 2000 ? '#d97706' : '#dc2626'}">${r.ms}ms</td>
      </tr>`;
  }).join('');

  // Read env vars set by workflow steps
  const devtoStatus    = process.env.DEVTO_STATUS    || 'unknown';
  const hashnodeStatus = process.env.HASHNODE_STATUS  || 'unknown';
  const blueskyStatus  = process.env.BLUESKY_STATUS   || 'unknown';
  const outreachStatus = process.env.OUTREACH_STATUS  || 'unknown';
  const outreachTarget = process.env.OUTREACH_TARGET  || '—';

  const statusIcon = (s) => s === 'success' ? '✅' : s === 'skipped' ? '⏭️' : s === 'failed' ? '❌' : '❓';

  return `
  <div style="font-family:system-ui,sans-serif;max-width:680px;margin:0 auto;color:#1f2937">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a5f,#0f766e);color:#fff;padding:24px 28px;border-radius:10px 10px 0 0">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <h1 style="margin:0;font-size:20px;font-weight:700">DevToolsmith Daily Report</h1>
          <p style="margin:6px 0 0;opacity:.8;font-size:14px">${date} · Automated by GitHub Actions</p>
        </div>
        <div style="margin-top:4px">${statusBadge}</div>
      </div>
    </div>

    <!-- Body -->
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 10px 10px">

      <!-- Site Status -->
      <h2 style="font-size:15px;color:#374151;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em">
        🌐 Site Health
      </h2>
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border-collapse:collapse;font-size:14px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase">Site</th>
            <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase">URL</th>
            <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase">HTTP</th>
            <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase">Latency</th>
          </tr>
        </thead>
        <tbody>${siteRows}</tbody>
      </table>

      <!-- Automation Activity -->
      <h2 style="font-size:15px;color:#374151;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em">
        🤖 Automation Activity
      </h2>
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border-collapse:collapse;font-size:14px;border:1px solid #e5e7eb;margin-bottom:24px">
        <tr style="background:#f9fafb">
          <td style="padding:10px 14px;font-weight:600;width:50%">Dev.to article</td>
          <td style="padding:10px 14px">${statusIcon(devtoStatus)} ${devtoStatus}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-weight:600;border-top:1px solid #f3f4f6">Hashnode article</td>
          <td style="padding:10px 14px;border-top:1px solid #f3f4f6">${statusIcon(hashnodeStatus)} ${hashnodeStatus}</td>
        </tr>
        <tr style="background:#f9fafb">
          <td style="padding:10px 14px;font-weight:600;border-top:1px solid #f3f4f6">Bluesky post</td>
          <td style="padding:10px 14px;border-top:1px solid #f3f4f6">${statusIcon(blueskyStatus)} ${blueskyStatus}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-weight:600;border-top:1px solid #f3f4f6">Outreach email</td>
          <td style="padding:10px 14px;border-top:1px solid #f3f4f6">${statusIcon(outreachStatus)} ${outreachStatus} ${outreachTarget !== '—' ? `→ ${outreachTarget}` : ''}</td>
        </tr>
      </table>

      <!-- Outreach Stats -->
      <h2 style="font-size:15px;color:#374151;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em">
        📊 Outreach Pipeline
      </h2>
      <div style="display:flex;gap:16px;margin-bottom:24px">
        ${[
          { label: 'Contacted',  value: prospectStats.contacted, color: '#15803d' },
          { label: 'Remaining',  value: prospectStats.remaining,  color: '#d97706' },
          { label: 'Total',      value: prospectStats.total,       color: '#6b7280' },
          { label: 'Sent Today', value: prospectStats.sentToday,   color: '#3b82f6' },
        ].map(({ label, value, color }) => `
          <div style="flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;text-align:center">
            <div style="font-size:24px;font-weight:700;color:${color}">${value}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px">${label}</div>
          </div>`).join('')}
      </div>

      <!-- Quick Links -->
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0 0 10px;font-weight:600;font-size:14px;color:#0369a1">🔗 Quick Links</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${SITES.map(s => `<a href="${s.url}" style="color:#0369a1;font-size:13px;text-decoration:none;background:#fff;border:1px solid #bae6fd;padding:4px 10px;border-radius:99px">${s.name}</a>`).join('')}
          ${workflowRunUrl ? `<a href="${workflowRunUrl}" style="color:#6b7280;font-size:13px;text-decoration:none;background:#fff;border:1px solid #e5e7eb;padding:4px 10px;border-radius:99px">View Workflow Logs</a>` : ''}
        </div>
      </div>

      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
        DevToolsmith Automation Suite · GitHub Actions ·
        Generated ${new Date().toUTCString()}
      </p>
    </div>
  </div>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const date           = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const workflowRunUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null;

  console.log('\n[Daily Report]');
  console.log('─'.repeat(60));
  console.log(`  Date: ${date}`);
  console.log('\n  Checking all site statuses...');

  const siteResults  = await Promise.all(SITES.map(checkSite));
  const prospectStats = getProspectStats();
  const allUp        = siteResults.every(r => r.ok);

  siteResults.forEach(r => {
    console.log(`  ${r.ok ? '✅' : '🔴'} ${r.name.padEnd(14)} ${r.status} · ${r.ms}ms`);
  });

  console.log(`\n  Prospects: ${prospectStats.contacted}/${prospectStats.total} contacted, ${prospectStats.remaining} remaining`);

  const subjectPrefix = allUp ? '✅' : `🔴 ${siteResults.filter(r => !r.ok).map(r => r.name).join(', ')} DOWN —`;
  const subject = `${subjectPrefix} DevToolsmith Daily Report · ${new Date().toLocaleDateString('en-GB')}`;

  const html = buildReportHtml({ date, siteResults, prospectStats, workflowRunUrl });

  console.log(`\n  Sending daily report to ${OWNER.email}...`);

  await sendAndLog({
    to:          [{ email: OWNER.email, name: OWNER.name }],
    subject,
    htmlContent: html,
  });

  console.log('\n✅ Daily report sent successfully');
  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(2);
});
