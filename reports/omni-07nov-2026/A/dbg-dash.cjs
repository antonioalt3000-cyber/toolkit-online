const { openIsolated, sleep, kit, randPw } = require('./lib.cjs');
(async () => {
  const K = kit('f3');
  const j = await openIsolated(`${K.app}/signup`);
  try {
    const email = `antonio.alt3000+qa07-f3-dbg${Date.now().toString(36)}@gmail.com`;
    await sleep(2500);
    const r = await j.eval(
      `fetch('/api/auth/signup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Dbg',email:${JSON.stringify(email)},password:${JSON.stringify(randPw())}})}).then(r=>r.status)`
    );
    console.log('signup', r);
    j.resetLog();
    await j.goto(`${K.app}/dashboard`);
    for (let i = 0; i < 6; i++) {
      await sleep(2500);
      const t = (await j.text()).replace(/\s+/g, ' ');
      console.log(i, t.length, (t.match(/\([^)]*plan\)/) || ['no-match'])[0], '|', t.slice(0, 160));
    }
    console.log(JSON.stringify(j.report()).slice(0, 600));
    console.log(
      'responses:',
      JSON.stringify(
        [...j.responses.values()]
          .filter((x) => /api\//.test(x.url))
          .map((x) => x.status + ' ' + x.url.replace(K.app, ''))
      )
    );
  } finally {
    await j.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
