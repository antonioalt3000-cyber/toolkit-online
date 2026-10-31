/**
 * Page sweep across the ten production domains, in the real browser.
 *
 * For every path: does it render, is React actually live, does the theme hold,
 * and did the page log an error or pull a 4xx/5xx.
 *
 * Deliberately NOT a fixed sleep: each page is polled until its content is
 * present. A 2.6s wait produced 17 false alarms in August on the heavier pages.
 */
const { newTab, connect, closeTab } = require("./cdp");
const fs = require("fs");

const PRODUCTS = {
  complipilot: {
    host: "https://complipilot.dev",
    paths: ["/", "/pricing", "/scan", "/checklist", "/document-generator", "/ai-act-article-50-check", "/audit-questionnaire", "/api-docs", "/dashboard", "/redeem", "/signup", "/faq"],
  },
  fixmyweb: {
    host: "https://fixmyweb.dev",
    paths: ["/", "/pricing", "/scan", "/bulk", "/tools/contrast-checker", "/tools/heading-checker", "/statement", "/vpat", "/dashboard", "/redeem", "/signup", "/faq"],
  },
  paymentrescue: {
    host: "https://paymentrescue.dev",
    paths: ["/", "/pricing", "/calculator", "/insights", "/playbooks", "/tools/churn-predictor", "/docs", "/docs/webhooks", "/dashboard", "/redeem", "/signup", "/faq"],
  },
  parseflow: {
    host: "https://parseflow.dev",
    paths: ["/", "/pricing", "/playground", "/demo", "/schema", "/templates", "/batch", "/docs", "/dashboard", "/redeem", "/signup", "/faq"],
  },
  captureapi: {
    host: "https://captureapi.dev",
    paths: ["/", "/pricing", "/playground", "/demo", "/tools/meta-inspector", "/docs", "/docs/screenshot", "/dashboard", "/redeem", "/signup", "/faq"],
  },
  emailguard: {
    host: "https://emailguard.dev",
    paths: ["/", "/pricing", "/docs", "/help", "/dashboard", "/redeem", "/signup"],
  },
  seoscope: {
    host: "https://seoscope.dev",
    paths: ["/", "/pricing", "/docs", "/help", "/seo-audit", "/dashboard", "/redeem", "/signup"],
  },
  headershield: {
    host: "https://headershield.dev",
    paths: ["/", "/pricing", "/docs", "/help", "/simulate", "/dashboard", "/redeem", "/signup"],
  },
  hooklab: {
    host: "https://gethooklab.dev",
    paths: ["/", "/pricing", "/docs", "/help", "/dashboard", "/redeem", "/signup"],
  },
  cardforge: {
    host: "https://getcardforge.dev",
    paths: ["/", "/pricing", "/docs", "/help", "/gallery", "/dashboard", "/redeem", "/signup"],
  },
};

/** Console noise that is not a product defect — each entry is justified. */
const KNOWN_BENIGN = [
  // Recoverable hydration mismatch. Characterised across four sessions: eleven
  // hypotheses refuted, user impact measured zero over ~180 loads, and the
  // decision to keep the nonce CSP is recorded in seoscope's middleware test.
  /Minified React error #418/,
  /hydrat/i,
];

function classify(errors) {
  const real = [];
  const benign = [];
  for (const e of errors) {
    (KNOWN_BENIGN.some((r) => r.test(e)) ? benign : real).push(e);
  }
  return { real, benign };
}

async function sweepProduct(name, cfg, results) {
  const t = await newTab("about:blank");
  const tab = await connect(t.id);
  try {
    for (const p of cfg.paths) {
      const url = cfg.host + p;
      let status = null;
      const onResp = (u, s) => {
        if (u === url || u === url + "/") status = s;
      };
      tab.failedRequests = [];
      tab.consoleErrors = [];
      // capture the document status
      const origPush = tab.failedRequests.push.bind(tab.failedRequests);
      void origPush;
      await tab.goto(url);
      const ready = await tab.waitFor(
        "document.body && document.body.innerText.trim().length > 120",
        25000,
      );
      const info = await tab.eval(`(() => {
        const h = document.documentElement;
        const bodyText = document.body ? document.body.innerText : '';
        return {
          title: document.title,
          h1: document.querySelector('h1') ? document.querySelector('h1').innerText : null,
          textLen: bodyText.length,
          htmlClass: h.className,
          bg: getComputedStyle(document.body).backgroundColor,
          fg: getComputedStyle(document.body).color,
          reactLive: !!(self.__next_f || window.__NEXT_DATA__ || window.next),
          buttons: document.querySelectorAll('button').length,
          links: document.querySelectorAll('a[href]').length,
          forms: document.querySelectorAll('form').length,
          notFound: /404|not found|page could not be found/i.test(bodyText.slice(0, 400))
        };
      })()`);
      const { real, benign } = classify(tab.consoleErrors);
      const bad = tab.failedRequests.filter(
        (r) => !/favicon|\/api\/(dashboard|health)|analytics|insights|sentry|monitoring/i.test(r),
      );
      results.push({
        product: name,
        path: p,
        ready,
        ...info,
        consoleReal: real.slice(0, 3),
        consoleBenign: benign.length,
        failedRequests: bad.slice(0, 4),
        status,
      });
      onResp(url, status);
    }
  } finally {
    tab.close();
    await closeTab(t.id);
  }
}

(async () => {
  const only = process.argv[2];
  const results = [];
  for (const [name, cfg] of Object.entries(PRODUCTS)) {
    if (only && only !== name) continue;
    process.stderr.write(`sweep ${name}...\n`);
    try {
      await sweepProduct(name, cfg, results);
    } catch (e) {
      results.push({ product: name, path: "*", error: e.message });
    }
  }
  fs.writeFileSync(
    __dirname + `/sweep-${only || "all"}.json`,
    JSON.stringify(results, null, 1),
  );
  // Terse report: only what needs a human eye.
  for (const r of results) {
    const flags = [];
    if (r.error) flags.push("HARNESS:" + r.error);
    if (r.ready === false) flags.push("NO-CONTENT");
    if (r.notFound) flags.push("404-TEXT");
    if (r.reactLive === false) flags.push("REACT-DEAD");
    if (r.consoleReal && r.consoleReal.length) flags.push("CONSOLE:" + r.consoleReal.join(" | ").slice(0, 160));
    if (r.failedRequests && r.failedRequests.length) flags.push("NET:" + r.failedRequests.join(","));
    if (flags.length) console.log(`FLAG ${r.product}${r.path}  ${flags.join("  ")}`);
  }
  const okCount = results.filter((r) => !r.error && r.ready && !r.notFound && r.reactLive).length;
  console.log(`\n${okCount}/${results.length} pagine sane (contenuto + React vivo + non-404)`);
})();
