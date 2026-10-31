const { newTab, connect, closeTab } = require("./cdp");
const path = require("path");
const PDF = path.join(__dirname, "fattura-27ago.pdf");
(async () => {
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  try {
    await tab.goto("https://parseflow.dev/playground");
    await tab.waitFor("document.querySelector('input[type=file]')", 30000);
    await tab.send("DOM.enable");
    const { root } = await tab.send("DOM.getDocument");
    const { nodeId } = await tab.send("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
    await tab.send("DOM.setFileInputFiles", { nodeId, files: [PDF] });
    // tipo documento lasciato sul DEFAULT (Auto-detect)
    await tab.eval(`(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'Extract Data'); b.click(); return true; })()`);
    await tab.waitFor("document.body.innerText.indexOf('completed') !== -1", 90000);
    // Read the result PANEL, not the whole document: the page contains other
    // braces (the placeholder comment, code samples), so slicing the body from
    // the first '{' to the last '}' produced something that was not JSON.
    const json = await tab.eval(`(() => {
      const pres = Array.from(document.querySelectorAll('pre,code'));
      for (const el of pres) {
        const s = el.innerText.trim();
        if (s.charAt(0) === '{' && s.indexOf('documentType') !== -1) return s;
      }
      return null;
    })()`);
    if (!json) { console.error('NESSUN JSON NEL PANNELLO. Testo:'); console.error(await tab.eval("(() => { const t = document.body.innerText; const i = t.indexOf('Extraction Result'); return i === -1 ? t.slice(0,400) : t.slice(i, i+700); })()")); process.exit(2); }
    const d = JSON.parse(json);
    console.log(JSON.stringify({
      documentType: d.documentType,
      invoiceNumber: d.data.invoiceNumber,
      subtotal: d.data.subtotal,
      taxAmount: d.data.taxAmount,
      taxRate: d.data.taxRate,
      total: d.data.total,
      currency: d.data.currency,
      currencyDetected: d.data.currencyDetected,
      invariante_sub_piu_iva_uguale_totale: d.data.subtotal + d.data.taxAmount === d.data.total,
      confidence: d.confidence
    }, null, 1));
    await tab.screenshot(__dirname + "/f4-verificato.png");
  } finally { tab.close(); await closeTab(t.id); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
