const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  for (const [label, url, sel] of [
    ["EmailGuard", "https://emailguard.dev/", "#demo-email"],
    ["HeaderShield", "https://headershield.dev/", "#header-demo-url"],
    ["SEOScope", "https://seoscope.dev/", "#audit-demo-url"],
  ]) {
    const h = await newCleanTab("about:blank");
    const tab = await connect(h.id);
    try {
      const t0 = Date.now();
      await tab.goto(url);
      await tab.waitFor(`document.querySelector('${sel}')`, 30000);
      const appeared = await tab.waitFor(
        `(function(){ var el = document.querySelector('${sel}'); return el && Object.keys(el).some(function(k){ return k.indexOf('__reactFiber') === 0; }); })()`,
        40000, 500);
      const ms = Date.now() - t0;
      const state = await tab.eval(`(() => {
        const el = document.querySelector('${sel}');
        return { keys: Object.keys(el).slice(0,4), hasNext: typeof window.next !== 'undefined' };
      })()`);
      console.log(label, "idratato=", appeared, "dopo", ms, "ms |", JSON.stringify(state));
    } finally { tab.close(); await disposeContext(h); }
  }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
