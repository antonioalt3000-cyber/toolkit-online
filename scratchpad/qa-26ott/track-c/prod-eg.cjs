// EmailGuard production journey: a visitor types addresses into the live demo.
// Oracle: independent DNS-over-HTTPS + the published scoring rubric recomputed here.
const { Journey, sleep, oracles, SITES, Recorder } = require('./lib.cjs');

const DISPOSABLE = new Set(['mailinator.com']);
const ROLE = new Set([
  'info',
  'admin',
  'support',
  'sales',
  'contact',
  'noreply',
  'no-reply',
  'postmaster',
  'webmaster',
  'billing',
  'help',
  'hello',
  'team',
  'office',
]);

function expectedScore(c) {
  if (!c.syntax) return 0;
  if (!c.mx) return 10;
  let s = 60 + (c.spf ? 12 : 0) + (c.dmarc ? 13 : 0) - (c.disposable ? 45 : 0) - (c.role ? 15 : 0);
  if (c.catchAll) s = Math.min(s - 12, 70);
  return Math.max(0, Math.min(100, s));
}
const statusOf = (s) => (s >= 80 ? 'deliverable' : s >= 50 ? 'risky' : 'undeliverable');
const LABEL = {
  deliverable: 'Valid',
  risky: 'Risky',
  undeliverable: 'Invalid',
  unknown: 'Unknown',
};

const CASES = [
  { email: 'qa26.oracle@gmail.com', note: 'casella gmail plausibile' },
  { email: 'someone@qa26-no-such-domain-7f3k.com', note: 'dominio inesistente' },
  { email: 'test@mailinator.com', note: 'usa-e-getta' },
  { email: 'info@github.com', note: 'indirizzo di ruolo' },
  {
    email: 'john..doe@gmail.com',
    note: 'sintassi RFC rotta (punti consecutivi) ma accettata da HTML5',
  },
  { email: 'user@example.com', note: 'dominio con null MX (RFC 7505)' },
];

(async () => {
  const rec = new Recorder('eg', 'prod-demo');
  const j = await Journey.open(`${SITES.eg.prod}/verify-email`);
  try {
    for (const [i, c] of CASES.entries()) {
      if (i > 0) await sleep(13000); // demo limit 5/min/IP
      const [local, domain] = [
        c.email.slice(0, c.email.lastIndexOf('@')),
        c.email.slice(c.email.lastIndexOf('@') + 1),
      ];
      await j.type('#demo-email', c.email);
      const respP = j.waitForResponse('/api/demo', 45000);
      await j.click('form button[type="submit"]');
      const resp = await respP;
      const data = JSON.parse(resp.body.toString());
      await j
        .waitFor("js:!document.querySelector('form button[type=submit]').disabled", {
          timeout: 30000,
        })
        .catch(() => {});
      await sleep(600);
      const ui = await j.eval(`document.querySelector("#demo-email").closest(".glass").innerText`);
      await j.screenshot(rec.ev(`demo-${i + 1}.png`));
      if (resp.status !== 200) {
        rec.check(`demo ${c.email}: HTTP`, 200, { status: resp.status, data }, false);
        continue;
      }

      // independent facts
      const dns = await oracles.emailDns(domain);
      const nullMx = dns.mx.length === 1 && /^0 \.$/.test(dns.mx[0].trim());
      const syntaxOk =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) &&
        !/\.\./.test(local) &&
        !local.startsWith('.') &&
        !local.endsWith('.');
      const facts = {
        syntax: syntaxOk,
        mx: dns.mx.length > 0 && !nullMx,
        spf: dns.spf,
        dmarc: dns.dmarc,
        disposable: DISPOSABLE.has(domain),
        role: ROLE.has(local.toLowerCase()),
        catchAll: !!data.checks?.catchAll,
      };
      const exp = expectedScore(facts);
      const ch = data.checks || {};
      rec.check(
        `demo ${c.email} (${c.note}): segnali vs DNS indipendente`,
        {
          syntax: facts.syntax,
          mx: facts.mx,
          ...(facts.syntax && facts.mx ? { spf: facts.spf, dmarc: facts.dmarc } : {}),
          disposable: facts.disposable,
          role: facts.role,
        },
        {
          syntax: ch.syntax,
          mx: ch.mx,
          ...(facts.syntax && facts.mx ? { spf: ch.spf, dmarc: ch.dmarc } : {}),
          disposable: ch.disposable,
          role: ch.role,
          catchAll: ch.catchAll,
          dnsMx: dns.mx,
        },
        ch.syntax === facts.syntax &&
          (!facts.syntax || ch.mx === facts.mx) &&
          (!(facts.syntax && facts.mx) || (ch.spf === facts.spf && ch.dmarc === facts.dmarc)) &&
          (!facts.syntax || (ch.disposable === facts.disposable && ch.role === facts.role))
      );
      const unknownOk = data.status === 'unknown' && data.score === 50;
      rec.check(
        `demo ${c.email}: punteggio e stato vs rubrica`,
        { score: exp, status: statusOf(exp) },
        { score: data.score, status: data.status, reason: data.reason },
        unknownOk || (data.score === exp && data.status === statusOf(exp))
      );
      const label = LABEL[data.status];
      rec.check(
        `demo ${c.email}: UI coerente con la risposta`,
        `badge "${label}" e punteggio ${data.score} a schermo`,
        ui.slice(0, 160).replace(/\s+/g, ' '),
        ui.includes(label) && ui.includes(String(data.score))
      );
    }

    // HTML5 guard: a visibly malformed address must not even be submitted.
    await sleep(2000);
    await j.type('#demo-email', 'a@@b');
    let fired = false;
    const l = (m, p) => {
      if (m === 'Network.requestWillBeSent' && p.request.url.includes('/api/demo')) fired = true;
    };
    j.listeners.push(l);
    await j.click('form button[type="submit"]');
    await sleep(2500);
    const valid = await j.eval(`document.querySelector('#demo-email').checkValidity()`);
    const msg = await j.eval(`document.querySelector('#demo-email').validationMessage`);
    rec.check(
      "input 'a@@b': validazione nativa blocca l'invio",
      'checkValidity=false e nessuna chiamata /api/demo',
      { checkValidity: valid, validationMessage: msg, requestSent: fired },
      valid === false && !fired
    );

    // empty submit
    await j.type('#demo-email', '');
    fired = false;
    await j.click('form button[type="submit"]');
    await sleep(1500);
    rec.check(
      'input vuoto: invio bloccato',
      'nessuna chiamata /api/demo',
      { requestSent: fired },
      !fired
    );
    const rep = j.report();
    rec.check(
      'demo: console/eccezioni durante il viaggio',
      '0 errori',
      rep,
      rep.consoleErrors.length === 0 && rep.exceptions.length === 0
    );
  } finally {
    await j.close();
  }
  console.log(
    `== eg prod-demo: ${rec.rows.filter((r) => !r.pass).length} FAIL / ${rec.rows.length}`
  );
})().catch((e) => {
  console.error('JOURNEY ERROR', e);
  process.exitCode = 1;
});
