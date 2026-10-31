const { openIsolated, sleep } = require('./helpers.cjs');
(async () => {
  for (const [u, t] of [
    ['https://paymentrescue.dev/redeem', 'Confirm & Activate'],
    ['https://parseflow.dev/redeem', 'Activate Enterprise Plan'],
  ]) {
    const j = await openIsolated(u);
    const info =
      await j.eval(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.innerText.includes(${JSON.stringify(t)}));
      if (!b) return null; const cs = getComputedStyle(b); return { disabled: b.disabled, ariaDisabled: b.getAttribute('aria-disabled'), opacity: cs.opacity, color: cs.color, bg: cs.backgroundColor, cls: b.className.slice(0, 200) }; })()`);
    console.log(u, JSON.stringify(info));
    await j.close();
  }
})();
