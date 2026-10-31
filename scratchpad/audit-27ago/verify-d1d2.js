const { newTab, connect, closeTab } = require("./cdp");
const path = require("path");
async function upload(tab, file) {
  await tab.goto("https://parseflow.dev/playground");
  await tab.waitFor("document.querySelector('input[type=file]')", 30000);
  await tab.waitFor("(function(){var e=document.querySelector('input[type=file]');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
  await tab.send("DOM.enable");
  const { root } = await tab.send("DOM.getDocument");
  const { nodeId } = await tab.send("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
  await tab.send("DOM.setFileInputFiles", { nodeId, files: [path.join(__dirname, file)] });
  await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Extract Data';});b.click();return true;})()");
  await tab.waitFor("document.body.innerText.indexOf('completed') !== -1", 90000);
  const json = await tab.eval("(function(){var pres=Array.from(document.querySelectorAll('pre,code'));for(var i=0;i<pres.length;i++){var s=pres[i].innerText.trim();if(s.charAt(0)==='{'&&s.indexOf('documentType')!==-1)return s;}return null;})()");
  return JSON.parse(json);
}
(async () => {
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  try {
    const REF = "9".repeat(60);
    const d1 = await upload(tab, "d1-rawtext.pdf");
    console.log(JSON.stringify({
      prova: "D1 — rawText deve tornare INTATTO",
      documentType: d1.documentType,
      rawTextContieneRiferimentoIntero: (d1.data.rawText || "").indexOf(REF) !== -1,
      cifreConsecutiveMax: Math.max.apply(null, ((d1.data.rawText||"").match(/[0-9]+/g) || ["0"]).map(function(x){return x.length;})),
    }, null, 1));
    const d2 = await upload(tab, "d2-receipt.pdf");
    console.log(JSON.stringify({
      prova: "D2 — scontrino ristorante deve essere 'receipt'",
      documentType: d2.documentType,
      tipoDati: d2.data.type,
      merchant: d2.data.merchantName || null,
      totale: d2.data.total !== undefined ? d2.data.total : null,
      confidenza: d2.confidence,
    }, null, 1));
    await tab.screenshot(__dirname + "/d1d2-verifica.png");
  } finally { tab.close(); await closeTab(t.id); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
