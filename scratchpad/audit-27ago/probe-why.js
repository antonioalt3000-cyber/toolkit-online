const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    const all = [];
    const net = [];
    tab.ws.on("message", (raw) => {
      try { const m = JSON.parse(raw.toString());
        if (m.method === "Runtime.consoleAPICalled") all.push("console." + m.params.type + ": " + (m.params.args||[]).map(a=>a.value ?? a.description ?? "").join(" ").slice(0,200));
        if (m.method === "Runtime.exceptionThrown") all.push("EXCEPTION: " + ((m.params.exceptionDetails||{}).exception||{}).description);
        if (m.method === "Log.entryAdded") all.push("LOG[" + m.params.entry.source + "/" + m.params.entry.level + "]: " + String(m.params.entry.text).slice(0,220));
        if (m.method === "Network.responseReceived" && m.params.response.url.indexOf('/_next/static/') !== -1) net.push(m.params.response.status + " " + m.params.response.url.split('/').pop());
        if (m.method === "Network.loadingFailed") all.push("LOADFAIL: " + m.params.errorText + " " + (m.params.blockedReason||""));
      } catch {}
    });
    await tab.send("Log.enable");
    await tab.goto("https://emailguard.dev/");
    await tab.waitFor("document.querySelector('#demo-email')", 30000);
    await tab.waitFor("false", 6000);
    console.log("=== CONSOLE / LOG ==="); all.slice(0,14).forEach(l => console.log(" -", l));
    console.log("=== CHUNK JS ==="); console.log(net.slice(0,10).join("\n") || "(nessuno)");
    const scripts = await tab.eval(`(() => Array.from(document.querySelectorAll('script[src]')).map(function(s){ return {src: s.src.split('/').pop(), nonce: s.nonce || s.getAttribute('nonce') || ''}; }).slice(0,8))()`);
    console.log("=== SCRIPT NEL DOM ==="); console.log(JSON.stringify(scripts));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
