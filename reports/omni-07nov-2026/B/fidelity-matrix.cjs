#!/usr/bin/env node
/**
 * fidelity-matrix.cjs — the "faithful customer" matrix (omni-QA 07 nov 2026, flow B).
 *
 *   node fidelity-matrix.cjs <cfg|eg|hsh|hkl|seo> [form: redeem|signup|all] [--base http://localhost:3215]
 *
 * WHY THIS EXISTS. CardForge told paying customers "Invalid or expired coupon code"
 * for 4.5 months because our own QA called /api/redeem directly, WITHOUT the
 * browser-owned state (form_ts, honeypot), and the anti-bot gate compared the visitor's
 * clock with the server's. A probe that bypasses a gate cannot find the gate's defects.
 * So here NOTHING is a shortcut: every scenario drives the real form in the real
 * Chrome on :9223 (raw CDP), and the page itself produces whatever hidden state it
 * produces. What we vary is the CUSTOMER'S ENVIRONMENT:
 *
 *   clock +-5 min / +-1 h / +-7 h / +-1 day   (Date shim on every new document)
 *   time zone + locale incl. RTL              (Emulation.setTimezoneOverride/LocaleOverride)
 *   autofill that also fills the honeypot     (programmatic value + input events, as a password manager does)
 *   submit faster than a human can type       (autofill + one click straight after hydration)
 *   double click / double Enter / two tabs    (one coupon, one consumption)
 *   slow 3G on the API call
 *   Safari / Firefox mobile user agent
 *   trackers blocked (analytics / GTM / PostHog)
 *   refresh and back after redeeming
 *
 * For EVERY refusal the verdict asks one question: does the code+message name the TRUE
 * cause? A message about the coupon is only legitimate when the COUPON is the cause.
 *
 * Local only (mock Upstash/Stripe/Brevo, `run-dev.cjs <slug> turbo`). Writes
 * evidence/<slug>/fidelity-matrix.json.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Journey, sleep } = require('../../../scratchpad/qa-infra/cdp-journey.cjs');

const ROOT = path.resolve(__dirname, '..');
const STATE_DIR = path.resolve(__dirname, '../../../scratchpad/qa-26ott/state');

const PRODUCTS = {
  cfg: {
    port: 3215,
    redeem: { hp: '#company_website' },
    signup: { hp: '#company_website' },
    prefix: 'CFG',
  },
  eg: {
    port: 3211,
    redeem: { hp: '#redeem-company' },
    signup: { hp: '#signup-company' },
    prefix: 'EG',
  },
  hsh: {
    port: 3213,
    redeem: { hp: '#redeem-website' },
    signup: { hp: '#signup-website' },
    prefix: 'HSH',
  },
  hkl: { port: 3214, redeem: { hp: null }, signup: { hp: '#company_website' }, prefix: 'HKL' },
  seo: {
    port: 3212,
    redeem: { hp: '#company_url' },
    signup: { hp: '#company_url' },
    prefix: 'SEO',
  },
};
const FORMS = {
  redeem: {
    page: '/redeem',
    api: '/api/redeem',
    code: '#redeem-code',
    email: '#redeem-email',
    error: '#redeem-error',
  },
  signup: {
    page: '/signup',
    api: '/api/signup',
    code: null,
    email: '#signup-email',
    error: '#signup-error',
  },
};

const UA = {
  safariIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  firefoxAndroid: 'Mozilla/5.0 (Android 14; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0',
};
const TRACKERS = [
  '*google-analytics.com*',
  '*googletagmanager.com*',
  '*posthog.com*',
  '*i.posthog.com*',
  '*_vercel/insights*',
  '*_vercel/speed-insights*',
  '*vercel-scripts.com*',
  '*sentry.io*',
];
const MIN = 60 * 1000;
// --prod: the same real-browser scenarios against production, but ONLY ones that cannot write: the
// coupon is a made-up code, so a request that clears the anti-bot gate is answered by the coupon
// pool ("Invalid or expired coupon code.") and one that does not is answered by the gate itself.
// The two are distinguishable only AFTER the fix, which is what this proves.
const PROD_REAL = process.argv.includes('--prod-real');
// --prod-real: SUCCESS paths in production with REAL `internal: true` coupons (only the founder's plus-alias can
// redeem them, so no partner pool is touched). Every key is registered in REDIS-WRITES.jsonl before it is minted.
const PROD_FAKE = process.argv.includes('--prod');
const PROD = PROD_FAKE || PROD_REAL;
const DOMAINS = {
  cfg: 'getcardforge.dev',
  eg: 'emailguard.dev',
  hsh: 'headershield.dev',
  hkl: 'gethooklab.dev',
  seo: 'seoscope.dev',
};
const ONLY = (() => {
  const i = process.argv.indexOf('--only');
  return i > 0 ? new Set(process.argv[i + 1].split(',')) : null;
})();
const want = (id) => !ONLY || ONLY.has(id);

// ---------------------------------------------------------------- helpers
function dateShim(offsetMs) {
  return `(() => { const OD = Date, off = ${offsetMs};
    const ND = function (...a) { if (!new.target) return new OD(OD.now() + off).toString();
      return a.length ? new OD(...a) : new OD(OD.now() + off); };
    ND.prototype = OD.prototype; ND.now = () => OD.now() + off; ND.parse = OD.parse; ND.UTC = OD.UTC;
    Object.defineProperty(ND, 'name', { value: 'Date' }); globalThis.Date = ND; })();`;
}

function rest(port, method, p, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? null : JSON.stringify(body);
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: p,
        method,
        headers: { 'content-type': 'application/json', ...headers },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

class Local {
  constructor(slug, base) {
    this.slug = slug;
    this.cfg = PRODUCTS[slug];
    this.base = base || (PROD ? `https://${DOMAINS[slug]}` : `http://localhost:${this.cfg.port}`);
    if (!PROD) {
      this.state = JSON.parse(fs.readFileSync(path.join(STATE_DIR, `${slug}.json`), 'utf8'));
      this.upstash = this.state.ports.upstash;
    }
    this.n = 0;
  }
  async redis(cmd) {
    const r = await rest(this.upstash, 'POST', '/', cmd, {
      authorization: 'Bearer qa-local-token',
    });
    return JSON.parse(r.body).result;
  }
  // The mock has no KEYS/SCAN, and flushing would erase the coupons. Isolation is by
  // visitor IP instead (see openCustomer), so there is nothing to clear.
  // Production has a real per-IP limit (5 redeems / minute): pace the scenarios instead of tripping it.
  async clearRateLimits() {
    if (PROD_REAL) await sleep(14000);
  }
  async mint(count = 1) {
    if (PROD_REAL) return this.mintInternal(count);
    if (PROD_FAKE)
      return Array.from(
        { length: count },
        (_, i) => `${this.cfg.prefix}-QA-NOPE-${Date.now().toString(36)}${i}`
      );
    const r = await rest(
      this.state.ports.app,
      'POST',
      '/api/admin/generate-coupons',
      { prefix: `${this.cfg.prefix}-QA`, count },
      { 'x-admin-secret': this.state.secrets.ADMIN_API_SECRET }
    );
    const j = JSON.parse(r.body);
    // `sample` is capped at 5 codes; `csv` carries them all. Using `sample` for 40 coupons
    // left `undefined` from the sixth scenario on: an empty field, a blocked submit, and
    // "no response" - a probe defect that looked like a product one.
    const all = String(j.csv || '')
      .split('\n')
      .slice(1)
      .filter(Boolean);
    if (all.length < count)
      throw new Error(`mint returned ${all.length}/${count}: ` + r.body.slice(0, 200));
    return all;
  }
  async mintInternal(count) {
    const { execFileSync } = require('child_process');
    const prefix = this.slug === 'cfg' ? 'QAOCTB' : 'QAOCT';
    const note = (key, nota) =>
      execFileSync(
        'node',
        [
          path.join(ROOT, 'progress.cjs'),
          'redis',
          '--repo',
          this.slug,
          '--key',
          key,
          '--nota',
          nota,
        ],
        { stdio: 'ignore' }
      );
    // registered BEFORE the write: the codes are not known yet, so the family of keys is.
    note(
      `${this.slug}:coupons:valid ← ${count} internal codes with prefix ${prefix}`,
      'B fidelity-matrix --prod-real: success paths (mint)'
    );
    const secretFile = path.join(
      process.env.TEMP || 'C:/Users/ftass/AppData/Local/Temp',
      'claude',
      'qa-secrets',
      `${this.slug}.qa`
    );
    const m = fs.readFileSync(secretFile, 'utf8').match(/^ADMIN_API_SECRET="?([^"\r\n]*)"?$/m);
    if (!m) throw new Error('no ADMIN_API_SECRET in the qa secrets file');
    const r = await new Promise((resolve, reject) => {
      const https = require('https');
      const body = JSON.stringify({ prefix, count, internal: true });
      const req = https.request(
        {
          host: DOMAINS[this.slug],
          path: '/api/admin/generate-coupons',
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-admin-secret': m[1],
            'content-length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let d = '';
          res.on('data', (c) => (d += c));
          res.on('end', () => resolve({ status: res.statusCode, body: d }));
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
    const j = JSON.parse(r.body);
    if (!j.internal)
      throw new Error(
        'minted coupons are NOT internal: refusing to continue ' + r.body.slice(0, 120)
      );
    const all = String(j.csv || '')
      .split('\n')
      .slice(1)
      .filter(Boolean);
    if (all.length < count) throw new Error(`mint returned ${all.length}/${count}`);
    for (const c of all)
      note(
        `${this.slug}:coupons:used → ${c}`,
        'B fidelity-matrix --prod-real: redeemed in a scenario'
      );
    return all;
  }
  async couponState(code) {
    if (PROD) return { valid: true, used: false };
    const valid = await this.redis(['SISMEMBER', `${this.slug}:coupons:valid`, code]);
    const used = await this.redis(['SISMEMBER', `${this.slug}:coupons:used`, code]);
    return { valid: valid === 1, used: used === 1 };
  }
  email(tag) {
    if (PROD_REAL) return `antonio.alt3000+qa07nov${this.slug}@gmail.com`;
    this.n += 1;
    return `fid-${tag}-${Date.now().toString(36)}${this.n}@example.org`;
  }
}

/** Opens a tab with the customer's environment applied BEFORE the page loads. */
let ipSeq = 0;
async function openCustomer(env = {}) {
  const j = await Journey.open('about:blank', { mobile: !!env.mobile });
  // Local only: every tab is a different "visitor" for the per-IP rate limiter, so a
  // scenario can never poison the next one (the 429 self-inflicted by the probe).
  ipSeq += 1;
  const headers = {
    'X-Forwarded-For': env.ip || `10.77.${Math.floor(ipSeq / 250)}.${(ipSeq % 250) + 1}`,
  };
  if (env.tz) await j.send('Emulation.setTimezoneOverride', { timezoneId: env.tz });
  if (env.locale) {
    await j.send('Emulation.setLocaleOverride', { locale: env.locale }).catch(() => {});
    headers['Accept-Language'] = env.locale;
  }
  await j.send('Network.setExtraHTTPHeaders', { headers });
  if (env.ua)
    await j.send('Emulation.setUserAgentOverride', {
      userAgent: env.ua,
      acceptLanguage: env.locale || 'en-US',
      platform: env.mobile ? 'iPhone' : 'Win32',
    });
  if (env.clockMs)
    await j.send('Page.addScriptToEvaluateOnNewDocument', { source: dateShim(env.clockMs) });
  if (env.block) await j.send('Network.setBlockedURLs', { urls: TRACKERS });
  return j;
}

