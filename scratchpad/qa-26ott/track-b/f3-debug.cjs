const { openIsolated, sleep, setVal } = require('./helpers.cjs');
(async () => {
  const j = await openIsolated('http://localhost:3203/signup');
  const reqs = [];
  j.listeners.push((m, p) => {
    if (
      m === 'Network.requestWillBeSent' &&
      !/_next\/static|webpack|hot-update|__nextjs/.test(p.request.url)
    )
      reqs.push(p.request.method + ' ' + p.request.url.slice(0, 100));
  });
  for (let i = 0; i < 20; i++) {
    const h = await j.eval(
      `(() => { const b = document.querySelector('button[type=submit]'); return b ? Object.keys(b).some(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps')) : 'nobtn'; })()`
    );
    if (h === true) {
      console.log('hydrated after', i, 's');
      break;
    }
    await sleep(1000);
    if (i === 19) console.log('NOT hydrated after 20s:', h);
  }
  await setVal(j, '#signup-name', 'Rescue QA Ltd');
  await setVal(j, '#signup-email', 'antonio.alt3000+qa26-f3-dbg@gmail.com');
  await setVal(j, '#signup-password', 'Qa26!debugPassw0rd');
  console.log(
    'values:',
    await j.eval(
      `['#signup-name','#signup-email','#signup-password'].map(s => document.querySelector(s).value.length)`
    )
  );
  console.log(
    'btn:',
    await j.eval(
      `(() => { const b = document.querySelector('button[type=submit]'); return { disabled: b.disabled, text: b.innerText }; })()`
    )
  );
  await sleep(2500);
  await j.click('button[type="submit"]');
  await sleep(5000);
  console.log('requests after click:', JSON.stringify(reqs.slice(-6)));
  console.log(
    'path:',
    await j.eval('location.pathname'),
    '| alerts:',
    await j.eval(`[...document.querySelectorAll('[role=alert]')].map(e => e.innerText).join(' | ')`)
  );
  console.log(JSON.stringify(j.report()));
  await j.close();
})();
