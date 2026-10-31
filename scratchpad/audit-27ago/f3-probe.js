const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://paymentrescue.dev/tools/churn-predictor");
    await tab.waitFor("document.body.innerText.indexOf('payments fail each month') !== -1", 30000);
    await tab.waitFor("(function(){var b=document.querySelector('button');return b&&Object.keys(b).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    const r = await tab.eval(`(function(){
      // dove sta il testo della domanda, e quali bottoni gli stanno sotto
      var h = Array.from(document.querySelectorAll('h1,h2,h3,p,div')).find(function(e){
        return e.children.length === 0 && e.innerText.indexOf('payments fail each month') !== -1;
      });
      var cont = h;
      for (var i = 0; i < 5 && cont; i++) {
        var bs = cont.querySelectorAll('button');
        if (bs.length >= 4) break;
        cont = cont.parentElement;
      }
      return {
        tagDomanda: h ? h.tagName + '.' + String(h.className).slice(0,30) : null,
        contenitore: cont ? cont.tagName + '.' + String(cont.className).slice(0,40) : null,
        bottoniNelContenitore: cont ? Array.from(cont.querySelectorAll('button')).map(function(b){return b.innerText.trim().slice(0,26);}) : [],
        tuttiIBottoni: Array.from(document.querySelectorAll('button')).map(function(b){return b.innerText.trim().slice(0,22);})
      };
    })()`);
    console.log(JSON.stringify(r, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
