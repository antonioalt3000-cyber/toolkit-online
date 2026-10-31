// CaptureAPI production: demo/playground/meta-inspector in the browser + paid endpoints via script
// (creator key read from the vault inside this process only, never printed).
const { Journey, openIsolated, sleep, O, EVID, setVal, check, save } = require('./helpers.cjs');
const path = require('path');
const fs = require('fs');
const BASE = 'https://captureapi.dev';
const dir = path.join(EVID, 'b7');
// w3.org answers the engine with a Cloudflare challenge (datacenter IP): use our own tall page instead.
const TARGET = 'https://paymentrescue.dev/calculator';
const ONLY = process.argv[2] || 'all';

async function selectValue(j, sel, value) {
  await j.eval(
    `(() => { const s = document.querySelector(${JSON.stringify(sel)}); const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; set.call(s, ${JSON.stringify(value)}); s.dispatchEvent(new Event('change', { bubbles: true })); })()`
  );
  await sleep(250);
}

async function capture(j, submit, label, expectType, expectDims) {
  const respP = j.waitForResponse('/api/v1/demo', 60000);
  await submit();
  const r = await respP.catch(() => ({ status: 'NO-RESPONSE', body: null, mimeType: null }));
  await sleep(1200);
  // The customer sees the decoded <img>: its intrinsic size is the oracle input.
  const shown =
    await j.eval(`(() => { const imgs = [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth > 0 && (i.src.startsWith('blob:') || i.src.startsWith('data:')));
    const i = imgs[imgs.length - 1]; return i ? { width: i.naturalWidth, height: i.naturalHeight } : null; })()`);
  const buf = Buffer.isBuffer(r.body) ? r.body : null;
  const dims = buf ? O.pngDims(buf) || O.jpegDims(buf) : shown;
  check('b7', `${label}: HTTP 200`, 200, r.status);
  check('b7', `${label}: content-type`, expectType, r.mimeType);
  check('b7', `${label}: dimensions`, expectDims, dims);
  return r;
}

async function demoPage(btn) {
  const j = await Journey.open(`${BASE}/demo`);
  await setVal(j, '#demo-url', 'https://github.com');
  await capture(j, () => j.click(btn), 'demo github.com 1280x720', 'image/png', {
    width: 1280,
    height: 720,
  });
  await sleep(1500);
  check(
    'b7',
    'demo: screenshot rendered in page',
    true,
    await j.eval(
      `!![...document.querySelectorAll('img')].find(i => i.complete && i.naturalWidth >= 1000)`
    )
  );
  await j.screenshot(path.join(dir, 'prod-demo-page.png'));
  const rep = j.report();
  check('b7', 'demo: console errors/exceptions', [[], []], [rep.consoleErrors, rep.exceptions]);
  await j.close();
}

async function playground(btn) {
  // fresh anonymous visitor: the shared Chrome profile stores a CaptureAPI key, which switches the page to /api/v1/screenshot
  const j = await openIsolated(`${BASE}/playground`);
  const submit = () => j.click('#pg-url').then(() => j.press('Enter')); // the Try It button sits below a 900px viewport: a real user presses Enter in the URL field
  await setVal(j, '#pg-url', TARGET);
  await setVal(j, '#pg-width', 800);
  await setVal(j, '#pg-height', 600);
  await capture(j, submit, 'playground 800x600 png', 'image/png', { width: 800, height: 600 });
  await selectValue(j, '#pg-format', 'jpeg');
  await capture(j, submit, 'playground 800x600 jpeg', 'image/jpeg', { width: 800, height: 600 });
  await selectValue(j, '#pg-format', 'png');
  await setVal(j, '#pg-width', 3000);
  await setVal(j, '#pg-height', 2000);
  await capture(j, submit, 'playground 3000x2000 anonymous clamped to 1920x1080', 'image/png', {
    width: 1920,
    height: 1080,
  });
  check('b7', 'playground: demo clamp disclosed in UI', true, /1920/.test(await j.text()));
  for (const bad of [
    'http://169.254.169.254/latest/meta-data/',
    'http://localhost:3000/',
    'http://10.0.0.1/',
  ]) {
    await setVal(j, '#pg-url', bad);
    const p = j.waitForResponse('/api/v1/demo', 30000);
    await submit();
    const rr = await p.catch(() => ({ status: 'NO-RESPONSE' }));
    await sleep(700);
    check('b7', `SSRF ${bad}: rejected with 400`, 400, rr.status);
  }
  check(
    'b7',
    'SSRF: error shown to the customer',
    true,
    /private|internal|not allowed|blocked|invalid/i.test(await j.text())
  );
  await j.screenshot(path.join(dir, 'prod-playground-ssrf.png'));
  check('b7', 'playground: uncaught exceptions', [], j.report().exceptions);
  await j.close();
}

