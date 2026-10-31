const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    const net = [];
    tab.ws.on("message", (raw) => { try { const m=JSON.parse(raw.toString());
      if (m.method==="Network.responseReceived" && m.params.response.url.indexOf("/api/")!==-1)
        net.push(m.params.response.status+" "+m.params.response.url.replace("https://fixmyweb.dev",""));
    } catch(e){} });
    await tab.goto("https://fixmyweb.dev/statement");
    await tab.waitFor("document.querySelector('#company-name')", 30000);
    await tab.waitFor("(function(){var e=document.querySelector('#company-name');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    // compilo TUTTO col setter nativo: e' cio' che React riconosce, e non dipende dalle coordinate
    const set = await tab.eval(`(function(){
      var S = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      var ST = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
      function fill(id,v){ var e=document.getElementById(id); if(!e) return 'ASSENTE';
        (e.tagName==='TEXTAREA'?ST:S).call(e,v); e.dispatchEvent(new Event('input',{bubbles:true})); return e.value; }
      return {
        azienda: fill('company-name','Contoso Nordic AB'),
        sito: fill('website-url','https://contoso-nordic.example'),
        email: fill('contact-email','accessibility@contoso-nordic.example'),
        data: fill('audit-date','2026-08-30'),
        limiti: fill('limitations','Il visualizzatore PDF di terze parti non espone i testi alternativi.')
      };
    })()`);
    console.log("CAMPI:", JSON.stringify(set));
    await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Generate Statement';});b.click();return true;})()`);
    await tab.waitFor("false", 5000);
    const out = await tab.eval(`(function(){
      var ta = Array.from(document.querySelectorAll('textarea')).map(function(t){return {id:t.id, lunghezza:(t.value||'').length, inizio:(t.value||'').slice(0,120)};});
      var pre = Array.from(document.querySelectorAll('pre,code')).map(function(p){return {lunghezza:p.innerText.length, inizio:p.innerText.slice(0,120)};});
      return { textarea: ta, pre: pre, contieneContosoInnerText: document.body.innerText.indexOf('Contoso')!==-1,
               bottoniOra: Array.from(document.querySelectorAll('button')).map(function(b){return b.innerText.trim().slice(0,24);}).filter(Boolean) };
    })()`);
    console.log("OUTPUT:", JSON.stringify(out, null, 1));
    console.log("RETE:", JSON.stringify(net));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
