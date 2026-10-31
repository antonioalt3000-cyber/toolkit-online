const { newCleanTab, disposeContext, connect } = require("./cdp");
const fs = require("fs");
function chiave(nome) {
  const t = fs.readFileSync("C:/Users/ftass/secrets-private/saas-creator-keys.md", "utf8");
  const riga = t.split("\n").find((l) => l.indexOf("| " + nome + " ") === 0);
  const m = riga && riga.match(/`([a-z]+_[A-Za-z0-9_]+)`/);
  return m ? m[1] : null;
}
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    // --- F1 CompliPilot: /api/plan con la chiave
    const k1 = chiave("complipilot (F1)") || chiave("complipilot");
    await tab.goto("https://complipilot.dev/dashboard");
    await tab.waitFor("document.body.innerText.length > 200", 30000);
    const f1 = await tab.eval(`(async function(){
      var K = ${JSON.stringify(k1)};
      async function p(h){ var r = await fetch('/api/plan', { headers: h }); var j=null; try{j=await r.json();}catch(e){} return { status:r.status, corpo: JSON.stringify(j).slice(0,180) }; }
      return {
        conChiave: await p({ 'x-api-key': K }),
        senzaChiave: await p({}),
        chiaveInventata: await p({ 'x-api-key': 'cp_live_' + 'f'.repeat(48) })
      };
    })()`);
    console.log(JSON.stringify({ prodotto: "F1 CompliPilot · /api/plan", ...f1 }, null, 1));

    // --- F4 ParseFlow: /api/v1/dashboard
    const k4 = chiave("parseflow (F4)") || chiave("parseflow");
    await tab.goto("https://parseflow.dev/dashboard");
    await tab.waitFor("document.body.innerText.length > 200", 30000);
    const f4 = await tab.eval(`(async function(){
      var K = ${JSON.stringify(k4)};
      async function d(h){ var r = await fetch('/api/v1/dashboard', { headers: h }); var j=null; try{j=await r.json();}catch(e){} return { status:r.status, corpo: JSON.stringify(j).slice(0,220) }; }
      var prima = await d({ 'x-api-key': K });
      return { conChiave: prima, senzaChiave: await d({}), altrui: await d({ 'x-api-key': ${JSON.stringify(chiave("emailguard"))} }) };
    })()`);
    console.log(JSON.stringify({ prodotto: "F4 ParseFlow · /api/v1/dashboard", ...f4 }, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
