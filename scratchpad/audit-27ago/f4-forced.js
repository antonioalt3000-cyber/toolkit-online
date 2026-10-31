const { newTab, connect, closeTab } = require("./cdp");
const path = require("path");
const PDF = path.join(__dirname, "fattura-27ago.pdf");
async function run(tab, docType) {
  await tab.goto("https://parseflow.dev/playground");
  await tab.waitFor("document.querySelector('input[type=file]')", 30000);
  await tab.send("DOM.enable");
  const { root } = await tab.send("DOM.getDocument");
  const { nodeId } = await tab.send("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
  await tab.send("DOM.setFileInputFiles", { nodeId, files: [PDF] });
  if (docType) {
    await tab.eval(`(() => {
      const s = document.querySelector('#doc-type') || document.querySelector('select');
      const opt = Array.from(s.options).find(o => o.text.trim().toLowerCase() === ${JSON.stringify(docType.toLowerCase())});
      s.value = opt.value;
      s.dispatchEvent(new Event('change', { bubbles: true }));
      return s.value;
    })()`);
  }
  await tab.eval(`(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'Extract Data'); b.click(); return true; })()`);
  await tab.waitFor("document.body.innerText.indexOf('\"status\"') !== -1 && document.body.innerText.indexOf('completed') !== -1", 90000);
  return tab.eval(`(() => { const t = document.body.innerText; const i = t.indexOf('{'); const j = t.lastIndexOf('}'); return i === -1 ? null : t.slice(i, j+1); })()`);
}
(async () => {
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  try {
    const forced = await run(tab, "Invoice");
    console.log("=== documentType FORZATO A INVOICE ===");
    console.log(forced ? forced.slice(0, 1800) : "(nessun JSON)");
  } finally { tab.close(); await closeTab(t.id); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
