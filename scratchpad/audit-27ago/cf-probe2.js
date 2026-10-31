const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    const net = [];
    tab.ws.on("message", (raw) => { try { const m=JSON.parse(raw.toString());
      if (m.method==="Network.responseReceived" && m.params.response.url.indexOf("getcardforge.dev")!==-1 && m.params.response.url.indexOf("/api/")!==-1)
        net.push(m.params.response.status + " " + m.params.response.url.replace("https://getcardforge.dev","").slice(0,110));
    } catch(e){} });
    await tab.goto("https://getcardforge.dev/");
    await tab.waitFor("document.querySelector('#cardforge-title')", 30000);
    await tab.waitFor("(function(){var e=document.querySelector('#cardforge-title');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    net.length = 0;
    await tab.typeInto("#cardforge-title", "Zero-Trust QA");
    await tab.waitFor("false", 7000);
    const r = await tab.eval(`(function(){
      return {
        immagini: Array.from(document.querySelectorAll('img')).map(function(i){return i.src.slice(0,110);}).slice(0,6),
        canvas: document.querySelectorAll('canvas').length,
        svg: document.querySelectorAll('svg').length,
        bg: Array.from(document.querySelectorAll('*')).map(function(e){var b=getComputedStyle(e).backgroundImage;return b&&b!=='none'?b.slice(0,110):null;}).filter(Boolean).slice(0,4),
        bottoni: Array.from(document.querySelectorAll('button')).map(function(b){return b.innerText.trim().slice(0,22);}).filter(Boolean).slice(0,12)
      };
    })()`);
    console.log("RETE dopo la digitazione:", JSON.stringify(net.slice(0,6), null, 1));
    console.log(JSON.stringify(r, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})();
