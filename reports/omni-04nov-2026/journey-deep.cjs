#!/usr/bin/env node
/**
 * journey-deep.cjs — il viaggio del cliente pagante, dal coupon alla feature.
 *
 *   node journey-deep.cjs <slug>
 *
 * Scrive in produzione. Due protezioni non negoziabili:
 *  - il coupon nasce `internal: true`, quindi solo l'email del fondatore puo'
 *    riscattarlo: i pool dei partner non vengono sfiorati;
 *  - ogni chiave Redis che nasce finisce in REDIS-WRITES.jsonl PRIMA di nascere,
 *    altrimenti il teardown non la ritrova.
 *
 * Il mese si comprime invocando i cron con Bearer CRON_SECRET (leva L1): e' il
 * solo modo di far avanzare dunning, review-request e monitor senza aspettare.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  Journey,
  sleep,
} = require('C:/Users/ftass/toolkit-online/scratchpad/qa-infra/cdp-journey.cjs');

const SLUG = process.argv[2];
const DIR = __dirname;
const SECRETS = 'C:/Users/ftass/AppData/Local/Temp/claude/qa-secrets';

const isPng = (b) => b[0] === 0x89 && b[1] === 0x50;

const P = {
  f1: {
    dom: 'complipilot.dev',
    name: 'CompliPilot',
    prefix: 'QAOCT',
    feature: {
      method: 'POST',
      url: '/api/scan',
      body: { url: 'https://example.com' },
      key: 'x-api-key',
      oracle: (t) => /"(overallScore|score)"\s*:\s*\d+/.test(t),
      what: 'uno scan AI Act con un punteggio',
    },
  },
  f2: {
    dom: 'fixmyweb.dev',
    name: 'FixMyWeb',
    prefix: 'QAOCT',
    feature: {
      method: 'POST',
      url: '/api/scan',
      body: { url: 'https://example.com' },
      key: 'x-api-key',
      oracle: (t) => /"score"\s*:\s*\d+/.test(t),
      what: 'uno scan WCAG con un punteggio',
    },
  },
  f3: {
    dom: 'paymentrescue.dev',
    name: 'PaymentRescue',
    prefix: 'QAOCT',
    feature: {
      method: 'GET',
      url: '/api/dashboard',
      cookie: true,
      oracle: (t) => /"(stats|recovered|failedPayments|plan)"/.test(t),
      what: 'la dashboard dunning',
    },
  },
  f4: {
    dom: 'parseflow.dev',
    name: 'ParseFlow',
    prefix: 'QAOCT',
    feature: {
      method: 'GET',
      url: '/api/v1/dashboard',
      key: 'x-api-key',
      oracle: (t) => /"(plan|usage|documents)"/.test(t),
      what: 'la dashboard estrazioni',
    },
  },
  b7: {
    dom: 'captureapi.dev',
    name: 'CaptureAPI',
    prefix: 'QAOCT',
    feature: {
      method: 'GET',
      url: '/api/v1/screenshot?url=https://example.com&width=800&height=600',
      key: 'x-api-key',
      binary: true,
      oracle: isPng,
      what: 'uno screenshot PNG vero',
    },
  },
  cfg: {
    dom: 'getcardforge.dev',
    name: 'CardForge',
    prefix: 'QAOCTB',
    feature: {
      method: 'GET',
      url: '/api/v1/card?template=og-minimal&title=Collaudo',
      key: 'x-api-key',
      binary: true,
      oracle: isPng,
      what: 'una card PNG vera',
    },
  },
  eg: {
    dom: 'emailguard.dev',
    name: 'EmailGuard',
    prefix: 'QAOCT',
    feature: {
      method: 'GET',
      url: '/api/v1/verify?email=postmaster@gmail.com',
      key: 'x-api-key',
      oracle: (t) => /"score"\s*:\s*\d+/.test(t),
      what: 'una verifica email con punteggio',
    },
  },
  hsh: {
    dom: 'headershield.dev',
    name: 'HeaderShield',
    prefix: 'QAOCT',
    feature: {
      method: 'GET',
      url: '/api/v1/scan?url=https://example.com',
      key: 'x-api-key',
      oracle: (t) => /"(grade|score)"/.test(t),
      what: 'uno scan header con voto',
    },
  },
  hkl: {
    dom: 'gethooklab.dev',
    name: 'HookLab',
    prefix: 'QAOCT',
    feature: {
      method: 'GET',
      url: '/api/v1/endpoints',
      key: 'x-api-key',
      oracle: (t) => /\[|"endpoints"/.test(t),
      what: 'la lista degli endpoint webhook',
    },
  },
  seo: {
    dom: 'seoscope.dev',
    name: 'SEOScope',
    prefix: 'QAOCT',
    feature: {
      method: 'POST',
      url: '/api/v1/audit',
      body: { url: 'https://example.com' },
      key: 'x-api-key',
      oracle: (t) => /"(score|issues)"/.test(t),
      what: 'un audit SEO con punteggio',
    },
  },
}[SLUG];
if (!P) throw new Error('slug ignoto: ' + SLUG);

const EV = path.join(DIR, 'evidence', SLUG);
fs.mkdirSync(EV, { recursive: true });
const EMAIL = 'antonio.alt3000+qa04nov-' + SLUG + '@gmail.com';
const out = [];

function check(day, what, pass, detail) {
  out.push({ day, what, pass: !!pass, detail: String(detail || '').slice(0, 300) });
  const tail = detail ? '  — ' + String(detail).slice(0, 150) : '';
  console.log((pass ? 'PASS' : 'FAIL') + '  D' + day + '  ' + what + tail);
}

function secrets() {
  const f = path.join(SECRETS, SLUG + '.qa');
  const o = {};
  if (fs.existsSync(f)) {
    for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
      const m = l.match(/^([A-Z_]+)="?([^"\r\n]*)"?$/);
      if (m) o[m[1]] = m[2];
    }
  }
  return o;
}

function curl(args) {
  return execFileSync('curl', ['-s', '--max-time', '70'].concat(args), {
    maxBuffer: 64 * 1024 * 1024,
  });
}

/**
 * Come curl(), ma non fa cadere il giro: un segreto che comincia per "-", un
 * timeout o un reset fanno uscire curl non-zero, ed execFileSync in quel caso
 * lancia. Un singolo cron irraggiungibile e' un check rosso, non la fine del
 * collaudo. L'errore non viene stampato: conterrebbe il segreto in chiaro.
 */
