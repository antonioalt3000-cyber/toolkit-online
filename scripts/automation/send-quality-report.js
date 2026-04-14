'use strict';

// ─── Weekly Quality Report Emailer ───────────────────────────────────────────
// Called by weekly-quality.yml after lint + build.
// Reads results from env vars and sends a formatted email via Brevo.

const https = require('https');

const apiKey     = process.env.BREVO_API_KEY;
const ownerEmail = process.env.OWNER_EMAIL || 'antonio.alt3000@gmail.com';
const lintExit   = process.env.LINT_EXIT   || '1';
const buildExit  = process.env.BUILD_EXIT  || '1';
const lintLines  = (process.env.LINT_LINES  || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const buildLines = (process.env.BUILD_LINES || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const runUrl     = process.env.RUN_URL || '#';
const date       = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const lintOk  = lintExit  === '0';
const buildOk = buildExit === '0';
const allOk   = lintOk && buildOk;
const badge   = allOk ? '✅' : '❌';

const statusCell = (ok, text) =>
  `<td style="padding:12px 16px;border:1px solid #e5e7eb;color:${ok ? '#15803d' : '#dc2626'};font-weight:600">${ok ? '✅ ' : '❌ '}${text}</td>`;

const codeBlock = (content) => content
  ? `<pre style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:12px;font-size:12px;overflow:auto;max-height:200px;white-space:pre-wrap">${content}</pre>`
  : '';

const html = `
<div style="font-family:system-ui,sans-serif;max-width:680px;margin:0 auto;color:#1f2937">
  <div style="background:#1e3a5f;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:18px">${badge} Weekly Quality Report — ToolKit Online</h1>
    <p style="margin:6px 0 0;opacity:.8;font-size:13px">${date} · ${allOk ? 'ALL CHECKS PASS' : 'ISSUES FOUND — action required'}</p>
  </div>
  <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin-bottom:20px;border:1px solid #e5e7eb">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:10px 16px;text-align:left;border:1px solid #e5e7eb">Check</th>
          <th style="padding:10px 16px;text-align:left;border:1px solid #e5e7eb">Result</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:12px 16px;border:1px solid #e5e7eb;font-weight:600">ESLint</td>
          ${statusCell(lintOk, lintOk ? 'Passed — no errors' : `Failed (exit ${lintExit})`)}
        </tr>
        <tr style="background:#f9fafb">
          <td style="padding:12px 16px;border:1px solid #e5e7eb;font-weight:600">next build</td>
          ${statusCell(buildOk, buildOk ? 'Compiled successfully' : `Failed (exit ${buildExit})`)}
        </tr>
      </tbody>
    </table>

    ${!lintOk && lintLines  ? `<p style="font-weight:600;margin:0 0 8px">ESLint output:</p>${codeBlock(lintLines)}`  : ''}
    ${!buildOk && buildLines ? `<p style="font-weight:600;margin:16px 0 8px">Build output (last 30 lines):</p>${codeBlock(buildLines)}` : ''}

    <p style="margin-top:20px">
      <a href="${runUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600">
        View Full Workflow Logs →
      </a>
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
    <p style="font-size:12px;color:#9ca3af;margin:0">
      DevToolsmith · Weekly Quality Check · GitHub Actions · ${new Date().toUTCString()}
    </p>
  </div>
</div>`;

const subject = `${badge} Weekly Quality: ${allOk ? 'All checks pass' : 'Issues found'} — ToolKit Online (${date})`;

const payload = JSON.stringify({
  sender:      { name: 'DevToolsmith', email: 'hello@captureapi.dev' },
  to:          [{ email: ownerEmail, name: 'Antonio' }],
  subject,
  htmlContent: html,
});

if (!apiKey) {
  console.error('BREVO_API_KEY not set');
  process.exit(1);
}

const req = https.request(
  {
    hostname: 'api.brevo.com',
    path:     '/v3/smtp/email',
    method:   'POST',
    headers: {
      'accept':         'application/json',
      'api-key':        apiKey,
      'content-type':   'application/json',
      'content-length': Buffer.byteLength(payload),
    },
  },
  (res) => {
    let data = '';
    res.on('data', (c) => { data += c; });
    res.on('end', () => {
      console.log(`Quality report sent — HTTP ${res.statusCode}`);
      process.exit(res.statusCode < 300 ? 0 : 1);
    });
  }
);

req.on('error', (e) => { console.error(e.message); process.exit(1); });
req.write(payload);
req.end();
