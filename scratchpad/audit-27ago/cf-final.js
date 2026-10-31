const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://getcardforge.dev/");
    await tab.waitFor("document.querySelector('#cardforge-title')", 30000);
    await tab.waitFor("(function(){var e=document.querySelector('#cardforge-title');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.typeInto("#cardforge-title", "Zero-Trust QA 28 ago");
    await tab.typeInto("#cardforge-subtitle", "collaudo motore CardForge");
    await tab.waitFor("false", 7000);
    const r = await tab.eval(`(async function(){
      // l'anteprima e' la PRIMA immagine /api/demo della pagina
      var i = Array.from(document.querySelectorAll('img')).filter(function(x){return x.src.indexOf('/api/demo')!==-1;})[0];
      if (!i) return null;
      var u = decodeURIComponent(i.src);
      var res = await fetch(i.src);
      var blob = await res.blob();
      return {
        urlAnteprima: u.slice(u.indexOf('?'), u.indexOf('?') + 130),
        titoloNellUrl: u.indexOf('Zero-Trust QA 28 ago') !== -1,
        sottotitoloNellUrl: u.indexOf('collaudo motore CardForge') !== -1,
        larghezza: i.naturalWidth, altezza: i.naturalHeight,
        status: res.status, tipo: res.headers.get('content-type'), byte: blob.size
      };
    })()`);
    console.log(JSON.stringify(r, null, 1));
    await tab.screenshot(__dirname + "/cf-engine.png");
  } finally { tab.close(); await disposeContext(h); }
})();
