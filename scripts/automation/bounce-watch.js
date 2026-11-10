'use strict';

// ─── Bounce Watch — did the transactional email actually REACH the customer? ──
//
// Our ten SaaS hand the customer their API key by email, through the Brevo SMTP
// relay. Brevo answering HTTP 201 proves we handed the message over; it proves
// nothing about delivery. The only place a delivery failure exists afterwards is
// Brevo's event feed, and until this script nobody read it.
//
// The incident that bought this file: on 2026-11-05 at 09:26 CET
// "Your EmailGuard Key is Ready" to adam@adambeckoin.pw went softBounce with
//   551-5.7.1 Your IP is black listed by SpamCop.org
// The customer paid and received nothing. We found out FIVE DAYS later, by hand,
// scrolling the Brevo dashboard. The relay's shared IPs rotate, so the failure
// is intermittent and does not reproduce — you cannot test for it, you can only
// watch for it.
//
// Design constraints, each one learned the hard way:
//
//  1. NEVER use the API's `email=` filter to count what happened. It does not
//     match plus-aliases, and it has already produced false zeros — a clean
//     answer from a query that could not have matched. We read the UNFILTERED
//     feed and page through it with limit/offset, then filter in memory, where
//     the rules are ours and are unit-tested.
//
//  2. The event index lags. The absence of an event right after a send proves
//     nothing, so the window is DAYS wide (7 by default), never minutes.
//
//  3. Our own QA aliases bounce constantly and would bury the one event that
//     matters. They are excluded by `isInternalRecipient` — and the count of
//     what was excluded is reported, because a filter nobody can see is
//     indistinguishable from a filter that swallowed the finding.
//
//  4. A credential delivery that bounces leaves the customer without the
//     product. Those are ranked first, by subject (see
//     CREDENTIAL_SUBJECT_PATTERNS — grounded in the real subject lines the ten
//     products send, not invented).
//
// Repetition is deliberate: a bounce stays in the window for 7 days, so an
// un-actioned one is reported every day until the recipient is fixed. Five days
// of silence is the thing this file exists to prevent.
//
// Zero npm dependencies (node built-ins only), same as its siblings here.
// Required env var: BREVO_API_KEY.
//
// CLI:
//   node scripts/automation/bounce-watch.js                 # last 7 days
//   node scripts/automation/bounce-watch.js --days 30
//   node scripts/automation/bounce-watch.js --start 2026-11-01 --end 2026-11-08
//   node scripts/automation/bounce-watch.js --json

const https = require('https');

// Brevo caps this endpoint's page size at 100. MAX_PAGES is a hard stop so a
// pathological window can never turn the daily report into a long-running job.
const PAGE_LIMIT = 100;
const MAX_PAGES = 20;
const DEFAULT_WINDOW_DAYS = 7;
const REQUEST_TIMEOUT_MS = 20000;

// Both halves of "it did not arrive". A soft bounce is the dangerous one: it
// looks temporary, nothing retries it, and the customer is simply left waiting.
const BOUNCE_EVENTS = ['softBounces', 'hardBounces'];

// ── Recipient classification ─────────────────────────────────────────────────

// SMTP rejections arrive as multi-line replies ("551-5.7.1 …\n551-5.7.1 …"),
// which wreck both the console table and the HTML row. Keep every word, on one
// line: the reason text is the evidence, so it is never truncated here.
function compactText(value) {
  return String(value == null ? '' : value)
    .replace(/\s+/g, ' ')
    .trim();
}

function splitAddress(email) {
  const addr = String(email == null ? '' : email)
    .trim()
    .toLowerCase();
  const at = addr.lastIndexOf('@');
  if (at <= 0 || at === addr.length - 1) return null;
  return { local: addr.slice(0, at), domain: addr.slice(at + 1) };
}

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);
const OWNER_GMAIL_LOCAL = 'antonioalt3000'; // dots stripped — Gmail ignores them

function inDomain(domain, suffix) {
  return domain === suffix || domain.endsWith('.' + suffix);
}

/**
 * True for addresses that are OURS: the owner's inbox and its plus-aliases, the
 * reserved example.com used by every QA run, the MX-less devtoolsmith.dev, and
 * the products' own support@ mailboxes. These bounce routinely and are noise.
 *
 * A malformed address is NOT treated as internal: it cannot be a customer we
 * can reach, but it is also not something to silently drop — it surfaces as a
 * finding so somebody looks at it.
 */
