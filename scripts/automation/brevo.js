'use strict';

// ─── Brevo Email API Helper ───────────────────────────────────────────────────
// Free tier: 300 emails/day. No npm dependency — uses Node.js built-in https.

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ── Dedup guard (anti-retry duplicates, e.g. Pabbly 11s dup incident 15/4/2026)
// Same (to+subject) sent within DEDUP_WINDOW_MS is blocked.
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const DEDUP_DIR = path.join(os.tmpdir(), 'devtoolsmith-brevo-dedup');
try { fs.mkdirSync(DEDUP_DIR, { recursive: true }); } catch (_) {}

function dedupKey(to, subject) {
  const addr = Array.isArray(to) ? to[0].email : (to && to.email) || '';
  return crypto.createHash('sha256').update(addr + '|' + (subject || '')).digest('hex').slice(0, 32);
}

function isDuplicate(to, subject) {
  try {
    const file = path.join(DEDUP_DIR, dedupKey(to, subject) + '.lock');
    if (!fs.existsSync(file)) return false;
    const ts = parseInt(fs.readFileSync(file, 'utf-8'), 10);
    return Number.isFinite(ts) && (Date.now() - ts) < DEDUP_WINDOW_MS;
  } catch (_) { return false; }
}

function markSent(to, subject) {
  try {
    const file = path.join(DEDUP_DIR, dedupKey(to, subject) + '.lock');
    fs.writeFileSync(file, String(Date.now()));
  } catch (_) {}
}

/**
 * Send a transactional email via Brevo v3 API.
 *
 * @param {object} opts
 * @param {object|object[]} opts.to          - {email, name} or array thereof
 * @param {string}          opts.subject     - Email subject
 * @param {string}          opts.htmlContent - HTML body
 * @param {object}          [opts.sender]    - {email, name} — defaults to DevToolsmith
 * @param {string}          [opts.replyTo]   - Reply-to email
 * @param {boolean}         [opts.skipDedup] - Bypass dedup guard (use carefully)
 * @returns {Promise<{status: number, body: string}>}
 */
function sendEmail({ to, subject, htmlContent, sender, replyTo, skipDedup }) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return reject(new Error('BREVO_API_KEY environment variable is not set'));

    if (!skipDedup && isDuplicate(to, subject)) {
      return resolve({ status: 208, body: '{"duplicate":true,"reason":"same to+subject within dedup window"}' });
    }

    const payload = {
      sender: sender || { name: 'DevToolsmith', email: 'hello@captureapi.dev' },
      to:     Array.isArray(to) ? to : [to],
      subject,
      htmlContent,
    };
    if (replyTo) payload.replyTo = { email: replyTo };

    const body = JSON.stringify(payload);

    const options = {
      hostname: 'api.brevo.com',
      path:     '/v3/smtp/email',
      method:   'POST',
      headers: {
        'accept':         'application/json',
        'api-key':        apiKey,
        'content-type':   'application/json',
        'content-length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end',  () => {
        if (res.statusCode >= 200 && res.statusCode < 300) markSent(to, subject);
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Brevo API request timed out after 15s'));
    });

    req.write(body);
    req.end();
  });
}

/**
 * Simple wrapper: sends and logs result. Returns true on success.
 */
async function sendAndLog({ to, subject, htmlContent, sender, replyTo }) {
  try {
    const result = await sendEmail({ to, subject, htmlContent, sender, replyTo });
    if (result.status >= 200 && result.status < 300) {
      const toAddr = Array.isArray(to) ? to[0].email : to.email;
      console.log(`  ✉️  Sent to ${toAddr} — HTTP ${result.status}`);
      return true;
    } else {
      console.error(`  ❌ Brevo error ${result.status}: ${result.body.substring(0, 200)}`);
      return false;
    }
  } catch (err) {
    console.error(`  ❌ Brevo exception: ${err.message}`);
    return false;
  }
}

module.exports = { sendEmail, sendAndLog };
