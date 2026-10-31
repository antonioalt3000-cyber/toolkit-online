const { newCleanTab, disposeContext, connect } = require("./cdp");
const fs = require("fs");
function chiave(nome) {
  const t = fs.readFileSync("C:/Users/ftass/secrets-private/saas-creator-keys.md", "utf8");
  const riga = t.split("\n").find((l) => l.indexOf("| " + nome + " ") === 0);
  const m = riga && riga.match(/`([a-z]+_[A-Za-z0-9_]+)`/);
  return m ? m[1] : null;
}
(async () => {
  const k = chiave("cardforge");
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://getcardforge.dev/");
    await tab.waitFor("document.body.innerText.length > 300", 30000);
    const r = await tab.eval(`(async function(){
      var res = await fetch('/api/v1/vcard', { method:'POST',
        headers:{ 'content-type':'application/json', 'x-api-key': ${JSON.stringify(k)} },
        body: JSON.stringify({ name:'Ana Codes', org:'Contoso Nordic AB', title:'Head of Platform', email:'ana@contoso.example', phone:'+46 8 123456', url:'https://contoso.example' }) });
      var t = await res.text();
      var NL = String.fromCharCode(10);
      return {
        status: res.status,
        tipo: res.headers.get('content-type'),
        disposizione: res.headers.get('content-disposition'),
        righe: t.split(NL).map(function(x){return x.trim();}).filter(Boolean).slice(0,12),
        inizia: t.trim().indexOf('BEGIN:VCARD') === 0,
        finisce: t.trim().slice(-9) === 'END:VCARD',
        contiene: { nome: t.indexOf('Ana Codes')!==-1, org: t.indexOf('Contoso Nordic AB')!==-1,
                    titolo: t.indexOf('Head of Platform')!==-1, email: t.indexOf('ana@contoso.example')!==-1,
                    telefono: t.indexOf('123456')!==-1, url: t.indexOf('contoso.example')!==-1 }
      };
    })()`);
    const tutti = Object.values(r.contiene).every(Boolean);
    console.log(JSON.stringify({ prodotto:"N5 · vCard (POST)", ...r, vcfValido: r.inizia && r.finisce, tuttiICampiPresenti: tutti }, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
