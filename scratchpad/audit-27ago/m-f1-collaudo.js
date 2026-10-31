const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
const clickTesto = (t) => `(function(){var el=Array.from(document.querySelectorAll('button,a')).find(function(b){return (b.innerText||'').trim().indexOf(${JSON.stringify(t)})!==-1;});if(!el)return false;el.click();return true;})()`;
const banner = `(function(){var el=Array.from(document.querySelectorAll('button')).find(function(b){return (b.innerText||'').trim()==='Essential Only';});if(el){el.click();return 'chiuso';}return 'assente';})()`;

(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  const out = {};
  try {
    // ---- /risk-assessment ----
    await tab.goto("https://complipilot.dev/risk-assessment");
    await tab.waitFor("!!document.querySelector('#ra-purpose-chatbot')", 30000);
    await tab.waitFor(idr("#ra-purpose-chatbot"), 40000, 400);
    out.cookie = await tab.eval(banner);
    await new Promise((r) => setTimeout(r, 400));
    const SCELTE = ["ra-purpose-chatbot","ra-impact-moderate","ra-autonomy-assisted","ra-data-behavioral","ra-sector-marketing","ra-transparency-limited"];
    out.selezioni = await tab.eval(`(function(){
      var ids = ${JSON.stringify(SCELTE)};
      return ids.map(function(id){ var e=document.getElementById(id); if(!e) return {id:id, trovato:false}; e.click(); return {id:id, trovato:true, selezionato:e.checked}; });
    })()`);
    await new Promise((r) => setTimeout(r, 500));
    out.classificazione = await tab.eval(clickTesto("Get Risk Classification"));
    await new Promise((r) => setTimeout(r, 1500));
    out.verdetto = await tab.eval(`(function(){
      var t = document.body.innerText;
      var liv = ['Unacceptable Risk','High Risk','Limited Risk','Minimal Risk'].filter(function(l){ return t.indexOf(l) !== -1; });
      var i = t.indexOf('Deadline');
      var riga = i === -1 ? null : t.slice(i, i + 200).split(String.fromCharCode(10)).filter(Boolean).slice(0,2).join(' >> ');
      return { livelli: liv, scadenza: riga };
    })()`);

    // ---- /audit-questionnaire ----
    await tab.goto("https://complipilot.dev/audit-questionnaire");
    await tab.waitFor("document.querySelectorAll('div.grid.gap-2 > button').length > 0", 30000);
    await tab.waitFor(idr("div.grid.gap-2 > button"), 40000, 400);
    await tab.eval(banner);
    const misura = async (primo) => {
      const n = await tab.eval("(function(){var n=0;Array.from(document.querySelectorAll('div.grid.gap-2')).forEach(function(g){var b=Array.from(g.children).filter(function(c){return c.tagName==='BUTTON';});if(b.length){(" + (primo ? "b[0]" : "b[b.length-1]") + ").click();n++;}});return n;})()");
      await new Promise((r) => setTimeout(r, 600));
      await tab.eval(clickTesto("View Results"));
      await tab.waitFor("document.body.innerText.indexOf('Combined Compliance Score') !== -1", 15000);
      const p = await tab.eval("(function(){var t=document.body.innerText;var i=t.indexOf('Combined Compliance Score');var m=t.slice(i,i+90).match(new RegExp('[0-9]+'));return m?Number(m[0]):null;})()");
      await tab.eval(clickTesto("Retake Assessment"));
      await new Promise((r) => setTimeout(r, 800));
      return { domandeRisposte: n, punteggio: p };
    };
    out.questionario = { migliore: await misura(true), peggiore: await misura(false) };
    console.log(JSON.stringify(out, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
