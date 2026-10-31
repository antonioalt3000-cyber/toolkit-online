const { Journey, sleep } = require('./lib.cjs');
(async () => {
  const j = await Journey.open('https://gethooklab.dev/inspect/grtyzimi9i');
  await sleep(2500);
  const state = () =>
    j.eval(
      `[...document.querySelectorAll('button[aria-expanded]')].map((b) => (b.textContent.trim().slice(0,4)) + '=' + b.getAttribute('aria-expanded')).join(' ')`
    );
  console.log('before', await state());
  await j.eval(
    `[...document.querySelectorAll('button[aria-expanded]')].find((x) => x.textContent.trim().startsWith("POST")).setAttribute('data-qa-expand','1')`
  );
  const r = await j.eval(
    `(() => { const b = document.querySelector('[data-qa-expand]'); const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`
  );
  console.log('rect', JSON.stringify(r));
  await j.click('[data-qa-expand]');
  await sleep(150);
  console.log('t+150ms', await state());
  await sleep(4000);
  console.log('t+4s', await state());
  const el = await j.eval(
    `(() => { const b = document.querySelector('[data-qa-expand]'); const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2); return e ? e.tagName + '.' + (e.className||'').toString().slice(0,60) + ' txt=' + (e.textContent||'').slice(0,30) : null; })()`
  );
  console.log('element at click point:', el);
  await j.screenshot('../evidence/hkl/dbg-expand.png');
  await j.close();
  process.exit(0);
})();
