const { Journey, sleep, setVal } = require('./helpers.cjs');
(async () => {
  const j = await Journey.open('https://captureapi.dev/playground');
  await setVal(j, '#pg-url', 'https://www.w3.org/WAI/demos/bad/before/home.html');
  const pos = await j.locate('button[type=submit]');
  const hit = await j.eval(
    `(() => { const e = document.elementFromPoint(${pos.x}, ${pos.y}); return e ? e.outerHTML.slice(0, 160) : null; })()`
  );
  console.log('pos', JSON.stringify(pos), 'hit:', hit);
  const count = await j.eval(`document.querySelectorAll('button[type=submit]').length`);
  console.log(
    'submit buttons:',
    count,
    await j.eval(
      `[...document.querySelectorAll('button[type=submit]')].map(b => b.innerText.trim()).join(' | ')`
    )
  );
  await j.screenshot('../evidence/b7/debug-playground.png');
  const h = await Journey.open('https://www.w3.org/WAI/demos/bad/before/home.html', {
    width: 1280,
    height: 800,
  });
  console.log(
    'w3c page scrollHeight at 1280:',
    await h.eval('document.documentElement.scrollHeight')
  );
  await h.close();
  await j.close();
})();
