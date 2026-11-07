const { openIsolated, sleep } = require('./lib.cjs');
(async () => {
  const j = await openIsolated('about:blank');
  j.listeners.push((m, p) => {
    if (/loadingFailed|Page.frameNavigated|responseReceived/.test(m))
      console.log(m, JSON.stringify(p).slice(0, 300));
  });
  await j.send('Page.navigate', { url: process.argv[2] });
  await sleep(6000);
  console.log(
    'href:',
    await j.eval('location.href'),
    'ready:',
    await j.eval('document.readyState')
  );
  console.log('html:', (await j.eval('document.documentElement.outerHTML')).slice(0, 400));
  await j.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
