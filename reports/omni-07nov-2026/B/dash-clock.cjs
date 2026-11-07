#!/usr/bin/env node
/**
 * dash-clock.cjs — the dashboard's activity sparkline with the CUSTOMER'S clock off, in the real browser.
 *
 *   node A/..B/run-prod-b.cjs <slug>      (production build under mocks, ports 33xx)
 *   node B/dash-clock.cjs <slug>
 *
 * A real request is made with the customer's key (so the server logs it with ITS timestamp), then the
 * dashboard is opened with the browser clock at 0, -5 min, +5 min and, as the negative control, -2 days. The
 * sparkline's "today" bar must be lit for the first three (bucketByDay used to drop a request the server logged
 * "in the future" of a browser clock that runs behind) and must NOT be for -2 days (more than a day of skew is
 * not skew: the chart is allowed to say nothing, which proves the oracle can go red).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { Journey, sleep } = require('../../../scratchpad/qa-infra/cdp-journey.cjs');

const SLUG = process.argv[2];
const S = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../../../scratchpad/qa-26ott/state', `${SLUG}.json`),
    'utf8'
  )
);
const BASE = S.base;
const STORAGE = { cfg: 'cardforge-dashboard-key' };
const results = [];
const check = (what, pass, detail = '') => {
  results.push({ what, pass: !!pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${what}${detail ? '  — ' + detail : ''}`);
};

const shim = (off) => `(() => { const OD = Date, off = ${off};
  const ND = function (...a) { if (!new.target) return new OD(OD.now() + off).toString(); return a.length ? new OD(...a) : new OD(OD.now() + off); };
  ND.prototype = OD.prototype; ND.now = () => OD.now() + off; ND.parse = OD.parse; ND.UTC = OD.UTC; globalThis.Date = ND; })();`;

async function main() {
  const email = `qa-clock-${SLUG}-${Date.now().toString(36)}@example.org`;
  const su = await (
    await fetch(`${BASE}/api/signup`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: BASE },
      body: JSON.stringify({ email }),
    })
  ).json();
  const key = su.apiKey;
  check('signup consegna una chiave', !!key);
  const card = await fetch(`${BASE}/api/v1/card?template=og-minimal&title=clock`, {
    headers: { 'x-api-key': key },
  });
  check(
    'una richiesta reale con la chiave (registrata dal server col SUO orologio)',
    card.status === 200,
    `HTTP ${card.status}`
  );
  await sleep(1500);
  const reqs = await (
    await fetch(`${BASE}/api/dashboard/requests`, { headers: { 'x-api-key': key } })
  ).json();
  const logged = (reqs.requests || reqs.recentRequests || []).length;
  check('il server ha registrato almeno una richiesta recente', logged >= 1, `${logged} richieste`);

  for (const [label, offMs, expectLit] of [
    ['orologio del browser corretto', 0, true],
    [
      'orologio del browser 5 minuti INDIETRO (la richiesta è nel «futuro» del browser)',
      -5 * 60 * 1000,
      true,
    ],
    ['orologio del browser 5 minuti AVANTI', 5 * 60 * 1000, true],
    [
      'controllo negativo: orologio 2 giorni INDIETRO (oltre un giorno non è skew)',
      -2 * 24 * 3600 * 1000,
      false,
    ],
  ]) {
    const j = await Journey.open('about:blank');
    await j.send('Page.addScriptToEvaluateOnNewDocument', { source: shim(offMs) });
    await j.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `try { localStorage.setItem(${JSON.stringify(STORAGE[SLUG])}, ${JSON.stringify(key)}); } catch (e) {}`,
    });
    await j.goto(`${BASE}/dashboard`);
    await j.waitFor('svg[aria-label^="Activity for the last"]', { timeout: 30000 }).catch(() => {});
    await sleep(800);
    const info =
      await j.eval(`(() => { const svg = document.querySelector('svg[aria-label^="Activity for the last"]');
      if (!svg) return { found: false };
      const rects = [...svg.querySelectorAll('rect')];
      return { found: true, bars: rects.length, lit: rects.filter((r) => r.getAttribute('opacity') === '0.9').length,
        lastLit: rects.length ? rects[rects.length - 1].getAttribute('opacity') === '0.9' : false }; })()`);
    const ok = info.found && (expectLit ? info.lastLit : info.lit === 0);
    check(
      `${label}: la barra di oggi è ${expectLit ? 'ACCESA' : 'spenta'}`,
      ok,
      JSON.stringify(info)
    );
    await j.close();
  }
}
main()
  .catch((e) => {
    console.error('DASH-CLOCK ABORTED:', e && e.stack ? e.stack : e);
    process.exitCode = 2;
  })
  .finally(() => {
    const fails = results.filter((r) => !r.pass).length;
    console.log(`\n--- ${SLUG}: ${results.length - fails}/${results.length} PASS`);
  });
