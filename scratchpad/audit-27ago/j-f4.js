/**
 * ParseFlow — upload a fresh hostile invoice through the real playground and
 * read the extraction off the screen.
 *
 * The file goes in via DOM.setFileInputFiles, which is a real file selection as
 * far as the page is concerned; nothing is posted behind the UI's back.
 */
const { newTab, connect, closeTab } = require("./cdp");
const path = require("path");

const PDF = path.join(__dirname, "fattura-27ago.pdf");

(async () => {
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  const out = {};
  try {
    await tab.goto("https://parseflow.dev/playground");
    await tab.waitFor("document.querySelector('input[type=file]')", 30000);

    await tab.send("DOM.enable");
    const { root } = await tab.send("DOM.getDocument");
    const { nodeId } = await tab.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector: "input[type=file]",
    });
    await tab.send("DOM.setFileInputFiles", { nodeId, files: [PDF] });
    out.fileAttached = await tab.eval(
      "(() => { const i = document.querySelector('input[type=file]'); return i && i.files && i.files.length ? i.files[0].name : null; })()",
    );

    // Whatever the run control is called, find it by role and act on the
    // BUTTON — clicking an ancestor div produced a false alarm in August.
    const clicked = await tab.eval(`(() => {
      const wanted = ['extract','parse','run','submit','upload','process'];
      const b = Array.from(document.querySelectorAll('button')).find(x => {
        const s = x.innerText.toLowerCase();
        return !x.disabled && wanted.some(w => s.indexOf(w) !== -1) && s.indexOf('sample') === -1;
      });
      if (!b) return null;
      b.setAttribute('data-qa-run','1');
      return b.innerText.trim();
    })()`);
    out.runButton = clicked;
    if (clicked) await tab.clickSelector("button[data-qa-run='1']");

    const done = await tab.waitFor(
      "document.body.innerText.indexOf('22500') !== -1 || document.body.innerText.indexOf('INV-2026-0913') !== -1 || document.body.innerText.toLowerCase().indexOf('error') !== -1",
      120000,
    );
    out.resultRendered = done;

    const raw = await tab.text();
    out.sawInvoiceNumber = raw.indexOf("INV-2026-0913") !== -1;
    out.sawSubtotal = raw.indexOf("18000") !== -1;
    out.sawTax = raw.indexOf("4500") !== -1;
    out.sawTotal = raw.indexOf("22500") !== -1;
    out.sawSEK = raw.indexOf("SEK") !== -1;
    const i = raw.indexOf("{");
    out.excerpt = (i !== -1 ? raw.slice(i, i + 900) : raw.slice(0, 900)).replace(/\n{2,}/g, "\n");
    out.consoleErrors = tab.consoleErrors.filter((e) => !/418|hydrat/i.test(e)).slice(0, 3);
    out.failedRequests = tab.failedRequests.filter((r) => !/favicon|analytics|insights/i.test(r)).slice(0, 4);
    await tab.screenshot(__dirname + "/f4-playground.png");
  } finally {
    tab.close();
    await closeTab(t.id);
  }
  console.log(JSON.stringify(out, null, 1));
})().catch((e) => {
  console.error("J-F4 FAIL:", e.message);
  process.exit(1);
});
