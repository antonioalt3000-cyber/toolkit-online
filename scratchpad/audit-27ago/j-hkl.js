const { newCleanTab, disposeContext, connect } = require("./cdp");
const MARK = "zerotrust-" + Date.now();

/**
 * Estrae l'endpoint VERO: 'api/h/' seguito da un id alfanumerico.
 * La hero della pagina contiene 'api/h/<id>' come testo promozionale, quindi
 * cercare 'api/h/' e basta e' un falso positivo garantito.
 */
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
  const out = { marcatore: MARK };
  try {
    await tab.goto("https://gethooklab.dev/");
    await tab.waitFor("Array.from(document.querySelectorAll('button')).some(function(b){return b.innerText.indexOf('Create test endpoint')!==-1;})", 30000);
    await tab.waitFor("(function(){var b=document.querySelector('button');return b&&Object.keys(b).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    out.primaDelClic = await tab.eval(EXTRACT);   // controllo negativo: deve essere null
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.indexOf('Create test endpoint')!==-1;});b.click();return true;})()");
    out.creato = await tab.waitFor(EXTRACT + " !== null", 60000);
    const url = await tab.eval(EXTRACT);
    out.endpoint = url;
    if (url) {
      out.postStatus = await tab.eval(`(async function(){
        var r = await fetch(${JSON.stringify(url)}, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({marcatore: ${JSON.stringify(MARK)}, origine:'zero-trust QA'})});
        return r.status;
      })()`);
      out.corpoCatturato = await tab.waitFor("document.body.innerText.indexOf(" + JSON.stringify(MARK) + ") !== -1", 45000);
      out.estratto = await tab.eval("(function(){var t=document.body.innerText,i=t.indexOf(" + JSON.stringify(MARK) + ");return i===-1?null:t.slice(Math.max(0,i-120),i+80).replace(/\n+/g,' | ');})()");
    }
    out.consoleErrors = tab.consoleErrors.filter(function(e){return !/418|hydrat/i.test(e);}).slice(0,2);
    await tab.screenshot(__dirname + "/hkl-engine.png");
  } catch (e) { out.errore = e.message; }
  finally { tab.close(); await disposeContext(h); }
  console.log(JSON.stringify(out, null, 1));
})();
