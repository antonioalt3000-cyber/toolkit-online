const { newTab, connect, closeTab } = require("./cdp");
const path = require("path");
const PDF = path.join(__dirname, "fattura-27ago.pdf");
(async () => {
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  try {
    const reqs = [];
    tab.ws.on("message", (raw) => {
      try { const m = JSON.parse(raw.toString());
        if (m.method === "Network.requestWillBeSent" && m.params.request.url.indexOf('/api/') !== -1)
          reqs.push(m.params.request.method + " " + m.params.request.url);
      } catch {}
    });
    await tab.goto("https://parseflow.dev/playground");
    await tab.waitFor("document.querySelector('input[type=file]')", 30000);
    await tab.send("DOM.enable");
    const { root } = await tab.send("DOM.getDocument");
    const { nodeId } = await tab.send("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
    await tab.send("DOM.setFileInputFiles", { nodeId, files: [PDF] });

    const st = await tab.eval(`(() => {
      const bs = Array.from(document.querySelectorAll('button'));
      const b = bs.find(x => x.innerText.trim() === 'Extract Data');
      if (!b) return { found:false, all: bs.map(x=>x.innerText.trim()).slice(0,20) };
      const r = b.getBoundingClientRect();
      return { found:true, disabled: b.disabled, rect: {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
               topElementAtCenter: (function(){ const e = document.elementFromPoint(r.x+r.width/2, r.y+r.height/2); return e ? e.tagName + '.' + String(e.className).slice(0,40) : null; })() };
    })()`);
    console.log("BOTTONE:", JSON.stringify(st));

    // click nativo dell'elemento, non per coordinate
    await tab.eval(`(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'Extract Data'); b.click(); return true; })()`);
    const done = await tab.waitFor("document.body.innerText.indexOf('22500') !== -1 || document.body.innerText.indexOf('INV-2026-0913') !== -1 || document.body.innerText.toLowerCase().indexOf('failed') !== -1", 60000);
    const panel = await tab.eval(`(() => { const t = document.body.innerText; const i = t.indexOf('Extraction Result'); return i === -1 ? null : t.slice(i, i+600); })()`);
    console.log("DOPO CLICK nativo, done=", done);
    console.log("PANNELLO:", panel);
    console.log("RICHIESTE API:", reqs);
  } finally { tab.close(); await closeTab(t.id); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
