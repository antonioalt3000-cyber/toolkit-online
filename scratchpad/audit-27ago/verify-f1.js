const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  try {
    await tab.goto("https://complipilot.dev/scan");
    await tab.waitFor("document.querySelector('form input[type=text]')", 30000);
    const r = await tab.eval(`(() => {
      const txt = document.body.innerText;
      const i = txt.indexOf('Sign up free for');
      return {
        cta: i === -1 ? null : txt.slice(i, i + 40),
        stillSays50: txt.indexOf('Sign up free for 50') !== -1,
        guestLine: (function(){ var j = txt.indexOf('Guest plan'); return j === -1 ? null : txt.slice(j, j+34); })()
      };
    })()`);
    console.log(JSON.stringify(r, null, 1));
  } finally { tab.close(); await disposeContext(h); }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
