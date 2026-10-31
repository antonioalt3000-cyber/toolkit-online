const { Journey, sleep } = require('./helpers.cjs');
const withTimeout = (p, ms, label) =>
  Promise.race([p.then(() => `${label}: ok`), sleep(ms).then(() => `${label}: TIMEOUT ${ms}ms`)]);
(async () => {
  const j = await Journey.open('https://paymentrescue.dev/calculator');
  console.log('opened');
  console.log(await withTimeout(j.eval('1+1'), 5000, 'eval'));
  console.log(
    await withTimeout(
      j.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 100, y: 100 }),
      8000,
      'mouseMoved (background)'
    )
  );
  console.log(
    await withTimeout(j.send('Input.insertText', { text: '' }), 5000, 'insertText (background)')
  );
  const wid = await j
    .send('Browser.getWindowForTarget', { targetId: j.target.id })
    .catch((e) => ({ err: e.message }));
  console.log('window', JSON.stringify(wid));
  await j.close();
  // new window variant
  const t = await j.send.call({ send: null }, 'x').catch(() => null);
  process.exit(0);
})();
