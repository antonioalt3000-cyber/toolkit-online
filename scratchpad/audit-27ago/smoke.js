const { newTab, connect, closeTab } = require("./cdp");
(async () => {
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  try {
    await tab.goto("https://complipilot.dev/");
    const ok = await tab.waitFor("document.querySelector('h1') && document.querySelector('h1').innerText.length > 3", 25000);
    const h1 = await tab.eval("document.querySelector('h1') ? document.querySelector('h1').innerText : null");
    const react = await tab.eval("!!document.querySelector('#__next, [data-reactroot], body > div')");
    const theme = await tab.eval("getComputedStyle(document.body).backgroundColor");
    console.log(JSON.stringify({ contentReady: ok, h1: String(h1).slice(0,80), reactMounted: react, bg: theme, consoleErrors: tab.consoleErrors.length, failedReq: tab.failedRequests.slice(0,3) }, null, 1));
  } finally {
    tab.close(); await closeTab(t.id);
  }
})().catch(e => { console.error("SMOKE FAIL:", e.message); process.exit(1); });
