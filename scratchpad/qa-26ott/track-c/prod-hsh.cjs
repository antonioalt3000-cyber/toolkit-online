// HeaderShield production journey: live demo on real sites + the /simulate
// what-if grader. Oracle: an independent re-implementation of the published
// rubric (written here, not imported) over headers fetched separately.
const { Journey, sleep, oracles, SITES, Recorder } = require('./lib.cjs');

function grade(headersIn) {
  const h = Object.fromEntries(
    Object.entries(headersIn).map(([k, v]) => [
      k.toLowerCase(),
      Array.isArray(v) ? v.join(', ') : String(v),
    ])
  );
  const pts = {};
  const csp = h['content-security-policy'];
  const dirs = (csp || '')
    .split(';')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  const scriptDir =
    dirs.find((d) => d.startsWith('script-src-elem ')) ||
    dirs.find((d) => d.startsWith('script-src ')) ||
    dirs.find((d) => d.startsWith('default-src '));
  if (!csp) pts.csp = 0;
  else if (scriptDir && /unsafe-inline|unsafe-eval/.test(scriptDir)) pts.csp = 12.5;
  else if (!scriptDir) pts.csp = 8;
  else pts.csp = 25;
  const hsts = h['strict-transport-security'];
  if (!hsts) pts.hsts = 0;
  else {
    const ma = Number((hsts.match(/max-age\s*=\s*(\d+)/i) || [])[1] || 0);
    pts.hsts = ma >= 15552000 && /includesubdomains/i.test(hsts) ? 20 : 14;
  }
  const xfo = h['x-frame-options'];
  pts.xfo =
    csp && /frame-ancestors/i.test(csp)
      ? 10
      : xfo && /^(deny|sameorigin)$/i.test(xfo.trim())
        ? 10
        : xfo
          ? 5
          : 0;
  const xcto = h['x-content-type-options'];
  pts.xcto = xcto && xcto.trim().toLowerCase() === 'nosniff' ? 10 : xcto ? 5 : 0;
  pts.referrer = h['referrer-policy'] ? 10 : 0;
  pts.permissions = h['permissions-policy'] ? 10 : 0;
  pts.coop = h['cross-origin-opener-policy'] ? 5 : 0;
  pts.corp = h['cross-origin-resource-policy'] ? 5 : 0;
  pts.leak = h['server'] || h['x-powered-by'] ? 0 : 5;
  const score = Math.round(Object.values(pts).reduce((a, b) => a + b, 0));
  const g =
    score >= 95
      ? 'A+'
      : score >= 85
        ? 'A'
        : score >= 70
          ? 'B'
          : score >= 55
            ? 'C'
            : score >= 40
              ? 'D'
              : score >= 25
                ? 'E'
                : 'F';
  return { score, grade: g, pts };
}
const LABEL = {
  'Content-Security-Policy': 'csp',
  'Strict-Transport-Security': 'hsts',
  'X-Frame-Options': 'xfo',
  'X-Content-Type-Options': 'xcto',
  'Referrer-Policy': 'referrer',
  'Permissions-Policy': 'permissions',
  'Cross-Origin-Opener-Policy': 'coop',
  'Cross-Origin-Resource-Policy': 'corp',
  'Server / X-Powered-By': 'leak',
};
const productPts = (findings) =>
  Object.fromEntries(
    findings.filter((f) => LABEL[f.header]).map((f) => [LABEL[f.header], f.points])
  );

// Hand-computed expectations (worked out on paper from the rubric, then cross-checked by grade()).
const SIM = [
  { name: 'solo Content-Type', block: 'Content-Type: text/html', hand: { score: 5, grade: 'F' } },
  {
    name: 'configurazione completa',
    hand: { score: 100, grade: 'A+' },
    block: [
      "Content-Security-Policy: default-src 'self'; script-src 'self'; frame-ancestors 'none'",
      'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
      'X-Content-Type-Options: nosniff',
      'Referrer-Policy: strict-origin-when-cross-origin',
      'Permissions-Policy: camera=(), microphone=()',
      'Cross-Origin-Opener-Policy: same-origin',
      'Cross-Origin-Resource-Policy: same-origin',
    ].join('\n'),
  },
  {
    name: 'debole con arrotondamento .5',
    hand: { score: 37, grade: 'E' },
    block: [
      // 12.5+14+5+5+0 = 36.5 -> 37
      "Content-Security-Policy: default-src 'self' 'unsafe-inline'",
      'Strict-Transport-Security: max-age=300',
      'X-Frame-Options: ALLOW-FROM https://a.example',
      'X-Content-Type-Options: sniff',
      'Server: nginx/1.25',
    ].join('\n'),
  },
  {
    name: 'CSP senza direttive script',
    hand: { score: 48, grade: 'D' },
    block: [
      // 8+20+10+10 = 48
      "Content-Security-Policy: frame-ancestors 'none'",
      'Strict-Transport-Security: max-age=31536000; includeSubDomains',
      'Referrer-Policy: no-referrer',
      'X-Powered-By: Express',
    ].join('\n'),
  },
];

