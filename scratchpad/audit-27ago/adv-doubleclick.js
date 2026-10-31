/**
 * Cinque clic rapidi sul submit. Un duplicato qui significa due chiavi, due
 * account o due sessioni di pagamento per un solo intento dell'utente.
 */
const { newCleanTab, disposeContext, connect } = require("./cdp");
const TARGETS = [
  ["emailguard",  "https://emailguard.dev/signup"],
  ["seoscope",    "https://seoscope.dev/signup"],
  ["cardforge",   "https://getcardforge.dev/signup"],
];
(async () => {
  for (const [name, url] of TARGETS) {
    const h = await newCleanTab("about:blank");
    const tab = await connect(h.id);
    const calls = [];
    const onMsg = (raw) => { try { const m = JSON.parse(raw.toString());
      if (m.method === "Network.requestWillBeSent" && m.params.request.url.indexOf("/api/signup") !== -1) calls.push(m.params.request.method);
    } catch (e) {} };
    tab.ws.on("message", onMsg);
    try {
      await tab.goto(url);
      const ok = await tab.waitFor("document.querySelector('input[type=email]')", 30000);
      await tab.waitFor("(function(){var e=document.querySelector('input[type=email]');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400);
      const email = "antonio.alt3000+zt" + Date.now() + "@gmail.com";
      await tab.typeInto("input[type=email]", email);
      // 5 clic rapidi, senza attesa fra l'uno e l'altro
      await tab.eval("(function(){var b=document.querySelector('form button[type=submit]');if(!b)return false;for(var i=0;i<5;i++)b.click();return true;})()");
      await tab.waitFor("false", 8000);
      const txt = await tab.eval("(function(){var t=document.body.innerText;var i=t.search(/key|Key|error|Error|already|Too many/);return i===-1?null:t.substr(i,120);})()");
      console.log(`${calls.length > 1 ? "🔴" : "  "} ${name.padEnd(12)} controlloTrovato=${ok} richieste_signup=${calls.length} :: ${String(txt).replace(/\n/g," ").slice(0,90)}`);
    } catch (e) { console.log(`🟠 ${name.padEnd(12)} SONDA: ${e.message}`); }
    finally { tab.ws.removeListener("message", onMsg); tab.close(); await disposeContext(h); }
  }
})();
