const { newCleanTab, disposeContext, connect } = require("./cdp");
const idr = (s) => `(function(){var e=document.querySelector(${JSON.stringify(s)});return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()`;
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://complipilot.dev/risk-assessment");
    await tab.waitFor("document.querySelectorAll('button').length > 2", 30000);
    await tab.waitFor(idr("button"), 40000, 400);
    const stato = await tab.eval(`(function(){
      var b = Array.from(document.querySelectorAll('button')).map(function(x){ return (x.innerText||'').trim().slice(0,60); }).filter(Boolean);
      return { bottoni: b, testataVisibile: document.body.innerText.slice(0, 300).split(String.fromCharCode(10)).filter(Boolean).slice(0,6) };
    })()`);
    console.log(JSON.stringify(stato, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
