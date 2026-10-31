const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
const clickTesto = (t) => `(function(){var el=Array.from(document.querySelectorAll('button,a')).find(function(b){return (b.innerText||'').trim().indexOf(${JSON.stringify(t)})!==-1;});if(!el)return false;el.click();return true;})()`;
const banner = `(function(){var el=Array.from(document.querySelectorAll('button')).find(function(b){return (b.innerText||'').trim()==='Essential Only';});if(el){el.click();return 'chiuso';}return 'assente';})()`;

(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  const out = {};
  try {
    // ===== F1 /risk-assessment =====
    await tab.goto("https://complipilot.dev/risk-assessment");
    await tab.waitFor("!!document.querySelector('#ra-purpose-chatbot')", 30000);
    await tab.waitFor(idr("#ra-purpose-chatbot"), 40000, 400);
    await tab.eval(banner);
    await tab.eval(`(function(){["ra-purpose-chatbot","ra-impact-moderate","ra-autonomy-assisted","ra-data-behavioral","ra-sector-marketing","ra-transparency-limited"].forEach(function(id){var e=document.getElementById(id);if(e)e.click();});return true;})()`);
    await new Promise((r) => setTimeout(r, 500));
    await tab.eval(clickTesto("Get Risk Classification"));
    await new Promise((r) => setTimeout(r, 1500));
    out.f1_riskAssessment = await tab.eval(`(function(){
      var t=document.body.innerText; var i=t.indexOf('Deadline');
      var riga = i===-1?null:t.slice(i,i+220).split(String.fromCharCode(10)).filter(Boolean).slice(0,2).join(' >> ');
      return { livello: ['Unacceptable Risk','High Risk','Limited Risk','Minimal Risk'].filter(function(l){return t.indexOf(l)!==-1;}),
               scadenza: riga, contiene2025: /August 2, 2025/.test(t) };
    })()`);

    // ===== F1 /document-generator =====
    await tab.goto("https://complipilot.dev/document-generator");
    await tab.waitFor("document.body.innerText.indexOf('Compliance Document Generator') !== -1", 30000);
    out.f1_documentGenerator = await tab.eval(`(function(){
      var t = document.body.innerText;
      return {
        fantasmi: ['Article 11','Article 12','ROPA','Record of Processing','DOCX'].filter(function(f){ return t.indexOf(f) !== -1; }),
        elencaDaCatalogo: ['Privacy Policy','Cookie Policy','AI Disclosure Statement','DPIA Template','Article 9','Annex V'].filter(function(f){ return t.indexOf(f) !== -1; }),
        formati: ['plain text','Markdown'].filter(function(f){ return t.indexOf(f) !== -1; })
      };
    })()`);

    // ===== F2 /vpat =====
    await tab.goto("https://fixmyweb.dev/vpat");
    await tab.waitFor("!!document.querySelector('#wcag-version')", 30000);
    await tab.waitFor(idr("#wcag-version"), 40000, 400);
    const conta = () => tab.eval("({ criteri: document.querySelectorAll('select[aria-label^=\"Conformance level\"]').length, tutteLeSelect: document.querySelectorAll('select').length })");
    out.f2_vpat = { versionePredefinita: await tab.eval("document.getElementById('wcag-version').value"), conteggio21: await conta() };

    const impostaVersione = (v) => tab.eval(`(function(){
      var s=document.getElementById('wcag-version');
      var S=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set;
      S.call(s, ${JSON.stringify(v)}); s.dispatchEvent(new Event('change',{bubbles:true})); return s.value;
    })()`);
    await impostaVersione("2.2");
    await new Promise((r) => setTimeout(r, 700));
    out.f2_vpat.conteggio22 = await conta();

    // risposta su un criterio che esiste solo in 2.2, poi andata e ritorno
    const setCrit = (crit, val) => tab.eval(`(function(){
      var s=document.querySelector('select[aria-label*="' + ${JSON.stringify(crit)} + '"]');
      if(!s) return 'assente';
      var S=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set;
      S.call(s, ${JSON.stringify(val)}); s.dispatchEvent(new Event('change',{bubbles:true})); return s.value;
    })()`);
    out.f2_vpat.impostato258 = await setCrit("2.5.8", "Partially Supports");
    await impostaVersione("2.1");
    await new Promise((r) => setTimeout(r, 700));
    out.f2_vpat.in21_il258 = await tab.eval(`(function(){return document.querySelector('select[aria-label*="2.5.8"]') ? 'presente' : 'assente';})()`);
    out.f2_vpat.in21_il411 = await tab.eval(`(function(){return document.querySelector('select[aria-label*="4.1.1"]') ? 'presente' : 'assente';})()`);
    await impostaVersione("2.2");
    await new Promise((r) => setTimeout(r, 700));
    out.f2_vpat.dopoAndataERitorno258 = await tab.eval(`(function(){var s=document.querySelector('select[aria-label*="2.5.8"]');return s? s.value : 'assente';})()`);
    out.f2_vpat.in22_il411 = await tab.eval(`(function(){return document.querySelector('select[aria-label*="4.1.1"]') ? 'presente' : 'assente';})()`);

    // documento generato in 2.2
    await tab.eval(`(function(){
      var S=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      function f(id,v){var e=document.getElementById(id);S.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));}
      f('product-name','Contoso Portal'); f('company-name','Contoso Nordic AB'); return true;
    })()`);
    await tab.eval(clickTesto("Generate VPAT"));
    await tab.waitFor("Array.from(document.querySelectorAll('pre')).some(function(p){return p.innerText.indexOf('DOCTYPE')!==-1;})", 20000);
    out.f2_vpat.intestazioneDocumento = await tab.eval(`(function(){
      var p=Array.from(document.querySelectorAll('pre')).find(function(x){return x.innerText.indexOf('DOCTYPE')!==-1;});
      var d=p.innerText;
      var v22 = d.indexOf("WCAG 2.2 Conformance Report") !== -1;
      var v21 = d.indexOf("WCAG 2.1 Conformance Report") !== -1;
      var s22 = d.indexOf("Standard:</strong> WCAG 2.2 Level AA") !== -1;
      var s21 = d.indexOf("Standard:</strong> WCAG 2.1 Level AA") !== -1;
      return { titolo22: v22, titolo21: v21, standard22: s22, standard21: s21 };
    })()`);
    console.log(JSON.stringify(out, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
