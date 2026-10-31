const { Journey, sleep, setVal } = require('./helpers.cjs');
const T = (p, ms, label) =>
  Promise.race([
    p.then((v) => {
      console.log(label, 'ok', JSON.stringify(v)?.slice(0, 200));
      return v;
    }),
    sleep(ms).then(() => {
      console.log(label, 'TIMEOUT');
      process.exit(2);
    }),
  ]);
(async () => {
  const t0 = Date.now();
  const j = await T(Journey.open('https://paymentrescue.dev/calculator'), 60000, 'open');
  console.log('t', Date.now() - t0);
  await T(j.waitFor('#calc-mrr'), 20000, 'waitFor');
  await T(
    j.eval(
      `(() => { const h = [...document.querySelectorAll('h2')].find(e => e.textContent.trim() === 'Your Results'); return h ? h.parentElement.innerText.slice(0, 300) : 'NO H2'; })()`
    ),
    5000,
    'results'
  );
  await T(j.locate('#calc-mrr'), 5000, 'locate');
  await T(setVal(j, '#calc-mrr', 120000), 15000, 'setVal');
  await T(j.eval(`document.querySelector('#calc-mrr').value`), 5000, 'value');
  await j.close();
})();
