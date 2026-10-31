const { openIsolated, setVal, sleep } = require('./helpers.cjs');
(async () => {
  const cases = [
    [
      'https://paymentrescue.dev/redeem',
      'Confirm & Activate',
      [
        ['#redeem-email', 'qa@example.org'],
        ['#redeem-code', 'PRE-ABCD-1234'],
      ],
      '#redeem-confirm',
    ],
    [
      'https://parseflow.dev/redeem',
      'Activate Enterprise Plan',
      [
        ['#redeem-email', 'qa@example.org'],
        ['#redeem-code', 'PFL-ABCD-1234'],
      ],
      null,
    ],
  ];
  for (const [u, t, fields, confirm] of cases) {
    const j = await openIsolated(u);
    for (const [sel, v] of fields) {
      try {
        await setVal(j, sel, v);
      } catch (e) {
        console.log('field', sel, e.message);
      }
    }
    if (confirm) await j.click(confirm).catch((e) => console.log('confirm', e.message));
    await sleep(400);
    const sel = await j.eval(
      `(() => { const b = [...document.querySelectorAll('button')].find(b => b.innerText.includes(${JSON.stringify(t)})); if (!b) return null; b.id = b.id || 'qa-cta'; return '#' + b.id + (b.disabled ? ':disabled' : ''); })()`
    );
    console.log(
      u,
      'button:',
      sel,
      JSON.stringify(sel && !sel.endsWith(':disabled') ? await j.contrast(sel) : 'still disabled')
    );
    await j.close();
  }
})();