(async () => {
  const rec = new Recorder('hsh', 'prod-demo');
  // ---- live demo on real targets ----
  const TARGETS = ['github.com', 'toolkitonline.vip', 'headershield.dev', 'www.w3.org'];
  const j = await Journey.open(`${SITES.hsh.prod}/`);
  try {
    for (const [i, t] of TARGETS.entries()) {
      if (i > 0) await sleep(13000);
      await j.type('#header-demo-url', t);
      const respP = j.waitForResponse('/api/demo', 60000);
      await j.click('form:has(#header-demo-url) button[type="submit"]');
      const resp = await respP;
      await sleep(1500);
      const data = JSON.parse(resp.body.toString());
      await j.screenshot(rec.ev(`demo-${t}.png`));
      if (resp.status !== 200) {
        rec.check(`demo ${t}: HTTP`, 200, { status: resp.status, data }, false);
        continue;
      }
      const raw = await oracles.rawGet(`https://${t}/`);
      const mine = grade(raw.headers);
      const theirs = productPts(data.findings || []);
      const diff = Object.keys(mine.pts).filter((k) => mine.pts[k] !== theirs[k]);
      rec.check(
        `demo ${t}: voce per voce vs header scaricati a parte`,
        mine,
        {
          score: data.score,
          grade: data.grade,
          pts: theirs,
          fetchedStatus: data.fetchedStatus,
          differenze: diff,
        },
        diff.length === 0 && data.score === mine.score && data.grade === mine.grade
      );
      const ui = await j.eval(
        `document.querySelector('#header-demo-url').closest('.glass, section, div').parentElement.innerText`
      );
      rec.check(
        `demo ${t}: voto a schermo = risposta`,
        `voto ${data.grade} visibile`,
        ui.slice(0, 200).replace(/\s+/g, ' '),
        new RegExp(`(^|\\s)${data.grade.replace('+', '\\+')}(\\s|$)`).test(ui)
      );
    }
    // SSRF / malformed input through the same UI
    for (const [k, bad] of [
      ['metadata AWS', '169.254.169.254'],
      ['localhost', 'localhost:3000'],
      ['schema non http', 'file:///etc/passwd'],
    ].entries()) {
      await sleep(13000);
      await j.type('#header-demo-url', bad[1]);
      const respP = j.waitForResponse('/api/demo', 30000).catch(() => null);
      await j.click('form:has(#header-demo-url) button[type="submit"]');
      const resp = await respP;
      await sleep(800);
      const body = resp && resp.body ? resp.body.toString().slice(0, 200) : null;
      rec.check(
        `demo input ostile (${bad[0]}): rifiutato`,
        '4xx con messaggio, nessuno scan',
        { status: resp && resp.status, body },
        !!resp && resp.status >= 400 && resp.status < 500
      );
    }
  } finally {
    await j.close();
  }

  // ---- what-if simulator ----
  const s = await Journey.open(`${SITES.hsh.prod}/simulate`);
  try {
    for (const c of SIM) {
      await s.type('#sim-headers', c.block);
      const respP = s.waitForResponse('/api/v1/simulate', 30000);
      await s.click('form:has(#sim-headers) button[type="submit"]');
      const resp = await respP;
      await sleep(800);
      const data = JSON.parse(resp.body.toString());
      const parsed = Object.fromEntries(
        c.block
          .split('\n')
          .map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()])
      );
      const mine = grade(parsed);
      rec.check(
        `simulate "${c.name}": oracolo a mano = oracolo codice`,
        c.hand,
        { score: mine.score, grade: mine.grade },
        mine.score === c.hand.score && mine.grade === c.hand.grade
      );
      rec.check(
        `simulate "${c.name}": prodotto`,
        c.hand,
        {
          status: resp.status,
          score: data.score,
          grade: data.grade,
          pts: productPts(data.findings || []),
        },
        resp.status === 200 && data.score === c.hand.score && data.grade === c.hand.grade
      );
      const ui = await s.eval(
        `document.querySelector('#sim-headers').closest('form').parentElement.innerText`
      );
      rec.check(
        `simulate "${c.name}": voto a schermo`,
        c.hand.grade,
        ui.slice(0, 160).replace(/\s+/g, ' '),
        new RegExp(`(^|\\s)${c.hand.grade.replace('+', '\\+')}(\\s|$)`).test(ui)
      );
      await s.screenshot(rec.ev(`simulate-${c.hand.score}.png`));
    }
    const rep = s.report();
    rec.check(
      'simulate: console/eccezioni',
      '0',
      rep,
      rep.consoleErrors.length === 0 && rep.exceptions.length === 0
    );
  } finally {
    await s.close();
  }
  console.log(
    `== hsh prod-demo: ${rec.rows.filter((r) => !r.pass).length} FAIL / ${rec.rows.length}`
  );
})().catch((e) => {
  console.error('JOURNEY ERROR', e);
  process.exitCode = 1;
});
