const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://getcardforge.dev/");
    await tab.waitFor("document.querySelector('#cardforge-title')", 30000);
    await tab.waitFor("(function(){var e=document.querySelector('#cardforge-title');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    const r = await tab.eval(`(function(){
      var el = document.querySelector('#cardforge-title');
      var rect = el.getBoundingClientRect();
      var anc = [], p = el.parentElement, n = 0;
      while (p && n < 6) {
        var cs = getComputedStyle(p);
        anc.push(p.tagName + '[' + (p.className||'').toString().slice(0,26) + '] display=' + cs.display + ' vis=' + cs.visibility + ' h=' + Math.round(p.getBoundingClientRect().height));
        p = p.parentElement; n++;
      }
      return { rect: {w:Math.round(rect.width), h:Math.round(rect.height), top:Math.round(rect.top)}, antenati: anc,
               tabs: Array.from(document.querySelectorAll('[role=tab], button')).map(function(b){return b.innerText.trim().slice(0,24);}).filter(Boolean).slice(0,14) };
    })()`);
    console.log(JSON.stringify(r, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})();
