// Flusso A (7 nov 2026): thin layer over the qa-infra harness. Evidence goes to reports/omni-07nov-2026/evidence/<slug>/.
'use strict';
const path = require('path');
const fs = require('fs');
const TB = path.resolve(__dirname, '..', '..', '..', 'scratchpad', 'qa-26ott', 'track-b');
const INFRA = path.resolve(__dirname, '..', '..', '..', 'scratchpad', 'qa-infra');
const H = require(path.join(TB, 'helpers.cjs'));
const { kit, req, randPw } = require(path.join(TB, 'local-kit.cjs'));
const EVID = path.resolve(__dirname, '..', 'evidence');
const results = [];
function check(saas, step, expected, observed, note = '') {
  const ok = JSON.stringify(expected) === JSON.stringify(observed);
  results.push({ saas, step, expected, observed, ok, note });
  console.log(
    `${ok ? 'PASS' : 'FAIL'} [${saas}] ${step} | expected=${JSON.stringify(expected)} observed=${JSON.stringify(observed)}`
  );
  return ok;
}
function save(name) {
  const f = path.join(EVID, name);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(results, null, 2));
  const fails = results.filter((r) => !r.ok).length;
  console.log(`== ${results.length} checks, ${fails} FAIL -> ${f}`);
  return fails;
}
module.exports = { ...H, EVID, INFRA, kit, req, randPw, check, save, results };
