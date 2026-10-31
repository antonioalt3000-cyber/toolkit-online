const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://fixmyweb.dev/bulk");
    await tab.waitFor("document.querySelector('#bulk-urls')", 30000);
    await tab.waitFor(idr("#bulk-urls"), 40000, 400);
    const righe = [];
    for (let i = 0; i < 25; i++) righe.push("https://sito-" + i + ".example");
    await tab.eval(`(function(){
      var S=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
      var e=document.getElementById('bulk-urls');
      S.call(e, ${JSON.stringify(righe.join("\n"))});
      e.dispatchEvent(new Event('input',{bubbles:true}));
      return true;
    })()`);
    await new Promise(r => setTimeout(r, 900));
    const testo = await tab.eval("(function(){var n=document.querySelector('[role=status]');return n?n.textContent:null;})()");
    console.log("AVVISO ESATTO:", JSON.stringify(testo));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
