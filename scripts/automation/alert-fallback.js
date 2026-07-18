'use strict';

// ─── Independent alert channel (Brevo-agnostic) ──────────────────────────────
// Every existing monitor emails via a SINGLE Brevo key. If that key dies (the
// real 401 incident), ALL email alerting goes silent (gap G7). This helper adds
// a second, independent channel: a GitHub Issue opened via the built-in
// GITHUB_TOKEN — no new account, no cost, and it survives a dead Brevo key.
//   • openOrUpdateIssue(): dedup-by-title, comment if already open.
//   • alertWithFallback(): try Brevo first, fall back to a GitHub Issue.

const https = require('https');
const { GITHUB, OWNER } = require('./config');

function ghRequest(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return reject(new Error('GITHUB_TOKEN not set'));
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'toolkit-online-canary',
      'x-github-api-version': '2022-11-28',
    };
    if (data) {
      headers['content-type'] = 'application/json';
      headers['content-length'] = Buffer.byteLength(data);
    }
    const req = https.request(
      { hostname: 'api.github.com', path: apiPath, method, headers },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('GitHub API timeout'));
    });
    if (data) req.write(data);
    req.end();
  });
}

// Repo slug from the Actions env, with a config fallback for local runs.
function repoSlug() {
  return process.env.GITHUB_REPOSITORY || `${GITHUB.owner}/${GITHUB.repo}`;
}

async function findOpenIssueByTitle(slug, title) {
  const r = await ghRequest('GET', `/repos/${slug}/issues?state=open&per_page=100`);
  if (r.status !== 200) return null;
  try {
    const items = JSON.parse(r.body);
    const exact = items.find((i) => i.title === title && !i.pull_request);
    return exact ? exact.number : null;
  } catch (_) {
    return null;
  }
}

// Open a new alert issue, or comment on the existing open one with the same
// title (dedup — avoids a new issue every 6h while an outage persists).
async function openOrUpdateIssue({ title, body }) {
  const slug = repoSlug();
  const existing = await findOpenIssueByTitle(slug, title).catch(() => null);
  if (existing) {
    const r = await ghRequest('POST', `/repos/${slug}/issues/${existing}/comments`, { body });
    return { status: r.status, action: 'commented', number: existing };
  }
  const r = await ghRequest('POST', `/repos/${slug}/issues`, { title, body });
  let number = null;
  try {
    number = JSON.parse(r.body).number;
  } catch (_) {}
  return { status: r.status, action: 'created', number };
}

// Try Brevo first; escalate to the independent GitHub Issue channel if it fails.
async function alertWithFallback({ subject, htmlContent, textBody }) {
  let brevoOk = false;
  try {
    const { sendAndLog } = require('./brevo');
    brevoOk = await sendAndLog({
      to: { email: OWNER.email, name: OWNER.name },
      subject,
      htmlContent: htmlContent || `<pre>${textBody || subject}</pre>`,
    });
  } catch (e) {
    console.error('Brevo path threw:', e.message);
  }
  if (brevoOk) return { brevoOk: true };
  console.error('Brevo failed — escalating via GitHub Issue (independent channel).');
  const issue = await openOrUpdateIssue({ title: subject, body: textBody || subject }).catch(
    (e) => ({ status: 0, action: 'error', error: e.message })
  );
  return { brevoOk: false, issue };
}

module.exports = { ghRequest, repoSlug, openOrUpdateIssue, alertWithFallback };
