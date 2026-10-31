const { Journey, sleep } = require('./lib.cjs');
(async () => {
  const j = await Journey.open('https://seoscope.dev/');
  const st = () =>
    j.eval(
      `({cls: document.documentElement.className, body: getComputedStyle(document.body).backgroundColor, btns: [...document.querySelectorAll('button')].map(b => b.getAttribute('aria-label')).filter(Boolean).slice(0,8)})`
    );
  console.log('before', JSON.stringify(await st()));
  await j.eval(
    `[...document.querySelectorAll('button')].find(b => /theme/i.test(b.getAttribute('aria-label')||'')).setAttribute('data-qa-t','1')`
  );
  await j.click('[data-qa-t]');
  await sleep(500);
  console.log('after', JSON.stringify(await st()));
  await j.close();
})();
