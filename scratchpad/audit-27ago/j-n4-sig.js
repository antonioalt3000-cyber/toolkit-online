const { newCleanTab, disposeContext, connect } = require("./cdp");
const crypto = require("crypto");
const fs = require("fs");

/** Chiave creator letta dal vault, MAI stampata. */
function chiave(nome) {
  const t = fs.readFileSync("C:/Users/ftass/secrets-private/saas-creator-keys.md", "utf8");
  const riga = t.split("\n").find((l) => l.indexOf("| " + nome + " ") === 0 || l.indexOf("| " + nome + " |") !== -1);
  if (!riga) return null;
  const m = riga.match(/`([a-z]+_[A-Za-z0-9_]+)`/);
  return m ? m[1] : null;
}

const SEGRETO = "whsec_" + crypto.randomBytes(16).toString("hex");
const CORPO = JSON.stringify({ id: "evt_zt30", type: "invoice.payment_failed", amount: 4200 });
const TS = Math.floor(Date.now() / 1000);
const firmaValida = "t=" + TS + ",v1=" + crypto.createHmac("sha256", SEGRETO).update(TS + "." + CORPO).digest("hex");
// stessa firma, corpo manomesso di UN carattere: deve essere rifiutata
const CORPO_MANOMESSO = CORPO.replace('"amount":4200', '"amount":9200');

(async () => {
  const k = chiave("hooklab");
  if (!k) { console.error("chiave hooklab non trovata nel vault"); process.exit(2); }
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://gethooklab.dev/");
    await tab.waitFor("document.body.innerText.length > 300", 30000);
    const r = await tab.eval(`(async function(){
      async function chiama(corpo){
        var res = await fetch('/api/v1/verify-signature', {
          method:'POST',
          headers:{'content-type':'application/json','x-api-key': ${JSON.stringify(k)}},
          body: JSON.stringify({ provider:'stripe', secret:${JSON.stringify(SEGRETO)}, rawBody: corpo, signature: ${JSON.stringify(firmaValida)} })
        });
        var j = null; try { j = await res.json(); } catch(e) {}
        return { status: res.status, valido: j && (j.valid !== undefined ? j.valid : (j.data && j.data.valid)), corpo: JSON.stringify(j).slice(0,200) };
      }
      return { autentico: await chiama(${JSON.stringify(CORPO)}), manomesso: await chiama(${JSON.stringify(CORPO_MANOMESSO)}) };
    })()`);
    console.log(JSON.stringify({
      prodotto: "N4 · verify-signature (Stripe HMAC reale)",
      autentico: r.autentico,
      manomesso: r.manomesso,
      accettaIlValido: r.autentico.valido === true,
      rifiutaIlManomesso: r.manomesso.valido === false,
      invarianteRispettata: r.autentico.valido === true && r.manomesso.valido === false,
    }, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
