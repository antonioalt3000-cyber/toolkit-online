const { newCleanTab, disposeContext, connect } = require("./cdp");
const TITLE = "Zero-Trust QA 28 ago";
const SUB = "collaudo motore CardForge";
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  const out = {};
  try {
    await tab.goto("https://getcardforge.dev/");
    await tab.waitFor("document.querySelector('#cardforge-title')", 30000);
    await tab.waitFor("(function(){var e=document.querySelector('#cardforge-title');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.typeInto("#cardforge-title", TITLE);
    await tab.typeInto("#cardforge-subtitle", SUB);
    out.titoloDigitato = await tab.eval("document.querySelector('#cardforge-title').value");
    out.sottotitoloDigitato = await tab.eval("document.querySelector('#cardforge-subtitle').value");
    // l'anteprima e' un'immagine servita dall'API con i parametri nell'URL
    out.immagineAggiornata = await tab.waitFor("(function(){var i=Array.from(document.querySelectorAll('img')).find(function(x){return x.src.indexOf('/api/demo')!==-1;});return i && decodeURIComponent(i.src).indexOf('Zero-Trust QA') !== -1;})()", 30000);
    const img = await tab.eval(`(function(){
      var i = Array.from(document.querySelectorAll('img')).find(function(x){ return x.src.indexOf('/api/demo') !== -1; });
      if (!i) return null;
      return { w: i.naturalWidth, h: i.naturalHeight, completa: i.complete, urlContieneTesto: decodeURIComponent(i.src).indexOf('Zero-Trust QA') !== -1 };
    })()`);
    out.immagine = img;
    // e l'immagine risponde davvero 200 con un content-type immagine?
    out.rispostaApi = await tab.eval(`(async function(){
      var i = Array.from(document.querySelectorAll('img')).find(function(x){ return x.src.indexOf('/api/demo') !== -1; });
      if (!i) return null;
      var r = await fetch(i.src);
      return { status: r.status, tipo: r.headers.get('content-type'), byte: (await r.blob()).size };
    })()`);
    out.consoleErrors = tab.consoleErrors.filter(function(e){return !/418|hydrat/i.test(e);}).slice(0,2);
    await tab.screenshot(__dirname + "/cf-engine.png");
  } catch (e) { out.errore = e.message; }
  finally { tab.close(); await disposeContext(h); }
  console.log(JSON.stringify(out, null, 1));
})();
