const { newCleanTab, disposeContext, connect } = require("./cdp");
const fs = require("fs");
function chiave(nome) {
  const t = fs.readFileSync("C:/Users/ftass/secrets-private/saas-creator-keys.md", "utf8");
  const riga = t.split("\n").find((l) => l.indexOf("| " + nome + " ") === 0);
  const m = riga && riga.match(/`([a-z]+_[A-Za-z0-9_]+)`/);
  return m ? m[1] : null;
}
(async () => {
  const kCf = chiave("cardforge"), kSeo = chiave("seoscope");
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    // --- N5 QR: dati diversi devono produrre immagini diverse, e il formato dev'essere valido
    await tab.goto("https://getcardforge.dev/");
    await tab.waitFor("document.body.innerText.length > 300", 30000);
    const qr = await tab.eval(`(async function(){
      async function q(dati){
        var r = await fetch('/api/v1/qr?data=' + encodeURIComponent(dati) + '&size=300', { headers:{ 'authorization':'Bearer ' + ${JSON.stringify(kCf)} } });
        var b = await r.blob();
        var buf = new Uint8Array(await b.arrayBuffer());
        var firma = Array.from(buf.slice(0,4)).map(function(x){return x.toString(16).padStart(2,'0');}).join('');
        return { status:r.status, tipo:r.headers.get('content-type'), byte:b.size, firma:firma };
      }
      var a = await q('https://contoso.example/alpha');
      var b = await q('https://contoso.example/beta-diverso');
      return { a:a, b:b, byteDiversi: a.byte !== b.byte };
    })()`);
    console.log(JSON.stringify({ prodotto:"N5 · QR", ...qr, pngValido: qr.a.firma === "89504e47" || String(qr.a.tipo||"").indexOf("svg") !== -1 }, null, 1));

    // --- N5 vCard: deve essere un VCF valido coi dati passati
    const vc = await tab.eval(`(async function(){
      var r = await fetch('/api/v1/vcard?name=' + encodeURIComponent('Ana Codes') + '&org=' + encodeURIComponent('Contoso Nordic AB') + '&email=ana@contoso.example', { headers:{ 'authorization':'Bearer ' + ${JSON.stringify(kCf)} } });
      var t = await r.text();
      return { status:r.status, tipo:r.headers.get('content-type'), inizia:t.slice(0,12), finisce:t.trim().slice(-10),
               contieneNome:t.indexOf('Ana Codes')!==-1, contieneOrg:t.indexOf('Contoso Nordic AB')!==-1, contieneEmail:t.indexOf('ana@contoso.example')!==-1 };
    })()`);
    console.log(JSON.stringify({ prodotto:"N5 · vCard", ...vc, vcfValido: vc.inizia.indexOf("BEGIN:VCARD")===0 && vc.finisce.indexOf("END:VCARD")!==-1 }, null, 1));

    // --- N2 compare: due URL, due punteggi
    await tab.goto("https://seoscope.dev/");
    await tab.waitFor("document.body.innerText.length > 300", 30000);
    const cmp = await tab.eval(`(async function(){
      var r = await fetch('/api/v1/audit/compare', { method:'POST',
        headers:{ 'content-type':'application/json', 'x-api-key': ${JSON.stringify(kSeo)} },
        body: JSON.stringify({ urlA:'https://www.mozilla.org', urlB:'https://example.com' }) });
      var j=null; try { j = await r.json(); } catch(e){}
      var d = j && (j.data || j);
      return { status:r.status,
               scoreA: d && d.a && (d.a.score !== undefined ? d.a.score : (d.a.data && d.a.data.score)),
               scoreB: d && d.b && (d.b.score !== undefined ? d.b.score : (d.b.data && d.b.data.score)),
               haConfronto: !!(d && d.comparison),
               chiavi: d ? Object.keys(d).slice(0,6) : null };
    })()`);
    console.log(JSON.stringify({ prodotto:"N2 · compare A/B", ...cmp,
      duePunteggiDistinti: typeof cmp.scoreA === "number" && typeof cmp.scoreB === "number" && cmp.scoreA !== cmp.scoreB }, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
