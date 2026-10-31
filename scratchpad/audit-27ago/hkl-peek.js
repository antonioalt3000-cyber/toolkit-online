const { newCleanTab, disposeContext, connect } = require("./cdp");
const MARK = "zt-peek-" + Date.now();
const EXTRACT = `(function(){var t=document.body.innerText,from=0;while(true){var i=t.indexOf('api/h/',from);if(i===-1)return null;var id='';for(var k=i+6;k<t.length;k++){var c=t.charAt(k);if((c>='a'&&c<='z')||(c>='0'&&c<='9')){id+=c;}else{break;}}if(id.length>=6)return id;from=i+6;}})()`;
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    const net = [];
    tab.ws.on("message", (raw) => { try { const m=JSON.parse(raw.toString());
      if (m.method==="Network.responseReceived" && m.params.response.url.indexOf("/api/")!==-1)
        net.push(m.params.response.status+" "+m.params.response.url.replace("https://gethooklab.dev",""));
    } catch(e){} });
    await tab.goto("https://gethooklab.dev/");
    await tab.waitFor("Array.from(document.querySelectorAll('button')).some(function(b){return b.innerText.indexOf('Create test endpoint')!==-1;})", 30000);
    await tab.waitFor("(function(){var b=document.querySelector('button');return b&&Object.keys(b).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.indexOf('Create test endpoint')!==-1;});b.click();return true;})()");
    await tab.waitFor(EXTRACT + " !== null", 60000);
    const id = await tab.eval(EXTRACT);
    console.log("id endpoint:", id);
    const r = await tab.eval(`(async function(){
      var post = await fetch('/api/h/${'${id}'.replace('${id}', id)}', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({marcatore:${JSON.stringify(MARK)}})});
      var ps = post.status;
      await new Promise(function(r){setTimeout(r,2500);});
      var peek = await fetch('/api/h/${id}/peek');
      var body = await peek.text();
      return { postStatus: ps, peekStatus: peek.status, peekLen: body.length, contieneMarcatore: body.indexOf(${JSON.stringify(MARK)}) !== -1, estratto: body.slice(0,260) };
    })()`);
    console.log(JSON.stringify(r, null, 1));
    await tab.waitFor("false", 6000);
    console.log("rete osservata (ultime):", JSON.stringify(net.slice(-8)));
  } finally { tab.close(); await disposeContext(h); }
})();