function isInternalRecipient(email) {
  const parts = splitAddress(email);
  if (!parts) return false;
  const { local, domain } = parts;

  // RFC 2606 reserved: can never receive mail. Every QA signup uses it.
  if (inDomain(domain, 'example.com')) return true;
  // Our own codename domain: no MX record, and brand convention forbids it.
  if (inDomain(domain, 'devtoolsmith.dev')) return true;
  // support@<product>.dev — our side of a customer conversation, not a customer.
  if (local === 'support' && domain.endsWith('.dev')) return true;

  if (GMAIL_DOMAINS.has(domain)) {
    // Gmail ignores dots and everything after '+', so antonio.alt3000+qa@ and
    // antonioalt3000@ are one inbox: the owner's. Normalize before comparing,
    // or a plus-alias slips through as if it were a customer.
    const base = local.split('+')[0].replace(/\./g, '');
    if (base === OWNER_GMAIL_LOCAL) return true;
  }

  return false;
}

// ── Subject classification ───────────────────────────────────────────────────

// Taken from the subject lines the ten products actually send. A bounce on one
// of these means the customer has no key, no sign-in and no product.
const CREDENTIAL_SUBJECT_PATTERNS = [
  { label: 'API key delivery', re: /key is ready/i },
  { label: 'API key delivery', re: /\bapi key\b/i },
  { label: 'sign-in key', re: /\bsign-?in key\b/i },
  { label: 'first access', re: /\bwelcome to\b/i },
  { label: 'lifetime redemption (carries the key)', re: /\blifetime (?:access|account)\b/i },
  { label: 'password reset', re: /password reset|reset your password/i },
];

/**
 * Does this subject look like a credential handover?
 * @returns {{credential: boolean, label: string|null}}
 */
function classifySubject(subject) {
  const text = String(subject == null ? '' : subject);
  for (const { label, re } of CREDENTIAL_SUBJECT_PATTERNS) {
    if (re.test(text)) return { credential: true, label };
  }
  return { credential: false, label: null };
}

/**
 * Priority of one bounce.
 *
 * `high` covers two shapes:
 *  - a credential subject (the customer is left without the product), and
 *  - any hardBounce, because a permanent failure means every future email to
 *    that address is lost too, receipts and resets included.
 */
function classifyEvent(event) {
  const subject = classifySubject(event && event.subject);
  if (subject.credential) {
    return { priority: 'high', why: subject.label };
  }
  if (event && event.event === 'hardBounces') {
    return { priority: 'high', why: 'hard bounce — address permanently unreachable' };
  }
  return { priority: 'normal', why: 'non-credential email' };
}

// ── Window ───────────────────────────────────────────────────────────────────

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Inclusive [startDate, endDate] in UTC, `days` wide and ending today.
 * days=1 is a single day (today); the default 7 absorbs the feed's indexing lag.
 */
function windowDates(days = DEFAULT_WINDOW_DAYS, now = new Date()) {
  const span = Math.max(1, Math.floor(Number(days) || DEFAULT_WINDOW_DAYS));
  const end = new Date(now.getTime());
  const start = new Date(end.getTime() - (span - 1) * 86400000);
  return { startDate: ymd(start), endDate: ymd(end) };
}

// ── Findings ─────────────────────────────────────────────────────────────────

const PRIORITY_RANK = { high: 0, normal: 1 };

/**
 * Collapse raw events into one finding per (recipient, event type, subject),
 * external recipients only, high priority first then most recent.
 *
 * @returns {{findings: object[], scanned: number, excluded: number}}
 */
function toFindings(events) {
  const list = Array.isArray(events) ? events : [];
  const byKey = new Map();
  let excluded = 0;

  for (const ev of list) {
    if (!ev || !ev.email) continue;
    if (isInternalRecipient(ev.email)) {
      excluded++;
      continue;
    }
    const email = String(ev.email).trim().toLowerCase();
    const subject = compactText(ev.subject) || '(no subject)';
    const key = email + '|' + (ev.event || '') + '|' + subject;
    const date = ev.date || '';

    let finding = byKey.get(key);
    if (!finding) {
      const { priority, why } = classifyEvent(ev);
      finding = {
        email,
        event: ev.event || 'bounce',
        subject,
        from: ev.from || '(unknown sender)',
        reason: compactText(ev.reason) || '(no reason given)',
        priority,
        why,
        occurrences: 0,
        firstSeen: date,
        lastSeen: date,
        messageIds: [],
      };
      byKey.set(key, finding);
    }
    finding.occurrences++;
    if (date && (!finding.firstSeen || date < finding.firstSeen)) finding.firstSeen = date;
    if (date && (!finding.lastSeen || date > finding.lastSeen)) finding.lastSeen = date;
    if (ev.messageId && finding.messageIds.length < 3) finding.messageIds.push(ev.messageId);
  }

  const findings = Array.from(byKey.values()).sort((a, b) => {
    const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (rank !== 0) return rank;
    return String(b.lastSeen).localeCompare(String(a.lastSeen));
  });

  return { findings, scanned: list.length, excluded };
}

