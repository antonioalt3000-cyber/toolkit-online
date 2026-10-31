const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://gethooklab.dev/");
    await tab.waitFor("Array.from(document.querySelectorAll('button')).some(function(b){return b.innerText.indexOf('Create test endpoint')!==-1;})", 30000);
    await tab.waitFor("(function(){var b=document.querySelector('button');return b&&Object.keys(b).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
    await tab.eval("(function(){var b=Array.from(document.querySelectorAll('button')).find(function(x){return x.innerText.indexOf('Create test endpoint')!==-1;});b.click();return true;})()");
    await tab.waitFor("document.body.innerText.indexOf('/h/')!==-1", 60000);
    const r = await tab.eval(`(function(){
      return {
        inputs: Array.from(document.querySelectorAll('input')).map(function(i){return i.value;}).filter(Boolean).slice(0,4),
        code:   Array.from(document.querySelectorAll('code,pre')).map(function(c){return c.innerText.trim().slice(0,90);}).filter(Boolean).slice(0,5),
        links:  Array.from(document.querySelectorAll('a[href*="/h/"], a[href*="inspect"]')).map(function(a){return a.href;}).slice(0,4),
        testo:  (function(){var t=document.body.innerText;var i=t.indexOf('/h/');return t.slice(Math.max(0,i-90), i+60);})()
      };
    })()`);
    console.log(JSON.stringify(r, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})();