/** Records every POST to `api` with its response body, independent of the page. */
function watchApi(j, api) {
  const seen = new Map();
  const out = [];
  j.listeners.push(async (m, p) => {
    if (
      m === 'Network.requestWillBeSent' &&
      p.request.method === 'POST' &&
      p.request.url.includes(api)
    ) {
      let body = null;
      try {
        body = JSON.parse(p.request.postData || 'null');
      } catch {
        /* not JSON */
      }
      seen.set(p.requestId, { t: Date.now(), reqBody: body });
    } else if (m === 'Network.responseReceived' && seen.has(p.requestId)) {
      Object.assign(seen.get(p.requestId), {
        status: p.response.status,
        retryAfter: p.response.headers['retry-after'],
      });
    } else if (m === 'Network.loadingFinished' && seen.has(p.requestId)) {
      const rec = seen.get(p.requestId);
      try {
        const b = await j.send('Network.getResponseBody', { requestId: p.requestId });
        rec.body = JSON.parse(b.body);
      } catch {
        rec.body = null;
      }
      out.push(rec);
    }
  });
  return out;
}

const HYDRATED = `js:(() => { const f = document.querySelector('form');
  return !!f && Object.keys(f).some((k) => k.startsWith('__reactProps')); })()`;

function setNative(sel, value) {
  return `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return false;
    const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    d.set.call(e, ${JSON.stringify(value)});
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }));
    return true; })()`;
}

