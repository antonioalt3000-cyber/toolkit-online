const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://fixmyweb.dev/statement");
    await tab.waitFor("document.querySelector('#company-name')", 30000);
    await tab.waitFor("(function(){var e=document.querySelector('#company-name');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.typeInto("#company-name", "Contoso Nordic AB");
    await tab.typeInto("#website-url", "https://contoso-nordic.example");
    await tab.typeInto("#contact-email", "accessibility@contoso-nordic.example");
    const stato = await tab.eval(`(function(){
      var ids=['company-name','website-url','wcag-level','audit-date','contact-email','limitations'];
      var o={};
      ids.forEach(function(id){ var e=document.getElementById(id); o[id]= e? {valore:e.value, obbligatorio:!!e.required} : 'ASSENTE'; });
      var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Generate Statement';});
      o.bottone={ trovato:!!b, disabilitato: b? b.disabled : null };
      return o;
    })()`);
    console.log("PRIMA DEL CLIC:", JSON.stringify(stato, null, 1));
    await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Generate Statement';});b.click();return true;})()`);
    await tab.waitFor("false", 4000);
    const dopo = await tab.eval(`(function(){
      var t=document.body.innerText;
      return {
        lunghezza: t.length,
        contieneContoso: t.indexOf('Contoso') !== -1,
        messaggiNativi: Array.from(document.querySelectorAll('input,select,textarea')).map(function(e){return e.validationMessage;}).filter(Boolean),
        coda: t.slice(-500)
      };
    })()`);
    console.log("DOPO IL CLIC:", JSON.stringify(dopo, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