async function metaInspector(inputSel, btn) {
  const j = await Journey.open(`${BASE}/tools/meta-inspector`);
  await setVal(j, inputSel, 'https://github.com');
  const pp = j.waitForResponse('/api/proxy', 30000);
  await j.click(btn);
  const pr = await pp.catch(() => null);
  await sleep(1500);
  const raw = await O.rawGet('https://github.com/');
  const ind = O.seoParse(raw.body.toString('utf8'));
  const pageText = await j.text();
  check('b7', 'meta-inspector: proxy HTTP 200', 200, pr && pr.status);
  check(
    'b7',
    `meta-inspector: title == independent fetch (${ind.title})`,
    true,
    !!ind.title && pageText.includes(ind.title.slice(0, 40))
  );
  check(
    'b7',
    'meta-inspector: og:image == independent fetch',
    true,
    !!ind.ogImage && pageText.includes(ind.ogImage.slice(0, 40))
  );
  await j.screenshot(path.join(dir, 'prod-meta-inspector.png'), { fullPage: true });
  check('b7', 'meta-inspector: uncaught exceptions', [], j.report().exceptions);
  await j.close();
}

function postJson(key, p, body) {
  const https = require('https');
  return new Promise((res, rej) => {
    const b = JSON.stringify(body);
    const r = https.request(
      BASE + p,
      {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(b),
        },
      },
      (s) => {
        const c = [];
        s.on('data', (d) => c.push(d));
        s.on('end', () =>
          res({ status: s.statusCode, headers: s.headers, body: Buffer.concat(c) })
        );
      }
    );
    r.on('error', rej);
    r.end(b);
  });
}

async function paid() {
  const vault = fs.readFileSync(
    path.join('C:/Users/ftass', 'secrets-private', 'saas-creator-keys.md'),
    'utf8'
  );
  const row = vault.split('\n').find((l) => l.includes('captureapi.dev') && l.includes('`'));
  const key = row && (row.match(/`([^`]+)`/) || [])[1];
  if (!key) return check('b7', 'creator key available', true, false);
  const call = (p) => O.rawGet(`${BASE}${p}`, { headers: { 'x-api-key': key } });
  const s1 = await call(
    `/api/v1/screenshot?url=${encodeURIComponent(TARGET)}&width=1024&height=768`
  );
  check('b7', 'paid screenshot 1024x768: HTTP 200', 200, s1.status);
  check('b7', 'paid screenshot 1024x768: dims', { width: 1024, height: 768 }, O.pngDims(s1.body));
  const s2 = await call(
    `/api/v1/screenshot?url=${encodeURIComponent(TARGET)}&width=1280&height=800&full_page=true`
  );
  const d2 = O.pngDims(s2.body);
  check(
    'b7',
    `paid full_page: width 1280, height > 800 (${JSON.stringify(d2)})`,
    true,
    !!d2 && d2.width === 1280 && d2.height > 800
  );
  const pdf = await postJson(key, '/api/v1/pdf', { url: TARGET, format: 'A4' }); // the PDF route is POST-only
  const pi = O.pdfInfo(pdf.body);
  check('b7', 'paid pdf: HTTP 200', 200, pdf.status);
  check(
    'b7',
    `paid pdf: A4 with >=1 page (${JSON.stringify(pi)})`,
    true,
    !!pi && pi.format === 'A4' && pi.pages >= 1
  );
  const pdfBad = await postJson(key, '/api/v1/pdf', { url: TARGET, format: 'A9' });
  check(
    'b7',
    'paid pdf unsupported format A9: 400 with the supported list',
    true,
    pdfBad.status === 400 && /A4, A3, A5, Letter, Legal, Tabloid/.test(pdfBad.body.toString())
  );
  const og = await call(`/api/v1/og?title=${encodeURIComponent('QA 26 ottobre CaptureAPI')}`);
  const od = O.pngDims(og.body) || O.jpegDims(og.body);
  check('b7', 'paid og: HTTP 200', 200, og.status);
  check('b7', 'paid og: 1200x630', { width: 1200, height: 630 }, od);
  fs.writeFileSync(path.join(dir, 'prod-paid-1024.png'), s1.body);
  fs.writeFileSync(path.join(dir, 'prod-paid-full.png'), s2.body);
  fs.writeFileSync(path.join(dir, 'prod-paid.pdf'), pdf.body);
  fs.writeFileSync(path.join(dir, 'prod-paid-og.png'), og.body);
  const ss = await call(
    `/api/v1/screenshot?url=${encodeURIComponent('http://169.254.169.254/latest/meta-data/')}`
  );
  check(
    'b7',
    `paid SSRF metadata IP rejected (HTTP ${ss.status})`,
    true,
    ss.status >= 400 && ss.status < 500
  );
}

(async () => {
  const cfg = JSON.parse(process.env.B7_SEL || '{}');
  if (ONLY === 'all' || ONLY === 'demo') await demoPage(cfg.demoBtn);
  if (ONLY === 'all' || ONLY === 'playground') await playground(cfg.pgBtn);
  if (ONLY === 'all' || ONLY === 'meta') await metaInspector(cfg.metaInput, cfg.metaBtn);
  if (ONLY === 'all' || ONLY === 'paid') await paid();
  save(`b7/prod-${ONLY}.json`);
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
