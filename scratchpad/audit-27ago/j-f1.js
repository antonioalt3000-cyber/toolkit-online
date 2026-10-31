/**
 * CompliPilot — customer journey in the real browser.
 * Types a URL into the public scanner and reads the verdict off the screen.
 */
const { newTab, connect, closeTab } = require("./cdp");

const TARGET = process.argv[2] || "https://www.mozilla.org";

(async () => {
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  const out = {};
  try {
    await tab.goto("https://complipilot.dev/scan");
    await tab.waitFor("document.querySelector('form input[type=text]')", 25000);

    await tab.typeInto("form input[type=text]", TARGET);
    out.typed = await tab.eval("document.querySelector('form input[type=text]').value");

    await tab.clickSelector("form button[type=submit]");

    // Wait for the VERDICT, not for a clock. A scan of a live site takes as
    // long as it takes.
    const done = await tab.waitFor(
      "/score|compliance|risk|gdpr|passed|failed|issue/i.test(document.body.innerText) && document.body.innerText.length > 1500",
      60000,
    );
    out.resultRendered = done;

    const raw = await tab.text();
    out.bodyLen = raw.length;
    out.excerpt = raw.replace(/\n{2,}/g, "\n").slice(0, 700);
    out.nativeValidation = await tab.nativeValidationMessages();
    out.consoleErrors = tab.consoleErrors.filter((e) => !/418|hydrat/i.test(e)).slice(0, 3);
    out.failedRequests = tab.failedRequests.filter((r) => !/favicon|analytics|insights/i.test(r)).slice(0, 4);
    await tab.screenshot(__dirname + "/f1-scan.png");
  } finally {
    tab.close();
    await closeTab(t.id);
  }
  console.log(JSON.stringify(out, null, 1));
})().catch((e) => {
  console.error("J-F1 FAIL:", e.message);
  process.exit(1);
});
