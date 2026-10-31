const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
const setVal = (id, v) => `(function(){
  var e=document.getElementById(${JSON.stringify(id)});
  var proto = e.tagName==='TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto,'value').set.call(e, ${JSON.stringify(v)});
  e.dispatchEvent(new Event('input',{bubbles:true}));
  return e.value;
})()`;

/** F2 — il rapporto di contrasto e' un valore ESATTO, non un'opinione. */
async function contrasto(tab) {
  const out = { prodotto: "F2 · contrast-checker", casi: [] };
  const CASI = [["#000000", "#FFFFFF", 21.0, "AAA"], ["#777777", "#FFFFFF", 4.48, "AA"]];
  for (const [fg, bg, atteso, livelloAtteso] of CASI) {
    await tab.goto("https://fixmyweb.dev/tools/contrast-checker");
    await tab.waitFor("document.querySelector('#fg-color')", 30000);
    await tab.waitFor(idr("#fg-color"), 40000, 400);
    // i campi hex accanto ai color picker
    await tab.eval(`(function(){
      var txt = Array.from(document.querySelectorAll('input[type=text]'));
      var S = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      S.call(txt[0], ${JSON.stringify(fg)}); txt[0].dispatchEvent(new Event('input',{bubbles:true}));
      S.call(txt[1], ${JSON.stringify(bg)}); txt[1].dispatchEvent(new Event('input',{bubbles:true}));
      return [txt[0].value, txt[1].value];
    })()`);
    await tab.waitFor("false", 1500);
    const t = await tab.text();
    // cerco un numero con ':1' accanto, senza regex nell'espressione iniettata
    const m = t.match(/(\d+(?:\.\d+)?)\s*:\s*1/);
    const letto = m ? Number(m[1]) : null;
    out.casi.push({
      fg, bg, atteso, letto,
      esatto: letto !== null && Math.abs(letto - atteso) < 0.06,
      livelloMostrato: ["AAA", "AA", "Fail"].filter(function (l) { return t.indexOf(l) !== -1; }),
    });
  }
  return out;
}

/** B7 — il meta-inspector deve leggere i tag VERI di un sito noto. */
async function meta(tab) {
  const out = { prodotto: "B7 · meta-inspector" };
  await tab.goto("https://captureapi.dev/tools/meta-inspector");
  await tab.waitFor("document.querySelector('#meta-url')", 30000);
  await tab.waitFor(idr("#meta-url"), 40000, 400);
  await tab.eval(setVal("meta-url", "https://github.com"));
  await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Inspect';});b.click();return true;})()`);
  out.completato = await tab.waitFor("document.body.innerText.indexOf('GitHub') !== -1 || document.body.innerText.toLowerCase().indexOf('error') !== -1", 90000);
  const t = await tab.text();
  out.trovaTitolo = t.indexOf("GitHub") !== -1;
  out.mostraOg = ["og:title", "og:image", "og:description", "twitter"].filter(function (k) { return t.toLowerCase().indexOf(k) !== -1; });
  const i = t.indexOf("GitHub");
  out.estratto = i === -1 ? null : t.slice(Math.max(0, i - 120), i + 200).split(String.fromCharCode(10)).join(" | ");
  return out;
}

/** F4 — formattare JSON deve preservare i dati: round-trip. */
async function jsonPreview(tab) {
  const out = { prodotto: "F4 · json-preview" };
  const ORIG = '{"b":2,"a":[1,2,{"c":"x"}],"n":null,"t":true,"s":"con \\"virgolette\\"","num":1234567.89}';
  await tab.goto("https://parseflow.dev/tools/json-preview");
  await tab.waitFor("document.querySelector('#json-input')", 30000);
  await tab.waitFor(idr("#json-input"), 40000, 400);
  await tab.eval(setVal("json-input", ORIG));
  await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Format';});b.click();return true;})()`);
  await tab.waitFor("false", 2500);
  const r = await tab.eval(`(function(){
    var pres = Array.from(document.querySelectorAll('pre,code,textarea'));
    var cand = pres.map(function(p){ return p.tagName==='TEXTAREA' ? p.value : p.innerText; })
                   .filter(function(s){ return s && s.indexOf('"a"') !== -1 && s.length > 40; });
    return cand.length ? cand[cand.length-1] : null;
  })()`);
  out.formattatoTrovato = !!r;
  if (r) {
    try {
      const a = JSON.parse(ORIG), b = JSON.parse(r);
      out.jsonValido = true;
      out.datiPreservati = JSON.stringify(a) === JSON.stringify(b);
      out.indentato = r.indexOf("\n  ") !== -1;
    } catch (e) { out.jsonValido = false; out.erroreParse = e.message; out.inizio = r.slice(0, 120); }
  }
  return out;
}

(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    for (const f of [contrasto, meta, jsonPreview]) {
      try { console.log(JSON.stringify(await f(tab), null, 1)); }
      catch (e) { console.log(JSON.stringify({ prodotto: f.name, errore: e.message })); }
    }
  } finally { tab.close(); await disposeContext(h); }
})();
