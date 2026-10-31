const { newCleanTab, disposeContext, connect } = require("./cdp");
const MARK = "zerotrust-" + Date.now();
const EXTRACT = `(function(){var t=document.body.innerText,from=0;while(true){var i=t.indexOf('api/h/',from);if(i===-1)return null;var id='';for(var k=i+6;k<t.length;k++){var c=t.charAt(k);if((c>='a'&&c<='z')||(c>='0'&&c<='9')){id+=c;}else{break;}}if(id.length>=6)return id;from=i+6;}})()`;
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://gethooklab.dev/");
    await tab.waitFor("Array.from(document.querySelectorAll('button')).some(function(b){return b.innerText.indexOf('Create test endpoint')!==-1;})", 30000);
    await tab.waitFor("(function(){var b=document.querySelector('button');return b&&Object.keys(b).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.indexOf('Create test endpoint')!==-1;});b.click();return true;})()");
    await tab.waitFor(EXTRACT + " !== null", 60000);
    const id = await tab.eval(EXTRACT);
    // POST PRIMA di aprire l'inspector: cosi' la cattura c'e' gia' al caricamento
    const st = await tab.eval(`(async function(){var r=await fetch('/api/h/${id}',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({marcatore:'${MARK}',origine:'zero-trust'})});return r.status;})()`);
    console.log("endpoint:", id, "| POST:", st, "| marcatore:", MARK);
    await tab.goto("https://gethooklab.dev/inspect/" + id);
    await tab.waitFor("document.body.innerText.length > 400", 25000);
    await tab.waitFor("false", 6000);
    const txt = await tab.eval("document.body.innerText");
    console.log("\n--- marcatore presente subito:", txt.indexOf(MARK) !== -1);
    // provo ad espandere OGNI bottone della lista e riguardo
    const n = await tab.eval("(function(){var bs=Array.from(document.querySelectorAll('button'));var c=0;bs.forEach(function(b){var s=b.innerText.toLowerCase();if(s.indexOf('post')!==-1||s.indexOf('req_')!==-1||s.indexOf('view')!==-1||s.indexOf('detail')!==-1){b.click();c++;}});return c;})()");
    await tab.waitFor("false", 4000);
    const txt2 = await tab.eval("document.body.innerText");
    console.log("--- bottoni cliccati:", n, "| marcatore dopo espansione:", txt2.indexOf(MARK) !== -1);
    const i = txt2.indexOf("req_") !== -1 ? txt2.indexOf("req_") : 0;
    console.log("\n--- ESTRATTO PAGINA INSPECTOR ---\n" + txt2.slice(Math.max(0, i - 260), i + 620));
    await tab.screenshot(__dirname + "/hkl-inspector.png");
  } finally { tab.close(); await disposeContext(h); }
})();
