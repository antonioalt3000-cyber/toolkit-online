const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    // --- N3: cosa mostra DAVVERO dopo il grading
    await tab.goto("https://headershield.dev/simulate");
    await tab.waitFor("document.querySelector('#sim-headers')", 30000);
    await tab.waitFor(idr("#sim-headers"), 40000, 400);
    const prima = await tab.eval("document.body.innerText.length");
    await tab.eval(`(function(){
      var e=document.getElementById('sim-headers');
      var S=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
      var NL = String.fromCharCode(10);
      S.call(e, ["strict-transport-security: max-age=63072000; includeSubDomains; preload",
                 "content-security-policy: default-src 'self'",
                 "x-content-type-options: nosniff",
                 "x-frame-options: DENY",
                 "referrer-policy: no-referrer",
                 "permissions-policy: camera=()"].join(NL));
      e.dispatchEvent(new Event('input',{bubbles:true})); return e.value.length;
    })()`);
    await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Grade these headers';});b.click();return true;})()`);
    await tab.waitFor("false", 4000);
    const n3 = await tab.eval(`(function(){var t=document.body.innerText;var i=t.indexOf('Grade Simulator');return {crescita: t.length, estratto: t.slice(i, i+420).split(String.fromCharCode(10)).join(' | ')};})()`);
    console.log("=== N3 dopo il grading (testo era " + prima + ")\n " + JSON.stringify(n3, null, 1));

    // --- N2: cosa succede dopo Audit
    await tab.goto("https://seoscope.dev/seo-audit");
    await tab.waitFor("document.querySelector('#audit-demo-url')", 30000);
    await tab.waitFor(idr("#audit-demo-url"), 40000, 400);
    await tab.typeInto("#audit-demo-url", "https://www.mozilla.org");
    await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Audit';});b.click();return true;})()`);
    await tab.waitFor("false", 20000);
    const n2 = await tab.eval(`(function(){var t=document.body.innerText;var i=t.indexOf('Audit a page');return {estratto: t.slice(i, i+480).split(String.fromCharCode(10)).join(' | ')};})()`);
    console.log("=== N2 dopo l'audit\n " + JSON.stringify(n2, null, 1));

    // --- N5: che forma hanno le immagini della galleria
    await tab.goto("https://getcardforge.dev/gallery");
    await tab.waitFor("document.querySelectorAll('img').length > 1", 30000);
    await tab.waitFor("false", 5000);
    const n5 = await tab.eval(`(function(){
      var imgs=Array.from(document.querySelectorAll('img'));
      return { quante: imgs.length, sorgenti: imgs.slice(0,6).map(function(i){return i.src.slice(0,95);}),
               dimensioni: imgs.slice(0,6).map(function(i){return i.naturalWidth+'x'+i.naturalHeight;}) };
    })()`);
    console.log("=== N5 galleria\n " + JSON.stringify(n5, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
