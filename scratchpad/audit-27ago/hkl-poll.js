const { newCleanTab, disposeContext, connect } = require("./cdp");
const EXTRACT = `(function(){var t=document.body.innerText,from=0;while(true){var i=t.indexOf('api/h/',from);if(i===-1)return null;var id='';for(var k=i+6;k<t.length;k++){var c=t.charAt(k);if((c>='a'&&c<='z')||(c>='0'&&c<='9')){id+=c;}else{break;}}if(id.length>=6)return id;from=i+6;}})()`;
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    const peeks = [];
    tab.ws.on("message", (raw) => { try { const m=JSON.parse(raw.toString());
      if (m.method==="Network.requestWillBeSent" && m.params.request.url.indexOf("/peek")!==-1) peeks.push(Date.now());
    } catch(e){} });
    await tab.goto("https://gethooklab.dev/");
    await tab.waitFor("Array.from(document.querySelectorAll('button')).some(function(b){return b.innerText.indexOf('Create test endpoint')!==-1;})", 30000);
    await tab.waitFor("(function(){var b=document.querySelector('button');return b&&Object.keys(b).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.indexOf('Create test endpoint')!==-1;});b.click();return true;})()");
    await tab.waitFor(EXTRACT + " !== null", 60000);
    const t0 = Date.now();
    peeks.length = 0;
    console.log("osservo 18 secondi SENZA fare nulla...");
    await tab.waitFor("false", 18000);
    console.log("  chiamate a /peek partite dalla pagina:", peeks.length, "(attese ~6 se sonda ogni 3s)");
    // ora invio una richiesta e guardo se l'interfaccia la mostra da sola
    const id = await tab.eval(EXTRACT);
    const MARK = "poll-" + Date.now();
    await tab.eval(`fetch('/api/h/${id}', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({marcatore:'${MARK}'})})`);
    const visto = await tab.waitFor("document.body.innerText.indexOf('" + MARK + "') !== -1", 20000);
    console.log("  la pagina mostra la richiesta entro 20s:", visto);
    console.log("  chiamate a /peek totali dopo il POST:", peeks.length);
  } finally { tab.close(); await disposeContext(h); }
})();
