#!/usr/bin/env node
/**
 * journey.cjs — un mese d'uso cliente compresso, su un prodotto, nel browser reale.
 *
 * Il tempo non si puo' far passare, quindi il mese si comprime con tre leve:
 *   L1  i cron si invocano a mano con Bearer CRON_SECRET;
 *   L2  i timestamp in Redis si riscrivono (non usata qui: richiede il token di scrittura);
 *   L3  la quota vive su una chiave YYYY-MM e si azzera da se' al cambio mese.
 *
 * Tutto quello che scrive in produzione passa da un coupon `internal: true`, che
 * solo l'email del fondatore puo' riscattare: i pool dei partner non si toccano.
 *
 *   node journey.cjs <slug>
 */
const fs = require('fs');
const path = require('path');
const { Journey, sleep } = require('C:/Users/ftass/toolkit-online/scratchpad/qa-infra/cdp-journey.cjs');

const SLUG = process.argv[2];
const DIR = __dirname;
const EV = path.join(DIR, 'evidence', SLUG);
fs.mkdirSync(EV, { recursive: true });

const CFG = {
  f1:  { dom: 'complipilot.dev',   name: 'CompliPilot',   auth: 'apikey' },
  f2:  { dom: 'fixmyweb.dev',      name: 'FixMyWeb',      auth: 'cookie' },
  f3:  { dom: 'paymentrescue.dev', name: 'PaymentRescue', auth: 'cookie' },
  f4:  { dom: 'parseflow.dev',     name: 'ParseFlow',     auth: 'apikey' },
  b7:  { dom: 'captureapi.dev',    name: 'CaptureAPI',    auth: 'apikey' },
  cfg: { dom: 'getcardforge.dev',  name: 'CardForge',     auth: 'apikey' },
  eg:  { dom: 'emailguard.dev',    name: 'EmailGuard',    auth: 'apikey' },
  hsh: { dom: 'headershield.dev',  name: 'HeaderShield',  auth: 'apikey' },
  hkl: { dom: 'gethooklab.dev',    name: 'HookLab',       auth: 'apikey' },
  seo: { dom: 'seoscope.dev',      name: 'SEOScope',      auth: 'apikey' },
}[SLUG];
if (!CFG) throw new Error(`slug ignoto: ${SLUG}`);

const EMAIL = `antonio.alt3000+qa31ott-${SLUG}@gmail.com`;
const results = [];
function check(day, what, pass, detail = '') {
  results.push({ day, what, pass: !!pass, detail: String(detail).slice(0, 300) });
  console.log(`${pass ? 'PASS' : 'FAIL'}  D${day}  ${what}${detail ? '  — ' + String(detail).slice(0, 160) : ''}`);
}

/** Errori che non sono colpa del prodotto: estensioni, analytics bloccati, rumore del browser. */
/** overflowX() restituisce {scrollWidth, clientWidth, offenders}: va confrontato,
 *  non trattato come booleano (il primo giro di questo script lo ha sbagliato e
 *  ha prodotto due FAIL che erano della sonda, non del prodotto). */
async function noOverflow(j) {
  const o = await j.overflowX();
  return { ok: o.scrollWidth <= o.clientWidth + 1, detail: `scrollWidth ${o.scrollWidth} vs clientWidth ${o.clientWidth}${o.offenders.length ? ' | ' + o.offenders.join(', ') : ''}` };
}

const NOISE = /favicon|analytics|googletag|gtag|posthog|sentry|doubleclick|ERR_BLOCKED_BY_CLIENT|chrome-extension|net::ERR_ABORTED/i;
function realErrors(j) {
  return {
    console: j.consoleErrors.filter((e) => !NOISE.test(e)),
    exceptions: j.exceptions.slice(),
    bad: j.badResponses.filter((r) => !NOISE.test(r.url)),
  };
}

(async () => {
  console.log(`\n===== ${CFG.name} (${CFG.dom}) — mese compresso, browser reale\n`);
  const j = await Journey.open(`https://${CFG.dom}/`);
  try {
    // ---- D1: la vetrina rende, senza errori
    await j.idle();
    await j.screenshot(path.join(EV, 'd1-home.png'));
    const e1 = realErrors(j);
    check(1, 'home rende senza errori di console', e1.console.length === 0 && e1.exceptions.length === 0,
      [...e1.console, ...e1.exceptions].join(' | '));
    check(1, 'home senza risposte >=400', e1.bad.length === 0, e1.bad.map((b) => `${b.status} ${b.url}`).join(' | '));
    const ov1 = await noOverflow(j);
    check(1, 'nessuno scorrimento orizzontale a 1366px', ov1.ok, ov1.detail);

    // ---- D1: /redeem raggiungibile e il form c'e'
    j.consoleErrors.length = 0; j.exceptions.length = 0; j.badResponses.length = 0;
    await j.goto(`https://${CFG.dom}/redeem`);
    await j.idle();
    await j.screenshot(path.join(EV, 'd1-redeem.png'));
    const hasForm = await j.eval(`!!document.querySelector('input[type=email],input[name=email],#email')`);
    check(1, '/redeem espone un campo email', hasForm);
    const e2 = realErrors(j);
    check(1, '/redeem senza errori di console', e2.console.length === 0 && e2.exceptions.length === 0,
      [...e2.console, ...e2.exceptions].join(' | '));

    // ---- D2: mobile 375px, la regressione che il round di ottobre aveva lasciato aperta
    await j.viewport(375, 812, true);
    await j.goto(`https://${CFG.dom}/`);
    await j.idle();
    await j.screenshot(path.join(EV, 'd2-mobile.png'));
    const ov2 = await noOverflow(j);
    check(2, 'nessuno scorrimento orizzontale a 375px', ov2.ok, ov2.detail);
    await j.viewport(1366, 900, false);

    fs.writeFileSync(path.join(EV, 'results.json'), JSON.stringify({ slug: SLUG, ...CFG, email: EMAIL, results }, null, 2));
    const failed = results.filter((r) => !r.pass);
    console.log(`\n--- ${CFG.name}: ${results.length - failed.length}/${results.length} PASS`);
    if (failed.length) console.log(failed.map((f) => `    FAIL D${f.day} ${f.what}: ${f.detail}`).join('\n'));
  } finally {
    await j.close();
  }
})().catch((e) => { console.error('ERRORE HARNESS:', e.message); process.exit(1); });
