/**
 * Core engine of each remaining product, driven from the real browser with
 * data chosen now — not fixtures.
 *
 * Each entry names the control by the id the LIVE page uses (read with
 * discover.js), because assuming a control's name from memory is what produced
 * most of the false alarms in previous campaigns.
 */
const { newCleanTab, disposeContext, connect } = require("./cdp");

const JOBS = [
  {
    name: "N1 EmailGuard",
    url: "https://emailguard.dev/",
    input: "#demo-email",
    value: "billing@stripe.com",
    submit: (t) => t.trim() === "Verify",
    // A verdict, not merely a spinner.
    done: "document.body.innerText.indexOf('Deliverable') !== -1 || document.body.innerText.indexOf('Risky') !== -1 || document.body.innerText.indexOf('Undeliverable') !== -1",
    grab: ["Deliverable", "Risky", "Undeliverable", "score", "Score"],
  },
  {
    name: "N3 HeaderShield",
    url: "https://headershield.dev/",
    input: "#header-demo-url",
    value: "https://www.mozilla.org",
    submit: (t) => t.trim() === "Scan",
    done: "document.body.innerText.indexOf('Grade') !== -1 || document.body.innerText.indexOf('Strict-Transport') !== -1 || document.body.innerText.indexOf('Content-Security') !== -1",
    grab: ["Grade", "Strict-Transport-Security", "Content-Security-Policy"],
  },
];

(async () => {
  for (const job of JOBS) {
    const h = await newCleanTab("about:blank");
    const tab = await connect(h.id);
    const out = { product: job.name };
    try {
      await tab.goto(job.url);
      const ready = await tab.waitFor(`document.querySelector('${job.input}')`, 30000);
      out.controlFound = ready;
      if (ready) {
        await tab.typeInto(job.input, job.value);
        out.typed = await tab.eval(`document.querySelector('${job.input}').value`);
        const tagged = await tab.eval(`(() => {
          const b = Array.from(document.querySelectorAll('button')).find(x => (${job.submit.toString()})(x.innerText));
          if (!b) return null;
          b.setAttribute('data-qa-go','1');
          return b.innerText.trim();
        })()`);
        out.submitButton = tagged;
        if (tagged !== null) {
          await tab.clickSelector("button[data-qa-go='1']");
          out.resultRendered = await tab.waitFor(job.done, 90000);
          const raw = await tab.text();
          out.evidence = job.grab
            .map((k) => {
              const i = raw.indexOf(k);
              return i === -1 ? null : raw.slice(i, i + 60).replace(/\n+/g, " ");
            })
            .filter(Boolean);
        }
      }
      out.consoleErrors = tab.consoleErrors.filter((e) => !/418|hydrat/i.test(e)).slice(0, 2);
      await tab.screenshot(__dirname + `/${job.name.split(" ")[0].toLowerCase()}-engine.png`);
    } catch (e) {
      out.error = e.message;
    } finally {
      tab.close();
      await disposeContext(h);
    }
    console.log(JSON.stringify(out, null, 1));
  }
})();
