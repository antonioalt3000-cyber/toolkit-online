const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://complipilot.dev/scan");
    // Wait for the FORM, not for a byte count: nav+footer alone satisfied a
    // length check before hydration and made the page look empty.
    const ok = await tab.waitFor("document.querySelector('form input[type=text]')", 30000);
    const r = await tab.eval(`(() => {
      const txt = document.body.innerText;
      return {
        formPresent: !!document.querySelector('form input[type=text]'),
        lsKeys: Object.keys(localStorage),
        unlimitedBanner: txt.indexOf('Unlimited scans') !== -1,
        guestPlanLine: txt.indexOf('Guest plan') !== -1,
        h1: document.querySelector('h1') ? document.querySelector('h1').innerText : null,
        quotaText: (function(){ var i = txt.indexOf('Guest plan'); return i === -1 ? null : txt.slice(i, i+80); })()
      };
    })()`);
    console.log(JSON.stringify({ formAppeared: ok, ...r }, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
