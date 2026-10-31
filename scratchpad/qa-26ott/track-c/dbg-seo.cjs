const { Journey, sleep, Recorder } = require('./lib.cjs');
(async () => {
  const j = await Journey.open('https://seoscope.dev/seo-audit');
  await j.type('#audit-demo-url', 'https://www.w3.org/WAI/demos/bad/before/home.html');
  const p = j.waitForResponse('/api/demo', 60000);
  await j.click('form:has(#audit-demo-url) button[type="submit"]');
  const r = await p;
  const d = JSON.parse(r.body.toString());
  require('fs').writeFileSync('../evidence/seo/w3c-bad-response.json', JSON.stringify(d, null, 2));
  console.log(Object.keys(d));
  for (const c of d.checks) console.log(c.id, c.status, JSON.stringify(c).slice(0, 160));
  await j.close();
})();
