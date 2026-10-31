const { newCleanTab, disposeContext, connect } = require("./cdp");
async function genera(tab, versione) {
  await tab.goto("https://fixmyweb.dev/statement");
  await tab.waitFor("document.querySelector('#wcag-version')", 30000);
  await tab.waitFor("(function(){var e=document.querySelector('#wcag-version');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
  await tab.eval(`(function(){
    var S=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    var ST=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
    function f(id,v){var e=document.getElementById(id);(e.tagName==='TEXTAREA'?ST:S).call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));}
    f('company-name','Contoso Nordic AB');
    f('website-url','https://contoso-nordic.example');
    f('contact-email','accessibility@contoso-nordic.example');
    f('audit-date','2026-08-30');
    var v=document.getElementById('wcag-version'); v.value=${JSON.stringify(versione)}; v.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  })()`);
  await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Generate Statement';});b.click();return true;})()`);
  await tab.waitFor("Array.from(document.querySelectorAll('pre')).some(function(p){return p.innerText.indexOf('DOCTYPE')!==-1;})", 30000);
  return tab.eval("(function(){var p=Array.from(document.querySelectorAll('pre')).find(function(x){return x.innerText.indexOf('DOCTYPE')!==-1;});return p?p.innerText:null;})()");
}
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    for (const v of ["2.2", "2.1"]) {
      const doc = await genera(tab, v);
      const altra = v === "2.2" ? "2.1" : "2.2";
      console.log(JSON.stringify({
        scelta: v,
        conformita: (doc.match(/Guidelines \(WCAG\) [0-9.]+ Level [A]+/) || ["(non trovata)"])[0],
        valutazione: (doc.match(/Evaluation against WCAG [0-9.]+ Level [A]+ criteria/) || ["(non trovata)"])[0],
        nominaLaltraVersione: doc.indexOf("WCAG " + altra) !== -1 || doc.indexOf("(WCAG) " + altra) !== -1,
      }));
    }
    await tab.screenshot(__dirname + "/f2-version.png");
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
