// Public pages as a FRESH anonymous visitor (isolated browser context), desktop + 375px mobile:
// HTTP status, console errors, uncaught exceptions, horizontal overflow, contrast of the primary CTAs.
const { openIsolated, sleep, EVID, check, save } = require('./helpers.cjs');
const path = require('path');

const SITES = {
  f3: [
    'https://paymentrescue.dev',
    [
      '/',
      '/pricing',
      '/calculator',
      '/tools/churn-predictor',
      '/signup',
      '/login',
      '/redeem',
      '/free',
      '/how-it-works',
    ],
  ],
  f4: [
    'https://parseflow.dev',
    ['/', '/pricing', '/playground', '/batch', '/login', '/redeem', '/free', '/demo'],
  ],
  b7: [
    'https://captureapi.dev',
    [
      '/',
      '/pricing',
      '/demo',
      '/playground',
      '/tools/meta-inspector',
      '/dashboard',
      '/redeem',
      '/free',
    ],
  ],
};

// Primary CTAs: filled buttons/links whose own background is opaque.
const CTA_PROBE = `(() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { cx.clearRect(0,0,1,1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0,0,1,1); const d = cx.getImageData(0,0,1,1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const out = [];
  for (const e of document.querySelectorAll('a, button')) {
    const r = e.getBoundingClientRect(); if (r.width < 40 || r.height < 24) continue;
    const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (cs.backgroundImage && cs.backgroundImage !== 'none') continue; // gradients measured from screenshots
    const bg = rgba(cs.backgroundColor); if (bg[3] < 0.99) continue;
    const fg = rgba(cs.color); const text = (e.innerText || '').trim().replace(/\\s+/g, ' ');
    if (!text) continue;
    const a = lum(fg), b = lum(bg); const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const size = parseFloat(cs.fontSize), bold = Number(cs.fontWeight) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    out.push({ text: text.slice(0, 40), ratio: Math.round(ratio * 100) / 100, need: large ? 3 : 4.5 });
  }
  return out;
})()`;

(async () => {
  for (const [saas, [base, routes]] of Object.entries(SITES)) {
    for (const mobile of [false, true]) {
      const j = await openIsolated('about:blank', { mobile });
      for (const r of routes) {
        j.resetLog();
        let doc = null;
        const onDoc = (m, p) => {
          if (m === 'Network.responseReceived' && p.type === 'Document' && !doc)
            doc = { status: p.response.status, url: p.response.url };
        };
        j.listeners.push(onDoc);
        await j.goto(base + r);
        await sleep(800);
        j.listeners = j.listeners.filter((x) => x !== onDoc);
        const tag = `${r} ${mobile ? '375px' : 'desktop'}`;
        check(saas, `${tag}: document HTTP 200`, 200, doc ? doc.status : null);
        const rep = j.report();
        const errs = rep.consoleErrors.filter((e) => !/api\/auth\/me|status of 401/.test(e)); // anonymous auth probe tallied separately
        check(saas, `${tag}: console errors (excluding auth probe)`, [], errs);
        check(saas, `${tag}: uncaught exceptions`, [], rep.exceptions);
        if (rep.consoleErrors.length !== errs.length)
          check(saas, `${tag}: anonymous auth probe logs a 401`, 'none', '401 /api/auth/me');
        if (mobile) {
          const o = await j.overflowX();
          check(saas, `${tag}: no horizontal overflow`, 375, o.scrollWidth);
        } else {
          const ctas = await j.eval(CTA_PROBE);
          const bad = ctas.filter((c) => c.ratio < c.need);
          check(saas, `${tag}: CTA contrast >= AA (${ctas.length} measured)`, [], bad);
        }
        if (r === '/')
          await j.screenshot(
            path.join(EVID, saas, `public-home-${mobile ? 'mobile' : 'desktop'}.png`)
          );
      }
      await j.close();
    }
  }
  save('public-sweep-track-b.json');
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
