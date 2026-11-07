const { openIsolated, sleep } = require('./lib.cjs');
(async () => {
  const j = await openIsolated('about:blank');
  let n = 0;
  j.listeners.push((m, p) => {
    if (m === 'Network.webSocketCreated') console.log('WS created', p.url);
    if (m === 'Network.webSocketFrameReceived' && n++ < 25)
      console.log('WS<-', String(p.response.payloadData).slice(0, 220));
    if (m === 'Network.webSocketClosed') console.log('WS closed');
    if (m === 'Page.frameNavigated') console.log('NAV', p.frame.url);
    if (m === 'Page.frameStartedLoading') console.log('startedLoading');
  });
  await j.send('Page.navigate', { url: process.argv[2] });
  await sleep(9000);
  await j.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
