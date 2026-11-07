#!/usr/bin/env node
/**
 * pool-readonly.cjs — fotografia in SOLA LETTURA dei conteggi dei pool coupon, 10 prodotti.
 *
 * GET /api/admin/coupon-stats con `x-admin-secret` (da %TEMP%/claude/qa-secrets/<slug>.qa).
 * Salva SOLO i campi scalari numerici/booleani (profondita' <= 2): le liste (redemptions)
 * contengono email di clienti veri e NON vengono mai scritte su disco ne' stampate.
 *
 * Si lancia due volte nel round (T0 all'inizio, T1 alla fine): il conteggio dei coupon
 * riferiti ai partner non deve muoversi per nostra mano — le differenze si spiegano o
 * con riscatti veri di clienti o con coupon interni che abbiamo registrato.
 *
 *   node pool-readonly.cjs <etichetta>      # es. T0 | T1  -> baseline/pools-<etichetta>.json
 *   node pool-readonly.cjs diff T0 T1
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const TMP = process.env.TEMP || process.env.TMP || '.';
const DOM = {
  f1: 'complipilot.dev',
  f2: 'fixmyweb.dev',
  f3: 'paymentrescue.dev',
  f4: 'parseflow.dev',
  b7: 'captureapi.dev',
  cfg: 'getcardforge.dev',
  eg: 'emailguard.dev',
  hsh: 'headershield.dev',
  hkl: 'gethooklab.dev',
  seo: 'seoscope.dev',
};

function secretFor(slug) {
  const f = path.join(TMP, 'claude', 'qa-secrets', `${slug}.qa`);
  if (!fs.existsSync(f)) return null;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*ADMIN_API_SECRET\s*=\s*"?([^"\r\n]*)"?\s*$/);
    if (m) return m[1];
  }
  return null;
}

function scalars(obj, depth = 0, prefix = '') {
  const out = {};
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || depth > 2) return out;
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'number' || typeof v === 'boolean') out[key] = v;
    else if (v && typeof v === 'object' && !Array.isArray(v))
      Object.assign(out, scalars(v, depth + 1, key));
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function snapshot(label) {
  const res = { label, at: new Date().toISOString(), products: {} };
  for (const slug of Object.keys(DOM)) {
    const secret = secretFor(slug);
    if (!secret) {
      res.products[slug] = { error: 'ADMIN_API_SECRET assente' };
      continue;
    }
    try {
      const r = await fetch(`https://${DOM[slug]}/api/admin/coupon-stats`, {
        headers: { 'x-admin-secret': secret },
        signal: AbortSignal.timeout(25000),
      });
      const j = await r.json().catch(() => null);
      res.products[slug] = { status: r.status, ...scalars(j) };
    } catch (e) {
      res.products[slug] = { error: String(e.message || e) };
    }
    console.log(slug.padEnd(4), JSON.stringify(res.products[slug]));
    await sleep(2500);
  }
  fs.writeFileSync(path.join(DIR, 'baseline', `pools-${label}.json`), JSON.stringify(res, null, 1));
}

function diff(a, b) {
  const A = JSON.parse(fs.readFileSync(path.join(DIR, 'baseline', `pools-${a}.json`), 'utf8'));
  const B = JSON.parse(fs.readFileSync(path.join(DIR, 'baseline', `pools-${b}.json`), 'utf8'));
  for (const slug of Object.keys(DOM)) {
    const pa = A.products[slug] || {};
    const pb = B.products[slug] || {};
    const keys = [...new Set([...Object.keys(pa), ...Object.keys(pb)])].filter(
      (k) => typeof pa[k] === 'number' || typeof pb[k] === 'number'
    );
    const changed = keys.filter((k) => pa[k] !== pb[k]).map((k) => `${k}: ${pa[k]} -> ${pb[k]}`);
    console.log(slug.padEnd(4), changed.length ? changed.join(' | ') : 'invariato');
  }
}

(async () => {
  const [cmd, x, y] = process.argv.slice(2);
  if (cmd === 'diff') return diff(x, y);
  if (!cmd) throw new Error('uso: pool-readonly.cjs <etichetta> | diff <a> <b>');
  await snapshot(cmd);
})().catch((e) => {
  console.error('ERRORE', e.message);
  process.exit(1);
});