function countHigh(findings) {
  return (findings || []).filter((f) => f.priority === 'high').length;
}

// ── Brevo event feed ─────────────────────────────────────────────────────────

function requestJson(path, apiKey) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        hostname: 'api.brevo.com',
        path,
        port: 443,
        headers: { accept: 'application/json', 'api-key': apiKey },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            // Never echo the key; the status code and body prefix are enough.
            return reject(new Error(`Brevo HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          }
          try {
            resolve(JSON.parse(data || '{}'));
          } catch (err) {
            reject(new Error(`Brevo returned unparseable JSON: ${err.message}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error(`Brevo event request timed out after ${REQUEST_TIMEOUT_MS}ms`));
    });
  });
}

/**
 * One page of the UNFILTERED event feed for a single event type.
 *
 * An empty window answers `{}` with NO `events` key at all (verified against
 * the live API) — reading `body.events.length` on that throws, which is how a
 * check like this quietly stops checking.
 */
async function fetchEventPage({
  apiKey,
  event,
  startDate,
  endDate,
  offset = 0,
  limit = PAGE_LIMIT,
}) {
  const qs = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    startDate,
    endDate,
    event,
  });
  const body = await requestJson(`/v3/smtp/statistics/events?${qs.toString()}`, apiKey);
  return Array.isArray(body && body.events) ? body.events : [];
}

/**
 * Every bounce event in the window, both types, all pages.
 * `fetchPage` is injectable so the paging and grouping logic is testable
 * without the network.
 */
async function fetchBounceEvents({ apiKey, startDate, endDate, fetchPage = fetchEventPage }) {
  const events = [];
  const errors = [];

  for (const event of BOUNCE_EVENTS) {
    try {
      for (let page = 0; page < MAX_PAGES; page++) {
        const batch = await fetchPage({
          apiKey,
          event,
          startDate,
          endDate,
          offset: page * PAGE_LIMIT,
          limit: PAGE_LIMIT,
        });
        events.push(...batch);
        if (batch.length < PAGE_LIMIT) break;
        if (page === MAX_PAGES - 1) {
          errors.push(`${event}: hit the ${MAX_PAGES}-page cap — the window may be truncated`);
        }
      }
    } catch (err) {
      // One event type failing must not discard the other type's findings.
      errors.push(`${event}: ${err.message}`);
    }
  }

  return { events, errors };
}

/**
 * The whole check. Never throws: the daily report must still go out even when
 * this fails, and when it fails it says so (a silent green is worse than none).
 *
 * @returns {Promise<{ok: boolean, window: object, findings: object[], scanned: number, excluded: number, highCount: number, errors: string[]}>}
 */
async function collectBounceFindings(options = {}) {
  const apiKey = options.apiKey || process.env.BREVO_API_KEY;
  const window =
    options.startDate && options.endDate
      ? { startDate: options.startDate, endDate: options.endDate }
      : windowDates(options.days || process.env.BOUNCE_WINDOW_DAYS || DEFAULT_WINDOW_DAYS);

  const empty = { window, findings: [], scanned: 0, excluded: 0, highCount: 0 };

  if (!apiKey) {
    return {
      ...empty,
      ok: false,
      errors: ['BREVO_API_KEY is not set — the bounce feed was NOT read'],
    };
  }

  try {
    const { events, errors } = await fetchBounceEvents({
      apiKey,
      startDate: window.startDate,
      endDate: window.endDate,
      fetchPage: options.fetchPage,
    });
    const { findings, scanned, excluded } = toFindings(events);
    return {
      ok: errors.length === 0,
      window,
      findings,
      scanned,
      excluded,
      highCount: countHigh(findings),
      errors,
    };
  } catch (err) {
    return { ...empty, ok: false, errors: [err.message] };
  }
}

// ── Rendering ────────────────────────────────────────────────────────────────

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * The daily-report section. Three shapes, and the difference between them is
 * the whole point: findings, a proven-clean window, or a check that could not
 * run. The last one is never allowed to look like the middle one.
 */
