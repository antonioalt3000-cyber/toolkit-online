const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    const net = [];
    tab.ws.on("message", (raw) => { try { const m = JSON.parse(raw.toString());
      if (m.method === "Network.responseReceived" && m.params.response.url.indexOf("/api/") !== -1)
        net.push(m.params.response.status + " " + m.params.response.url.replace("https://gethooklab.dev",""));
    } catch (e) {} });
    await tab.goto("https://gethooklab.dev/");
    await tab.waitFor("Array.from(document.querySelectorAll('button')).some(function(b){return b.innerText.indexOf('Create test endpoint')!==-1;})", 30000);
    await tab.waitFor("(function(){var b=document.querySelector('button');return b&&Object.keys(b).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    const before = await tab.eval("(function(){var t=document.body.innerText;var i=t.indexOf('TRY IT LIVE');return i===-1?null:t.slice(i,i+320);})()");
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.indexOf('Create test endpoint')!==-1;});b.click();return true;})()");
    await tab.waitFor("false", 9000);
    const after = await tab.eval("(function(){var t=document.body.innerText;var i=t.indexOf('TRY IT LIVE');return i===-1?null:t.slice(i,i+320);})()");
    console.log("RETE:", JSON.stringify(net));
    console.log("\nPRIMA:\n" + before);
    console.log("\nDOPO:\n" + after);
    console.log("\nCAMBIATO:", before !== after);
  } finally { tab.close(); await disposeContext(h); }
})();
