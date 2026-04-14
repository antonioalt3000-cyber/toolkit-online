'use strict';

// ─── Brevo Email API Helper ───────────────────────────────────────────────────
// Free tier: 300 emails/day. No npm dependency — uses Node.js built-in https.

const https = require('https');

/**
 * Send a transactional email via Brevo v3 API.
 *
 * @param {object} opts
 * @param {object|object[]} opts.to          - {email, name} or array thereof
 * @param {string}          opts.subject     - Email subject
 * @param {string}          opts.htmlContent - HTML body
 * @param {object}          [opts.sender]    - {email, name} — defaults to DevToolsmith
 * @param {string}          [opts.replyTo]   - Reply-to email
 * @returns {Promise<{status: number, body: string}>}
 */
function sendEmail({ to, subject, htmlContent, sender, replyTo }) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return reject(new Error('BREVO_API_KEY environment variable is not set'));

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
      res.on('end',  () => resolve({ status: res.statusCode, body: data }));
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
