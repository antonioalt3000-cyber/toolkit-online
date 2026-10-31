const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;

// Nome azienda con caratteri legittimi ma ostili all'HTML: e-commerciale e angolari.
const AZIENDA = 'Contoso & Söhne <Nord> AB';
const SCELTE = [
  ["1.1.1", "Supports",           "Tutte le immagini hanno alt verificato"],
  ["1.3.1", "Partially Supports", "Due tabelle senza intestazioni <th> & senza scope"],
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

    // Intercetta l'argomento reale passato alla clipboard: e' cio' che il cliente incolla.
    await tab.eval(`(function(){
      window.__copiato = null;
      try {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: { writeText: function(t){ window.__copiato = t; return Promise.resolve(); } }
        });
      } catch(e) { window.__patchErr = String(e); }
      return true;
    })()`);

    out.impostazioni = await tab.eval(`(function(){
      var S=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      function f(id,v){var e=document.getElementById(id); if(!e) return false; S.call(e,v); e.dispatchEvent(new Event('input',{bubbles:true})); return true;}
      var esiti = { intestazione: {} };
      esiti.intestazione.prodotto = f('product-name','Contoso Portal');
      esiti.intestazione.versione = f('product-version','4.2.0');
      esiti.intestazione.data     = f('report-date','2026-08-30');
      esiti.intestazione.azienda  = f('company-name', ${JSON.stringify(AZIENDA)});
      var SS=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set;
      var scelte = ${JSON.stringify(SCELTE)};
      esiti.criteri = scelte.map(function(sc){
        var crit=sc[0], val=sc[1], nota=sc[2];
        var sel = document.querySelector('select[aria-label*="' + crit + '"]');
        var txt = document.querySelector('input[aria-label*="' + crit + '"]');
        if (sel) { SS.call(sel, val); sel.dispatchEvent(new Event('change',{bubbles:true})); }
        if (txt) { S.call(txt, nota); txt.dispatchEvent(new Event('input',{bubbles:true})); }
        return { criterio: crit, selectTrovata: !!sel, notaTrovata: !!txt, valoreImpostato: sel ? sel.value : null };
      });
      return esiti;
    })()`);

    await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Generate VPAT';});b.click();return true;})()`);
    out.generato = await tab.waitFor("Array.from(document.querySelectorAll('pre')).some(function(p){return p.innerText.indexOf('DOCTYPE')!==-1;})", 30000);

    // Percorso di consegna reale: il bottone "Copy HTML".
    await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim().indexOf('Copy HTML')!==-1;});if(!b) return false;b.click();return true;})()`);
    out.copiaRiuscita = await tab.waitFor("typeof window.__copiato === 'string' && window.__copiato.length > 0", 15000);

    const doc = await tab.eval("window.__copiato");
    if (!doc) { out.errore = "clipboard vuota"; console.log(JSON.stringify(out,null,1)); return; }

    const conta = (s, a) => s.split(a).length - 1;
    const critRe = new RegExp("[0-9]+[.][0-9]+[.][0-9]+", "g");
    const citati = doc.match(critRe) || [];
    const unici = Array.from(new Set(citati));

    out.documento = {
      lunghezza: doc.length,
      anteprimaTroncataA: 2000,
      righe: conta(doc, "<tr"),
      tabelle: conta(doc, "<table"),
      criteriUnici: unici.length,
      bilancioTag: {
        table: conta(doc, "<table") - conta(doc, "</table"),
        tr: conta(doc, "<tr") - conta(doc, "</tr"),
        td: conta(doc, "<td") - conta(doc, "</td"),
      },
    };

    out.mappatura = SCELTE.map(function (sc) {
      const [crit, val, nota] = sc;
      const i = doc.indexOf(crit);
      const fin = i === -1 ? "" : doc.slice(i, i + 700);
      return { criterio: crit, presente: i !== -1, valoreNellaFinestra: fin.indexOf(val) !== -1, notaPresente: fin.indexOf(nota.slice(0, 20)) !== -1 };
    });
    out.mappaturaCorretta = out.mappatura.every((m) => m.presente && m.valoreNellaFinestra && m.notaPresente);

    // Un valore non scelto non deve comparire accanto a un criterio non toccato.
    const iNonTocc = doc.indexOf("1.4.3");
    out.criterioNonToccato = iNonTocc === -1 ? null : doc.slice(iNonTocc, iNonTocc + 500).indexOf("Not Evaluated") !== -1;

    out.escaping = {
      ampersandGrezza: doc.indexOf("Contoso & S") !== -1,
      ampersandEscapata: doc.indexOf("Contoso &amp; S") !== -1,
      angolariGrezzi: doc.indexOf("<Nord>") !== -1,
      angolariEscapati: doc.indexOf("&lt;Nord&gt;") !== -1,
      notaAngolariGrezzi: doc.indexOf("<th> &") !== -1,
    };
    out.segnapostiResidui = ["undefined", "null", "[object", "NaN", "{{"].filter((p) => doc.indexOf(p) !== -1);
    out.codaDocumento = doc.slice(-120);
    console.log(JSON.stringify(out, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
