const { newCleanTab, disposeContext, newTab, closeTab, connect } = require("./cdp");
const EXTRACT = `(function(){var t=document.body.innerText,from=0;while(true){var i=t.indexOf('api/h/',from);if(i===-1)return null;var id='';for(var k=i+6;k<t.length;k++){var c=t.charAt(k);if((c>='a'&&c<='z')||(c>='0'&&c<='9')){id+=c;}else{break;}}if(id.length>=6)return id;from=i+6;}})()`;
async function run(label, mk, dispose) {
  const h = await mk("about:blank");
  const tab = await connect(h.id);
  try {
    const peeks = [];
    tab.ws.on("message", (raw) => { try { const m=JSON.parse(raw.toString());
      if (m.method==="Network.requestWillBeSent" && m.params.request.url.indexOf("/peek")!==-1) peeks.push(1);
    } catch(e){} });
    await tab.goto("https://gethooklab.dev/");
    await tab.waitFor("Array.from(document.querySelectorAll('button')).some(function(b){return b.innerText.indexOf('Create test endpoint')!==-1;})", 30000);
    await tab.waitFor("(function(){var b=document.querySelector('button');return b&&Object.keys(b).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    const vis = await tab.eval("document.visibilityState + '/hidden=' + document.hidden");
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.indexOf('Create test endpoint')!==-1;});b.click();return true;})()");
    await tab.waitFor(EXTRACT + " !== null", 60000);
    peeks.length = 0;
    await tab.waitFor("false", 15000);
    console.log(`  ${label}: visibilita'=${vis}  chiamate_peek_in_15s=${peeks.length}`);
  } finally { tab.close(); await dispose(h); }
}
(async () => {
  await run("contesto pulito ", newCleanTab, (h) => disposeContext(h));
  await run("scheda normale  ", newTab, (h) => closeTab(h.id));
})();
