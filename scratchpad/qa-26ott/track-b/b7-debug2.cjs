const { Journey, sleep, setVal } = require('./helpers.cjs');
(async () => {
  const j = await Journey.open('https://captureapi.dev/playground', { width: 1366, height: 1400 });
  const reqs = [];
  j.listeners.push((m, p) => {
    if (m === 'Network.requestWillBeSent' && /\/api\//.test(p.request.url))
      reqs.push(p.request.method + ' ' + p.request.url.slice(0, 160));
  });
  await setVal(j, '#pg-url', 'https://paymentrescue.dev/calculator');
  console.log('url value:', await j.eval("document.querySelector('#pg-url').value"));
  const pos = await j.locate('button[type=submit]');
  console.log(
    'button pos',
    JSON.stringify(pos),
    'hit:',
    await j.eval(
      `(() => { const e = document.elementFromPoint(${pos.x}, ${pos.y}); return e ? e.tagName + ' ' + (e.innerText||'').slice(0,40) : null; })()`
    )
  );
  await j.click('button[type=submit]');
  await sleep(15000);
  console.log('api requests:', JSON.stringify(reqs, null, 1));
  console.log('form text tail:', (await j.text('form')).slice(-500));
  console.log(
    'validity:',
    await j.eval(
      `[...document.querySelectorAll('form input')].filter(i => !i.checkValidity()).map(i => i.id + ':' + i.validationMessage)`
    )
  );
  await j.screenshot('../evidence/b7/debug-playground2.png');
  console.log(JSON.stringify(j.report()));
  await j.close();
})();
