const { newCleanTab, disposeContext, connect } = require("./cdp");
const CASES = [
  ["CompliPilot (interattivo provato)", "https://complipilot.dev/scan", "form input[type=text]"],
  ["EmailGuard", "https://emailguard.dev/", "#demo-email"],
  ["HeaderShield", "https://headershield.dev/", "#header-demo-url"],
];
(async () => {
  for (const [label, url, sel] of CASES) {
    const h = await newCleanTab("about:blank");
    const tab = await connect(h.id);
    try {
      await tab.goto(url);
      await tab.waitFor(`document.querySelector('${sel}')`, 30000);
      const r = await tab.eval(`(() => {
        const el = document.querySelector('${sel}');
        const own = Object.keys(el);
        const parent = el.parentElement ? Object.keys(el.parentElement) : [];
        const rootDiv = document.body.firstElementChild ? Object.keys(document.body.firstElementChild) : [];
        return { onInput: own, onParent: parent, onBodyFirstChild: rootDiv,
                 reactGlobals: Object.keys(window).filter(function(k){ return k.indexOf('React') !== -1 || k.indexOf('__next') !== -1 || k.indexOf('next') === 0; }).slice(0,8) };
      })()`);
      console.log(label, JSON.stringify(r));
    } finally { tab.close(); await disposeContext(h); }
  }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
