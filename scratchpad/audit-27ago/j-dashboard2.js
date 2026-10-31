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
    // --- N4 HookLab e B7 CaptureAPI: stesso schema dashboard
    for (const [nome, dominio, rotta] of [
      ["hooklab",    "https://gethooklab.dev", "/api/v1/endpoints"],
      ["captureapi", "https://captureapi.dev", "/api/v1/usage"],
    ]) {
      const k = chiave(nome);
      await tab.goto(dominio + "/dashboard");
      await tab.waitFor("document.body.innerText.length > 200", 30000);
      const r = await tab.eval(`(async function(){
        var K = ${JSON.stringify(k)};
        var res = await fetch('/api/dashboard', { headers:{ 'X-API-Key': K } });
        var j=null; try{ j=await res.json(); }catch(e){}
        var d = j && (j.data || j);
        var chiamata = await fetch(${JSON.stringify(rotta)}, { headers:{ 'X-API-Key': K } });
        return { status:res.status, plan: d && d.plan, uso: d && d.usage ? JSON.stringify(d.usage).slice(0,120) : null, statusChiamata: chiamata.status };
      })()`);
      console.log(JSON.stringify({ prodotto: nome, ...r }));
    }

    // --- ISOLAMENTO: la chiave di un prodotto non deve valere su un altro
    await tab.goto("https://seoscope.dev/dashboard");
    await tab.waitFor("document.body.innerText.length > 200", 30000);
    const iso = await tab.eval(`(async function(){
      async function prova(k, etichetta){
        var res = await fetch('/api/dashboard', { headers:{ 'X-API-Key': k } });
        var j=null; try{ j=await res.json(); }catch(e){}
        return { chi: etichetta, status: res.status, piano: j && (j.plan || (j.data && j.data.plan)) || null };
      }
      return {
        propria:   await prova(${JSON.stringify(chiave("seoscope"))},   'chiave seoscope su seoscope'),
        altrui:    await prova(${JSON.stringify(chiave("emailguard"))}, 'chiave EMAILGUARD su seoscope'),
        inventata: await prova('seo_' + 'f'.repeat(48),                 'chiave inventata'),
        assente:   await (async function(){ var r = await fetch('/api/dashboard'); return { chi:'nessuna chiave', status:r.status, piano:null }; })()
      };
    })()`);
    console.log(JSON.stringify({ prova: "isolamento chiavi su seoscope", ...iso }, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
