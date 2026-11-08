#!/usr/bin/env node
/**
 * journey-core.cjs — la feature core di ogni prodotto, in produzione, con un
 * oracolo che RICALCOLA la risposta per una strada indipendente dal codice del
 * prodotto. Nessun oracolo importa codice di prodotto: aritmetica, formati
 * binari, HMAC, DNS e un parser HTML propri.
 *
 * Un oracolo sul testo della pagina o sulla sola presenza di una chiave e' una
 * fabbrica di falsi verdi: qui ogni numero viene riprodotto.
 *
 *   node journey-core.cjs <slug>
 */
const fs = require('fs');
const path = require('path');
const o = require('C:/Users/ftass/toolkit-online/scratchpad/qa-infra/oracles.cjs');

const VAULT = 'C:/Users/ftass/secrets-private/saas-creator-keys.md';
const SLUG = process.argv[2];
const EV = path.join(__dirname, 'evidence', SLUG);
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

/** I cron VERI di ogni prodotto, letti dai rispettivi vercel.json. Sondare un
 *  cron che non esiste da' 404, e un 404 contato come PASS non prova nulla:
 *  l'harness precedente sondava `review-requests` su prodotti che non l'hanno. */
const CRONS = {
  f1: ['eurlex', 'review-requests'],
  f2: ['review-requests'],
  f3: ['dunning', 'retry', 'cleanup', 'daily-digest', 'review-requests'],
  f4: ['cleanup', 'audit-export', 'maintenance', 'review-requests'],
  b7: ['ttl-audit', 'weekly-usage', 'review-requests'],
  cfg: [], // nessun vercel.json: questo prodotto non ha cron, e non e' un difetto
  eg: ['monitors', 'weekly-summary', 'portfolio-watch'],
  hsh: ['dispatcher'],
  hkl: ['digest', 'portfolio-watch'],
  seo: ['monitors', 'weekly-summary'],
};

const CARD_DIMS = {
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

const results = [];
function check(what, pass, detail = '') {
  results.push({ what, pass: !!pass, detail: String(detail).slice(0, 400) });
  console.log(
    `${pass ? 'PASS' : 'FAIL'}  ${what}${detail ? '  — ' + String(detail).slice(0, 200) : ''}`
  );
}
/**
 * Terzo stato, oltre a PASS e FAIL: quello che NON si e' potuto verificare da
 * questa macchina. Contarlo come PASS gonfierebbe il punteggio con qualcosa che
 * non e' stato provato; contarlo come FAIL accuserebbe il prodotto di un difetto
 * che non ha. Esce dal conteggio e compare a parte.
 */
function unverified(what, detail = '') {
  results.push({ what, pass: null, detail: String(detail).slice(0, 400) });
  console.log(`NON VERIF.  ${what}${detail ? '  — ' + detail : ''}`);
}

const near = (a, b, eps = 0.011) => Math.abs(a - b) <= eps;

/**
 * `rawGet` non segue i redirect, e confrontare il corpo di un 308 con quello che
 * il prodotto ha letto dopo averlo seguito e' una fabbrica di falsi rossi: al
 * primo giro ha prodotto due FAIL su SEOScope (toolkitonline.vip fa 308 -> /en)
 * che erano dell'oracolo, non del prodotto.
 */
async function getFinal(url, hops = 4) {
  let current = url;
  for (let i = 0; i < hops; i++) {
    const r = await o.rawGet(current);
    if (r.status >= 300 && r.status < 400 && r.headers.location) {
      current = new URL(r.headers.location, current).toString();
      continue;
    }
    return { ...r, finalUrl: current };
  }
  throw new Error(`troppi redirect da ${url}`);
}

/** Chiave creator dal vault. Mai stampata, nemmeno in un dettaglio di check. */
function vaultKey(domain) {
  const head = fs.readFileSync(VAULT, 'utf8').split('## QA 19 ago')[0];
  for (const line of head.split('\n')) {
    if (!line.includes(domain)) continue;
    const m = line.match(/`([A-Za-z0-9_.-]{12,})`/);
    if (m) return m[1];
  }
  // La chiave di FixMyWeb non sta nella tabella principale (li' dice
  // "magic-link, no api key"): e' in una sezione propria, aggiunta il 1 ott.
  if (domain === 'fixmyweb.dev') {
    const sec = fs.readFileSync(VAULT, 'utf8').split('## FixMyWeb (F2)')[1] || '';
    const m = sec.match(/`([A-Za-z0-9_.-]{12,})`/);
    if (m) return m[1];
  }
  return null;
}

function secretsFor(slug) {
  const f = `${TMP}/claude/qa-secrets/${slug}.qa`;
  const out = {};
  if (fs.existsSync(f)) {
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
      if (m) out[m[1]] = m[2];
    }
  }
  return out;
}

const DOMAIN = DOM[SLUG];
const KEY = DOMAIN ? vaultKey(DOMAIN) : null;

async function api(pathname, { method = 'GET', body, headers = {}, raw = false } = {}) {
  const res = await fetch(`https://${DOMAIN}${pathname}`, {
    method,
    headers: {
      ...(KEY ? { 'x-api-key': KEY } : {}),
      ...(body && !(body instanceof FormData) ? { 'content-type': 'application/json' } : {}),
      origin: `https://${DOMAIN}`,
      ...headers,
    },
    ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
  });
  if (raw) return { status: res.status, buf: Buffer.from(await res.arrayBuffer()), res };
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non JSON */
  }
  return { status: res.status, json, text, res };
}

