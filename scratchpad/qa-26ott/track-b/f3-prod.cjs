// PaymentRescue production: calculator + churn predictor as a customer, vs independent oracle.
const { Journey, sleep, O, EVID, setVal, check, save, num } = require('./helpers.cjs');
const BASE = 'https://paymentrescue.dev';

function roiOracle(mrr, churn, txn, recPct) {
  const c = Math.max(1, Math.min(30, churn)); // UI clamps churn to [1,30]
  const t = Math.max(0, Math.min(10000, txn));
  const rate = Math.min(0.5, Math.max(0.3, recPct / 100)); // lib clamps rate to [0.3,0.5]
  const lost = (mrr * c) / 100,
    rec = lost * rate,
    saved = rec * 12,
    cost = 59 * 12;
  const roi = ((saved - cost) / cost) * 100;
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  return {
    lost: `-$${fmt(lost)}`,
    rec: `+$${fmt(rec)}`,
    recPct: `${Math.round(rate * 100)}%`,
    saved: `$${fmt(saved)}`,
    avg: `~$${fmt(t > 0 ? lost / t : 0)}`,
    roi: roi > 0 ? `${fmt(roi)}%` : '---',
  };
}
async function readResults(j) {
  // parse in Node (plain regexes) from the rendered text the customer sees
  const t = await j.eval(
    `(() => { const h = [...document.querySelectorAll('h2')].find(e => e.textContent.trim() === 'Your Results'); return h ? h.parentElement.innerText : ''; })()`
  );
  const pick = (re) => (t.match(re) || [])[1] || null;
  return {
    lost: pick(/Revenue Lost per Month\s+(-\$[\d,]+)/),
    rec: pick(/Recoverable per Month \(\d+%\)\s+(\+\$[\d,]+)/),
    recPct: pick(/Recoverable per Month \((\d+%)\)/),
    saved: pick(/Total Saved per Year\s+(\$[\d,]+)/),
    avg: pick(/(~\$[\d,]+) avg value per failed payment/),
    roi: pick(/Your ROI with PaymentRescue\s+([\d,]+%|---)/i),
  };
}

(async () => {
  const j = await Journey.open(`${BASE}/calculator`);
  await j.waitFor('#calc-mrr');
  // defaults first (no typing)
  check(
    'f3',
    'calculator defaults 25000/9/50/40',
    roiOracle(25000, 9, 50, 40),
    await readResults(j)
  );
  const cases = [
    [120000, 5, 80, 30],
    [1000, 1, 3, 50],
    [480000, 12.5, 2400, 45],
    [50000, 45, 0, 70],
    [7300, 0.2, 7, 10],
  ];
  for (const [m, c, t, r] of cases) {
    await setVal(j, '#calc-mrr', m);
    await setVal(j, '#calc-churn', c);
    await setVal(j, '#calc-txn', t);
    await setVal(j, '#calc-recovery', r);
    await sleep(300);
    const shown = await j.eval(
      `[...['#calc-mrr','#calc-churn','#calc-txn','#calc-recovery']].map(s => document.querySelector(s).value)`
    );
    check(
      'f3',
      `calculator ${m}/${c}/${t}/${r} (inputs shown ${shown.join('/')})`,
      roiOracle(m, c, t, r),
      await readResults(j)
    );
  }
  await j.screenshot(`${EVID}/f3/calculator-desktop.png`, { fullPage: true });
  // share link: copy button writes ?mrr=&churn=&txn= — does opening it restore the values?
  await j.goto(`${BASE}/calculator?mrr=120000&churn=5&txn=80`);
  await j.waitFor('#calc-mrr');
  const restored = await j.eval(
    `['#calc-mrr','#calc-churn','#calc-txn'].map(s => document.querySelector(s).value)`
  );
  check(
    'f3',
    'shared link /calculator?mrr=120000&churn=5&txn=80 restores inputs',
    ['120000', '5', '80'],
    restored
  );
  // mobile
  await j.viewport(375, 812, true);
  await j.goto(`${BASE}/calculator`);
  await j.waitFor('#calc-mrr');
  check(
    'f3',
    'calculator mobile 375 no horizontal overflow',
    375,
    (await j.overflowX()).scrollWidth
  );
  await j.screenshot(`${EVID}/f3/calculator-mobile.png`);
  const rep1 = j.report();
  check(
    'f3',
    'calculator console errors/exceptions',
    [[], []],
    [rep1.consoleErrors, rep1.exceptions]
  );
  console.log('bad responses calculator:', JSON.stringify(rep1.badResponses));
  await j.close();

  // churn predictor
  const sets = [
    {
      name: 'all best',
      labels: [
        'Less than 2%',
        'Yes, with smart scheduling',
        'Automated multi-step sequence',
        'Yes, with automatic card updater',
        'Yes, with dashboards and alerts',
      ],
      vals: [10, 5, 5, 5, 5],
    },
    {
      name: 'all worst',
      labels: [
        'More than 10%',
        'No retry at all',
        'No dunning at all',
        'No, we wait until payment fails',
        'Not tracked at all',
      ],
      vals: [90, 85, 90, 80, 75],
    },
    {
      name: 'boundary 25',
      labels: [
        'Less than 2%',
        'Manual retries only',
        'Single automated email',
        'Yes, we email before expiry',
        'Yes, with dashboards and alerts',
      ],
      vals: [10, 55, 30, 25, 5],
    },
    {
      name: 'boundary 70',
      labels: [
        'More than 10%',
        'No retry at all',
        'No dunning at all',
        'No, we wait until payment fails',
        'Yes, with dashboards and alerts',
      ],
      vals: [90, 85, 90, 80, 5],
    },
    {
      name: 'high 53',
      labels: [
        '5% - 10%',
        'Manual retries only',
        'Manual emails sometimes',
        'We notify but do not follow up',
        'Occasionally checked',
      ],
      vals: [60, 55, 55, 50, 45],
    },
  ];
  for (const s of sets) {
    const p = await Journey.open(`${BASE}/tools/churn-predictor`);
    for (const l of s.labels) {
      await p.click(`text=${l}`);
      await sleep(350);
    }
    await sleep(500);
    const avg = Math.round(s.vals.reduce((a, b) => a + b, 0) / s.vals.length);
    const level = avg >= 70 ? 'critical' : avg >= 50 ? 'high' : avg >= 25 ? 'medium' : 'low';
    const t = await p.text();
    const score = (t.match(/(\d+)\s*\/\s*100/) || [])[1];
    const six =
      t.match(/(\d+)%[^\n]*\n?[^\n]*6[- ]?[Mm]onth|6[- ]?[Mm]onth[^\n]*\n?[^0-9]*(\d+)%/) || [];
    check('f3', `predictor ${s.name} score`, String(avg), score || null);
    check('f3', `predictor ${s.name} level`, true, new RegExp(level, 'i').test(t));
    check(
      'f3',
      `predictor ${s.name} 6-month churn`,
      String(Math.round(avg * 0.18)),
      six[1] || six[2] || null
    );
    if (s.name === 'all worst')
      await p.screenshot(`${EVID}/f3/predictor-worst.png`, { fullPage: true });
    const r = p.report();
    if (r.consoleErrors.length || r.exceptions.length)
      console.log('predictor errors', JSON.stringify(r));
    await p.close();
  }
  save('f3/prod-calculator-predictor.json');
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
