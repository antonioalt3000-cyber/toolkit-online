// F2 FixMyWeb scan endpoint, hostile / degenerate inputs and determinism, driven FROM the real browser page
// (a non-browser client gets the bot gate's 403 on every request, which would make any "4xx" below vacuous).
// Control: a legitimate scan from the same page must answer 200 first, otherwise nothing below proves anything.
'use strict';
const { openIsolated, sleep, check, save } = require('./lib.cjs');
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

(async () => {
  let j;
  try {
    j = await openIsolated('https://fixmyweb.dev/');
    await sleep(4000);
    const scan = (u) =>
      j.eval(`fetch('/api/scan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: ${JSON.stringify(u)} }) })
        .then(async (r) => { const t = await r.text(); let s = null; try { const d = JSON.parse(t); s = d.score ?? d.overallScore ?? null; } catch (e) {} return { status: r.status, score: s, text: t.slice(0, 140) }; })`);
    const ok = await scan('https://example.com');
    check(
      'f2',
      'control: a legitimate scan from the page answers 200 with a numeric score',
      [200, true],
      [ok.status, typeof ok.score === 'number'],
      ok.text.slice(0, 80)
    );
    if (ok.status !== 200)
      throw new Error('control scan failed, nothing below would prove anything');
    for (const u of BAD) {
      await sleep(3000);
      const r = await scan(u);
      check(
        'f2',
        `invalid/hostile url ${JSON.stringify(u.slice(0, 40))}: a 4xx that is NOT the bot gate`,
        true,
        r.status >= 400 && r.status < 500 && r.status !== 403,
        `HTTP ${r.status} ${r.text.replace(/\s+/g, ' ').slice(0, 110)}`
      );
    }
    for (const [label, u] of [
      ['empty 200 body', 'https://httpbin.org/status/200'],
      ['404 page', 'https://httpbin.org/status/404'],
    ]) {
      await sleep(3000);
      const r = await scan(u);
      check(
        'f2',
        `${label}: no 5xx and no NaN/null score`,
        true,
        r.status < 500 && (r.status >= 400 || Number.isFinite(r.score)),
        `HTTP ${r.status} score=${r.score} ${r.status >= 400 ? r.text.replace(/\s+/g, ' ').slice(0, 100) : ''}`
      );
    }
    await sleep(3000);
    const a = await scan('https://example.com');
    check(
      'f2',
      'determinism: the same page scanned again has the same score',
      ok.score,
      a.score,
      `${ok.status}/${a.status}`
    );
  } finally {
    if (j) await j.close();
  }
  const fails = save('f2-edge-browser.json');
  process.exitCode = fails ? 1 : 0;
})().catch((e) => {
  console.error('ERR', e.message);
  process.exitCode = 1;
});
