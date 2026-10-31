const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://captureapi.dev/redeem");
    await tab.waitFor("document.querySelector('#redeem-code')", 30000);
    // pagina VERGINE, nessun invio: il mio rilevatore scatta lo stesso?
    const r = await tab.eval("(function(){var t=document.body.innerText;return {gia_matcha:/api key|your key|activated|Success/i.test(t), estratto:(function(){var i=t.search(/api key/i);return i===-1?null:t.substr(i-40,120);})()};})()");
    console.log(JSON.stringify(r, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
