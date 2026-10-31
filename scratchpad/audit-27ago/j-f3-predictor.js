const { newCleanTab, disposeContext, connect } = require("./cdp");

/**
 * Il questionario e' a 5 domande, una schermata per volta.
 * `pos` = indice dell'opzione da scegliere (0 = migliore, 3 = peggiore).
 * Attesi, calcolati dal codice: tutte le ultime -> 420/5 = 84 critical, 15%.
 *                               tutte le prime  ->  30/5 =  6 low,       1%.
 */
async function esegui(tab, pos) {
  await tab.goto("https://paymentrescue.dev/tools/churn-predictor");
  await tab.waitFor("document.body.innerText.indexOf('payments fail each month') !== -1", 30000);
  await tab.waitFor("(function(){var b=document.querySelector('button');return b&&Object.keys(b).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
  const scelte = [];
  for (let d = 0; d < 5; d++) {
    // le opzioni sono i bottoni che NON sono navigazione
    // Delimitato al riquadro della domanda: prendendo tutti i <button> della
    // pagina si pescano il toggle del tema e il banner cookie, non le opzioni.
    const opts = await tab.eval(`(function(){
      var h = Array.from(document.querySelectorAll('h2')).find(function(e){ return e.innerText.trim().length > 10; });
      var cont = h;
      for (var i = 0; i < 5 && cont; i++) {
        if (cont.querySelectorAll('button').length >= 4) break;
        cont = cont.parentElement;
      }
      if (!cont) return [];
      var skip = ['previous','start over','next','back'];
      return Array.from(cont.querySelectorAll('button'))
        .filter(function(b){ var t=b.innerText.trim().toLowerCase(); return t && skip.indexOf(t)===-1; })
        .map(function(b){ return b.innerText.trim(); });
    })()`);
    if (!opts || opts.length < 2) break;
    const scelta = opts[Math.min(pos, opts.length - 1)];
    scelte.push(scelta);
    await tab.eval(`(function(){
      var t = ${JSON.stringify(scelta)};
      var h = Array.from(document.querySelectorAll('h2')).find(function(e){ return e.innerText.trim().length > 10; });
      var cont = h;
      for (var i = 0; i < 5 && cont; i++) {
        if (cont.querySelectorAll('button').length >= 4) break;
        cont = cont.parentElement;
      }
      var b = Array.from(cont.querySelectorAll('button')).find(function(x){ return x.innerText.trim() === t; });
      b.click(); return true;
    })()`);
    await tab.waitFor("false", 900);
  }
  await tab.waitFor("document.body.innerText.indexOf('Risk Score') !== -1 || document.body.indexOf === undefined || document.body.innerText.indexOf('/100') !== -1", 25000);
  const txt = await tab.text();
  const num = (etichetta) => {
    const i = txt.indexOf(etichetta);
    if (i === -1) return null;
    const m = txt.slice(i, i + 90).match(/(\d+)/);
    return m ? Number(m[1]) : null;
  };
  return {
    scelte,
    schermo: txt.slice(txt.indexOf("Churn Risk"), txt.indexOf("Churn Risk") + 420).replace(/\n+/g, " | "),
    punteggio: num("Risk Score"),
  };
}

(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    for (const [etichetta, pos, attesoScore, attesoLivello, attesoChurn] of [
      ["PEGGIORE", 3, 84, "critical", 15],
      ["MIGLIORE", 0, 6, "low", 1],
    ]) {
      const r = await esegui(tab, pos);
      console.log(`\n=== ${etichetta} (atteso: score ${attesoScore}, ${attesoLivello}, churn ${attesoChurn}%)`);
      console.log("  scelte:", JSON.stringify(r.scelte));
      console.log("  punteggio letto:", r.punteggio, r.punteggio === attesoScore ? "✅" : "🔴 ATTESO " + attesoScore);
      console.log("  schermo:", r.schermo.slice(0, 300));
    }
    await tab.screenshot(__dirname + "/f3-predictor.png");
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
