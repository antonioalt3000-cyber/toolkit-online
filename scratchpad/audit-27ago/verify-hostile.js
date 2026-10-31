const { newTab, connect, closeTab } = require("./cdp");
const path = require("path");
const PDF = path.join(__dirname, "hostile-zt.pdf");
(async () => {
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  try {
    await tab.goto("https://parseflow.dev/playground");
    await tab.waitFor("document.querySelector('input[type=file]')", 30000);
    await tab.waitFor("(function(){var e=document.querySelector('input[type=file]');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.send("DOM.enable");
    const { root } = await tab.send("DOM.getDocument");
    const { nodeId } = await tab.send("DOM.querySelector", { nodeId: root.nodeId, selector: "input[type=file]" });
    await tab.send("DOM.setFileInputFiles", { nodeId, files: [PDF] });
    const t0 = Date.now();
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Extract Data';});b.click();return true;})()");
    const done = await tab.waitFor("document.body.innerText.indexOf('completed') !== -1 || document.body.innerText.toLowerCase().indexOf('failed') !== -1 || document.body.innerText.toLowerCase().indexOf('too large') !== -1", 120000);
    const ms = Date.now() - t0;
    const panel = await tab.eval("(function(){var pres=Array.from(document.querySelectorAll('pre,code'));for(var i=0;i<pres.length;i++){var s=pres[i].innerText.trim();if(s.charAt(0)==='{'&&s.indexOf('documentType')!==-1)return s.substr(0,420);}return null;})()");
    console.log(JSON.stringify({ rispostaEntro: done, millisecondi: ms, pannello: panel ? panel.replace(/\s+/g," ").slice(0,300) : "(nessun JSON)" }, null, 1));
  } finally { tab.close(); await closeTab(t.id); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
