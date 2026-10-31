const { newCleanTab, disposeContext, connect } = require("./cdp");

const PRODUCTS = {
  complipilot:  "https://complipilot.dev/redeem",
  fixmyweb:     "https://fixmyweb.dev/redeem",
  paymentrescue:"https://paymentrescue.dev/redeem",
  parseflow:    "https://parseflow.dev/redeem",
  captureapi:   "https://captureapi.dev/redeem",
  emailguard:   "https://emailguard.dev/redeem",
  seoscope:     "https://seoscope.dev/redeem",
  headershield: "https://headershield.dev/redeem",
  hooklab:      "https://gethooklab.dev/redeem",
  cardforge:    "https://getcardforge.dev/redeem",
};
const CASES = [
  ["inesistente", "ZZZZ-0000-0000-0000"],
  ["vuoto",       ""],
  ["sql",         "'; DROP TABLE users;--"],
  ["xss",         "<script>alert(1)</script>"],
  ["5000char",    "A".repeat(5000)],
];
const EMAIL = "antonio.alt3000+zt28ago@gmail.com";
const HYDR = "(function(){var e=document.querySelector('#redeem-code');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()";
const SHOWN = "(function(){var t=document.body.innerText;var keys=['Invalid','not found','already','expired','Error','error','required','Too many','Please','must'];for(var j=0;j<keys.length;j++){var i=t.indexOf(keys[j]);if(i!==-1)return t.substr(i,100);}return null;})()";

(async () => {
  const only = process.argv[2];
  for (const [name, url] of Object.entries(PRODUCTS)) {
    if (only && only !== name) continue;
    const h = await newCleanTab("about:blank");
    const tab = await connect(h.id);
    try {
      for (const [label, code] of CASES) {
        const net = [];
        const onMsg = (raw) => {
          try {
            const m = JSON.parse(raw.toString());
            if (m.method === "Network.responseReceived" && m.params.response.url.indexOf("/api/redeem") !== -1) net.push(m.params.response.status);
          } catch (e) { /* non-json */ }
        };
        tab.ws.on("message", onMsg);
        let out;
        try {
          await tab.goto(url);
          await tab.waitFor("document.querySelector('#redeem-code')", 30000);
          await tab.waitFor(HYDR, 40000, 400);
          await tab.typeInto("#redeem-email", EMAIL);
          if (code) await tab.typeInto("#redeem-code", code);
          await tab.eval("(function(){var c=document.querySelector('#redeem-confirm');if(c&&!c.checked)c.click();return true;})()");
          await tab.eval("(function(){var b=document.querySelector('form button[type=submit]');if(b)b.click();return !!b;})()");
          await tab.waitFor("false", 6000);
          out = {
            http: net,
            shown: await tab.eval(SHOWN),
            native: await tab.nativeValidationMessages(),
            white: await tab.eval("document.body.innerText.trim().length < 60"),
            granted: await tab.eval("/api key|your key|dm_live_|cp_live_|activated|Success/i.test(document.body.innerText)"),
            errs: tab.consoleErrors.filter(function (e) { return !/418|hydrat/i.test(e); }).length,
          };
        } catch (e) {
          out = { fail: e.message };
        }
        tab.ws.removeListener("message", onMsg);
        if (out.fail) { console.log(`🟠 ${name.padEnd(13)} ${label.padEnd(11)} SONDA: ${out.fail}`); continue; }
        const bad = out.white || out.granted || out.http.some(function (s) { return s >= 500; });
        const msg = out.shown || (out.native[0] || "(nessun messaggio)");
        console.log(`${bad ? "🔴" : "  "} ${name.padEnd(13)} ${label.padEnd(11)} http=${JSON.stringify(out.http)} bianca=${out.white} concessa=${out.granted} err=${out.errs} :: ${String(msg).replace(/\n/g, " ").slice(0, 78)}`);
      }
    } finally { tab.close(); await disposeContext(h); }
  }
})();