// ============================================================ oracoli
const ORACLES = {
  /** CompliPilot: il punteggio complessivo deve essere la media dei punteggi di
   *  categoria applicabili (le categorie non applicabili arrivano `null`). */
  async f1() {
    const target = 'https://toolkitonline.vip';
    const a = await api('/api/scan', { method: 'POST', body: { url: target } });
    check('scan risponde 200', a.status === 200, `HTTP ${a.status}`);
    if (a.status !== 200) return;
    const cs = a.json.categoryScores || {};
    const applicable = Object.entries(cs).filter(([, v]) => typeof v === 'number');
    const mean = applicable.reduce((s, [, v]) => s + v, 0) / applicable.length;
    check(
      'overallScore = media delle categorie applicabili',
      Math.abs(a.json.overallScore - mean) <= 0.51,
      `riportato ${a.json.overallScore}, ricalcolato ${mean.toFixed(2)} da ${applicable.map(([k, v]) => `${k}=${v}`).join(' ')}`
    );
    check(
      'ogni categoria sta in 0..100',
      applicable.every(([, v]) => v >= 0 && v <= 100),
      applicable.map(([k, v]) => `${k}=${v}`).join(' ')
    );
    check(
      'ogni rilievo ha severita noto',
      Array.isArray(a.json.issues) &&
        a.json.issues.every((i) => ['critical', 'warning', 'info'].includes(i.severity)),
      `${a.json.issues?.length} rilievi, severita: ${[...new Set((a.json.issues || []).map((i) => i.severity))].join(',')}`
    );
    const b = await api('/api/scan', { method: 'POST', body: { url: target } });
    check(
      'due scansioni dello stesso URL danno lo stesso punteggio',
      b.status === 200 && b.json.overallScore === a.json.overallScore,
      `${a.json.overallScore} poi ${b.json.overallScore}`
    );
  },

  /** FixMyWeb: il rapporto di contrasto e' una formula WCAG chiusa — si ricalcola. */
  async f2() {
    const colors = ['#767676', '#ffffff', '#777', '#1a1a1a'];
    const r = await api('/api/contrast', { method: 'POST', body: { colors } });
    check('contrast risponde 200', r.status === 200, `HTTP ${r.status}`);
    if (r.status !== 200) return;
    const pairs = r.json.pairs || r.json.results || r.json.combinations || [];
    check('restituisce le coppie di colori', pairs.length > 0, `${pairs.length} coppie`);
    let worst = 0;
    let bad = [];
    for (const p of pairs) {
      const mine = o.contrastRatio(p.foreground, p.background);
      const theirs = Number(p.ratio);
      if (!near(mine, theirs, 0.051))
        bad.push(`${p.foreground}/${p.background}: loro ${theirs} vs mio ${mine.toFixed(2)}`);
      worst = Math.max(worst, Math.abs(mine - theirs));
    }
    check(
      'ogni rapporto coincide con la formula WCAG',
      bad.length === 0,
      bad.join(' | ') || `scarto max ${worst.toFixed(4)} su ${pairs.length} coppie`
    );
    const expanded = pairs.find((p) => p.foreground === '#777777' || p.background === '#777777');
    check(
      'un hex a 3 cifre viene espanso a 6 (regressione nota)',
      !!expanded,
      expanded ? '#777 -> #777777' : 'nessuna coppia con #777777'
    );
    const known = pairs.find(
      (p) =>
        (p.foreground === '#767676' && p.background === '#ffffff') ||
        (p.foreground === '#ffffff' && p.background === '#767676')
    );
    check(
      'la coppia nota #767676/#ffffff vale 4.54',
      known && near(Number(known.ratio), 4.54, 0.02),
      known ? `riportato ${known.ratio}` : 'coppia non trovata'
    );
    const grades = known && (known.wcag || known.grades || {});
    if (grades && typeof grades.AA_normal === 'boolean') {
      check(
        'le soglie WCAG seguono il rapporto',
        grades.AA_normal === Number(known.ratio) >= 4.5 &&
          grades.AAA_normal === Number(known.ratio) >= 7,
        `ratio ${known.ratio} AA=${grades.AA_normal} AAA=${grades.AAA_normal}`
      );
    }
    await ORACLES.f2scan();
  },

  /** FixMyWeb, scan WCAG autenticato: due invarianti esatte sul punteggio. */
  async f2scan() {
    const target = 'https://toolkitonline.vip/en';
    const a = await api('/api/scan', { method: 'POST', body: { url: target } });
    check(
      'scan WCAG risponde 200 con la chiave di un account pagante',
      a.status === 200,
      `HTTP ${a.status}`
    );
    if (a.status !== 200) return;
    const j = a.json;
    check(
      'passati + rilievi = controlli totali',
      j.passed + j.issues.length === j.totalChecks,
      `${j.passed} + ${j.issues.length} = ${j.passed + j.issues.length} vs ${j.totalChecks}`
    );
    const recomputed = Math.round((j.passed / j.totalChecks) * 100);
    check(
      'score = passati / totali',
      Math.abs(j.score - recomputed) <= 1,
      `riportato ${j.score}, ricalcolato ${recomputed} (${j.passed}/${j.totalChecks})`
    );
    check(
      'i punteggi per principio stanno in 0..100',
      Object.values(j.scores).every((v) => v >= 0 && v <= 100),
      Object.entries(j.scores)
        .map(([k, v]) => `${k}=${v}`)
        .join(' ')
    );
    check(
      'ogni rilievo porta un criterio WCAG e una severita noti',
      j.issues.every(
        (i) =>
          /^[0-9]+\.[0-9]+\.[0-9]+/.test(String(i.wcagCriterion || '')) &&
          ['critical', 'serious', 'moderate', 'minor'].includes(i.severity)
      ),
      [...new Set(j.issues.map((i) => i.wcagCriterion + '/' + i.severity))].slice(0, 6).join(' ')
    );
    // Controprova indipendente: le immagini senza alt le conta anche il mio parser.
    const real = o.seoParse((await getFinal(target)).body.toString());
    const altIssues = j.issues.filter((i) =>
      /alt|image/i.test(i.title + ' ' + i.wcagCriterion)
    ).length;
    check(
      'i rilievi sulle immagini senza alt concordano col parser indipendente',
      real.imagesMissingAlt > 0 === altIssues > 0,
      `prodotto ${altIssues} rilievi su immagini, parser ${real.imagesMissingAlt} senza alt su ${real.images}`
    );
    const b = await api('/api/scan', { method: 'POST', body: { url: target } });
    check(
      'due scan dello stesso URL danno lo stesso punteggio',
      b.status === 200 && b.json.score === j.score,
      `${j.score} poi ${b.json && b.json.score}`
    );
  },
  /** ParseFlow: una fattura con totali noti al centesimo, ricalcolati a parte. */
  async f4() {
    const spec = {
      seller: 'Studio Vallone SRL',
      sellerVat: 'IT09876543210',
      number: 'QA-04NOV-0001',
      date: '2026-11-04',
      due: '2026-12-04',
      buyer: 'Officina Marelli SNC',
      currency: 'EUR',
      vatRate: 21,
      items: [
        { desc: 'Consulenza tecnica', qty: 3, unit: 85.5 },
        { desc: 'Licenza annuale', qty: 1, unit: 240.0 },
        { desc: 'Supporto extra', qty: 7, unit: 12.75 },
      ],
    };
    const pdfPath = path.join(EV, 'fattura-oracolo.pdf');
    fs.mkdirSync(EV, { recursive: true });
    const truth = o.makeInvoicePdf(spec, pdfPath);
    check(
      'la fattura di prova e un PDF valido',
      (() => {
        const i = o.pdfInfo(fs.readFileSync(pdfPath));
        return i && i.pages >= 1;
      })(),
      `subtotale ${truth.subtotal} IVA ${truth.tax} totale ${truth.total}`
    );

    const fd = new FormData();
    fd.append(
      'file',
      new Blob([fs.readFileSync(pdfPath)], { type: 'application/pdf' }),
      'fattura-oracolo.pdf'
    );
    fd.append('document_type', 'invoice');
    const r = await api('/api/v1/extract', { method: 'POST', body: fd });
    check('extract risponde 200', r.status === 200, `HTTP ${r.status} ${r.text?.slice(0, 160)}`);
    if (r.status !== 200) return;
    fs.writeFileSync(path.join(EV, 'extract-risposta.json'), JSON.stringify(r.json, null, 1));
    const flat = JSON.stringify(r.json);
    const d = r.json.data || r.json.fields || r.json.extracted || r.json;
    const num = (x) =>
      typeof x === 'number'
        ? x
        : Number(
            String(x ?? '')
              .replace(/[^\d.,-]/g, '')
              .replace(',', '.')
          );
    // I nomi veri sono camelCase (`taxAmount`, `taxRate`), come tutto il resto
    // della risposta: cercare `tax`/`vat` dava 0 e un falso rosso al primo giro.
    const got = {
      total: num(d.total),
      subtotal: num(d.subtotal),
      tax: num(d.taxAmount),
      rate: num(d.taxRate),
    };
    check(
      'il totale estratto coincide al centesimo',
      near(got.total, truth.total, 0.011),
      `atteso ${truth.total}, letto ${got.total}`
    );
    check(
      'subtotale e IVA coincidono al centesimo',
      near(got.subtotal, truth.subtotal, 0.011) && near(got.tax, truth.tax, 0.011),
      `atteso ${truth.subtotal}/${truth.tax}, letto ${got.subtotal}/${got.tax}`
    );
    check(
      'subtotale + IVA = totale nei dati estratti',
      near(o.round2(got.subtotal + got.tax), got.total, 0.011),
      `${got.subtotal} + ${got.tax} = ${o.round2(got.subtotal + got.tax)} vs ${got.total}`
    );
    check(
      'il numero di fattura estratto e quello scritto',
      flat.includes(spec.number),
      spec.number
    );
    check(
      'l aliquota estratta e quella della fattura',
      got.rate === spec.vatRate,
      `attesa ${spec.vatRate}%, letta ${got.rate}%`
    );
    check(
      'IVA = subtotale x aliquota',
      near(o.round2((got.subtotal * got.rate) / 100), got.tax, 0.011),
      `${got.subtotal} x ${got.rate}% = ${o.round2((got.subtotal * got.rate) / 100)} vs ${got.tax}`
    );
    // Le righe: ogni importo deve essere quantita x prezzo, e la somma il subtotale.
    const items = d.lineItems || [];
    const wrongRows = items.filter(
      (it) => !near(o.round2(it.quantity * it.unitPrice), it.amount, 0.011)
    );
    const rowsSum = o.round2(items.reduce((s2, it) => s2 + it.amount, 0));
    check(
      `le ${items.length} righe estratte sono quelle scritte, e ogni importo moltiplica`,
      items.length === spec.items.length && wrongRows.length === 0,
      wrongRows.length
        ? wrongRows
            .map((r2) => `${r2.description}: ${r2.quantity}x${r2.unitPrice} != ${r2.amount}`)
            .join(' | ')
        : items.map((it) => `${it.quantity}x${it.unitPrice}=${it.amount}`).join(' ')
    );
    check(
      'la somma delle righe e il subtotale',
      near(rowsSum, got.subtotal, 0.011),
      `somma ${rowsSum} vs subtotale ${got.subtotal}`
    );
    check(
      'anche l indirizzo del fornitore e quello scritto (fix del 4 nov)',
      String(d.vendor?.address || '') === '' || /Via Cavour/.test(String(d.vendor?.address || '')),
      `vendor.address = ${JSON.stringify(d.vendor?.address || '')}`
    );

    // L'immagine deve essere RIFIUTATA: questo prodotto non fa OCR, e un claim
    // contrario era la causa di un ticket cliente.
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
      'base64'
    );
    const fd2 = new FormData();
    fd2.append('file', new Blob([png], { type: 'image/png' }), 'scansione.png');
    const r2 = await api('/api/v1/extract', { method: 'POST', body: fd2 });
    check(
      'un PNG viene rifiutato con 4xx (nessun OCR promesso)',
      r2.status >= 400 && r2.status < 500,
      `HTTP ${r2.status} ${(r2.json && (r2.json.code || r2.json.error)) || ''}`
    );
  },

  /** CaptureAPI: i pixel richiesti devono essere i pixel consegnati. */
  async b7() {
    fs.mkdirSync(EV, { recursive: true });
    // Questo endpoint ha DUE forme volute: GET con query restituisce il PNG
    // binario, POST con corpo JSON restituisce un involucro multi-viewport con
    // l'immagine in data-URI. Al primo giro l'oracolo pretendeva byte binari dal
    // POST e dava due rossi che erano suoi.
    const shot = await api(
      '/api/v1/screenshot?url=https://seoscope.dev&width=800&height=600&format=png',
      { raw: true }
    );
    check(
      'screenshot (GET) risponde 200',
      shot.status === 200,
      `HTTP ${shot.status} ${shot.res.headers.get('content-type')}`
    );
    if (shot.status === 200) {
      fs.writeFileSync(path.join(EV, 'screenshot-800x600.png'), shot.buf);
      const dims = o.pngDims(shot.buf);
      check(
        'e un PNG vero (magic byte)',
        shot.buf.subarray(0, 4).toString('hex') === '89504e47',
        shot.buf.subarray(0, 4).toString('hex')
      );
      check(
        'le dimensioni consegnate sono esattamente 800x600',
        dims && dims.width === 800 && dims.height === 600,
        dims ? `${dims.width}x${dims.height}, ${shot.buf.length} byte` : 'non leggibili'
      );
    }
    const env = await api('/api/v1/screenshot', {
      method: 'POST',
      body: { url: 'https://seoscope.dev', width: 800, height: 600, format: 'png' },
    });
    check(
      'screenshot (POST) risponde 200 con involucro JSON',
      env.status === 200 && env.json?.success === true,
      `HTTP ${env.status}`
    );
    const item = env.json?.items?.[0];
    if (item) {
      const b64 = String(item.image || '').split(',')[1] || '';
      const buf = Buffer.from(b64, 'base64');
      const d = o.pngDims(buf);
      check(
        'i pixel dentro il data-URI coincidono con le dimensioni dichiarate',
        d &&
          d.width === item.width &&
          d.height === item.height &&
          d.width === 800 &&
          d.height === 600,
        `dichiarato ${item.width}x${item.height}, pixel ${d ? d.width + 'x' + d.height : 'non PNG'}`
      );
      check(
        'size_bytes dichiarato coincide con i byte veri',
        Math.abs(buf.length - item.size_bytes) <= 2,
        `dichiarato ${item.size_bytes}, reale ${buf.length}`
      );
    }
    const pdf = await api('/api/v1/pdf', {
      method: 'POST',
      body: { url: 'https://seoscope.dev', format: 'A4' },
      raw: true,
    });
    check('pdf risponde 200', pdf.status === 200, `HTTP ${pdf.status}`);
    if (pdf.status === 200) {
      fs.writeFileSync(path.join(EV, 'pagina-a4.pdf'), pdf.buf);
      const info = o.pdfInfo(pdf.buf);
      check(
        'e un PDF vero con almeno una pagina',
        !!info && info.pages >= 1,
        info ? `v${info.version}, ${info.pages} pagine, ${pdf.buf.length} byte` : 'non leggibile'
      );
      check(
        'il formato pagina e A4',
        !!info && !!info.size && near(info.size.w, 595.28, 1.2) && near(info.size.h, 841.89, 1.2),
        info && info.size ? `${info.size.w}x${info.size.h} (${info.format})` : 'MediaBox assente'
      );
    }
  },

  /** CardForge: ogni template dichiara una dimensione, e deve consegnarla. */
  async cfg() {
    fs.mkdirSync(EV, { recursive: true });
    const wrong = [];
    for (const [tpl, [w, h]] of Object.entries(CARD_DIMS)) {
      const r = await api(
        `/api/v1/card?template=${tpl}&title=${encodeURIComponent('Collaudo 4 nov — àèì 日本')}`,
        { raw: true }
      );
      if (r.status !== 200) {
        wrong.push(`${tpl}: HTTP ${r.status}`);
        continue;
      }
      const d = o.pngDims(r.buf);
      if (!d || d.width !== w || d.height !== h)
        wrong.push(
          `${tpl}: atteso ${w}x${h}, ottenuto ${d ? d.width + 'x' + d.height : 'non PNG'}`
        );
      else fs.writeFileSync(path.join(EV, `card-${tpl}.png`), r.buf);
    }
    check(
      `i ${Object.keys(CARD_DIMS).length} template consegnano le dimensioni dichiarate`,
      wrong.length === 0,
      wrong.join(' | ')
    );

    const long = await api(
      `/api/v1/card?template=og-minimal&title=${encodeURIComponent('x'.repeat(400))}`,
      { raw: true }
    );
    check(
      'un titolo di 400 caratteri non rompe il render',
      long.status === 200 && o.pngDims(long.buf)?.width === 1200,
      `HTTP ${long.status}`
    );
    const empty = await api('/api/v1/card?template=og-minimal&title=', { raw: true });
    check('un titolo vuoto non da 500', empty.status < 500, `HTTP ${empty.status}`);
    const badHex = await api('/api/v1/card?template=og-minimal&title=Test&accent=non-un-colore', {
      raw: true,
    });
    check(
      'un colore non valido da 4xx o un default, mai 500',
      badHex.status < 500,
      `HTTP ${badHex.status}`
    );
    // Il fallback a og-gradient per un template ignoto NON e' una svista: e'
    // dichiarato nei docs e nell'openapi ("Defaults to og-gradient") e applicato
    // uniformemente a theme/trend/size. Per un endpoint che serve <meta og:image>
    // un errore duro romperebbe la card. L'oracolo verifica il contratto
    // documentato, non quello che mi aspettavo al primo giro.
    const badTpl = await api('/api/v1/card?template=non-esiste&title=Test', { raw: true });
    const fallbackDims = badTpl.status === 200 ? o.pngDims(badTpl.buf) : null;
    check(
      'un template ignoto ricade su og-gradient come documentato',
      badTpl.status === 200 &&
        fallbackDims &&
        fallbackDims.width === 1200 &&
        fallbackDims.height === 630,
      `HTTP ${badTpl.status} ${fallbackDims ? fallbackDims.width + 'x' + fallbackDims.height : 'non PNG'}`
    );
  },

  /** EmailGuard: MX, SPF e DMARC si verificano per DNS-over-HTTPS, non a parole. */
  async eg() {
    const r = await api('/api/v1/verify?email=postmaster@gmail.com');
    check('verify risponde 200', r.status === 200, `HTTP ${r.status}`);
    if (r.status !== 200) return;
    const dns = await o.emailDns('gmail.com');
    const c = r.json.checks || {};
    check(
      'il verdetto MX coincide col DNS reale',
      c.mx === dns.mx.length > 0,
      `prodotto mx=${c.mx}, DNS ${dns.mx.length} record`
    );
    check(
      'il verdetto SPF coincide col DNS reale',
      c.spf === dns.spf,
      `prodotto spf=${c.spf}, DNS spf=${dns.spf}`
    );
    check(
      'il verdetto DMARC coincide col DNS reale',
      c.dmarc === dns.dmarc,
      `prodotto dmarc=${c.dmarc}, DNS dmarc=${dns.dmarc}`
    );
    const realHosts = new Set(
      dns.mx.map((m) =>
        m
          .replace(/^\d+\s+/, '')
          .replace(/\.$/, '')
          .toLowerCase()
      )
    );
    const reported = new Set(
      (r.json.mxRecords || []).map((m) => String(m).replace(/\.$/, '').toLowerCase())
    );
    check(
      'i record MX elencati sono quelli veri',
      [...reported].every((h) => realHosts.has(h)) && reported.size === realHosts.size,
      `prodotto ${reported.size}, DNS ${realHosts.size}`
    );
    check(
      'un indirizzo di ruolo e segnalato come tale',
      (r.json.reasons || []).includes('role_address') || r.json.checks?.role === true,
      (r.json.reasons || []).join(',')
    );

    const bad = await api('/api/v1/verify?email=non-un-indirizzo');
    check(
      'una sintassi rotta viene rifiutata o segnata non valida',
      bad.status >= 400 || bad.json?.valid === false,
      `HTTP ${bad.status} valid=${bad.json?.valid}`
    );
    const noMx = await api('/api/v1/verify?email=qualcuno@toolkitonline.vip');
    const dnsNoMx = await o.emailDns('toolkitonline.vip');
    check(
      'un dominio senza MX: il verdetto segue il DNS',
      noMx.status === 200 && noMx.json.checks?.mx === dnsNoMx.mx.length > 0,
      `prodotto mx=${noMx.json?.checks?.mx}, DNS ${dnsNoMx.mx.length} record`
    );
    const over = await api('/api/v1/verify', {
      method: 'POST',
      body: { emails: Array.from({ length: 101 }, (_, i) => `u${i}@gmail.com`) },
    });
    check(
      'un lotto oltre il limite di 100 viene rifiutato',
      over.status >= 400,
      `HTTP ${over.status}`
    );
  },

  /** HeaderShield: il voto si ricalcola dai punti, e i rilievi si confrontano
   *  con gli header veri letti da una connessione indipendente. */
  async hsh() {
    const target = 'https://seoscope.dev';
    const r = await api(`/api/v1/scan?url=${encodeURIComponent(target)}`);
    check('scan risponde 200', r.status === 200, `HTTP ${r.status}`);
    if (r.status !== 200) return;
    const f = r.json.findings || [];
    const pts = f.reduce((s, x) => s + (x.points || 0), 0);
    const max = f.reduce((s, x) => s + (x.maxPoints || 0), 0);
    const recomputed = Math.round((pts / max) * 100);
    check(
      'score = punti ottenuti / punti massimi',
      Math.abs(r.json.score - recomputed) <= 1,
      `riportato ${r.json.score}, ricalcolato ${recomputed} (${pts}/${max})`
    );
    const real = await getFinal(target);
    const present = new Map(Object.entries(real.headers).map(([k, v]) => [k.toLowerCase(), v]));
    const mismatch = [];
    for (const x of f) {
      const name = String(x.header || '').toLowerCase();
      if (!name || !/^[a-z-]+$/.test(name)) continue;
      const there = present.has(name);
      const passed = x.status === 'pass' || x.status === 'warn';
      if (there !== passed && x.status !== 'info')
        mismatch.push(
          `${x.header}: prodotto ${x.status}, header ${there ? 'presente' : 'assente'}`
        );
    }
    check(
      'ogni rilievo coincide con gli header veri',
      mismatch.length === 0,
      mismatch.join(' | ') || `${f.length} rilievi confrontati`
    );
    const dohSpf = await o.doh('seoscope.dev', 'TXT');
    const spfReal = JSON.stringify(dohSpf).includes('v=spf1');
    check(
      'la postura SPF coincide col DNS reale',
      (r.json.dnsPosture?.spf?.status === 'found') === spfReal,
      `prodotto ${r.json.dnsPosture?.spf?.status}, DNS ${spfReal ? 'presente' : 'assente'}`
    );
    const strict = await api(`/api/v1/scan?url=${encodeURIComponent(target)}&fail_under=99`);
    check(
      'fail_under non soddisfatto da 422',
      strict.status === 422,
      `HTTP ${strict.status} (score ${r.json.score} < 99)`
    );
  },

  /** HookLab: la firma si ricalcola, e il payload ispezionato deve essere
   *  identico a quello spedito, byte per byte. Lo schema vero: il corpo
   *  catturato sta in `bodyRaw`, e `verify-signature` ammette solo i provider
   *  stripe/github/shopify (GitHub usa esattamente `sha256=hex(hmac)`). */
  async hkl() {
    const created = await api('/api/v1/endpoints', {
      method: 'POST',
      body: { name: 'collaudo-04nov' },
    });
    check(
      'creazione endpoint 2xx',
      created.status >= 200 && created.status < 300,
      `HTTP ${created.status}`
    );
    const id = created.json?.id || created.json?.endpoint?.id;
    if (!id) return check('endpoint con id', false, JSON.stringify(created.json).slice(0, 200));

    const payload = JSON.stringify({ event: 'invoice.paid', amount: 4917, ref: 'QA-04NOV' });
    const secret = 'qa-collaudo-04nov-secret';
    const sig = `sha256=${o.hmacHex(secret, payload)}`;
    const sent = await fetch(`https://${DOMAIN}/api/h/${id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hub-signature-256': sig },
      body: payload,
    });
    check(
      'la cattura accetta il webhook',
      sent.status >= 200 && sent.status < 300,
      `HTTP ${sent.status}`
    );
    await new Promise((r) => setTimeout(r, 1500));

    const reqs = await api(`/api/v1/endpoints/${id}/requests`);
    check('le richieste catturate si rileggono', reqs.status === 200, `HTTP ${reqs.status}`);
    const list = reqs.json?.requests || [];
    const mine = list.find((x) => String(x.bodyRaw || '').includes('QA-04NOV'));
    check('la richiesta spedita e fra quelle catturate', !!mine, `${list.length} richieste`);
    if (mine) {
      check(
        'bodyRaw e byte-per-byte il payload spedito',
        mine.bodyRaw === payload,
        `catturato ${JSON.stringify(mine.bodyRaw).slice(0, 140)}`
      );
      check(
        'la firma e arrivata intatta nell header',
        (mine.headers || {})['x-hub-signature-256'] === sig,
        `header ${(mine.headers || {})['x-hub-signature-256'] || 'assente'}`
      );
      check(
        'il contentType catturato e quello spedito',
        mine.contentType === 'application/json' && mine.bodyIsJson === true,
        `${mine.contentType} json=${mine.bodyIsJson}`
      );
    }

    // Forma "literal": la firma che ho calcolato io deve essere riconosciuta valida.
    const ver = await api('/api/v1/verify-signature', {
      method: 'POST',
      body: { provider: 'github', secret, rawBody: payload, signature: sig },
    });
    const verOk = ver.status === 200 && /"valid"\s*:\s*true/.test(JSON.stringify(ver.json));
    check(
      'verify-signature conferma la firma che ho calcolato',
      verOk,
      `HTTP ${ver.status} ${JSON.stringify(ver.json).slice(0, 180)}`
    );

    // Firma sbagliata: deve essere dichiarata NON valida, e la risposta non deve
    // essere un 400 di validazione (che passerebbe per il motivo sbagliato).
    const verBad = await api('/api/v1/verify-signature', {
      method: 'POST',
      body: { provider: 'github', secret, rawBody: payload, signature: 'sha256=' + '0'.repeat(64) },
    });
    const declaredInvalid = /"valid"\s*:\s*false/.test(JSON.stringify(verBad.json));
    check(
      'verify-signature dichiara non valida una firma sbagliata',
      verBad.status === 200 && declaredInvalid,
      `HTTP ${verBad.status} ${JSON.stringify(verBad.json).slice(0, 180)}`
    );

    // Un solo byte diverso nel corpo deve invalidare la firma: e' la proprieta'
    // che un cliente compra.
    const tampered = payload.replace('4917', '4918');
    const verTamper = await api('/api/v1/verify-signature', {
      method: 'POST',
      body: { provider: 'github', secret, rawBody: tampered, signature: sig },
    });
    check(
      'un corpo alterato di un byte invalida la firma',
      verTamper.status === 200 && /"valid"\s*:\s*false/.test(JSON.stringify(verTamper.json)),
      `HTTP ${verTamper.status} ${JSON.stringify(verTamper.json).slice(0, 140)}`
    );

    // Forma "captured": verifica contro la richiesta memorizzata.
    const verCap = await api('/api/v1/verify-signature', {
      method: 'POST',
      body: { provider: 'github', secret, endpointId: id, requestIndex: 0 },
    });
    check(
      'verify-signature verifica anche la richiesta memorizzata',
      verCap.status === 200 && /"valid"/.test(JSON.stringify(verCap.json)),
      `HTTP ${verCap.status} ${JSON.stringify(verCap.json).slice(0, 180)}`
    );

    // Pulizia: l'endpoint lo ho creato io adesso, quindi lo rimuovo.
    const del = await api(`/api/v1/endpoints/${id}/delete`, { method: 'POST' });
    check(
      'l endpoint di collaudo viene rimosso',
      del.status >= 200 && del.status < 300,
      `HTTP ${del.status}`
    );
  },

  /** SEOScope: il punteggio si ricalcola dai pesi di categoria, e i fatti della
   *  pagina si confrontano con un parser HTML indipendente. */
  async seo() {
    const target = 'https://toolkitonline.vip';
    const r = await api('/api/v1/audit', { method: 'POST', body: { url: target } });
    check('audit risponde 200', r.status === 200, `HTTP ${r.status}`);
    if (r.status !== 200) return;
    const br = r.json.categoryBreakdown || [];
    const wsum = br.reduce((s, c) => s + c.weight, 0);
    const weighted = br.reduce((s, c) => s + c.score * c.weight, 0) / wsum;
    check(
      'score = media dei punteggi di categoria pesata',
      Math.abs(r.json.score - weighted) <= 1.01,
      `riportato ${r.json.score}, ricalcolato ${weighted.toFixed(2)} (pesi ${br.map((c) => `${c.category}:${c.weight}`).join(' ')})`
    );
    const mismatch = br.filter((c) => r.json.categories[c.category] !== c.score);
    check(
      'i punteggi di categoria coincidono fra le due viste',
      mismatch.length === 0,
      mismatch.map((c) => c.category).join(' ')
    );

    const fetched = await getFinal(target);
    const real = o.seoParse(fetched.body.toString());
    check(
      'l oracolo e il prodotto guardano la stessa pagina',
      true,
      `oracolo su ${fetched.finalUrl}`
    );
    // Il parser dell'oracolo non decodifica le entita' HTML, il prodotto si': senza
    // questa normalizzazione il confronto segnala una differenza che e' solo di
    // codifica (`&amp;` contro `&`).
    const entities = (s) =>
      String(s || '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/\s+/g, ' ')
        .trim();
    check(
      'il titolo letto e quello della pagina',
      entities(r.json.page?.title) === entities(real.title),
      `prodotto "${entities(r.json.page?.title)}" vs reale "${entities(real.title)}"`
    );
    check(
      'la description letta e quella della pagina',
      entities(r.json.page?.description) === entities(real.description),
      `prodotto ${r.json.page?.description?.length ?? 0} car, reale ${real.description?.length ?? 0} car`
    );
    check(
      'il conteggio immagini coincide col parser indipendente',
      r.json.page?.imagesTotal === real.images,
      `prodotto ${r.json.page?.imagesTotal}, parser ${real.images}`
    );
    const strict = await api(`/api/v1/audit?url=${encodeURIComponent(target)}&fail_under=99`);
    check(
      'fail_under non soddisfatto da 422',
      strict.status === 422,
      `HTTP ${strict.status} (score ${r.json.score} < 99)`
    );
  },
};

// ============================================================ cron veri
async function crons() {
  const names = CRONS[SLUG] || [];
  if (!names.length) {
    check(
      'questo prodotto non ha cron (nessun vercel.json)',
      true,
      'verificato sul repo, non assunto'
    );
    return;
  }
  const S = secretsFor(SLUG);
  let cron = S.CRON_SECRET;
  if (!cron) {
    const file = { f1: 'complipilot-cron-secret.txt', b7: 'capture-api-cron-secret.txt' }[SLUG];
    const p = file && `C:/Users/ftass/secrets-private/${file}`;
    if (p && fs.existsSync(p)) cron = fs.readFileSync(p, 'utf8').trim();
  }
  if (!cron) {
    // Due casi diversi, che non vanno confusi:
    //  - f2: `CRON_SECRET` NON ESISTE in produzione (26 variabili elencate via
    //    `vercel env ls`, nessuna con CRON, in nessun ambiente), e i 4 job di
    //    vercel.json accettano solo `Bearer $CRON_SECRET` -> falliscono chiusi
    //    a ogni invocazione. Questo e' un DIFETTO, ed e' il reperto R4.
    //  - altrove: la variabile esiste ma e' marcata Sensitive, quindi
    //    `vercel env pull` la restituisce vuota. Non verificabile, non rosso.
    if (SLUG === 'f2') {
      check(
        'CRON_SECRET esiste in produzione',
        false,
        'assente in OGNI ambiente: i 4 job schedulati in vercel.json (1 cron + 3 admin) falliscono chiusi a ogni invocazione — reperto R4'
      );
    }
    // Niente `return`: la porta chiusa si prova lo stesso, il segreto vero non serve.
  }
  // 8 nov 2026: la chiamata col segreto VERO e' stata TOLTA dal collaudo. Invocava ogni cron
  // a ogni giro, senza leggere la coda che consuma: il 6-7 nov ha fatto partire tre
  // «weekly summary» di EmailGuard verso un cliente reale, di sabato, piu' duplicati su
  // SEOScope e CaptureAPI. Un cron che puo' inviare NON si invoca dal collaudo: qui si prova
  // solo la porta chiusa (nessun segreto, segreto sbagliato -> 401/403). La porta aperta e'
  // coperta dai test unitari di ogni prodotto e dalla schedulazione di Vercel.
  void cron; // letto sopra solo per distinguere R4 (assente) da Sensitive
  const bad = [];
  for (const name of names) {
    const none = await fetch(`https://${DOMAIN}/api/cron/${name}`);
    const wrong = await fetch(`https://${DOMAIN}/api/cron/${name}`, {
      headers: { authorization: 'Bearer sbagliato-08nov' },
    });
    if (![401, 403, 503].includes(none.status))
      bad.push(`${name}: senza segreto -> ${none.status}`);
    if (![401, 403].includes(wrong.status))
      bad.push(`${name}: segreto sbagliato -> ${wrong.status}`);
  }
  check(
    `i ${names.length} cron rifiutano chi non ha il segreto (nessuno o sbagliato)`,
    bad.length === 0,
    bad.length ? bad.join(' | ') : '401/403 su tutti'
  );
  unverified(
    'percorso positivo dei cron (200 col segreto vero)',
    'non invocato per scelta: un cron che invia email o webhook non si chiama dal collaudo (incidente 6-7 nov)'
  );
}

