const { newCleanTab, disposeContext, connect } = require("./cdp");
const MARK = "zerotrust-" + Date.now();
const EXTRACT = `(function(){
  var t = document.body.innerText, from = 0;
  while (true) {
    var i = t.indexOf('api/h/', from);
    if (i === -1) return null;
    var id = '';
    for (var k = i + 6; k < t.length; k++) {
      var c = t.charAt(k);
      if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) { id += c; } else { break; }
    }
    if (id.length >= 6) return 'https://gethooklab.dev/api/h/' + id;
    from = i + 6;
  }
})()`;
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://gethooklab.dev/");
    await tab.waitFor("Array.from(document.querySelectorAll('button')).some(function(b){return b.innerText.indexOf('Create test endpoint')!==-1;})", 30000);
    await tab.waitFor("(function(){var b=document.querySelector('button');return b&&Object.keys(b).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.indexOf('Create test endpoint')!==-1;});b.click();return true;})()");
    await tab.waitFor(EXTRACT + " !== null", 60000);
    const url = await tab.eval(EXTRACT);
    console.log("endpoint:", url);
    const st = await tab.eval(`(async function(){
      var r = await fetch(${JSON.stringify(url)}, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({marcatore: ${JSON.stringify(MARK)}})});
      return r.status;
    })()`);
    console.log("POST:", st, "marcatore:", MARK);
    for (const s of [3, 8, 15, 25]) {
      await tab.waitFor("false", s * 1000 - (s > 3 ? (s === 8 ? 3000 : s === 15 ? 8000 : 15000) : 0));
      const seen = await tab.eval("document.body.innerText.indexOf(" + JSON.stringify(MARK) + ") !== -1");
      const panel = await tab.eval("(function(){var t=document.body.innerText;var i=t.indexOf('TRY IT LIVE');return i===-1?'(nessun pannello)':t.slice(i,i+430);})()");
      console.log(`\n--- dopo ~${s}s  marcatore_visibile=${seen}`);
      if (seen || s === 25) { console.log(panel); break; }
    }
  } finally { tab.close(); await disposeContext(h); }
})();