async function readUi(j, form) {
  return j.eval(`(() => { const e = document.querySelector(${JSON.stringify(form.error)});
    return { error: e ? e.innerText.trim() : '', formPresent: !!document.querySelector('form'),
      body: document.body.innerText.slice(0, 400) }; })()`);
}

function causeOf(rec) {
  if (!rec) return 'no-response';
  const b = rec.body || {};
  const code = (b.error && (b.error.code || b.code)) || b.code || '';
  const msg =
    (typeof b.error === 'string' ? b.error : b.error && b.error.message) || b.message || '';
  return { code, msg };
}

// ---------------------------------------------------------------- one run of one form
/**
 * opts: { env, form, honeypot, fast, how: 'click'|'enter'|'double-click'|'double-enter',
 *         coupon, email, slowNet, afterHydrateWaitMs }
 */
async function runForm(L, opts) {
  const form = FORMS[opts.form];
  const hp = L.cfg[opts.form].hp;
  const j = await openCustomer(opts.env || {});
  const calls = watchApi(j, form.api);
  const t0 = Date.now();
  await j.send('Page.navigate', { url: L.base + form.page });
  await j.waitFor(HYDRATED, { timeout: 45000 });
  const hydratedAt = Date.now() - t0;
  // A person reads the page before typing. Without a think time the probe fills a ONE-field
  // form in well under the 1.2 s gate and reports the gate's refusal as a product defect
  // (S05-S07 of the first CardForge signup run: three false reds, all the probe's). Only the
  // scenarios that SAY they are autofill-fast skip it.
  const think = opts.fast || opts.fillThenWait ? 0 : (opts.afterHydrateWaitMs ?? 1800);
  if (think) await sleep(think);
  if (opts.slowNet)
    await j.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 2000,
      downloadThroughput: (400 * 1024) / 8,
      uploadThroughput: (400 * 1024) / 8,
    });

  const submitAt = Date.now();
  if (opts.fast || opts.fillThenWait) {
    // password-manager style: programmatic fill + one click, as quickly as the page allows
    if (form.code) await j.eval(setNative(form.code, opts.coupon));
    await j.eval(setNative(form.email, opts.email));
  } else {
    if (form.code) await j.type(form.code, opts.coupon);
    await j.type(form.email, opts.email);
  }
  if (opts.honeypot && hp) await j.eval(setNative(hp, opts.honeypot));
  // fillThenWait: the fields are filled at once and the customer then takes EXACTLY this long, so
  // the real fill time is deterministic (typing speed no longer moves the skew band).
  if (opts.fillThenWait) await sleep(opts.afterHydrateWaitMs ?? 3000);

  const how = opts.how || 'click';
  if (how.endsWith('enter')) {
    await j.eval(`document.querySelector(${JSON.stringify(form.email)}).focus()`);
    await j.press('Enter');
    if (how === 'double-enter') await j.press('Enter');
  } else {
    const pos = await j.locate('form button[type=submit]');
    const click = async () => {
      await j.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pos.x, y: pos.y });
      await j.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: pos.x,
        y: pos.y,
        button: 'left',
        clickCount: 1,
      });
      await j.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: pos.x,
        y: pos.y,
        button: 'left',
        clickCount: 1,
      });
    };
    await click();
    if (how === 'double-click') await click();
  }
  const deadline = Date.now() + (opts.slowNet ? 25000 : 9000);
  while (Date.now() < deadline && calls.length < (how.startsWith('double') ? 1 : 1))
    await sleep(100);
  await sleep(how.startsWith('double') ? 1200 : 500); // let a second (unwanted) request show up
  const ui = await readUi(j, form);
  const rep = j.report();
  const keep = { j, calls, ui, rep, hydratedAt, sinceHydrationMs: submitAt - t0 - hydratedAt };
  return keep;
}

