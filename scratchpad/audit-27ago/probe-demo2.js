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
    // Via il setter nativo + evento input: e' il modo che React riconosce.
    const set = await tab.eval(`(() => {
      const el = document.querySelector('#demo-email');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, 'billing@stripe.com');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return el.value;
    })()`);
    const btn = await tab.eval(`(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'Verify'); return b ? { disabled: b.disabled, type: b.type, inForm: !!b.closest('form') } : null; })()`);
    await tab.eval(`(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'Verify'); b.click(); return true; })()`);
    const got = await tab.waitFor("document.body.innerText.indexOf('Deliverable') !== -1 || document.body.innerText.indexOf('Risky') !== -1 || document.body.innerText.indexOf('Undeliverable') !== -1 || document.body.innerText.indexOf('blocked') !== -1", 45000);
    const after = await tab.eval(`(() => { const t = document.body.innerText; const i = t.indexOf('TRY IT LIVE'); return t.slice(i, i+500); })()`);
    console.log("valore impostato:", set, "| bottone:", JSON.stringify(btn));
    console.log("verdetto reso:", got);
    console.log("RISPOSTE API:", resp);
    console.log("SCHERMO:", after);
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
