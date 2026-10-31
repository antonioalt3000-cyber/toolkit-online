const { newTab, connect, closeTab } = require("./cdp");
(async () => {
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  try {
    await tab.goto("https://complipilot.dev/scan");
    await tab.waitFor("document.body.innerText.length > 400", 20000);
    // No regex inside the injected expression: escapes there have bitten before.
    const r = await tab.eval(`(() => {
      const keys = Object.keys(localStorage);
      const dump = {};
      for (const k of keys) { dump[k] = String(localStorage.getItem(k)).slice(0, 240); }
      const txt = document.body.innerText;
      return {
        localStorageKeys: keys,
        dump: dump,
        bannerSaysUnlimited: txt.indexOf('Unlimited scans') !== -1,
        hasGuestPlanLine: txt.indexOf('Guest plan') !== -1,
        sessionKeys: Object.keys(sessionStorage)
      };
    })()`);
    console.log(JSON.stringify(r, null, 1));
  } finally { tab.close(); await closeTab(t.id); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