function buildBounceSectionHtml(result) {
  const heading = `
      <h2 style="font-size:15px;color:#374151;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em">
        📮 Email Delivery (Brevo bounces)
      </h2>`;

  const scope = `${escapeHtml(result.window.startDate)} → ${escapeHtml(result.window.endDate)} · ${result.scanned} bounce event(s) scanned · ${result.excluded} on our own addresses`;

  if (!result.ok && result.findings.length === 0) {
    return `${heading}
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:14px;color:#92400e;font-weight:600">⚠️ The bounce check did not run</p>
        <p style="margin:6px 0 0;font-size:13px;color:#92400e">${escapeHtml(result.errors.join('; '))}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#92400e">A delivery failure in this window would be invisible. Treat this as unknown, not as clean.</p>
      </div>`;
  }

  if (result.findings.length === 0) {
    return `${heading}
      <div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:14px;color:#15803d;font-weight:600">✅ No external recipient bounced</p>
        <p style="margin:6px 0 0;font-size:12px;color:#166534">${scope}</p>
      </div>`;
  }

  const rows = result.findings
    .map((f) => {
      const high = f.priority === 'high';
      const color = high ? '#dc2626' : '#d97706';
      const badge = high ? '🚨 HIGH' : '⚠️ watch';
      const repeats = f.occurrences > 1 ? ` · ${f.occurrences}×` : '';
      return `
        <tr style="border-bottom:1px solid #f3f4f6">
          <td style="padding:10px 14px;font-weight:600;color:${color};white-space:nowrap">${badge}</td>
          <td style="padding:10px 14px;font-size:13px">
            <div style="font-weight:600">${escapeHtml(f.email)}</div>
            <div style="color:#6b7280">${escapeHtml(f.subject)}</div>
            <div style="color:#9ca3af;font-size:12px">${escapeHtml(f.event)}${repeats} · from ${escapeHtml(f.from)} · ${escapeHtml(f.why)}</div>
          </td>
          <td style="padding:10px 14px;font-size:12px;color:#6b7280;white-space:nowrap">${escapeHtml(String(f.lastSeen).slice(0, 16).replace('T', ' '))}</td>
          <td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#4b5563">${escapeHtml(f.reason)}</td>
        </tr>`;
    })
    .join('');

  const high = result.highCount;
  const banner = high
    ? `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:14px;margin-bottom:12px">
         <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600">🚨 ${high} credential/permanent delivery failure(s) — a paying customer may be holding nothing</p>
         <p style="margin:6px 0 0;font-size:12px;color:#991b1b">Resend by hand once the address or the sender IP is sorted. Brevo's 201 only proved we handed the message over.</p>
       </div>`
    : '';

  const warnings = (result.errors || []).length
    ? `<p style="margin:0 0 12px;font-size:12px;color:#92400e">⚠️ partial read: ${escapeHtml(result.errors.join('; '))}</p>`
    : '';

  return `${heading}
      ${banner}${warnings}
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border-collapse:collapse;font-size:14px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:8px">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase">Priority</th>
            <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase">Recipient / email</th>
            <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase">Last seen</th>
            <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase">Reason</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin:0 0 24px;font-size:12px;color:#9ca3af">${scope}</p>`;
}

// ── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') out.json = true;
    else if (arg === '--days') out.days = Number(argv[++i]);
    else if (arg === '--start') out.startDate = argv[++i];
    else if (arg === '--end') out.endDate = argv[++i];
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await collectBounceFindings(args);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }

  console.log('\n[Bounce Watch]');
  console.log('─'.repeat(72));
  console.log(`  Window:   ${result.window.startDate} → ${result.window.endDate}`);
  console.log(
    `  Scanned:  ${result.scanned} bounce event(s) · ${result.excluded} on our own addresses`
  );

  if (!result.ok) {
    console.log(`  ⚠️  Partial or failed read: ${result.errors.join('; ')}`);
  }

  if (result.findings.length === 0) {
    console.log('  ✅ No external recipient bounced in this window.\n');
    process.exit(result.ok ? 0 : 1);
  }

  console.log(`  🔴 ${result.findings.length} finding(s), ${result.highCount} high priority:\n`);
  for (const f of result.findings) {
    const tag = f.priority === 'high' ? '🚨 HIGH ' : '⚠️  watch';
    console.log(`  ${tag} ${f.email}`);
    console.log(
      `           "${f.subject}" · ${f.event}${f.occurrences > 1 ? ` ×${f.occurrences}` : ''} · from ${f.from}`
    );
    console.log(`           ${f.lastSeen} · ${f.why}`);
    console.log(`           ${f.reason}`);
    console.log('');
  }
  process.exit(result.highCount > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\n💥 Fatal error:', err.message);
    process.exit(2);
  });
}

module.exports = {
  isInternalRecipient,
  classifySubject,
  classifyEvent,
  windowDates,
  toFindings,
  countHigh,
  fetchBounceEvents,
  fetchEventPage,
  collectBounceFindings,
  buildBounceSectionHtml,
  CREDENTIAL_SUBJECT_PATTERNS,
  BOUNCE_EVENTS,
  PAGE_LIMIT,
  DEFAULT_WINDOW_DAYS,
};
