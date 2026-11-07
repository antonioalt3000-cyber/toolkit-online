const { openIsolated, sleep } = require('./lib.cjs');
(async () => {
  const j = await openIsolated('about:blank');
  await j.send('Page.navigate', { url: process.argv[2] });
  const t0 = Date.now();
  for (let i = 0; i < 14; i++) {
    await sleep(3000);
    const s = await j
      .eval(
        "JSON.stringify({rs:document.readyState,body:!!document.body,inputs:document.querySelectorAll('input').length,react:(()=>{const f=document.querySelector('form');return f?Object.keys(f).some(k=>k.startsWith('__reactProps')):null})()})"
      )
      .catch((e) => 'ERR ' + e.message.slice(0, 80));
    console.log(((Date.now() - t0) / 1000).toFixed(0) + 's', s, 'inflight', j.inflight.size);
    if (/"react":true/.test(s)) break;
  }
  console.log(JSON.stringify(j.report()).slice(0, 800));
  await j.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