async function closeTab(r) {
  await r.j.close();
}

// ---------------------------------------------------------------- scenarios
const results = [];
function record(id, desc, verdict, observed, note) {
  if (!want(id) && !want(id.replace(/[a-z]$/, ''))) return;
  results.push({ id, desc, verdict, observed, note });
  const mark = verdict === 'PASS' ? 'PASS' : verdict === 'INFO' ? 'info' : 'FAIL';
  console.log(`[${mark}] ${id} ${desc}${note ? '  -> ' + note : ''}`);
}

function summarise(r, extra = {}) {
  return {
    requests: r.calls.length,
    statuses: r.calls.map((c) => c.status),
    causes: r.calls.map((c) => causeOf(c)),
    ui: { error: r.ui.error, formPresent: r.ui.formPresent },
    uiBody: r.calls.length
      ? undefined
      : String(r.ui.body || '')
          .replace(/\s+/g, ' ')
          .slice(0, 200),
    consoleErrors: r.rep.consoleErrors.slice(0, 3),
    exceptions: r.rep.exceptions.slice(0, 3),
    ...extra,
  };
}

const mentionsCoupon = (s) => /coupon|code/i.test(s || '');

async function main() {
  const slug = process.argv[2];
  const which = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 'all';
  const baseArg =
    process.argv.indexOf('--base') > 0 ? process.argv[process.argv.indexOf('--base') + 1] : null;
  if (!PRODUCTS[slug]) throw new Error('slug: ' + Object.keys(PRODUCTS).join('|'));
  const L = new Local(slug, baseArg);
  const evidenceDir = path.join(ROOT, 'evidence', slug);
  fs.mkdirSync(evidenceDir, { recursive: true });

  // ---------- REDEEM
  if (
    (which === 'all' || which === 'redeem') &&
    (!ONLY || [...ONLY].some((x) => x.startsWith('R')))
  ) {
    const coupons = await L.mint(PROD_REAL ? 8 : 45);
    let ci = 0;
    const next = () => {
      if (ci >= coupons.length) throw new Error('out of coupons: mint more');
      return coupons[ci++];
    };

    // oracle for "a clean human succeeds": every environment that is NOT a bot must redeem.
    const humanEnvs = [
      ['R01', 'baseline (no emulation)', {}],
      ['R02', 'clock +5 min', { clockMs: 5 * MIN }],
      [
        'R02b',
        'clock +3.0 s, a customer who really takes 3.0 s+ (skew equal to the think time: the gate sees ~0 s)',
        { clockMs: 3000 },
        { fillThenWait: true, afterHydrateWaitMs: 3000 },
      ],
      ['R03', 'clock -5 min', { clockMs: -5 * MIN }],
      ['R04', 'clock +1 h', { clockMs: 60 * MIN }],
      ['R05', 'clock -1 h', { clockMs: -60 * MIN }],
      ['R06', 'clock +1 day', { clockMs: 24 * 60 * MIN }],
      ['R07', 'clock -7 h (also = a tab left open ~7 h)', { clockMs: -7 * 60 * MIN }],
      ['R08', 'clock -1 day', { clockMs: -24 * 60 * MIN }],
      [
        'R09',
        'tz Pacific/Kiritimati (UTC+14) + locale ar-EG (RTL)',
        { tz: 'Pacific/Kiritimati', locale: 'ar-EG' },
      ],
      [
        'R10',
        'tz America/Los_Angeles + locale he-IL (RTL)',
        { tz: 'America/Los_Angeles', locale: 'he-IL' },
      ],
      ['R11', 'tz Asia/Kolkata + locale ja-JP', { tz: 'Asia/Kolkata', locale: 'ja-JP' }],
      ['R12', 'Safari iOS user agent (mobile)', { ua: UA.safariIos, mobile: true }],
      ['R13', 'Firefox Android user agent (mobile)', { ua: UA.firefoxAndroid, mobile: true }],
      ['R14', 'trackers blocked (GA / GTM / PostHog / Vercel / Sentry)', { block: true }],
    ];
    for (const [id, desc, env, extra] of humanEnvs) {
      if (!want(id)) continue;
      await L.clearRateLimits();
      const code = next();
      const email = L.email(id);
      const r = await runForm(L, { form: 'redeem', env, coupon: code, email, ...(extra || {}) });
      const c = causeOf(r.calls[0]);
      const ok = PROD_FAKE
        ? r.calls.length === 1 &&
          r.calls[0].status === 400 &&
          /invalid or expired coupon/i.test(causeOf(r.calls[0]).msg || '') &&
          !/too quick|autofill/i.test(causeOf(r.calls[0]).msg || '')
        : r.calls.length === 1 && r.calls[0].status === 200;
      const st = await L.couponState(code);
      record(
        id,
        desc,
        ok && (PROD || st.used) && r.rep.exceptions.length === 0 ? 'PASS' : 'FAIL',
        summarise(r, { couponState: st }),
        ok
          ? ''
          : `refused: ${r.calls[0] && r.calls[0].status} ${JSON.stringify(c)} | ui="${r.ui.error}"`
      );
      await closeTab(r);
    }

    if (ONLY && [...ONLY].every((x) => humanEnvs.some((h) => h[0] === x)))
      return finish(L, evidenceDir);

    // slow 3G on the API call
    if (want('R15')) {
      await L.clearRateLimits();
      const code = next();
      const r = await runForm(L, {
        form: 'redeem',
        env: {},
        coupon: code,
        email: L.email('R15'),
        slowNet: true,
      });
      const ok = r.calls.length === 1 && r.calls[0].status === 200;
      record(
        'R15',
        'slow 3G on the API call (2 s latency, 400 kbps)',
        ok ? 'PASS' : 'FAIL',
        summarise(r, { couponState: await L.couponState(code) }),
        ok ? '' : `ui="${r.ui.error}"`
      );
      await closeTab(r);
    }

    // autofill fills the honeypot -> a refusal is expected; its cause must be named truthfully
    if (want('R16')) {
      await L.clearRateLimits();
      const code = next();
      const hp = L.cfg.redeem.hp;
      if (hp) {
        const r = await runForm(L, {
          form: 'redeem',
          env: {},
          coupon: code,
          email: L.email('R16'),
          honeypot: 'Acme Inc.',
        });
        const c = causeOf(r.calls[0]);
        const refused = r.calls[0] && r.calls[0].status >= 400;
        const st = await L.couponState(code);
        const shown = `${c.msg || ''} ${r.ui.error || ''}`;
        const lies = mentionsCoupon(shown) || /valid email|bot detected/i.test(shown);
        // The advice must be something a person with a password manager CAN follow.
        // "reload the page" is not: the manager fills the same field again.
        const helps = /autofill|auto-fill|password manager|support/i.test(shown);
        record(
          'R16',
          'autofill also fills the honeypot (a customer with a password manager)',
          refused && !lies && helps && st.valid ? 'PASS' : 'FAIL',
          summarise(r, { couponState: st }),
          !refused
            ? 'was NOT refused'
            : lies
              ? `refusal names the WRONG cause (coupon intact, valid=${st.valid}; email fine): ${JSON.stringify(c)}`
              : helps
                ? `ok: ${JSON.stringify(c)}`
                : `cause not blamed on the coupon, but the advice cannot help (a reload refills the same hidden field): ${JSON.stringify(c)}`
        );
        await closeTab(r);
      } else {
        record('R16', 'honeypot autofill', 'INFO', {}, 'redeem has no honeypot on this product');
      }
    }

    // submit faster than a human can type: refusal is by design, the cause must be named
    if (want('R17')) {
      await L.clearRateLimits();
      const code = next();
      const r = await runForm(L, {
        form: 'redeem',
        env: {},
        coupon: code,
        email: L.email('R17'),
        fast: true,
      });
      const c = causeOf(r.calls[0]);
      const st = await L.couponState(code);
      const refused = r.calls[0] && r.calls[0].status >= 400;
      // In production a made-up code that clears the gate is answered by the coupon pool: the gate did NOT
      // refuse (a real network + hydration put the submit past the threshold), so there is nothing to judge.
      const gatePassed =
        PROD_FAKE && refused && /COUPON_INVALID|invalid or expired coupon/i.test(JSON.stringify(c));
      if (!refused || gatePassed) {
        record(
          'R17',
          'autofill + immediate click (<1.2 s after render)',
          'INFO',
          summarise(r, { couponState: st }),
          (gatePassed
            ? 'the gate did not refuse (probe slower than the threshold over a real network); coupon pool answered the made-up code'
            : 'was accepted (the client was slower than the threshold on this run)') +
            ': sinceHydrationMs=' +
            r.sinceHydrationMs
        );
      } else {
        const lies = !/too quick|wait a moment/i.test(`${c.msg || ''} ${r.ui.error || ''}`);
        record(
          'R17',
          'autofill + immediate click (<1.2 s after render)',
          !lies && st.valid ? 'PASS' : 'FAIL',
          summarise(r, { couponState: st, sinceHydrationMs: r.sinceHydrationMs }),
          lies
            ? `refusal blames the COUPON though the coupon is intact (valid=${st.valid}): ${JSON.stringify(c)}`
            : `ok: ${JSON.stringify(c)}`
        );
        // the human follows the message: waits a moment and submits AGAIN on the same page
        if (refused && !PROD) {
          await sleep(1800);
          const pos = await r.j.locate('form button[type=submit]');
          const before = r.calls.length;
          await r.j.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pos.x, y: pos.y });
          await r.j.send('Input.dispatchMouseEvent', {
            type: 'mousePressed',
            x: pos.x,
            y: pos.y,
            button: 'left',
            clickCount: 1,
          });
          await r.j.send('Input.dispatchMouseEvent', {
            type: 'mouseReleased',
            x: pos.x,
            y: pos.y,
            button: 'left',
            clickCount: 1,
          });
          const dl = Date.now() + 8000;
          while (Date.now() < dl && r.calls.length === before) await sleep(100);
          await sleep(400);
          const again = r.calls[r.calls.length - 1];
          const st2 = await L.couponState(code);
          record(
            'R17b',
            'following the message ("wait and submit again") on the same page works',
            again && again.status === 200 && st2.used ? 'PASS' : 'FAIL',
            { status: again && again.status, couponState: st2, cause: causeOf(again) },
            again && again.status === 200 ? '' : `retry refused: ${JSON.stringify(causeOf(again))}`
          );
        }
      }
      await closeTab(r);
    }

    // double click / double Enter: one coupon, one consumption, one success
    for (const [id, how] of [
      ['R18', 'double-click'],
      ['R19', 'double-enter'],
    ]) {
      if (!want(id)) continue;
      await L.clearRateLimits();
      const code = next();
      const r = await runForm(L, {
        form: 'redeem',
        env: {},
        coupon: code,
        email: L.email(id),
        how,
      });
      const successes = r.calls.filter((c) => c.status === 200).length;
      const st = await L.couponState(code);
      record(
        id,
        how + ' on the submit control',
        successes === 1 && (PROD || (st.used && !st.valid)) ? 'PASS' : 'FAIL',
        summarise(r, { couponState: st, successes }),
        successes === 1 ? `requests=${r.calls.length}` : `successes=${successes}`
      );
      await closeTab(r);
    }

    // two tabs, same coupon, same moment: exactly one wins
    if (want('R20')) {
      await L.clearRateLimits();
      const code = next();
      const email = L.email('R20');
      const [a, b] = await Promise.all([
        runForm(L, { form: 'redeem', env: {}, coupon: code, email }),
        runForm(L, { form: 'redeem', env: {}, coupon: code, email }),
      ]);
      const all = [...a.calls, ...b.calls];
      const wins = all.filter((c) => c.status === 200).length;
      const st = await L.couponState(code);
      const loser = all.find((c) => c.status !== 200);
      record(
        'R20',
        'two tabs submit the same coupon together',
        wins === 1 && (PROD || st.used) ? 'PASS' : 'FAIL',
        {
          wins,
          statuses: all.map((c) => c.status),
          loser: loser ? causeOf(loser) : null,
          couponState: st,
        },
        wins === 1 ? `loser told: ${loser ? JSON.stringify(causeOf(loser)) : '-'}` : `wins=${wins}`
      );
      await closeTab(a);
      await closeTab(b);
    }

    // refresh after redeeming: the form is fresh again; reusing the coupon says "already redeemed"
    if (want('R21')) {
      await L.clearRateLimits();
      const code = next();
      const email = L.email('R21');
      const r = await runForm(L, { form: 'redeem', env: {}, coupon: code, email });
      const ok1 = r.calls[0] && r.calls[0].status === 200;
      await r.j.send('Page.reload');
      await r.j.waitFor(HYDRATED, { timeout: 30000 });
      await sleep(1500);
      await r.j.type('#redeem-code', code);
      await r.j.type('#redeem-email', email);
      const before = r.calls.length;
      await r.j.click('form button[type=submit]');
      const dl = Date.now() + 8000;
      while (Date.now() < dl && r.calls.length === before) await sleep(100);
      await sleep(400);
      const second = r.calls[r.calls.length - 1];
      const c2 = causeOf(second);
      const honest = second && second.status >= 400 && /already|used|redeem/i.test(c2.msg || '');
      record(
        'R21',
        'refresh after redeeming, then redeem the same coupon again',
        ok1 && honest ? 'PASS' : 'FAIL',
        { first: r.calls[0] && r.calls[0].status, second: second && second.status, cause: c2 },
        honest ? `told: ${JSON.stringify(c2)}` : `second answer: ${JSON.stringify(c2)}`
      );
      await closeTab(r);
    }

    // rate limit: the sixth redeem in a minute must say "slow down", not "invalid coupon"
    if (want('R22')) {
      await L.clearRateLimits();
      const j = await openCustomer({});
      const calls = watchApi(j, '/api/redeem');
      await j.send('Page.navigate', { url: L.base + '/redeem' });
      await j.waitFor(HYDRATED, { timeout: 30000 });
      await sleep(1500);
      for (let i = 0; i < 7; i++) {
        await j.type('#redeem-code', `${L.cfg.prefix}-NOPE-${i}`);
        await j.type('#redeem-email', L.email('R22'));
        const before = calls.length;
        await j.click('form button[type=submit]');
        const dl = Date.now() + 6000;
        while (Date.now() < dl && calls.length === before) await sleep(80);
        await sleep(250);
      }
      const limited = calls.find((c) => c.status === 429);
      const c = limited ? causeOf(limited) : null;
      const ui = await readUi(j, FORMS.redeem);
      const honest =
        !!limited &&
        /too many|rate|slow|wait|try again/i.test((c.msg || '') + ' ' + ui.error) &&
        !mentionsCoupon(c.msg);
      record(
        'R22',
        'rate limit trips: the message says slow down, not "invalid coupon"',
        honest ? 'PASS' : 'FAIL',
        {
          statuses: calls.map((x) => x.status),
          retryAfter: limited && limited.retryAfter,
          cause: c,
          ui: ui.error,
        },
        limited ? `429 told: ${JSON.stringify(c)} | ui="${ui.error}"` : 'no 429 within 7 attempts'
      );
      await j.close();
    }
  }

  // ---------- SIGNUP
  if (
    (which === 'all' || which === 'signup') &&
    (!ONLY || [...ONLY].some((x) => x.startsWith('S')))
  ) {
    const hp = L.cfg.signup.hp;
    const cases = [
      ['S01', 'signup baseline', {}, {}],
      ['S02', 'signup clock +5 min', { clockMs: 5 * MIN }, {}],
      ['S03', 'signup clock -5 min', { clockMs: -5 * MIN }, {}],
      ['S04', 'signup clock -7 h (tab left open)', { clockMs: -7 * 60 * MIN }, {}],
      [
        'S05',
        'signup RTL locale + far time zone',
        { tz: 'Pacific/Kiritimati', locale: 'ar-EG' },
        {},
      ],
      ['S06', 'signup Safari iOS UA', { ua: UA.safariIos, mobile: true }, {}],
      ['S07', 'signup trackers blocked', { block: true }, {}],
    ];
    for (const [id, desc, env, extra] of cases) {
      if (!want(id)) continue;
      await L.clearRateLimits();
      const r = await runForm(L, { form: 'signup', env, email: L.email(id), ...extra });
      const ok = r.calls.length === 1 && r.calls[0].status === 200 && !r.rep.exceptions.length;
      record(
        id,
        desc,
        ok ? 'PASS' : 'FAIL',
        summarise(r),
        ok ? '' : `refused: ${JSON.stringify(causeOf(r.calls[0]))} | ui="${r.ui.error}"`
      );
      await closeTab(r);
    }
    // honeypot: a refusal OR a silent success are both visible to the customer. Which one is it?
    if (hp && want('S08')) {
      await L.clearRateLimits();
      const r = await runForm(L, {
        form: 'signup',
        env: {},
        email: L.email('S08'),
        honeypot: 'Acme Inc.',
      });
      const c0 = r.calls[0];
      const c = causeOf(c0);
      const silentSuccess = c0 && c0.status === 200;
      record(
        'S08',
        'signup: autofill also fills the honeypot',
        !silentSuccess &&
          c0 &&
          !/valid email|bot detected|coupon/i.test(c.msg || '') &&
          /autofill|auto-fill|password manager|support/i.test(c.msg || '')
          ? 'PASS'
          : 'FAIL',
        summarise(r),
        silentSuccess
          ? `answered 200 (a customer sees "success" and waits for a key/email that never comes): ui="${r.ui.body.replace(/\s+/g, ' ').slice(0, 140)}"`
          : `refused: ${JSON.stringify(c)}`
      );
      await closeTab(r);
    }
    await L.clearRateLimits();
    if (want('S09')) {
      const r = await runForm(L, { form: 'signup', env: {}, email: L.email('S09'), fast: true });
      const c0 = r.calls[0];
      const c = causeOf(c0);
      const silentSuccess = c0 && c0.status === 200;
      record(
        'S09',
        'signup: autofill + immediate click',
        silentSuccess ? 'INFO' : /too quick|wait a moment/i.test(c.msg || '') ? 'PASS' : 'FAIL',
        summarise(r, { sinceHydrationMs: r.sinceHydrationMs }),
        silentSuccess
          ? 'accepted (client slower than threshold) or silently absorbed - see ui'
          : `refused: ${JSON.stringify(c)}`
      );
      await closeTab(r);
    }
  }

  finish(L, evidenceDir);
}

function finish(L, evidenceDir) {
  const failed = results.filter((x) => x.verdict === 'FAIL').length;
  const out = path.join(
    evidenceDir,
    ONLY ? 'fidelity-matrix.partial.json' : 'fidelity-matrix.json'
  );
  fs.writeFileSync(
    out,
    JSON.stringify({ slug: L.slug, base: L.base, at: new Date().toISOString(), results }, null, 2)
  );
  console.log(
    `\n${L.slug}: ${results.length} scenarios, ${results.filter((x) => x.verdict === 'PASS').length} PASS, ${failed} FAIL -> ${out}`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error('MATRIX ABORTED:', e && e.stack ? e.stack : e);
  process.exit(2);
});
