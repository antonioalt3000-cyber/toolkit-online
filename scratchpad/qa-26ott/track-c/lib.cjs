// Track C (5 chassis SaaS) shared journey helpers: site table, check recorder,
// creator-key loader (key never leaves this process: not in argv, not printed),
// and the parametric public-page audit reused on all five products.
'use strict';
const fs = require('fs');
const path = require('path');
const INFRA = 'C:/Users/ftass/toolkit-online/scratchpad/qa-infra';
const { Journey, sleep } = require(`${INFRA}/cdp-journey.cjs`);
const oracles = require(`${INFRA}/oracles.cjs`);

const EVID = 'C:/Users/ftass/toolkit-online/scratchpad/qa-26ott/evidence';

const SITES = {
  eg: {
    name: 'EmailGuard',
    prod: 'https://emailguard.dev',
    repo: 'business-new-emailguard',
    vault: 'emailguard',
    localPort: 3211,
  },
  seo: {
    name: 'SEOScope',
    prod: 'https://seoscope.dev',
    repo: 'business-new-seoscope',
    vault: 'seoscope',
    localPort: 3212,
  },
  hsh: {
    name: 'HeaderShield',
    prod: 'https://headershield.dev',
    repo: 'business-new-headershield',
    vault: 'headershield',
    localPort: 3213,
  },
  hkl: {
    name: 'HookLab',
    prod: 'https://gethooklab.dev',
    repo: 'business-new-hooklab',
    vault: 'hooklab',
    localPort: 3214,
  },
  cfg: {
    name: 'CardForge',
    prod: 'https://getcardforge.dev',
    repo: 'business-new-cardforge',
    vault: 'cardforge',
    localPort: 3215,
  },
};

class Recorder {
  constructor(saas, phase) {
    this.saas = saas;
    this.phase = phase;
    this.dir = path.join(EVID, saas);
    fs.mkdirSync(this.dir, { recursive: true });
    this.file = path.join(this.dir, `checks-${phase}.json`);
    this.rows = fs.existsSync(this.file) ? JSON.parse(fs.readFileSync(this.file, 'utf8')) : [];
  }
  check(step, expected, observed, pass, evidence = null) {
    const row = { at: new Date().toISOString(), step, expected, observed, pass: !!pass, evidence };
    this.rows = this.rows.filter((r) => r.step !== step);
    this.rows.push(row);
    fs.writeFileSync(this.file, JSON.stringify(this.rows, null, 2));
    console.log(
      `${pass ? 'PASS' : 'FAIL'} [${this.saas}] ${step} :: expected=${short(expected)} observed=${short(observed)}`
    );
    return !!pass;
  }
  ev(name) {
    return path.join(this.dir, name);
  }
}
function short(v) {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return (s || '').length > 220 ? s.slice(0, 220) + '…' : s;
}

/** Reads one creator key from the vault's main table. Returned value stays in-process. */
function creatorKey(vaultName) {
  const md = fs.readFileSync('C:/Users/ftass/secrets-private/saas-creator-keys.md', 'utf8');
  const section = md.split('## QA 19 ago')[0];
  const row = section.split('\n').find((l) => l.startsWith(`| ${vaultName} |`));
  const m = row && row.match(/`([a-z]+_[A-Za-z0-9_-]+)`/);
  if (!m) throw new Error(`no creator key for ${vaultName}`);
  return m[1];
}