function curlSoft(args) {
  try {
    return { ok: true, out: curl(args).toString().trim() };
  } catch (e) {
    return {
      ok: false,
      out: 'curl uscito con codice ' + (e.status === undefined ? '?' : e.status),
    };
  }
}

function note(key, nota) {
  execFileSync(
    'node',
    [path.join(DIR, 'progress.cjs'), 'redis', '--repo', SLUG, '--key', key, '--nota', nota],
    { stdio: 'ignore' }
  );
}

const SINK = path.join(require('os').tmpdir(), 'qa-curl-sink-' + SLUG + '.bin');

/**
 * Chiave creator dal vault, quando la pagina di riscatto non la mostra: F1 la
 * manda per email, F2 usa un magic-link e F3 una sessione. E' il metodo
 * permanente documentato in creator-test-access-permanent, non una scorciatoia.
 * Il valore non viene mai stampato.
 */
function vaultKey() {
  const f = 'C:/Users/ftass/secrets-private/saas-creator-keys.md';
  if (!fs.existsSync(f)) return '';
  const row = fs
    .readFileSync(f, 'utf8')
    .split(String.fromCharCode(10))
    .find((l) => l.startsWith('|') && l.includes(P.dom) && l.includes('`'));
  const m = row && row.match(/`([A-Za-z0-9_]{16,})`/);
  return m ? m[1] : '';
}

/**
 * Le variabili Vercel marcate "Sensitive" tornano VUOTE da `vercel env pull`:
 * un valore vuoto nel file scaricato non dice nulla sulla produzione. Per i due
 * prodotti che lo tengono anche nel vault si legge da li'.
 */
function vaultCron() {
  const bySlug = { f1: 'complipilot-cron-secret.txt', b7: 'capture-api-cron-secret.txt' };
  const f = bySlug[SLUG] && 'C:/Users/ftass/secrets-private/' + bySlug[SLUG];
  return f && fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : '';
}

const NOISE = /favicon|analytics|posthog|sentry|gtag|googletag|extension|ERR_BLOCKED_BY_CLIENT/i;

