const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
const clickTesto = (frammento) => `(function(){
  var t = ${JSON.stringify(frammento)};
  var el = Array.from(document.querySelectorAll('button,[role=button],a')).find(function(b){ return (b.innerText||'').indexOf(t) !== -1; });
  if (!el) return false; el.click(); return true;
})()`;

(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  const out = {};
  try {
    // ---------- A) /generate : i documenti che il cliente consegna ----------
    await tab.goto("https://complipilot.dev/generate");
    await tab.waitFor("document.querySelectorAll('[role=button]').length > 0", 30000);
    await tab.waitFor(idr("[role=button]"), 40000, 400);
    const titoli = await tab.eval("Array.from(document.querySelectorAll('[role=button] h2')).map(function(h){return h.innerText.trim();})");
    out.generate = { modelli: titoli, esiti: [] };

    for (let i = 0; i < titoli.length; i++) {
      await tab.eval(`(function(){var c=document.querySelectorAll('[role=button]')[${i}];c.click();return true;})()`);
      await tab.waitFor("!!Array.from(document.querySelectorAll('h2')).find(function(h){return h.innerText.indexOf('Generated:')===0;})", 15000);
      const r = await tab.eval(`(function(){
        var pre = document.querySelector('pre');
        var testo = pre ? (pre.innerText || pre.textContent) : '';
        var intest = Array.from(document.querySelectorAll('h2')).find(function(h){return h.innerText.indexOf('Generated:')===0;});
        var sospetti = ['undefined','[object','NaN','${'+'}'].filter(function(p){ return testo.indexOf(p) !== -1; });
        return { reso: intest ? intest.innerText.replace('Generated: ','') : null, lunghezza: testo.length, sospetti: sospetti, coda: testo.slice(-70) };
      })()`);
      out.generate.esiti.push({ atteso: titoli[i], ...r });
    }

    console.log("A) /generate:", JSON.stringify(out.generate, null, 1));
    // ---------- B) /risk-assessment : la data mostrata al cliente ----------
    await tab.goto("https://complipilot.dev/risk-assessment");
    await tab.waitFor("document.querySelectorAll('button').length > 3", 30000);
    await tab.waitFor(idr("button"), 40000, 400);
    const SCELTE = [
      "Chatbot, content generation",
      "Moderate impact",
      "AI assists but human makes the final decision",
      "Behavioral data",
      "Marketing, entertainment",
      "Limited transparency",
    ];
    out.riskAssessment = { clic: [] };
    for (const frammento of SCELTE) {
      const ok = await tab.eval(clickTesto(frammento));
      out.riskAssessment.clic.push({ opzione: frammento, cliccata: ok });
      await new Promise((r) => setTimeout(r, 350));
    }
    await tab.eval(clickTesto("See My Risk Level"));
    await tab.eval(clickTesto("Get My Risk"));
    await tab.eval(clickTesto("Calculate"));
    await new Promise((r) => setTimeout(r, 1200));
    out.riskAssessment.verdetto = await tab.eval(`(function(){
      var t = document.body.innerText;
      var liv = ['Unacceptable Risk','High Risk','Limited Risk','Minimal Risk'].filter(function(l){ return t.indexOf(l) !== -1; });
      var i = t.indexOf('Deadline');
      return { livelliVisibili: liv, rigaScadenza: i === -1 ? null : t.slice(i, i + 160).split(String.fromCharCode(10)).slice(0,3).join(' | ') };
    })()`);

    console.log("B) /risk-assessment:", JSON.stringify(out.riskAssessment, null, 1));
    // ---------- C) /audit-questionnaire : l'invariante del punteggio ----------
    await tab.goto("https://complipilot.dev/audit-questionnaire");
    await tab.waitFor("document.querySelectorAll('div.grid.gap-2 > button').length > 0", 30000);
    await tab.waitFor(idr("div.grid.gap-2 > button"), 40000, 400);
    const misura = async (primo) => {
      const cliccate = await tab.eval("(function(){var n=0;Array.from(document.querySelectorAll('div.grid.gap-2')).forEach(function(g){var b=Array.from(g.children).filter(function(c){return c.tagName==='BUTTON';});if(b.length){ (" + (primo ? "b[0]" : "b[b.length-1]") + ").click(); n++; }});return n;})()");
      await new Promise((r) => setTimeout(r, 600));
      await tab.eval(clickTesto("View Results"));
      await tab.waitFor("document.body.innerText.indexOf('Combined Compliance Score') !== -1", 15000);
      const p = await tab.eval("(function(){var t=document.body.innerText;var i=t.indexOf('Combined Compliance Score');var m=t.slice(i,i+90).match(new RegExp('[0-9]+'));return m?Number(m[0]):null;})()");
      await tab.eval(clickTesto("Retake Assessment"));
      await new Promise((r) => setTimeout(r, 700));
      return { gruppiCliccati: cliccate, punteggio: p };
    };
    const domande = await tab.eval("document.querySelectorAll('div.grid.gap-2').length");
    out.questionario = { gruppiOpzioni: domande };
    out.questionario.miglioreOvunque = await misura(true);
    out.questionario.peggioreOvunque = await misura(false);
    console.log("C) /audit-questionnaire:", JSON.stringify(out.questionario, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
