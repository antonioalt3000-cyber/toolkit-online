const { newCleanTab, disposeContext, connect } = require("./cdp");
const V = {
  azienda: "Contoso Nordic AB",
  sito: "https://contoso-nordic.example",
  email: "accessibility@contoso-nordic.example",
  data: "2026-08-30",
  limiti: "Il visualizzatore PDF di terze parti non espone i testi alternativi.",
};
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  const out = {};
  try {
    await tab.goto("https://fixmyweb.dev/statement");
    await tab.waitFor("document.querySelector('#company-name')", 30000);
    await tab.waitFor("(function(){var e=document.querySelector('#company-name');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.eval(`(function(){
      var S=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      var ST=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
      function f(id,v){var e=document.getElementById(id);(e.tagName==='TEXTAREA'?ST:S).call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));}
      f('company-name',${JSON.stringify(V.azienda)});
      f('website-url',${JSON.stringify(V.sito)});
      f('contact-email',${JSON.stringify(V.email)});
      f('audit-date',${JSON.stringify(V.data)});
      f('limitations',${JSON.stringify(V.limiti)});
      var s=document.getElementById('wcag-level');
      s.value='AAA'; s.dispatchEvent(new Event('change',{bubbles:true}));
      return true;
    })()`);
    await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Generate Statement';});b.click();return true;})()`);
    out.generato = await tab.waitFor("Array.from(document.querySelectorAll('pre')).some(function(p){return p.innerText.indexOf('DOCTYPE')!==-1;})", 30000);
    const doc = await tab.eval("(function(){var p=Array.from(document.querySelectorAll('pre')).find(function(x){return x.innerText.indexOf('DOCTYPE')!==-1;});return p?p.innerText:null;})()");
    out.lunghezza = doc ? doc.length : 0;
    out.contiene = {
      azienda: doc.indexOf(V.azienda) !== -1,
      sito: doc.indexOf("contoso-nordic.example") !== -1,
      email: doc.indexOf(V.email) !== -1,
      data: doc.indexOf("2026") !== -1,
      limiti: doc.indexOf("visualizzatore PDF") !== -1,
      livelloAAA: doc.indexOf("AAA") !== -1,
    };
    // un documento che il cliente pubblica non deve contenere segnaposto
    out.segnapostoResidui = ["{{", "}}", "[COMPANY", "[WEBSITE", "[EMAIL", "[DATE", "TODO", "Lorem", "undefined", "null"].filter(function(p){ return doc.indexOf(p) !== -1; });
    out.htmlBenFormato = doc.indexOf("<!DOCTYPE html>") === 0 && doc.trim().endsWith("</html>");
    out.estrattoConformita = (function(){ var i = doc.indexOf("AAA"); return i === -1 ? null : doc.slice(Math.max(0,i-160), i+120).replace(/\n+/g," | "); })();
    out.consoleErrors = tab.consoleErrors.filter(function(e){return !/418|hydrat/i.test(e);}).slice(0,2);
    await tab.screenshot(__dirname + "/f2-statement.png");
  } catch (e) { out.errore = e.message; }
  finally { tab.close(); await disposeContext(h); }
  console.log(JSON.stringify(out, null, 1));
})();