(async () => {
  const S = secrets();
  if (!S.CRON_SECRET) S.CRON_SECRET = vaultCron();
  console.log('\n===== ' + P.name + ' (' + P.dom + ') — viaggio del cliente pagante\n');

  // ---- D1: conia un coupon interno (i pool dei partner restano intatti)
  let code = '';
  if (S.ADMIN_API_SECRET) {
    const r = curl([
      '-X',
      'POST',
      'https://' + P.dom + '/api/admin/generate-coupons',
      '-H',
      'x-admin-secret: ' + S.ADMIN_API_SECRET,
      '-H',
      'Content-Type: application/json',
      '-d',
      JSON.stringify({ prefix: P.prefix, count: 1, internal: true }),
    ]).toString();
    try {
      code = (JSON.parse(r).sample || [])[0] || '';
    } catch {
      // la forma della risposta la riporta il check qui sotto
    }
    check(
      1,
      'coniato un coupon interno via /api/admin/generate-coupons',
      !!code,
      code || r.slice(0, 160)
    );
    if (code) note('coupons:used -> ' + code, 'coniato e riscattato nel journey 31 ott');
  } else {
    check(1, 'ADMIN_API_SECRET disponibile', false, 'assente nella env di produzione');
  }

  const j = await Journey.open('https://' + P.dom + '/redeem');
  try {
    await j.idle();

    // ---- D1: il riscatto, nel browser, come lo farebbe il cliente
    if (code) {
      await j.type('#redeem-code', code);
      await j.type('#redeem-email', EMAIL);
      // Alcuni form (PaymentRescue) tengono il bottone disabilitato finche' il
      // cliente non spunta una conferma. Un giro che non la spunta conclude
      // "il bottone non fa niente" e accusa il prodotto di un difetto suo.
      const ticked = await j.eval(`(() => {
        const boxes = [...document.querySelectorAll('form input[type=checkbox]')];
        for (const b of boxes) { if (!b.checked) b.click(); }
        return boxes.length;
      })()`);
      if (ticked) console.log('        (spuntate ' + ticked + ' caselle di conferma)');
      await sleep(1800); // la guardia anti-bot pretende >=1.2-1.5s fra render e invio
      await j.click('button[type=submit]');
      await sleep(7000);
      await j.idle();
      await j.screenshot(path.join(EV, 'd1-redeem-esito.png'));
      // L'oracolo NON e' il testo della pagina: la parola "lifetime" compare gia'
      // nella descrizione del form, quindi un riscatto mai partito passava lo
      // stesso (successo nel primo giro su F3, poi smentito dal 401 successivo).
      // L'oracolo vero e' lo stato della POST /api/redeem vista dalla rete.
      let redeemStatus = 0;
      for (const r of j.responses.values()) {
        if (/\/api\/redeem$/.test(new URL(r.url).pathname)) redeemStatus = r.status;
      }
      const body = await j.text('body');
      const flat = String(body).replace(/\s+/g, ' ');
      check(
        1,
        'il riscatto parte e la POST /api/redeem risponde 2xx',
        redeemStatus >= 200 && redeemStatus < 300,
        redeemStatus
          ? 'HTTP ' + redeemStatus
          : "la POST non e' mai partita (invio dal browser non riuscito)"
      );
      const m = flat.match(/\b((?:cfg|eg|hsh|hkl|seo|cap|dm|ask|pre|cpl)_[A-Za-z0-9_]{12,})\b/);
      if (m) {
        fs.writeFileSync(path.join(EV, 'apikey.txt'), m[1]);
        check(1, 'la pagina consegna la chiave API', true, m[1].slice(0, 10) + '…');
      }
    }

    // ---- D3: la feature a pagamento, con un oracolo vero
    const keyFile = path.join(EV, 'apikey.txt');
    const apiKey =
      (fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : '') || vaultKey();
    const F = P.feature;
    if (F.cookie) {
      const expr =
        'fetch(' +
        JSON.stringify(F.url) +
        ",{credentials:'include'}).then(r=>r.text()).then(t=>t.slice(0,2000))";
      const r = String(await j.eval(expr));
      check(3, 'la feature core risponde: ' + F.what, F.oracle(r), r.slice(0, 180));
    } else if (apiKey) {
      const args = ['https://' + P.dom + F.url, '-H', F.key + ': ' + apiKey];
      if (F.method === 'POST') {
        args.push(
          '-X',
          'POST',
          '-H',
          'Content-Type: application/json',
          '-d',
          JSON.stringify(F.body || {})
        );
      }
      const buf = curl(args);
      const pass = F.binary ? F.oracle(buf) : F.oracle(buf.toString());
      const detail = F.binary
        ? buf.length + ' byte, firma ' + buf.slice(0, 4).toString('hex')
        : buf.toString().slice(0, 180);
      check(3, 'la feature core risponde: ' + F.what, pass, detail);
    } else {
      check(3, 'la feature core risponde: ' + F.what, false, 'nessuna chiave API dal riscatto');
    }

    // ---- D7 / D30: i cron NON si sondano qui.
    // Questa parte sondava su ogni prodotto `review-requests` e `cleanup`, e
    // contava un 404 come PASS ("quel cron non esiste qui"). Il risultato era un
    // verde vacuo: su HeaderShield il cron vero (`dispatcher`) non era mai stato
    // provato, e "il cron rifiuta un segreto sbagliato — HTTP 404" non dimostra
    // nulla. I cron veri si leggono dal `vercel.json` di ciascun repo e li prova
    // `journey-core.cjs`, che pretende 200 col segreto giusto e 401/403 con uno
    // sbagliato. Qui si dichiara solo dove sono coperti, per non lasciare
    // un'evidenza che sembra una verifica e non lo e'.
    console.log(
      'RIMANDO  D7/D30  i cron: coperti da journey-core.cjs sui percorsi veri di vercel.json'
    );

    const dirty = j.consoleErrors.filter((x) => !NOISE.test(x)).concat(j.exceptions);
    check(
      30,
      'nessun errore di console nel viaggio autenticato',
      dirty.length === 0,
      dirty.join(' | ')
    );

    fs.writeFileSync(
      path.join(EV, 'deep-results.json'),
      JSON.stringify({ slug: SLUG, dom: P.dom, email: EMAIL, code, results: out }, null, 2)
    );
    const failed = out.filter((r) => !r.pass);
    console.log(
      '\n--- ' + P.name + ': ' + (out.length - failed.length) + '/' + out.length + ' PASS'
    );
  } finally {
    await j.close();
  }
})().catch((e) => {
  console.error('ERRORE HARNESS:', e.message);
  process.exit(1);
});