async function apiFetch(url, { method = 'GET', key, body, headers = {} } = {}) {
  const h = { ...headers };
  if (key) h['x-api-key'] = key;
  if (body !== undefined && !h['content-type']) h['content-type'] = 'application/json';
  const res = await fetch(url, {
    method,
    headers: h,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const buf = Buffer.from(await res.arrayBuffer());
  let json = null;
  try {
    json = JSON.parse(buf.toString('utf8'));
  } catch {
    /* binary */
  }
  return { status: res.status, headers: Object.fromEntries(res.headers), buf, json };
}

/** Marks the first visible element whose own text matches `text` so contrast() can address it. */
async function markByText(j, text, attr = 'data-qa-mark') {
  return j.eval(`(() => { document.querySelectorAll('[${attr}]').forEach((e) => e.removeAttribute('${attr}'));
    const t = ${JSON.stringify(text.toLowerCase())};
    const els = [...document.querySelectorAll('a,button')].filter((e) => (e.innerText || '').trim().toLowerCase() === t);
    const vis = els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    if (!vis.length) return 0; vis.forEach((e, i) => e.setAttribute('${attr}', String(i))); return vis.length; })()`);
}

async function setTheme(j, want) {
  // Read the theme the way a user sees it: the toggle's own label ("Switch to
  // light theme" means the page is dark now), falling back to the html class.
  const detect = () =>
    j.eval(`(() => { const b = [...document.querySelectorAll('button')].find((e) => /theme|mode/i.test(e.getAttribute('aria-label') || '') && e.getBoundingClientRect().width > 0);
    const l = (b && b.getAttribute('aria-label')) || '';
    if (/to light|light (mode|theme)$/i.test(l)) return 'dark';
    if (/to dark|dark (mode|theme)$/i.test(l)) return 'light';
    const c = document.documentElement.classList; return c.contains('light') ? 'light' : 'dark'; })()`);
  const current = await detect();
  if (current === want) return current;
  const sel =
    await j.eval(`(() => { const b = [...document.querySelectorAll('button')].find((e) => /theme|light|dark|mode/i.test((e.getAttribute('aria-label') || '') + ' ' + (e.title || '')) && e.getBoundingClientRect().width > 0);
    if (!b) return null; b.setAttribute('data-qa-theme', '1'); return '[data-qa-theme]'; })()`);
  if (!sel) return current;
  await j.click(sel);
  await sleep(1500); // let colour transitions finish before reading/measuring
  return detect();
}

/**
 * Parametric public-page audit: desktop load (console/exceptions/>=400),
 * mobile 375px horizontal overflow, CTA contrast in dark and light.
 */
async function auditPage(rec, url, label, { ctaTexts = [] } = {}) {
  const j = await Journey.open(url);
  try {
    await sleep(800);
    const rep = j.report();
    rec.check(
      `${label}: console/eccezioni/risposte`,
      '0 errori console, 0 eccezioni, 0 risposte >=400 inattese',
      rep,
      rep.consoleErrors.length === 0 && rep.exceptions.length === 0 && rep.badResponses.length === 0
    );
    for (const theme of ['dark', 'light']) {
      const got = await setTheme(j, theme);
      for (const t of ctaTexts) {
        const n = await markByText(j, t);
        if (!n) {
          rec.check(`${label}: CTA "${t}" (${got})`, 'presente', 'non trovato', false);
          continue;
        }
        const c = await j.contrast(`[data-qa-mark="0"]`);
        const big =
          c &&
          (parseFloat(c.fontSize) >= 24 ||
            (parseFloat(c.fontSize) >= 18.66 && Number(c.fontWeight) >= 700));
        const need = big ? 3 : 4.5;
        rec.check(
          `${label}: contrasto CTA "${t}" tema ${got}`,
          `>= ${need}:1`,
          c,
          c && c.ratio !== null && c.ratio >= need
        );
      }
    }
    await j.screenshot(rec.ev(`${label.replace(/[^a-z0-9]+/gi, '_')}-desktop.png`));
  } finally {
    await j.close();
  }
  const m = await Journey.open(url, { mobile: true });
  try {
    await sleep(800);
    const o = await m.overflowX();
    rec.check(
      `${label}: mobile 375px overflow orizzontale`,
      'scrollWidth <= 375',
      o,
      o.scrollWidth <= o.clientWidth + 1
    );
    await m.screenshot(rec.ev(`${label.replace(/[^a-z0-9]+/gi, '_')}-mobile.png`));
  } finally {
    await m.close();
  }
}

module.exports = {
  Journey,
  sleep,
  oracles,
  SITES,
  Recorder,
  creatorKey,
  apiFetch,
  markByText,
  setTheme,
  auditPage,
  EVID,
};
