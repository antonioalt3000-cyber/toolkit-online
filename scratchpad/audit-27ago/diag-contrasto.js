const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    for (const [fg, bg, rapporto] of [["#000000","#FFFFFF","21:1"], ["#777777","#FFFFFF","4.48:1"], ["#BBBBBB","#FFFFFF","1.85:1"]]) {
      await tab.goto("https://fixmyweb.dev/tools/contrast-checker");
      await tab.waitFor("document.querySelector('#fg-color')", 30000);
      await tab.waitFor(idr("#fg-color"), 40000, 400);
      await tab.eval(`(function(){
        var t=Array.from(document.querySelectorAll('input[type=text]'));
        var S=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
        S.call(t[0], ${JSON.stringify(fg)}); t[0].dispatchEvent(new Event('input',{bubbles:true}));
        S.call(t[1], ${JSON.stringify(bg)}); t[1].dispatchEvent(new Event('input',{bubbles:true}));
        return true;
      })()`);
      await tab.waitFor("false", 1500);
      // leggo i VERDETTI riga per riga, non cerco stringhe sparse
      const v = await tab.eval(`(function(){
        var t = document.body.innerText.split(String.fromCharCode(10)).map(function(x){return x.trim();}).filter(Boolean);
        var out = [];
        for (var i=0;i<t.length;i++){
          var r = t[i];
          if (r.indexOf('AA') !== -1 || r.indexOf('Pass') !== -1 || r.indexOf('Fail') !== -1) {
            out.push(r.slice(0,70) + ' >> ' + (t[i+1]||'').slice(0,26));
          }
        }
        return out.slice(0,10);
      })()`);
      console.log("\n" + fg + " su " + bg + " (atteso " + rapporto + "):");
      v.forEach(function(x){ console.log("   " + x); });
    }
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