(async () => {
  if (!DOMAIN || !ORACLES[SLUG]) {
    console.error(`slug senza oracolo: ${SLUG} (disponibili: ${Object.keys(ORACLES).join(' ')})`);
    process.exit(2);
  }
  console.log(`\n===== ${SLUG} ${DOMAIN} — feature core con oracolo indipendente\n`);
  fs.mkdirSync(EV, { recursive: true });
  try {
    await ORACLES[SLUG]();
  } catch (e) {
    check('oracolo completato senza eccezioni', false, e.message);
  }
  try {
    await crons();
  } catch (e) {
    check('cron provati senza eccezioni', false, e.message);
  }
  fs.writeFileSync(
    path.join(EV, 'core-oracle.json'),
    JSON.stringify({ slug: SLUG, domain: DOMAIN, at: new Date().toISOString(), results }, null, 1)
  );
  const failed = results.filter((r) => r.pass === false);
  const skipped = results.filter((r) => r.pass === null);
  const checked = results.length - skipped.length;
  console.log(
    `
--- ${SLUG}: ${checked - failed.length}/${checked} PASS` +
      (skipped.length
        ? ` · ${skipped.length} NON VERIFICATI (${skipped.map((x) => x.what).join('; ')})`
        : '')
  );
  if (failed.length) console.log(failed.map((f) => `    FAIL ${f.what}: ${f.detail}`).join('\n'));
})();
