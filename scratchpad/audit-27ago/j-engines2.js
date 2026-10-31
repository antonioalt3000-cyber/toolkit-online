const { newCleanTab, disposeContext, connect } = require("./cdp");
const JOBS = [
  { name: "N1 EmailGuard", url: "https://emailguard.dev/", sel: "#demo-email", val: "billing@stripe.com", btn: "Verify",
    done: "document.body.innerText.indexOf('Deliverable') !== -1 || document.body.innerText.indexOf('Risky') !== -1 || document.body.innerText.indexOf('Undeliverable') !== -1 || document.body.innerText.indexOf('blocked') !== -1",
    grab: ["Deliverable","Risky","Undeliverable","blocked"] },
  { name: "N3 HeaderShield", url: "https://headershield.dev/", sel: "#header-demo-url", val: "https://www.mozilla.org", btn: "Scan",
    done: "document.body.innerText.indexOf('Grade') !== -1 || document.body.innerText.indexOf('Strict-Transport') !== -1 || document.body.innerText.indexOf('blocked') !== -1",
    grab: ["Grade","Strict-Transport-Security","Content-Security-Policy","blocked"] },
  { name: "N2 SEOScope", url: "https://seoscope.dev/", sel: "#audit-demo-url", val: "https://www.mozilla.org", btn: null,
    done: "document.body.innerText.indexOf('Score') !== -1 || document.body.innerText.indexOf('/100') !== -1 || document.body.innerText.indexOf('blocked') !== -1",
    grab: ["Score","/100","blocked"] },
];
(async () => {
  for (const j of JOBS) {
    const h = await newCleanTab("about:blank");
    const tab = await connect(h.id);
    const out = { product: j.name };
    try {
      await tab.goto(j.url);
      await tab.waitFor(`document.querySelector('${j.sel}')`, 30000);
      // ASPETTA L'IDRATAZIONE: prima di questa, il form e' inerte e un clic non fa nulla.
      out.hydrated = await tab.waitFor(`(function(){ var el = document.querySelector('${j.sel}'); return el && Object.keys(el).some(function(k){ return k.indexOf('__reactFiber') === 0; }); })()`, 40000, 400);
      await tab.typeInto(j.sel, j.val);
      out.typed = await tab.eval(`document.querySelector('${j.sel}').value`);
      const tagged = await tab.eval(`(() => {
        const want = ${JSON.stringify(j.btn)};
        const bs = Array.from(document.querySelectorAll('button'));
        const b = want ? bs.find(x => x.innerText.trim() === want)
                       : bs.find(x => x.type === 'submit' && x.closest('form') && x.closest('form').querySelector('${j.sel}'));
        if (!b) return null; b.setAttribute('data-qa-go','1'); return b.innerText.trim() || '(senza testo)';
      })()`);
      out.submitButton = tagged;
      if (tagged) {
        await tab.eval(`document.querySelector("button[data-qa-go='1']").click()`);
        out.resultRendered = await tab.waitFor(j.done, 90000);
        const raw = await tab.text();
        out.evidence = j.grab.map(k => { const i = raw.indexOf(k); return i === -1 ? null : raw.slice(i, i+70).replace(/\n+/g," "); }).filter(Boolean).slice(0,3);
      }
    } catch (e) { out.error = e.message; }
    finally { tab.close(); await disposeContext(h); }
    console.log(JSON.stringify(out, null, 1));
  }
})();
