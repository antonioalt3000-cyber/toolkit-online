const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  const out = {};
  try {
    await tab.goto("https://fixmyweb.dev/bulk");
    await tab.waitFor("document.querySelector('#bulk-urls')", 30000);
    await tab.waitFor(idr("#bulk-urls"), 40000, 400);

    out.testoIniziale = await tab.eval("(function(){var p=Array.from(document.querySelectorAll('p,label')).map(function(e){return e.innerText;}).join(' | ');return p.indexOf('up to 10 URLs')!==-1;})()");

    // 25 URL distinti + 2 duplicati
    const righe = [];
    for (let i = 0; i < 25; i++) righe.push("https://sito-" + i + ".example");
    righe.push("https://sito-0.example", "https://sito-1.example");
    await tab.eval(`(function(){
      var S=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
      var e=document.getElementById('bulk-urls');
      S.call(e, ${JSON.stringify(righe.join("\n"))});
      e.dispatchEvent(new Event('input',{bubbles:true}));
      return true;
    })()`);
    await new Promise(r => setTimeout(r, 900));

    out.avviso = await tab.eval(`(function(){
      var n=Array.from(document.querySelectorAll('p,div,span')).map(function(e){return e.innerText||'';}).find(function(t){return t.indexOf('will not be scanned')!==-1;});
      return n ? n.replace(/\s+/g,' ').trim().slice(0,220) : null;
    })()`);
    out.conteggioRilevato = await tab.eval("(function(){var s=Array.from(document.querySelectorAll('span')).map(function(e){return e.innerText||'';}).find(function(t){return t.indexOf('detected')!==-1;});return s?s.replace(/\s+/g,' ').trim():null;})()");
    out.ruoloStatus = await tab.eval("!!document.querySelector('[role=status]')");

    // Sotto il limite: nessun avviso
    await tab.eval(`(function(){
      var S=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
      var e=document.getElementById('bulk-urls');
      S.call(e, "https://a.example" + String.fromCharCode(10) + "https://b.example");
      e.dispatchEvent(new Event('input',{bubbles:true}));
      return true;
    })()`);
    await new Promise(r => setTimeout(r, 700));
    out.avvisoSpariscePocheUrl = await tab.eval("(function(){return !Array.from(document.querySelectorAll('p,div,span')).some(function(e){return (e.innerText||'').indexOf('will not be scanned')!==-1;});})()");
    out.conteggioDopo = await tab.eval("(function(){var s=Array.from(document.querySelectorAll('span')).map(function(e){return e.innerText||'';}).find(function(t){return t.indexOf('detected')!==-1;});return s?s.replace(/\s+/g,' ').trim():null;})()");

    console.log(JSON.stringify(out, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
