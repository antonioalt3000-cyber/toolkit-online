const { Journey } = require('../../qa-infra/cdp-journey.cjs');
(async () => {
  const j = await Journey.open(
    'http://localhost:3303/calculator?mrr=80000&churn=15&txn=200&recovery=38'
  );
  await j.waitFor('js:document.body.innerText.includes("ROI")');
  const vals = await j.eval(`(() => {
    const inputs = [...document.querySelectorAll('input[type=number]')];
    return inputs.map(i => ({ min: i.min, max: i.max, value: i.value }));
  })()`);
  console.log('number inputs on load:', JSON.stringify(vals));
  await j.screenshot(
    'C:/Users/ftass/toolkit-online/scratchpad/qa-26ott/evidence/f3/local-calculator-shared-link.png'
  );
  console.log('report', JSON.stringify(j.report()));
  await j.close();
})();
