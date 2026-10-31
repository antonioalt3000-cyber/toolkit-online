/**
 * FixMyWeb — accessibility scan from the browser, fresh target.
 */
const { newCleanTab, disposeContext, connect } = require("./cdp");

const TARGET = process.argv[2] || "https://www.gov.uk";

(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  const out = {};
  try {
    await tab.goto("https://fixmyweb.dev/scan");
    await tab.waitFor("document.querySelector('#scan-url')", 30000);
    await tab.typeInto("#scan-url", TARGET);
    out.typed = await tab.eval("document.querySelector('#scan-url').value");

    // The submit is the button labelled "Scan" — NOT "Customize"/"Accept All",
    // which belong to the consent banner.
    await tab.eval(`(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'Scan');
      if (b) b.setAttribute('data-qa-submit','1');
      return !!b;
    })()`);
    await tab.clickSelector("button[data-qa-submit='1']");

    // Wait for the scan to FINISH, not merely for a keyword to appear anywhere
    // on the page: the first draft matched text already present in the chrome
    // and reported a result while the button still read "Scanning...".
    const done = await tab.waitFor(
      "document.body.innerText.indexOf('Scanning...') === -1 && document.body.innerText.indexOf('Analyzing') === -1 && document.body.innerText.indexOf('Accessibility Score') !== -1",
      120000,
    );
    out.resultRendered = done;
    const raw = await tab.text();
    out.excerpt = raw.replace(/\n{2,}/g, "\n").slice(0, 800);
    out.nativeValidation = await tab.nativeValidationMessages();
    out.consoleErrors = tab.consoleErrors.filter((e) => !/418|hydrat/i.test(e)).slice(0, 3);
    out.failedRequests = tab.failedRequests.filter((r) => !/favicon|analytics|insights/i.test(r)).slice(0, 4);
    await tab.screenshot(__dirname + "/f2-scan.png");
  } finally {
    tab.close();
    await disposeContext(h);
  }
  console.log(JSON.stringify(out, null, 1));
})().catch((e) => {
  console.error("J-F2 FAIL:", e.message);
  process.exit(1);
});
