const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
/** Valori distinti su criteri distinti: se la mappatura slitta, si vede. */
const SCELTE = [
  ["1.1.1", "Supports",           "Tutte le immagini hanno alt verificato"],
  ["1.3.1", "Partially Supports", "Due tabelle senza intestazioni di riga"],
  ["2.4.7", "Does Not Support",   "Focus non visibile sul carosello"],
  ["3.3.5", "Not Applicable",     "Nessun aiuto contestuale nel prodotto"],
];
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  const out = {};
  try {
    await tab.goto("https://fixmyweb.dev/vpat");
    await tab.waitFor("document.querySelector('#product-name')", 30000);
    await tab.waitFor(idr("#product-name"), 40000, 400);
    await tab.eval(`(function(){
      var S=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      function f(id,v){var e=document.getElementById(id);S.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));}
      f('product-name','Contoso Portal');
      f('product-version','4.2.0');
      f('report-date','2026-08-30');
      f('company-name','Contoso Nordic AB');
      return true;
    })()`);
    // imposto conformita' e note per criterio, trovando la RIGA del criterio
    out.impostati = await tab.eval(`(function(){
      var scelte = ${JSON.stringify(SCELTE)};
      var fatti = [];
      scelte.forEach(function(sc){
        var crit = sc[0], val = sc[1], nota = sc[2];
        var sel = document.querySelector('select[aria-label*="' + crit + '"]');
        var txt = document.querySelector('input[aria-label*="' + crit + '"]');
        if (sel) { sel.value = val; sel.dispatchEvent(new Event('change',{bubbles:true})); }
        if (txt) {
          var S=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
          S.call(txt, nota); txt.dispatchEvent(new Event('input',{bubbles:true}));
        }
        fatti.push({ criterio: crit, select: !!sel, nota: !!txt, valoreImpostato: sel ? sel.value : null });
      });
      return fatti;
    })()`);
    await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Generate VPAT';});b.click();return true;})()`);
    out.generato = await tab.waitFor("Array.from(document.querySelectorAll('pre')).some(function(p){return p.innerText.indexOf('DOCTYPE')!==-1;})", 30000);
    const doc = await tab.eval("(function(){var p=Array.from(document.querySelectorAll('pre')).find(function(x){return x.innerText.indexOf('DOCTYPE')!==-1;});return p?p.innerText:null;})()");
    out.lunghezza = doc ? doc.length : 0;
    out.intestazione = {
      prodotto: doc.indexOf("Contoso Portal") !== -1,
      versione: doc.indexOf("4.2.0") !== -1,
      azienda: doc.indexOf("Contoso Nordic AB") !== -1,
      data: doc.indexOf("2026") !== -1,
    };
    // LA PROVA: ogni valore deve stare accanto al SUO criterio
    out.mappatura = SCELTE.map(function (sc) {
      const i = doc.indexOf(sc[0]);
      const finestra = i === -1 ? "" : doc.slice(i, i + 700);
      return { criterio: sc[0], atteso: sc[1], trovatoNellaFinestra: finestra.indexOf(sc[1]) !== -1, notaPresente: finestra.indexOf(sc[2].slice(0, 22)) !== -1 };
    });
    out.mappaturaCorretta = out.mappatura.every(function (m) { return m.trovatoNellaFinestra && m.notaPresente; });
    out.segnapostoResidui = ["{{", "}}", "undefined", "[object", "NaN"].filter(function (p) { return doc.indexOf(p) !== -1; });
    out.htmlBenFormato = doc.indexOf("<!DOCTYPE html>") === 0 && doc.trim().slice(-7) === "</html>";
    await tab.screenshot(__dirname + "/f2-vpat.png");
  } catch (e) { out.errore = e.message; }
  finally { tab.close(); await disposeContext(h); }
  console.log(JSON.stringify(out, null, 1));
})();
