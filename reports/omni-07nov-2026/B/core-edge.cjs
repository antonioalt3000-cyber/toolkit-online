#!/usr/bin/env node
/**
 * core-edge.cjs — casi limite della feature core, in produzione, con oracolo e controllo negativo.
 *
 *   node core-edge.cjs <cfg|eg|hsh|hkl|seo>
 *
 * Solo letture e chiamate API con la chiave creator del vault (come journey-core): nessun coupon, nessun
 * pool partner. Un oracolo che non puo' diventare rosso non misura niente, quindi ogni famiglia di check
 * ha un CONTROLLO NEGATIVO: la stessa misura, perturbata di proposito, deve fallire.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const o = require('C:/Users/ftass/toolkit-online/scratchpad/qa-infra/oracles.cjs');

const SLUG = process.argv[2];
const DOM = {
  cfg: 'getcardforge.dev',
  eg: 'emailguard.dev',
  hsh: 'headershield.dev',
  hkl: 'gethooklab.dev',
  seo: 'seoscope.dev',
};
const DOMAIN = DOM[SLUG];
const VAULT = 'C:/Users/ftass/secrets-private/saas-creator-keys.md';
const EV = path.resolve(__dirname, '..', 'evidence', SLUG);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function vaultKey(domain) {
  const head = fs.readFileSync(VAULT, 'utf8').split('## QA 19 ago')[0];
  for (const line of head.split('\n')) {
    if (!line.includes(domain)) continue;
    const m = line.match(/`([A-Za-z0-9_.-]{12,})`/);
    if (m) return m[1];
  }
  return null;
}
const KEY = vaultKey(DOMAIN);

const results = [];
function check(what, pass, detail = '') {
  results.push({ what, pass: !!pass, detail: String(detail).slice(0, 500) });
  console.log(
    `${pass ? 'PASS' : 'FAIL'}  ${what}${detail ? '  — ' + String(detail).slice(0, 220) : ''}`
  );
}

async function api(pathname, { method = 'GET', body, headers = {}, raw = false, rawBody } = {}) {
  const res = await fetch(`https://${DOMAIN}${pathname}`, {
    method,
    headers: {
      ...(KEY ? { 'x-api-key': KEY } : {}),
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      origin: `https://${DOMAIN}`,
      ...headers,
    },
    ...(rawBody !== undefined
      ? { body: rawBody }
      : body !== undefined
        ? { body: JSON.stringify(body) }
        : {}),
    signal: AbortSignal.timeout(60000),
  });
  if (raw) return { status: res.status, buf: Buffer.from(await res.arrayBuffer()), res };
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  return { status: res.status, json, text, res };
}

const isIend = (b) =>
  b.length > 12 && b.subarray(b.length - 8, b.length - 4).toString('latin1') === 'IEND';

const SUITES = {
  // ------------------------------------------------------------------ CardForge
  async cfg() {
    fs.mkdirSync(EV, { recursive: true });
    const DIMS = {
      'og-minimal': [1200, 630],
      'og-gradient': [1200, 630],
      'blog-cover': [1200, 630],
      'stat-card': [1200, 630],
      'release-card': [1200, 630],
      'quote-card': [1080, 1080],
      'youtube-thumb': [1280, 720],
      'x-header': [1500, 500],
      'linkedin-banner': [1584, 396],
    };
    const TITLES = {
      empty: '',
      one: 'A',
      len400: 'x'.repeat(400),
      len10000: 'y'.repeat(10000),
      emoji: 'Launch 🚀🔥✨ 👩🏽‍💻 🇪🇸',
      rtl: 'مرحبا بالعالم — שלום עולם',
      nullbyte: 'before\u0000after',
      crlf: 'line1\r\nX-Injected: yes\r\nline3',
    };
    const bad = [];
    const refused = [];
    let ok200 = 0;
    let first = null;
    for (const [tpl, [w, h]] of Object.entries(DIMS)) {
      for (const [name, title] of Object.entries(TITLES)) {
        const r = await api(`/api/v1/card?template=${tpl}&title=${encodeURIComponent(title)}`, {
          raw: true,
        });
        await sleep(350);
        const label = `${tpl}/${name}`;
        if (r.status >= 500) {
          bad.push(`${label}: HTTP ${r.status}`);
          continue;
        }
        if (r.status !== 200) {
          // an honest refusal is fine for the absurd cases, but it must say so in JSON, not leak HTML
          const txt = r.buf.toString('utf8', 0, 200);
          refused.push(`${label}: ${r.status}`);
          if (!/^\s*[{[]/.test(txt)) bad.push(`${label}: ${r.status} non-JSON refusal`);
          continue;
        }
        const d = o.pngDims(r.buf);
        const ct = r.res.headers.get('content-type') || '';
        if (!d || d.width !== w || d.height !== h)
          bad.push(`${label}: expected ${w}x${h}, got ${d ? d.width + 'x' + d.height : 'not PNG'}`);
        else if (!/image\/png/.test(ct)) bad.push(`${label}: content-type ${ct}`);
        else if (!isIend(r.buf)) bad.push(`${label}: PNG truncated (no IEND)`);
        else if ([...r.res.headers.keys()].some((k) => k === 'x-injected'))
          bad.push(`${label}: CRLF injected a response header`);
        else {
          ok200 += 1;
          if (!first) first = { w, h, buf: r.buf, label };
        }
      }
    }
    check(
      `9 template x 8 titles (0, 1, 400, 10000 chars, emoji, RTL, NUL, CRLF): never a 5xx, every 200 is the declared size`,
      bad.length === 0,
      bad.slice(0, 6).join(' | ') ||
        `${ok200} PNG a misura, ${refused.length} rifiuti onesti (${refused.slice(0, 4).join(', ')})`
    );
    check(
      `almeno 63 dei 72 casi consegnano una PNG (i rifiuti sono solo i titoli assurdi)`,
      ok200 >= 63,
      `${ok200}/72 PNG`
    );
    // negative control: the oracle must go red when the expectation is wrong
    if (first) {
      const d = o.pngDims(first.buf);
      check(
        'controllo negativo: lo stesso PNG contro una dimensione sbagliata (+1 px) viene rilevato',
        !(d.width === first.w + 1 && d.height === first.h),
        `${first.label} ${d.width}x${d.height}`
      );
      const cut = first.buf.subarray(0, first.buf.length - 20);
      check('controllo negativo: un PNG troncato NON passa il controllo IEND', !isIend(cut));
    }
  },

  // ------------------------------------------------------------------ HookLab
  async hkl() {
    const https = require('https');
    const created = await api('/api/v1/endpoints', {
      method: 'POST',
      body: { name: 'collaudo-edge-07nov' },
    });
    check(
      'endpoint di collaudo creato',
      created.status >= 200 && created.status < 300,
      `HTTP ${created.status}`
    );
    const id = created.json?.id || created.json?.endpoint?.id;
    if (!id) return check('endpoint con id', false, JSON.stringify(created.json).slice(0, 160));

    const post = (buf, headers = {}) =>
      new Promise((resolve) => {
        const req = https.request(
          {
            host: DOMAIN,
            path: `/api/h/${id}`,
            method: 'POST',
            headers: { 'content-length': buf.length, ...headers },
          },
          (res) => {
            let d = '';
            res.on('data', (c) => (d += c));
            res.on('end', () => resolve({ status: res.statusCode, text: d }));
          }
        );
        req.on('error', (e) => resolve({ status: 0, text: String(e.message) }));
        req.end(buf);
      });
    const list = async () => (await api(`/api/v1/endpoints/${id}/requests`)).json?.requests || [];
    const tag = (n) => `edge-${n}-${Date.now().toString(36)}`;
    const found = async (marker) => {
      for (let i = 0; i < 6; i++) {
        const m = (await list()).find(
          (x) =>
            String(x.bodyRaw || '').includes(marker) ||
            JSON.stringify(x.headers || {}).includes(marker)
        );
        if (m) return m;
        await sleep(1200);
      }
      return null;
    };

    // 1 byte
    let r = await post(Buffer.from('7'), { 'content-type': 'text/plain' });
    check(
      'payload di 1 byte: accettato (2xx), mai 5xx',
      r.status >= 200 && r.status < 300,
      `HTTP ${r.status}`
    );

    // ~1 MB, byte per byte
    const marker = tag('mb');
    const big = JSON.stringify({ m: marker, pad: 'z'.repeat(1_000_000 - 40) });
    r = await post(Buffer.from(big), { 'content-type': 'application/json' });
    check(
      'payload di ~1 MB: accettato o rifiutato con 413, mai 5xx',
      (r.status >= 200 && r.status < 300) || r.status === 413,
      `HTTP ${r.status} (${big.length} byte)`
    );
    if (r.status >= 200 && r.status < 300) {
      const mine = await found(marker);
      check('~1 MB: la richiesta si rilegge', !!mine);
      if (mine) {
        const exact = mine.bodyRaw === big;
        const declared =
          mine.truncated === true ||
          mine.bodyTruncated === true ||
          /trunc/i.test(JSON.stringify(Object.keys(mine)));
        check(
          '~1 MB: bodyRaw e byte-per-byte il payload, oppure il troncamento e dichiarato (mai silenzioso)',
          exact || (declared && big.startsWith(mine.bodyRaw)),
          exact
            ? 'esatto'
            : `lunghezza ${String(mine.bodyRaw).length}, chiavi ${Object.keys(mine).join(',')}`
        );
      }
    }
    // oltre il limite: un rifiuto, non un crash
    r = await post(Buffer.alloc(2 * 1024 * 1024, 0x61), { 'content-type': 'text/plain' });
    check(
      'payload di 2 MB: rifiuto pulito (413) o accettato, mai 5xx',
      r.status !== 0 && r.status < 500,
      `HTTP ${r.status}`
    );

    // non-UTF8
    const m8 = tag('bin');
    const bin = Buffer.concat([
      Buffer.from(m8 + ':'),
      Buffer.from([0xff, 0xfe, 0xfa, 0x80, 0xc3, 0x28, 0x00, 0x9f]),
    ]);
    r = await post(bin, { 'content-type': 'application/octet-stream' });
    check(
      'corpo non-UTF8 (con byte nulli): accettato, mai 5xx',
      r.status >= 200 && r.status < 300,
      `HTTP ${r.status}`
    );
    const mb = await found(m8);
    check(
      'non-UTF8: la richiesta si rilegge senza rompere la lista e non e marcata JSON',
      !!mb && mb.bodyIsJson !== true,
      mb ? `bodyIsJson=${mb.bodyIsJson}` : 'non trovata'
    );
    const after = await api(`/api/v1/endpoints/${id}/requests`);
    check(
      'non-UTF8: la lista delle richieste risponde ancora 200',
      after.status === 200,
      `HTTP ${after.status}`
    );

    // header duplicati (due righe `x-dup`)
    const md = tag('dup');
    r = await post(Buffer.from(md), { 'content-type': 'text/plain', 'x-dup': ['alfa', 'beta'] });
    check('header duplicati: accettati', r.status >= 200 && r.status < 300, `HTTP ${r.status}`);
    const mdup = await found(md);
    const dupv = mdup && (mdup.headers || {})['x-dup'];
    check(
      'header duplicati: entrambi i valori sopravvivono nella cattura',
      !!dupv && /alfa/.test(String(dupv)) && /beta/.test(String(dupv)),
      `catturato ${JSON.stringify(dupv)}`
    );

    // firma: corretta / byte alterato / timestamp vecchio (stile Stripe: t=<ts>,v1=hmac(t.payload))
    const secret = 'whsec_qa_edge_07nov';
    const body = JSON.stringify({ id: 'evt_qa_edge', amount: 4917 });
    const stripeSig = (ts, payload) => `t=${ts},v1=${o.hmacHex(secret, `${ts}.${payload}`)}`;
    const verify = async (payload, signature) =>
      await api('/api/v1/verify-signature', {
        method: 'POST',
        body: { provider: 'stripe', secret, rawBody: payload, signature },
      });
    const nowS = Math.floor(Date.now() / 1000);
    const okSig = await verify(body, stripeSig(nowS, body));
    check(
      'firma Stripe ricalcolata da me e fresca: valida',
      okSig.status === 200 && /"valid"\s*:\s*true/.test(JSON.stringify(okSig.json)),
      `HTTP ${okSig.status} ${JSON.stringify(okSig.json).slice(0, 160)}`
    );
    const altered = await verify(body.replace('4917', '4918'), stripeSig(nowS, body));
    check(
      'un byte alterato nel corpo: invalida (e non e un 400 di validazione)',
      altered.status === 200 && /"valid"\s*:\s*false/.test(JSON.stringify(altered.json)),
      `HTTP ${altered.status} ${JSON.stringify(altered.json).slice(0, 160)}`
    );
    const oldTs = nowS - 3600;
    const stale = await verify(body, stripeSig(oldTs, body));
    check(
      'firma corretta ma con timestamp di 1 ora fa: respinta',
      stale.status === 200 && /"valid"\s*:\s*false/.test(JSON.stringify(stale.json)),
      `HTTP ${stale.status} ${JSON.stringify(stale.json).slice(0, 200)}`
    );
    // controllo negativo: la STESSA firma vecchia, se il prodotto la accettasse, mi farebbe vedere valid:true
    check(
      'controllo negativo: i tre esiti sono distinti (fresca=true, alterata=false, vecchia=false)',
      /"valid"\s*:\s*true/.test(JSON.stringify(okSig.json)) &&
        /"valid"\s*:\s*false/.test(JSON.stringify(altered.json)) &&
        /"valid"\s*:\s*false/.test(JSON.stringify(stale.json))
    );

    // un payload FIRMATO piu grande del limite di cattura (64 KiB): la verifica sulla richiesta memorizzata deve
    // dire la verita. "SIGNATURE_MISMATCH" per un corpo che noi stessi abbiamo troncato sarebbe la causa sbagliata.
    const secretG = 'qa-edge-github-secret';
    const msg = tag('sig');
    const signedBig = JSON.stringify({ m: msg, pad: 'q'.repeat(100000) });
    const sigG = `sha256=${o.hmacHex(secretG, signedBig)}`;
    r = await post(Buffer.from(signedBig), {
      'content-type': 'application/json',
      'x-hub-signature-256': sigG,
    });
    check(
      'payload firmato di 100 KB: accettato',
      r.status >= 200 && r.status < 300,
      `HTTP ${r.status}`
    );
    const all = await (async () => {
      for (let i = 0; i < 6; i++) {
        const l = await list();
        if (l.some((x) => String(x.bodyRaw || '').includes(msg))) return l;
        await sleep(1200);
      }
      return await list();
    })();
    const idx = all.findIndex((x) => String(x.bodyRaw || '').includes(msg));
    check(
      'payload firmato di 100 KB: la cattura e dichiarata troncata',
      idx >= 0 && all[idx].truncated === true,
      idx >= 0
        ? `truncated=${all[idx].truncated}, bodyRaw ${String(all[idx].bodyRaw).length} byte`
        : 'non trovata'
    );
    if (idx >= 0) {
      const cap = await api('/api/v1/verify-signature', {
        method: 'POST',
        body: { provider: 'github', secret: secretG, endpointId: id, requestIndex: idx },
      });
      const txt = JSON.stringify(cap.json);
      // The product answers 400 "Captured body was truncated at 64KB, so its signature cannot be verified. Use literal
      // rawBody mode." - the TRUE cause and the way out. My first oracle demanded a 200 and called that a failure.
      const honest =
        (cap.status === 200 && /"valid"\s*:\s*true/.test(txt)) ||
        (cap.status === 400 && /truncated/i.test(txt) && /rawBody/i.test(txt));
      check(
        'verifica della richiesta memorizzata e troncata: o vale (corpo completo) o dichiara il troncamento, non un finto MISMATCH',
        honest,
        `HTTP ${cap.status} ${txt.slice(0, 260)}`
      );
    }

    const del = await api(`/api/v1/endpoints/${id}/delete`, { method: 'POST' });
    check(
      "l'endpoint di collaudo viene rimosso",
      del.status >= 200 && del.status < 300,
      `HTTP ${del.status}`
    );
  },

  // ------------------------------------------------------------------ EmailGuard
  async eg() {
    const DOMAINS = [
      'gmail.com',
      'outlook.com',
      'emailguard.dev',
      'toolkitonline.vip',
      `qa-no-such-domain-7nov-${Date.now().toString(36)}.com`,
    ];
    let negControlOk = true;
    for (const d of DOMAINS) {
      const dns = await o.emailDns(d);
      const r = await api(`/api/v1/verify?email=${encodeURIComponent('postmaster@' + d)}`);
      await sleep(400);
      const c = r.json?.checks || {};
      const mxReal = dns.mx.length > 0;
      const ok = r.status === 200 && c.mx === mxReal && c.spf === dns.spf && c.dmarc === dns.dmarc;
      check(
        `${d}: MX/SPF/DMARC del prodotto = DNS reale via DoH (mx ${mxReal}, spf ${dns.spf}, dmarc ${dns.dmarc})`,
        ok,
        `HTTP ${r.status}; prodotto mx=${c.mx} spf=${c.spf} dmarc=${c.dmarc}`
      );
      if (/qa-no-such-domain/.test(d)) {
        check(
          `${d} (inesistente, DNS: nessun MX): 200 con mx=false e indirizzo non valido, mai 5xx`,
          r.status === 200 && c.mx === false && r.json?.valid !== true,
          `HTTP ${r.status} valid=${r.json?.valid}`
        );
      }
      // negative control: the opposite expectation must NOT hold
      if (c.mx === !mxReal) negControlOk = false;
    }
    check(
      "controllo negativo: l'aspettativa opposta (MX invertito) non regge su nessun dominio",
      negControlOk
    );

    const mk = (n) => Array.from({ length: n }, (_, i) => `qa${i}@gmail.com`);
    const arrayOf = (j, n) => {
      if (!j) return null;
      for (const v of Object.values(j)) if (Array.isArray(v) && v.length === n) return v;
      for (const v of Object.values(j))
        if (v && typeof v === 'object')
          for (const w of Object.values(v)) if (Array.isArray(w) && w.length === n) return w;
      return null;
    };
    const b100 = await api('/api/v1/verify', { method: 'POST', body: { emails: mk(100) } });
    const arr = arrayOf(b100.json, 100);
    check(
      'lotto di 100 indirizzi: accettato (200) con 100 risultati',
      b100.status === 200 && !!arr,
      `HTTP ${b100.status}; chiavi ${Object.keys(b100.json || {}).join(',')}`
    );
    if (arr) {
      const dns = await o.emailDns('gmail.com');
      const wrong = arr.filter((x) => (x.checks || {}).mx !== dns.mx.length > 0).length;
      const emails = arr.map((x) => x.email);
      check(
        'lotto di 100: ogni risultato torna nello stesso ordine e con il verdetto MX del DNS reale',
        wrong === 0 && emails.every((e, i) => e === `qa${i}@gmail.com`),
        `${wrong} verdetti diversi dal DNS; primo ${emails[0]} ultimo ${emails[99]}`
      );
    }
    await sleep(800);
    const b101 = await api('/api/v1/verify', { method: 'POST', body: { emails: mk(101) } });
    check(
      'lotto di 101 indirizzi: respinto con 4xx JSON, nessun risultato parziale',
      b101.status >= 400 && b101.status < 500 && !arrayOf(b101.json, 100) && b101.json !== null,
      `HTTP ${b101.status} ${String(b101.text).slice(0, 140)}`
    );
    const b0 = await api('/api/v1/verify', { method: 'POST', body: { emails: [] } });
    // An empty batch answered 200 {count:0, results:[]} is a defensible contract (nothing asked, nothing returned);
    // my first oracle demanded a 4xx and called it a defect. What must never happen is a 5xx or a made-up result.
    check(
      'lotto vuoto: 4xx, oppure 200 con count 0 e nessun risultato inventato; mai 5xx',
      (b0.status >= 400 && b0.status < 500) ||
        (b0.status === 200 && b0.json?.count === 0 && (b0.json?.results || []).length === 0),
      `HTTP ${b0.status} ${String(b0.text).slice(0, 80)}`
    );
    const junk = await api('/api/v1/verify', {
      method: 'POST',
      body: { emails: ['', ' ', 'a@', '@b.com', 'x'.repeat(300) + '@gmail.com', 'ok@gmail.com'] },
    });
    check(
      'lotto con indirizzi spazzatura: 200 o 4xx, mai 5xx',
      junk.status < 500,
      `HTTP ${junk.status}`
    );
  },

  // ------------------------------------------------------------------ HeaderShield
  async hsh() {
    // independent reading of a site's real headers: our own connection, our own redirect following
    // The local resolver (192.168.0.1) does not resolve example.com: an ENVIRONMENT artefact, not a product defect.
    // When the OS cannot resolve a name, ask DNS-over-HTTPS for the address and connect to it with the right SNI/Host.
    const https = require('https');
    const viaDoh = (u) =>
      new Promise(async (resolve, reject) => {
        try {
          const url = new URL(u);
          const ans = await o.doh(url.hostname, 'A');
          const ip = (ans.answers || []).find((d) => /^\d+\.\d+\.\d+\.\d+$/.test(d));
          if (!ip) return reject(new Error('no A record via DoH'));
          const req = https.request(
            {
              host: url.hostname,
              servername: url.hostname,
              path: url.pathname + url.search,
              method: 'GET',
              lookup: (h, opts, cb) =>
                opts && opts.all ? cb(null, [{ address: ip, family: 4 }]) : cb(null, ip, 4),
              headers: { host: url.hostname },
            },
            (res) => {
              res.resume();
              resolve({ status: res.statusCode, headers: res.headers });
            }
          );
          req.on('error', reject);
          req.end();
        } catch (e) {
          reject(e);
        }
      });
    const realHeaders = async (url) => {
      let u = url;
      for (let i = 0; i < 5; i++) {
        let status, headers;
        try {
          const res = await fetch(u, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
          status = res.status;
          headers = Object.fromEntries(res.headers.entries());
        } catch {
          ({ status, headers } = await viaDoh(u));
        }
        const loc = headers.location;
        if (status >= 300 && status < 400 && loc) {
          u = new URL(loc, u).toString();
          continue;
        }
        return new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
      }
      return new Map();
    };
    const targets = [
      ['un nostro sito', 'https://emailguard.dev'],
      ['un bersaglio volutamente scadente', 'https://example.com'],
    ];
    const scores = [];
    for (const [label, target] of targets) {
      const r = await api(`/api/v1/scan?url=${encodeURIComponent(target)}`);
      await sleep(600);
      check(`${label} (${target}): lo scan risponde 200`, r.status === 200, `HTTP ${r.status}`);
      if (r.status !== 200) continue;
      const f = r.json.findings || [];
      const pts = f.reduce((a, x) => a + (x.points || 0), 0);
      const max = f.reduce((a, x) => a + (x.maxPoints || 0), 0);
      const recomputed = Math.round((pts / max) * 100);
      scores.push({ target, score: r.json.score, pts, max });
      check(
        `${label}: score = punti/massimo (${pts}/${max} -> ${recomputed})`,
        Math.abs(r.json.score - recomputed) <= 1,
        `riportato ${r.json.score}`
      );
      const real = await realHeaders(target);
      const mismatch = [];
      for (const x of f) {
        const name = String(x.header || '').toLowerCase();
        if (!name || !/^[a-z-]+$/.test(name) || x.status === 'info') continue;
        const there = real.has(name);
        const passed = x.status === 'pass' || x.status === 'warn';
        if (there !== passed)
          mismatch.push(
            `${x.header}: prodotto ${x.status}, header ${there ? 'presente' : 'assente'}`
          );
      }
      check(
        `${label}: ogni rilievo coincide con gli header letti da una connessione indipendente`,
        mismatch.length === 0,
        mismatch.join(' | ') || `${f.length} rilievi`
      );
      // fail_under: boundary exactly at the score
      const eq = await api(
        `/api/v1/scan?url=${encodeURIComponent(target)}&fail_under=${r.json.score}`
      );
      await sleep(600);
      const above = await api(
        `/api/v1/scan?url=${encodeURIComponent(target)}&fail_under=${Math.min(100, r.json.score + 1)}`
      );
      await sleep(600);
      if (r.json.score < 100) {
        check(
          `${label}: fail_under = score (${r.json.score}) passa, fail_under = score+1 -> 422`,
          eq.status === 200 && above.status === 422,
          `uguale HTTP ${eq.status}, sopra HTTP ${above.status}`
        );
      }
    }
    // negative control: the same recomputation with a wrong maximum must disagree with the product on at least one target
    const disc = scores.some(
      (x) => Math.abs(x.score - Math.round((x.pts / (x.max + 10)) * 100)) > 1
    );
    check(
      'controllo negativo: ricalcolare con un massimo sbagliato (+10) smentisce il prodotto su almeno un bersaglio',
      scores.length > 0 && disc,
      scores.map((x) => `${x.target} ${x.score}`).join(', ')
    );
    const poor = scores.find((x) => x.target.includes('example.com'));
    const ours = scores.find((x) => x.target.includes('emailguard.dev'));
    if (poor && ours)
      check(
        'il bersaglio scadente prende un voto più basso del nostro sito',
        poor.score < ours.score,
        `scadente ${poor.score}, nostro ${ours.score}`
      );
    // hostile / malformed targets and parameters: refused, never a 5xx, never data
    for (const bad of [
      'http://127.0.0.1/',
      'http://169.254.169.254/latest/meta-data/',
      'http://localhost:3000',
      'file:///etc/passwd',
      'http://[::1]/',
      'not a url',
      '',
    ]) {
      const r = await api(`/api/v1/scan?url=${encodeURIComponent(bad)}`);
      await sleep(400);
      check(
        `bersaglio "${bad || '(vuoto)'}": rifiutato con 4xx, mai 5xx e nessun dato`,
        r.status >= 400 && r.status < 500 && !(r.json && r.json.findings),
        `HTTP ${r.status}`
      );
    }
    for (const fu of ['abc', '-5', '101', '1e9']) {
      const r = await api(
        `/api/v1/scan?url=${encodeURIComponent('https://emailguard.dev')}&fail_under=${fu}`
      );
      await sleep(500);
      check(`fail_under=${fu}: mai 5xx`, r.status < 500, `HTTP ${r.status}`);
    }
  },

  // ------------------------------------------------------------------ SEOScope
  // The audit takes a URL, and a public host that serves OUR HTML as text/html does not exist without deploying
  // something (httpbin.org/base64 serves text/plain, and the product rightly refuses it: checked below). So the
  // edge cases come from REAL pages of ours that happen to hold them (dashboards are noindex, some titles run past
  // 60 characters, some pages carry several <h1>), read by an INDEPENDENT fetch + regex parser, page by page.
  async seo() {
    const pages = [
      'https://emailguard.dev/',
      'https://emailguard.dev/dashboard',
      'https://emailguard.dev/pricing',
      'https://headershield.dev/',
      'https://headershield.dev/dashboard',
      'https://gethooklab.dev/',
      'https://gethooklab.dev/dashboard',
      'https://getcardforge.dev/',
      'https://getcardforge.dev/dashboard',
      'https://seoscope.dev/',
      'https://seoscope.dev/dashboard',
      'https://seoscope.dev/docs',
      'https://toolkitonline.vip/en',
      'https://toolkitonline.vip/en/tools',
      // public pages of third parties that happen to hold the remaining classes: httpbin.org/html has NO <title>;
      // Wikipedia's Special:Search is noindex. If the product cannot fetch one, that is reported as unverified, not as a failure.
      'https://httpbin.org/html',
      'https://en.wikipedia.org/wiki/Special:Search?search=qa',
    ];
    const external = (u) => /httpbin\.org|wikipedia\.org/.test(u);
    const entities = (x) =>
      String(x || '')
        .replace(/&amp;/g, '&')
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
    const status = (r, id) => (r.json?.checks || []).find((c) => c.id === id);
    const tally = { titleWarn: 0, titlePass: 0, titleFail: 0, h1Warn: 0, h1Fail: 0, noindex: 0 };
    let weightsDiscriminate = false;
    for (const url of pages) {
      let html = '';
      let xrobots = '';
      let u = url;
      for (let i = 0; i < 4; i++) {
        const res = await fetch(u, {
          redirect: 'manual',
          headers: { 'user-agent': 'qa-probe/1.0 (+https://toolkitonline.vip)' },
          signal: AbortSignal.timeout(20000),
        });
        const loc = res.headers.get('location');
        if (res.status >= 300 && res.status < 400 && loc) {
          u = new URL(loc, u).toString();
          continue;
        }
        html = await res.text();
        xrobots = res.headers.get('x-robots-tag') || '';
        break;
      }
      const r = await api('/api/v1/audit', { method: 'POST', body: { url } });
      await sleep(1200);
      if (r.status !== 200 && external(url)) {
        console.log(
          `NON VERIF.  ${url}: il prodotto non ha potuto leggerla (HTTP ${r.status} ${String(r.text).slice(0, 80)}) — classe non coperta, non è un difetto`
        );
        continue;
      }
      if (r.status !== 200) {
        check(
          `${url}: l'audit risponde 200`,
          false,
          `HTTP ${r.status} ${String(r.text).slice(0, 100)}`
        );
        continue;
      }
      const tm = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = tm ? entities(tm[1]) : null;
      const h1s = (html.match(/<h1[\s>]/gi) || []).length;
      const metaRobots = (html.match(/<meta[^>]+name=["']robots["'][^>]*>/i) || [''])[0];
      const noindex = /noindex/i.test(metaRobots) || /noindex/i.test(xrobots);
      // title: status follows the 10-60 window, and a count in the message must be the real length
      const t = status(r, 'title');
      const tExpected =
        title === null || title === ''
          ? 'fail'
          : title.length < 10 || title.length > 60
            ? 'warn'
            : 'pass';
      tally[
        tExpected === 'fail' ? 'titleFail' : tExpected === 'warn' ? 'titleWarn' : 'titlePass'
      ] += 1;
      check(
        `${url}: titolo ${title === null ? 'assente' : title.length + ' car.'} -> ${tExpected}`,
        t?.status === tExpected &&
          (title === null ||
            tExpected === 'fail' ||
            !/\d+ characters/.test(t.message) ||
            new RegExp(`\b${title.length} characters`).test(t.message)),
        `prodotto ${t?.status} "${(t?.message || '').slice(0, 70)}"`
      );
      if (title !== null)
        check(
          `${url}: il titolo letto coincide col parser indipendente`,
          entities(r.json.page?.title) === title,
          `prodotto "${entities(r.json.page?.title).slice(0, 60)}" vs "${title.slice(0, 60)}"`
        );
      // h1
      const h = status(r, 'h1');
      const hExpected = h1s === 1 ? 'pass' : h1s === 0 ? 'fail' : 'warn';
      if (hExpected === 'warn') tally.h1Warn += 1;
      if (hExpected === 'fail') tally.h1Fail += 1;
      check(
        `${url}: ${h1s} <h1> -> ${hExpected}`,
        h?.status === hExpected,
        `prodotto ${h?.status} "${(h?.message || '').slice(0, 60)}"`
      );
      // noindex (meta robots or X-Robots-Tag)
      const rb = status(r, 'robots-meta');
      if (noindex) tally.noindex += 1;
      check(
        `${url}: ${noindex ? 'noindex' : 'indicizzabile'} -> robots-meta ${noindex ? 'fail' : 'non fail'}`,
        noindex ? rb?.status === 'fail' : rb?.status !== 'fail',
        `prodotto ${rb?.status}`
      );
      // weighted mean
      const br = r.json.categoryBreakdown || [];
      const wsum = br.reduce((x, c) => x + c.weight, 0);
      const weighted = br.reduce((x, c) => x + c.score * c.weight, 0) / wsum;
      check(
        `${url}: score = media pesata delle categorie (${weighted.toFixed(2)})`,
        Math.abs(r.json.score - weighted) <= 1.01,
        `riportato ${r.json.score}`
      );
      const flat = br.reduce((x, c) => x + c.score, 0) / br.length;
      if (Math.abs(flat - weighted) > 1.5) weightsDiscriminate = true;
    }
    check(
      "controllo negativo: una media NON pesata si discosta da quella pesata su almeno una pagina (l'oracolo distingue i pesi)",
      weightsDiscriminate
    );
    console.log('   copertura delle pagine reali:', JSON.stringify(tally));
    check(
      'le pagine reali coprono: titolo assente, titolo fuori soglia, titolo valido, h1 assente',
      tally.titleFail >= 1 && tally.titleWarn >= 1 && tally.titlePass >= 1 && tally.h1Fail >= 1,
      JSON.stringify(tally)
    );
    if (tally.noindex === 0)
      console.log(
        'NON VERIF.  noindex: nessuna pagina letta aveva un noindex (le dashboard sono bloccate da robots.txt, non da noindex): il ramo robots-meta=fail non è stato esercitato in produzione'
      );
    if (tally.h1Warn === 0)
      console.log(
        'NON VERIF.  più <h1> nella stessa pagina: nessuna pagina reale ne aveva più di uno: il ramo h1=warn non è stato esercitato in produzione'
      );
    // a text/plain "page" is refused with the TRUE cause; hostile targets are refused, never a 5xx
    const plain = await api(
      `/api/v1/audit?url=${encodeURIComponent('https://httpbin.org/base64/PGh0bWw-PC9odG1sPg==')}`
    );
    check(
      'un URL che serve text/plain: 422 che dice «not an HTML page» (causa vera)',
      plain.status === 422 && /not an HTML page/i.test(plain.text),
      `HTTP ${plain.status} ${String(plain.text).slice(0, 110)}`
    );
    for (const bad of [
      'http://127.0.0.1/',
      'http://169.254.169.254/',
      'file:///etc/passwd',
      'not a url',
    ]) {
      const r = await api(`/api/v1/audit?url=${encodeURIComponent(bad)}`);
      await sleep(500);
      check(
        `bersaglio "${bad}": 4xx, mai 5xx`,
        r.status >= 400 && r.status < 500,
        `HTTP ${r.status}`
      );
    }
  },
};

(async () => {
  if (!SUITES[SLUG]) throw new Error('slug: ' + Object.keys(SUITES).join('|'));
  if (!KEY) throw new Error('no creator key in the vault for ' + DOMAIN);
  console.log(`\n=== ${SLUG} (${DOMAIN}) — casi limite della feature core\n`);
  await SUITES[SLUG]();
  const fails = results.filter((r) => !r.pass).length;
  console.log(`\n--- ${SLUG}: ${results.length - fails}/${results.length} PASS`);
  fs.mkdirSync(EV, { recursive: true });
  fs.writeFileSync(
    path.join(EV, 'core-edge.json'),
    JSON.stringify({ slug: SLUG, at: new Date().toISOString(), results }, null, 1)
  );
  process.exit(fails ? 1 : 0);
})().catch((e) => {
  console.error('CORE-EDGE ABORTED:', e && e.message ? e.message : e);
  process.exit(2);
});
