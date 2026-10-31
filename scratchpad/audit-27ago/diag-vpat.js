const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://fixmyweb.dev/vpat");
    await tab.waitFor("document.querySelector('#product-name')", 30000);
    await tab.waitFor(idr("#product-name"), 40000, 400);
    const quanti = await tab.eval("({ select: document.querySelectorAll('select').length, note: document.querySelectorAll('input[type=text]').length })");
    await tab.eval(`(function(){
      var S=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      function f(id,v){var e=document.getElementById(id);S.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));}
      f('product-name','Contoso Portal'); f('product-version','4.2.0');
      f('report-date','2026-08-30'); f('company-name','Contoso Nordic AB');
      var s=document.querySelector('select[aria-label*="1.1.1"]'); if(s){ s.value='Supports'; s.dispatchEvent(new Event('change',{bubbles:true})); }
      return true;
    })()`);
    await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Generate VPAT';});b.click();return true;})()`);
    await tab.waitFor("Array.from(document.querySelectorAll('pre')).some(function(p){return p.innerText.indexOf('DOCTYPE')!==-1;})", 30000);
    const r = await tab.eval(`(function(){
      var p = Array.from(document.querySelectorAll('pre')).find(function(x){return x.innerText.indexOf('DOCTYPE')!==-1;});
      var dInner = p.innerText;
      var d = p.textContent || dInner;
      var righe = (d.match(/<tr>/g) || []).length;
      var crit = (d.match(/\b[1-4]\.[0-9]+\.[0-9]+\b/g) || []);
      var unici = Array.from(new Set(crit));
      return { lunghezzaInnerText: dInner.length, lunghezzaTextContent: d.length, righeTabella: righe, criteriCitati: unici.length,
               tabelle: (d.match(/<table/g)||[]).length,
               sezioni: (d.match(/<h2/g)||[]).length,
               primi: unici.slice(0,8), coda: d.slice(-260) };
    })()`);
    console.log("controlli nel modulo:", JSON.stringify(quanti));
    console.log(JSON.stringify(r, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
