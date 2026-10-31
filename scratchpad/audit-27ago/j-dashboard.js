const { newCleanTab, disposeContext, connect } = require("./cdp");
const fs = require("fs");
function chiave(nome) {
  const t = fs.readFileSync("C:/Users/ftass/secrets-private/saas-creator-keys.md", "utf8");
  const riga = t.split("\n").find((l) => l.indexOf("| " + nome + " ") === 0);
  const m = riga && riga.match(/`([a-z]+_[A-Za-z0-9_]+)`/);
  return m ? m[1] : null;
}
const PRODOTTI = [
  ["emailguard",  "https://emailguard.dev",   "/api/v1/verify?email=billing@stripe.com", "GET"],
  ["seoscope",    "https://seoscope.dev",     "/api/v1/audit?url=https://example.com",   "GET"],
  ["headershield","https://headershield.dev", "/api/v1/scan?url=https://example.com",    "GET"],
  ["cardforge",   "https://getcardforge.dev", "/api/v1/qr?data=zerotrust&size=200",      "GET"],
];
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    for (const [nome, dominio, rotta, metodo] of PRODOTTI) {
      const k = chiave(nome);
      if (!k) { console.log(JSON.stringify({ prodotto: nome, errore: "chiave assente nel vault" })); continue; }
      await tab.goto(dominio + "/dashboard");
      await tab.waitFor("document.body.innerText.length > 200", 30000);
      const r = await tab.eval(`(async function(){
        var K = ${JSON.stringify(k)};
        async function cruscotto(){
          var res = await fetch('/api/dashboard', { headers:{ 'X-API-Key': K } });
          var j = null; try { j = await res.json(); } catch(e) {}
          var d = j && (j.data || j);
          return { status: res.status, plan: d && d.plan,
                   mensile: d && d.usage && d.usage.monthly,
                   limite: d && d.usage && d.usage.limit,
                   percento: d && d.usage && d.usage.percentUsed };
        }
        async function storico(){
          var res = await fetch('/api/dashboard/requests', { headers:{ 'X-API-Key': K } });
          var j = null; try { j = await res.json(); } catch(e) {}
          var d = j && (j.data || j);
          var arr = Array.isArray(d) ? d : (d && (d.requests || d.items) || []);
          return { status: res.status, quante: arr.length, ultima: arr[0] ? JSON.stringify(arr[0]).slice(0,110) : null };
        }
        var prima = await cruscotto();
        var storicoPrima = await storico();
        var chiamata = await fetch(${JSON.stringify(rotta)}, { method:${JSON.stringify(metodo)}, headers:{ 'X-API-Key': K, 'authorization':'Bearer ' + K } });
        await new Promise(function(r){ setTimeout(r, 2500); });
        var dopo = await cruscotto();
        var storicoDopo = await storico();
        return { prima:prima, dopo:dopo, statusChiamata: chiamata.status, storicoPrima:storicoPrima, storicoDopo:storicoDopo };
      })()`);
      const delta = (r.dopo.mensile != null && r.prima.mensile != null) ? r.dopo.mensile - r.prima.mensile : null;
      console.log(JSON.stringify({
        prodotto: nome,
        piano: r.prima.plan,
        cruscottoStatus: r.prima.status,
        chiamataStatus: r.statusChiamata,
        usoPrima: r.prima.mensile, usoDopo: r.dopo.mensile, delta: delta,
        deltaCorretto: delta === 1,
        limite: r.prima.limite, percento: r.dopo.percento,
        storico: r.storicoPrima.quante + " -> " + r.storicoDopo.quante,
        ultimaRichiesta: r.storicoDopo.ultima,
      }));
    }
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
