const { newCleanTab, disposeContext, connect } = require("./cdp");
const idratato = (sel) => `(function(){var e=document.querySelector(${JSON.stringify(sel)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;

/** N3 — il simulatore deve rispondere al CONTENUTO, non dare sempre lo stesso voto. */
async function n3(tab) {
  const out = { prodotto: "N3 HeaderShield · simulatore" };
  const casi = [
    ["nudo", ""],
    ["forte", "strict-transport-security: max-age=63072000; includeSubDomains; preload\ncontent-security-policy: default-src 'self'\nx-content-type-options: nosniff\nx-frame-options: DENY\nreferrer-policy: no-referrer\npermissions-policy: camera=()"],
  ];
  out.esiti = [];
  for (const [etichetta, headers] of casi) {
    await tab.goto("https://headershield.dev/simulate");
    await tab.waitFor("document.querySelector('#sim-headers')", 30000);
    await tab.waitFor(idratato("#sim-headers"), 40000, 400);
    if (headers) await tab.eval(`(function(){
      var e=document.getElementById('sim-headers');
      var S=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
      S.call(e, ${JSON.stringify(headers)}); e.dispatchEvent(new Event('input',{bubbles:true})); return true;
    })()`);
    await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Grade these headers';});b.click();return true;})()`);
    await tab.waitFor("false", 3500);
    const t = await tab.text();
    const g = t.match(/\b(A\+|A|B|C|D|E|F)\b(?=[^a-zA-Z])/);
    out.esiti.push({ caso: etichetta, votoLetto: g ? g[1] : null });
  }
  out.votiDiversi = out.esiti.length === 2 && out.esiti[0].votoLetto !== out.esiti[1].votoLetto;
  return out;
}

/** N2 — l'audit deve produrre un punteggio numerico, non solo «reso». */
async function n2(tab) {
  const out = { prodotto: "N2 SEOScope · audit" };
  await tab.goto("https://seoscope.dev/seo-audit");
  await tab.waitFor("document.querySelector('#audit-demo-url')", 30000);
  await tab.waitFor(idratato("#audit-demo-url"), 40000, 400);
  await tab.typeInto("#audit-demo-url", "https://www.mozilla.org");
  await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Audit';});b.click();return true;})()`);
  out.completato = await tab.waitFor("/\b\d{1,3}\s*\/\s*100\b/.test(document.body.innerText) || document.body.innerText.indexOf('Score') !== -1", 90000);
  const t = await tab.text();
  const m = t.match(/(\d{1,3})\s*\/\s*100/);
  out.punteggio = m ? Number(m[1]) : null;
  out.punteggioPlausibile = out.punteggio !== null && out.punteggio >= 0 && out.punteggio <= 100;
  const i = t.search(/\d{1,3}\s*\/\s*100/);
  out.estratto = i === -1 ? null : t.slice(Math.max(0, i - 120), i + 200).replace(/\n+/g, " | ");
  return out;
}

/** N5 — la galleria deve mostrare card generate davvero, non segnaposto. */
async function n5(tab) {
  const out = { prodotto: "N5 CardForge · gallery" };
  await tab.goto("https://getcardforge.dev/gallery");
  await tab.waitFor("document.querySelectorAll('img').length > 2", 30000);
  await tab.waitFor("false", 4000);
  const r = await tab.eval(`(async function(){
    var imgs = Array.from(document.querySelectorAll('img')).filter(function(i){ return i.src.indexOf('/api/') !== -1; });
    var caricate = imgs.filter(function(i){ return i.complete && i.naturalWidth > 200; });
    var campione = imgs[0] ? await fetch(imgs[0].src).then(function(r){ return r.status + ' ' + r.headers.get('content-type'); }) : null;
    return { totali: imgs.length, caricate: caricate.length, dimensioni: caricate.slice(0,3).map(function(i){return i.naturalWidth+'x'+i.naturalHeight;}), campione: campione };
  })()`);
  Object.assign(out, r);
  out.tutteCaricate = r.totali > 0 && r.totali === r.caricate;
  return out;
}

(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    for (const f of [n3, n2, n5]) {
      try { console.log(JSON.stringify(await f(tab), null, 1)); }
      catch (e) { console.log(JSON.stringify({ prodotto: f.name, errore: e.message })); }
    }
  } finally { tab.close(); await disposeContext(h); }
})();
