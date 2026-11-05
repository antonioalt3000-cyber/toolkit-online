#!/usr/bin/env node
/**
 * shapes.cjs — chiama la feature core di ogni prodotto una volta e stampa SOLO la
 * forma della risposta (chiavi, tipi, forma del primo elemento degli array).
 * Serve a scrivere oracoli che confrontano campi veri: indovinare i nomi dei
 * campi e' il modo in cui una sonda produce falsi verdi.
 *
 * Nessun valore di chiave API viene stampato.
 *
 *   node shapes.cjs [slug ...]
 */
const fs = require('fs');

const VAULT = 'C:/Users/ftass/secrets-private/saas-creator-keys.md';

/** Chiave creator dal vault, per dominio. Mai stampata. */
function vaultKey(domain) {
  const text = fs.readFileSync(VAULT, 'utf8');
  const head = text.split('## QA 19 ago')[0];
  for (const line of head.split('\n')) {
    if (!line.includes(domain)) continue;
    const m = line.match(/`([A-Za-z0-9_.-]{12,})`/);
    if (m) return m[1];
  }
  return null;
}

const P = {
  f1: {
    dom: 'complipilot.dev',
    call: { method: 'POST', path: '/api/scan', body: { url: 'https://toolkitonline.vip' } },
  },
  f2: {
    dom: 'fixmyweb.dev',
    call: {
      method: 'POST',
      path: '/api/contrast',
      body: { foreground: '#767676', background: '#ffffff' },
    },
  },
  f4: { dom: 'parseflow.dev', call: { method: 'GET', path: '/api/v1/dashboard' } },
  b7: { dom: 'captureapi.dev', call: { method: 'GET', path: '/api/v1/usage' } },
  cfg: {
    dom: 'getcardforge.dev',
    call: { method: 'GET', path: '/api/v1/card?template=og-minimal&title=Collaudo', binary: true },
  },
  eg: {
    dom: 'emailguard.dev',
    call: { method: 'GET', path: '/api/v1/verify?email=postmaster@gmail.com' },
  },
  hsh: {
    dom: 'headershield.dev',
    call: { method: 'GET', path: '/api/v1/scan?url=https://seoscope.dev' },
  },
  hkl: { dom: 'gethooklab.dev', call: { method: 'GET', path: '/api/v1/endpoints' } },
  seo: {
    dom: 'seoscope.dev',
    call: { method: 'POST', path: '/api/v1/audit', body: { url: 'https://toolkitonline.vip' } },
  },
};

function shape(value, depth = 0) {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    return depth > 2
      ? `array(${value.length})`
      : `array(${value.length}) of ${value.length ? shape(value[0], depth + 1) : '?'}`;
  }
  if (typeof value === 'object') {
    if (depth > 2) return `{${Object.keys(value).slice(0, 8).join(',')}}`;
    return (
      '{ ' +
      Object.entries(value)
        .slice(0, 14)
        .map(([k, v]) => `${k}: ${shape(v, depth + 1)}`)
        .join(', ') +
      ' }'
    );
  }
  if (typeof value === 'string') return value.length > 28 ? 'string' : `"${value}"`;
  return typeof value === 'number' ? String(value) : typeof value;
}

(async () => {
  for (const slug of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(P)) {
    const cfg = P[slug];
    if (!cfg) continue;
    const key = vaultKey(cfg.dom);
    const url = `https://${cfg.dom}${cfg.call.path}`;
    const init = {
      method: cfg.call.method,
      headers: {
        ...(key ? { 'x-api-key': key } : {}),
        ...(cfg.call.body ? { 'content-type': 'application/json' } : {}),
        origin: `https://${cfg.dom}`,
      },
      ...(cfg.call.body ? { body: JSON.stringify(cfg.call.body) } : {}),
    };
    try {
      const res = await fetch(url, init);
      const ct = res.headers.get('content-type') || '';
      let body;
      if (cfg.call.binary || !ct.includes('json')) {
        const buf = Buffer.from(await res.arrayBuffer());
        body = `<${ct} ${buf.length} bytes, magic ${buf.subarray(0, 4).toString('hex')}>`;
      } else {
        body = shape(await res.json());
      }
      console.log(
        `${slug.padEnd(4)} ${cfg.call.method} ${cfg.call.path}\n     key=${key ? 'vault' : 'nessuna'} ${res.status} ${body}\n`
      );
    } catch (e) {
      console.log(`${slug.padEnd(4)} ${cfg.call.path} ERRORE ${e.message}\n`);
    }
  }
})();
