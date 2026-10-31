const { newTab, connect, closeTab } = require("./cdp");
(async () => {
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  try {
    await tab.goto("https://complipilot.dev/scan");
    await tab.waitFor("document.body.innerText.length > 400", 20000);
    const r = await tab.eval(`(async () => {
      const res = await fetch('/api/plan', { credentials: 'include' });
      let body = null; try { body = await res.json(); } catch(e) {}
      return { status: res.status, body: body, cookies: document.cookie ? document.cookie.split(';').map(c=>c.trim().split('=')[0]) : [] };
    })()`);
    console.log(JSON.stringify(r, null, 1));
  } finally { tab.close(); await closeTab(t.id); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
