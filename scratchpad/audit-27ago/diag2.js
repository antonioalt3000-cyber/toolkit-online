const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
const NLJOIN = "split(String.fromCharCode(10)).join(' | ')";
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    // N3: due input diversi, leggo la REGIONE DEL RISULTATO
    for (const [etichetta, righe] of [
      ["nudo", []],
      ["forte", ["strict-transport-security: max-age=63072000; includeSubDomains; preload","content-security-policy: default-src 'self'","x-content-type-options: nosniff","x-frame-options: DENY","referrer-policy: no-referrer","permissions-policy: camera=()"]],
    ]) {
      await tab.goto("https://headershield.dev/simulate");
      await tab.waitFor("document.querySelector('#sim-headers')", 30000);
      await tab.waitFor(idr("#sim-headers"), 40000, 400);
      if (righe.length) await tab.eval(`(function(){
        var e=document.getElementById('sim-headers');
        var S=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
        S.call(e, ${JSON.stringify(righe)}.join(String.fromCharCode(10)));
        e.dispatchEvent(new Event('input',{bubbles:true})); return true;
      })()`);
      await tab.eval(`(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Grade these headers';});b.click();return true;})()`);
      await tab.waitFor("false", 4000);
      const r = await tab.eval(`(function(){
        var t=document.body.innerText; var i=t.indexOf('Res');
        var j=t.indexOf('It runs the same engine');
        var dopo = j===-1 ? t : t.slice(j+40);
        return dopo.slice(0,300).${NLJOIN};
      })()`);
      console.log("N3 [" + etichetta + "]:", r);
    }
    // N5: cosa contiene la galleria
    await tab.goto("https://getcardforge.dev/gallery");
    await tab.waitFor("document.body.innerText.length > 300", 30000);
    await tab.waitFor("false", 5000);
    const g = await tab.eval(`(function(){
      return {
        immagini: document.querySelectorAll('img').length,
        picture: document.querySelectorAll('picture').length,
        sfondi: Array.from(document.querySelectorAll('*')).filter(function(e){var b=getComputedStyle(e).backgroundImage;return b&&b.indexOf('url(')!==-1;}).length,
        link: Array.from(document.querySelectorAll('a[href*="/c/"], a[href*="api"]')).length,
        testo: document.body.innerText.slice(0,400).${NLJOIN}
      };
    })()`);
    console.log("N5 gallery:", JSON.stringify(g, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
