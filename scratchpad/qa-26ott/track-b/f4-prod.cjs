// ParseFlow production playground + batch: real PDF uploads vs invoice oracle (totals generated independently).
const { Journey, sleep, O, EVID, check, save } = require('./helpers.cjs');
const path = require('path');
const fs = require('fs');
const BASE = 'https://parseflow.dev';
const dir = path.join(EVID, 'f4');
const oracle = JSON.parse(fs.readFileSync(path.join(dir, 'invoice-oracle.json'), 'utf8'));
const files = [
  ['a', 'invoice-a-us.pdf'],
  ['b', 'invoice-b-eu.pdf'],
  ['fixture', 'modern-xref-invoice.pdf'],
];

function pickFields(data) {
  const d = data && (data.data || data);
  return {
    invoiceNumber: d?.invoiceNumber ?? null,
    subtotal: d?.subtotal ?? null,
    taxAmount: d?.taxAmount ?? null,
    total: d?.total ?? null,
    taxRate: d?.taxRate ?? null,
    currency: d?.currency ?? null,
  };
}
(async () => {
  for (const [key, file] of files) {
    const j = await Journey.open(`${BASE}/playground`);
    await j.waitFor('input[type="file"]', { visible: false });
    await j.upload('input[type="file"]', [path.join(dir, file)]);
    await sleep(300);
    // the customer picks "Invoice" in the select
    await j.eval(
      `(() => { const s = document.querySelector('#doc-type'); const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; set.call(s, 'invoice'); s.dispatchEvent(new Event('change', { bubbles: true })); })()`
    );
    const respP = j.waitForResponse('/api/v1/demo', 30000);
    await j.click('button[aria-label="Extract data from the selected document"]');
    const resp = await respP.catch((e) => ({ status: 'NO-RESPONSE ' + e.message, body: null }));
    await sleep(800);
    const uiJson = await j.eval(
      `(() => { const c = document.querySelector('pre code'); return c ? c.textContent : null; })()`
    );
    const errText = await j.eval(
      `(() => { const e = [...document.querySelectorAll('[role=alert], .text-red-400, .text-red-300')].map(n => n.innerText).filter(Boolean); return e.join(' | ') || null; })()`
    );
    let ui = null;
    try {
      ui = JSON.parse(uiJson);
    } catch {}
    let api = null;
    try {
      api = JSON.parse(String(resp.body));
    } catch {}
    fs.writeFileSync(
      path.join(dir, `prod-playground-${key}.json`),
      JSON.stringify({ status: resp.status, api, uiError: errText }, null, 2)
    );
    const exp = oracle[key];
    const got = pickFields(ui);
    console.log(`[${key}] HTTP ${resp.status} uiError=${errText} fields=${JSON.stringify(got)}`);
    check('f4', `playground ${file}: HTTP status`, 200, resp.status);
    check(
      'f4',
      `playground ${file}: UI JSON == API JSON`,
      true,
      JSON.stringify(ui) === JSON.stringify(api)
    );
    for (const k of Object.keys(exp)) check('f4', `playground ${file}: ${k}`, exp[k], got[k]);
    await j.screenshot(path.join(dir, `prod-playground-${key}.png`), { fullPage: true });
    const r = j.report();
    check(
      'f4',
      `playground ${file}: console errors/exceptions`,
      [[], []],
      [r.consoleErrors, r.exceptions]
    );
    await j.close();
    await sleep(22000); // demo limit 3/min per IP
  }
  save('f4/prod-playground.json');
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
