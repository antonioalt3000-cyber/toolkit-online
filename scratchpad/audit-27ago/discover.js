/**
 * Discover the controls a real customer sees on a page, from the live product.
 *
 * Written because every previous campaign that assumed a control's name or shape
 * from memory produced false alarms: a button called "Try It" instead of "Run",
 * a link rendered where navigation was expected, an ancestor DIV clicked instead
 * of the <button>, a honeypot field filled in by mistake.
 */
const { newTab, connect, closeTab } = require("./cdp");

(async () => {
  const url = process.argv[2];
  if (!url) throw new Error("usage: node discover.js <url>");
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  try {
    await tab.goto(url);
    await tab.waitFor("document.body && document.body.innerText.trim().length > 120", 25000);
    const out = await tab.eval(`(() => {
      const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 || r.height > 0; };
      const label = (el) => {
        if (el.labels && el.labels.length) return el.labels[0].innerText;
        return el.getAttribute('aria-label') || el.placeholder || '';
      };
      return {
        title: document.title,
        inputs: Array.from(document.querySelectorAll('input,textarea,select')).map(e => ({
          tag: e.tagName.toLowerCase(), type: e.type || null, name: e.name || null,
          id: e.id || null, required: !!e.required, hidden: !vis(e),
          label: label(e), value: (e.value || '').slice(0, 40)
        })),
        buttons: Array.from(document.querySelectorAll('button,[role=button],input[type=submit]'))
          .filter(vis)
          .map(e => ({ text: (e.innerText || e.value || '').slice(0, 45), type: e.type || null, id: e.id || null, disabled: !!e.disabled })),
        forms: Array.from(document.querySelectorAll('form')).map(f => ({ id: f.id || null, action: f.getAttribute('action'), fields: f.elements.length })),
        headings: Array.from(document.querySelectorAll('h1,h2')).slice(0, 8).map(h => h.innerText.slice(0, 60))
      };
    })()`);
    console.log(JSON.stringify(out, null, 1));
  } finally {
    tab.close();
    await closeTab(t.id);
  }
})().catch((e) => {
  console.error("DISCOVER FAIL:", e.message);
  process.exit(1);
});
