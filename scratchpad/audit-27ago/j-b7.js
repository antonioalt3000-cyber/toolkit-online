const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  const out = {};
  try {
    await tab.goto("https://captureapi.dev/playground");
    await tab.waitFor("document.querySelector('#pg-url')", 30000);
    await tab.waitFor("(function(){var e=document.querySelector('#pg-url');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.typeInto("#pg-url", "https://www.wikipedia.org");
    out.url = await tab.eval("document.querySelector('#pg-url').value");
    // preset Mobile 375x812 — poi verifico che i campi lo riflettano
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.indexOf('Mobile')!==-1;});if(b)b.click();return !!b;})()");
    await tab.waitFor("document.querySelector('#pg-width').value === '375'", 8000);
    out.preset = await tab.eval("document.querySelector('#pg-width').value + 'x' + document.querySelector('#pg-height').value");
    // il bottone si chiama "Try It" (non "Run"): lezione gia' in memoria
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.trim()==='Try It';});b.click();return true;})()");
    out.reso = await tab.waitFor("!!document.querySelector('img[src^=\"data:image\"], img[src*=\"captureapi\"], img[src^=\"https://\"][alt*=\"creenshot\"]') || document.body.innerText.toLowerCase().indexOf('error')!==-1", 120000);
    const img = await tab.eval(`(function(){
      var imgs=Array.from(document.querySelectorAll('img'));
      var c=imgs.filter(function(i){return i.naturalWidth>200;}).pop();
      return c ? {w:c.naturalWidth, h:c.naturalHeight, src:c.src.slice(0,60)} : null;
    })()`);
    out.immagine = img;
    out.rapportoCorretto = img ? Math.abs((img.w/img.h) - (375/812)) < 0.05 : null;
    out.consoleErrors = tab.consoleErrors.filter(function(e){return !/418|hydrat/i.test(e);}).slice(0,2);
    await tab.screenshot(__dirname + "/b7-engine.png");
  } catch (e) { out.errore = e.message; }
  finally { tab.close(); await disposeContext(h); }
  console.log(JSON.stringify(out, null, 1));
})();
