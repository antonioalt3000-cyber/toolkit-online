const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    const resp = [];
    tab.ws.on("message", (raw) => {
      try { const m = JSON.parse(raw.toString());
        if (m.method === "Network.responseReceived" && m.params.response.url.indexOf('/api/') !== -1)
          resp.push(m.params.response.status + " " + m.params.response.url.replace('https://emailguard.dev',''));
      } catch {}
    });
    await tab.goto("https://emailguard.dev/");
    await tab.waitFor("document.querySelector('#demo-email')", 30000);
    await tab.typeInto("#demo-email", "billing@stripe.com");
    await tab.eval(`(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'Verify'); b.click(); return true; })()`);
    await tab.waitFor("false", 12000);
    const txt = await tab.eval(`(() => { const i = document.body.innerText.indexOf('billing@stripe.com'); const t = document.body.innerText; return t.slice(Math.max(0,i-200), i+400); })()`);
    console.log("RISPOSTE API:", resp);
    console.log("SCHERMO:", txt);
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
