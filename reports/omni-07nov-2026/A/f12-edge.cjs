// F1 CompliPilot and F2 FixMyWeb scan endpoints: hostile / degenerate inputs and determinism, in production.
// Key: the creator key from the vault (never printed). Rule asserted: never a 5xx, never a number that is not a number,
// the same page scanned twice gives the same score. usage: node f12-edge.cjs
'use strict';
const fs = require('fs');
const { check, save } = require('./lib.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VAULT = 'C:/Users/ftass/secrets-private/saas-creator-keys.md';

function vaultKey(dom) {
  const row = fs
    .readFileSync(VAULT, 'utf8')
    .split('\n')
    .find((l) => l.startsWith('|') && l.includes(dom) && l.includes('`'));
  const m = row && row.match(/`([A-Za-z0-9_]{16,})`/);
  return m ? m[1] : '';
}

async function scan(dom, key, url) {
  const res = await fetch(`https://${dom}/api/scan`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(key ? { 'x-api-key': key } : {}) },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(90000),
  }).catch((e) => ({ status: 0, text: async () => String(e.message) }));
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { status: res.status, text, json };
}

const BAD = [
  'not a url',
  '',
  'ftp://example.org/',
  'javascript:alert(1)',
  'file:///etc/passwd',
  'http://127.0.0.1/',
  'http://169.254.169.254/',
  'http://2130706433/',
  'http://[::1]/',
  'https://' + 'a'.repeat(300) + '.com/',
];
const scoreOf = (j) => j && (j.overallScore ?? j.score);

(async () => {
  for (const [slug, dom] of [
    ['f1', 'complipilot.dev'],
    ['f2', 'fixmyweb.dev'],
  ]) {
    const key = vaultKey(dom);
    // F1 scans with the creator key; F2 has no key in the vault (cookie sessions), so its scans are anonymous (free tier).
    if (slug === 'f1') check(slug, 'creator key available in the vault', true, key.length > 0);
    if (slug === 'f1' && !key) continue;
    for (const u of BAD) {
      await sleep(3000);
      const r = await scan(dom, key, u);
      check(
        slug,
        `invalid/hostile url ${JSON.stringify(u.slice(0, 40))}: a 4xx, never a 5xx`,
        true,
        r.status >= 400 && r.status < 500,
        `HTTP ${r.status} ${r.text.slice(0, 110).replace(/\s+/g, ' ')}`
      );
    }
    // degenerate pages (public test service answering 200 with an empty body, and 404)
    for (const [label, u] of [
      ['empty 200 body', 'https://httpbin.org/status/200'],
      ['404 page', 'https://httpbin.org/status/404'],
    ]) {
      await sleep(3000);
      const r = await scan(dom, key, u);
      const s = scoreOf(r.json);
      check(
        slug,
        `${label}: no 5xx and no NaN/null score`,
        true,
        r.status < 500 && (r.status >= 400 || (typeof s === 'number' && Number.isFinite(s))),
        `HTTP ${r.status} score=${s} ${r.status >= 400 ? r.text.slice(0, 100).replace(/\s+/g, ' ') : ''}`
      );
    }
    // determinism: the same page twice, same score
    await sleep(3000);
    const a = await scan(dom, key, 'https://example.com');
    await sleep(3000);
    const b = await scan(dom, key, 'https://example.com');
    check(
      slug,
      'determinism: the same page scanned twice has the same score',
      scoreOf(a.json),
      scoreOf(b.json),
      `${a.status}/${b.status}`
    );
    check(slug, 'determinism: both scans answered 200', [200, 200], [a.status, b.status]);
  }
  const fails = save('f1f2-edge.json');
  process.exitCode = fails ? 1 : 0;
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
