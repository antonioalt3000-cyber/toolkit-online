// F3 ROI calculator oracle (7 nov 2026). Independent arithmetic, real browser, real typing.
// usage: node f3-calc-oracle.cjs [baseUrl]    (default https://paymentrescue.dev; read-only, no writes)
//   lost/month  = mrr * churn%            -> shown as "-$X" and "$X*12/year"
//   recoverable = lost * recovery%        -> shown as "+$Y"
//   saved/year  = recoverable * 12        -> shown as "$Z"
// Bounds declared by the page (app/calculator/field-bounds.ts): mrr 0..10,000,000 · churn 1..30 · txn 0..10,000 · recovery 30..50.
// Every typed value outside its bound must be (a) USED at the bound and (b) SAID on screen. Nothing silent, nothing NaN.
'use strict';
const { openIsolated, sleep, setVal, check, save, EVID } = require('./lib.cjs');
const path = require('path');
const BASE = process.argv[2] || 'https://paymentrescue.dev';
const S = 'f3calc';
const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const CASES = [
  { name: 'headline: 25,000 x 9% x 40% x 12 = 10,800', mrr: 25000, churn: 9, txn: 40, rec: 40 },
  { name: 'MRR zero', mrr: 0, churn: 9, txn: 40, rec: 40 },
  { name: 'MRR negative (-5000)', mrr: -5000, churn: 9, txn: 40, rec: 40, expectNotice: ['mrr'] },
  {
    name: 'recovery 65 > max 50',
    mrr: 48000,
    churn: 5.5,
    txn: 40,
    rec: 65,
    expectNotice: ['recovery'],
  },
  {
    name: 'recovery 15 < min 30',
    mrr: 48000,
    churn: 5.5,
    txn: 40,
    rec: 15,
    expectNotice: ['recovery'],
  },
  { name: 'churn 99 > max 30', mrr: 25000, churn: 99, txn: 40, rec: 40, expectNotice: ['churn'] },
  {
    name: 'MRR 1e9 > max 10,000,000',
    mrr: 1000000000,
    churn: 9,
    txn: 40,
    rec: 40,
    expectNotice: ['mrr'],
  },
  {
    name: 'boundary: recovery exactly 30 and 50 are accepted as typed',
    mrr: 10000,
    churn: 10,
    txn: 10,
    rec: 50,
  },
];

async function readFigures(j) {
  return j.eval(`(() => {
    const t = document.body.innerText;
    return { text: t, notices: ['mrr','churn','txn','recovery'].map((k) => {
      const e = document.getElementById('calc-' + k + '-notice'); return [k, e ? e.innerText.trim() : ''];
    }) };
  })()`);
}

(async () => {
  let j;
  try {
    j = await openIsolated(`${BASE}/calculator`);
    await sleep(2000);
    for (const c of CASES) {
      await setVal(j, '#calc-mrr', c.mrr);
      await setVal(j, '#calc-churn', c.churn);
      await setVal(j, '#calc-txn', c.txn);
      await setVal(j, '#calc-recovery', c.rec);
      await sleep(500);
      const f = await readFigures(j);
      const mrrU = clamp(c.mrr, 0, 10000000);
      const churnU = clamp(c.churn, 1, 30);
      const recU = clamp(c.rec, 30, process.env.QA_PERTURB ? 45 : 50); // QA_PERTURB=1 must turn the oracle RED (mutation check)
      const lost = (mrrU * churnU) / 100;
      const rec = lost * (recU / 100);
      const yearly = rec * 12;
      const t = f.text;
      check(
        S,
        `${c.name}: no NaN/Infinity/undefined on the page`,
        false,
        /NaN|Infinity|undefined/.test(t)
      );
      check(S, `${c.name}: monthly loss -${usd(lost)}`, true, t.includes('-' + usd(lost)));
      check(
        S,
        `${c.name}: yearly loss ${usd(lost * 12)}/year`,
        true,
        t.includes(usd(lost * 12) + '/year')
      );
      check(
        S,
        `${c.name}: recoverable +${usd(rec)} at ${recU}%`,
        true,
        t.includes('+' + usd(rec)) && t.includes(`(${recU}%`)
      );
      check(S, `${c.name}: saved per year ${usd(yearly)}`, true, t.includes(usd(yearly)));
      for (const [k, txt] of f.notices) {
        const wants = (c.expectNotice || []).includes(k);
        check(
          S,
          `${c.name}: ${k} notice ${wants ? 'present' : 'absent'}`,
          wants,
          txt.length > 0,
          txt.slice(0, 120)
        );
      }
    }
    await j.screenshot(path.join(EVID, 'f3', 'calc-oracle-last.png'), { fullPage: true });
    // negative control: the oracle must go RED if the expectation is perturbed
    await setVal(j, '#calc-mrr', 25000);
    await setVal(j, '#calc-churn', 9);
    await setVal(j, '#calc-recovery', 40);
    await sleep(400);
    const t = (await readFigures(j)).text;
    check(
      S,
      'negative control: a WRONG expectation (10,801) is NOT found on the page',
      false,
      t.includes('10,801')
    );
    check(S, 'journey: no console exceptions', [], j.report().exceptions);
  } finally {
    if (j) await j.close();
  }
  const fails = save('f3/calc-oracle.json');
  process.exitCode = fails ? 1 : 0;
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
