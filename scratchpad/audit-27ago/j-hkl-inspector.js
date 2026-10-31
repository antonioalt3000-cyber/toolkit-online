const { newCleanTab, disposeContext, connect } = require("./cdp");
const MARK = "zerotrust-" + Date.now();
const EXTRACT = `(function(){var t=document.body.innerText,from=0;while(true){var i=t.indexOf('api/h/',from);if(i===-1)return null;var id='';for(var k=i+6;k<t.length;k++){var c=t.charAt(k);if((c>='a'&&c<='z')||(c>='0'&&c<='9')){id+=c;}else{break;}}if(id.length>=6)return id;from=i+6;}})()`;
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  const out = { marcatore: MARK };
  try {
    const peeks = [];
    tab.ws.on("message", (raw) => { try { const m=JSON.parse(raw.toString());
      if (m.method==="Network.requestWillBeSent" && m.params.request.url.indexOf("/peek")!==-1) peeks.push(1);
    } catch(e){} });
    await tab.goto("https://gethooklab.dev/");
    await tab.waitFor("Array.from(document.querySelectorAll('button')).some(function(b){return b.innerText.indexOf('Create test endpoint')!==-1;})", 30000);
    await tab.waitFor("(function(){var b=document.querySelector('button');return b&&Object.keys(b).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.indexOf('Create test endpoint')!==-1;});b.click();return true;})()");
    await tab.waitFor(EXTRACT + " !== null", 60000);
    const id = await tab.eval(EXTRACT);
    out.endpoint = id;
    // il percorso che il prodotto indica: il bottone "Open live inspector"
    await tab.eval("(function(){var a=Array.from(document.querySelectorAll('a')).find(function(x){return x.innerText.indexOf('Open live inspector')!==-1;});if(!a)return false;a.click();return true;})()");
    out.inspectorAperto = await tab.waitFor("location.pathname.indexOf('/inspect/') === 0", 25000);
    await tab.waitFor("document.body.innerText.length > 250", 20000);
    peeks.length = 0;
    // invio la richiesta MENTRE l'inspector e' aperto
    await tab.eval(`fetch('/api/h/${id}', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({marcatore:'${MARK}', origine:'zero-trust QA'})})`);
    // La riga compare da sola (polling); il CORPO e' dietro un espansore.
    out.rigaCompare = await tab.waitFor("document.body.innerText.indexOf('POST') !== -1 && document.querySelectorAll('button').length > 3", 30000);
    out.sondaggiOsservati = peeks.length;
    // Clicco il BOTTONE, non un DIV antenato: e' la trappola gia' annotata.
    out.espanso = await tab.eval(`(function(){
      var bs = Array.from(document.querySelectorAll('button'));
      var b = bs.find(function(x){ var s = x.innerText.toLowerCase(); return s.indexOf('post') !== -1 || s.indexOf('expand') !== -1 || s.indexOf('body') !== -1; });
      if (!b) return false; b.click(); return true;
    })()`);
    out.corpoVisibile = await tab.waitFor("document.body.innerText.indexOf('" + MARK + "') !== -1", 25000);
    out.estratto = await tab.eval("(function(){var t=document.body.innerText,i=t.indexOf('" + MARK + "');if(i===-1)return null;return t.slice(Math.max(0,i-140),i+60).split(String.fromCharCode(10)).join(' | ');})()");
    out.consoleErrors = tab.consoleErrors.filter(function(e){return !/418|hydrat/i.test(e);}).slice(0,2);
    await tab.screenshot(__dirname + "/hkl-inspector.png");
  } catch (e) { out.errore = e.message; }
  finally { tab.close(); await disposeContext(h); }
  console.log(JSON.stringify(out, null, 1));
})();
