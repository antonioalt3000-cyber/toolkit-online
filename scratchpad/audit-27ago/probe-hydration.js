const { newCleanTab, disposeContext, connect, newTab, closeTab } = require("./cdp");
async function check(makeTab, label) {
  const h = await makeTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://emailguard.dev/");
    await tab.waitFor("document.querySelector('#demo-email')", 30000);
    // fiber React su un nodo reale = idratazione avvenuta
    const r = await tab.eval(`(() => {
      const el = document.querySelector('#demo-email');
      const keys = Object.keys(el);
      const fiber = keys.filter(function(k){ return k.indexOf('__reactFiber') === 0 || k.indexOf('__reactProps') === 0; });
      // prova di reattivita': il toggle tema deve cambiare l'attributo su <html>
      const before = document.documentElement.className + '|' + (document.documentElement.getAttribute('data-theme') || '');
      const btns = Array.from(document.querySelectorAll('button'));
      const themeBtn = btns.find(function(b){ var t=b.innerText.trim(); return t==='Light'||t==='Dark'||t==='Auto'; });
      if (themeBtn) themeBtn.click();
      const after = document.documentElement.className + '|' + (document.documentElement.getAttribute('data-theme') || '');
      return { fiberKeys: fiber, hasFiber: fiber.length > 0, themeButton: !!themeBtn, before: before, after: after, changed: before !== after };
    })()`);
    console.log(label, JSON.stringify(r));
  } finally { tab.close(); if (h.browserContextId) await disposeContext(h); else await closeTab(h.id); }
}
(async () => {
  await check(newCleanTab, "CONTESTO PULITO:");
  await check(newTab, "PROFILO NORMALE:");
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
