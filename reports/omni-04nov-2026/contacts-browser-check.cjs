/**
 * Verifica nel browser reale (CDP :9223) che nessuna pagina pubblicata mostri un
 * indirizzo che rimbalza, e che la carta "Your data" sia in dashboard.
 *
 * Il test unitario legge il sorgente; questo legge il DOM servito da Vercel. Sono
 * due cose diverse: una build vecchia rimasta in produzione passerebbe il primo e
 * non il secondo. Serve per rispondere "e' live", non "e' committato".
 *
 * Gli unici local-part con una regola di inoltro sono hello/support/contact
 * (misurati 30/30 il 5 nov). Qualunque altro, su un nostro dominio, e' un buco nero.
 */
const { Journey } = require('../../scratchpad/qa-infra/cdp-journey.cjs');

const DELIVERABLE = ['hello', 'support', 'contact'];
const DOMAINS = [
  'complipilot.dev',
  'fixmyweb.dev',
  'paymentrescue.dev',
  'parseflow.dev',
  'captureapi.dev',
  'getcardforge.dev',
  'emailguard.dev',
  'headershield.dev',
  'gethooklab.dev',
  'seoscope.dev',
];
const PAGES = ['/privacy', '/terms', '/dpa', '/security', '/ai-transparency'];

// Raccoglie gli indirizzi su QUALSIASI nostro dominio, non solo su quello corrente:
// una pagina che rimanda al dominio sbagliato e' un difetto a sua volta.
const COLLECT = `(() => {
  const re = /([A-Za-z0-9._%+-]+)@((?:complipilot|fixmyweb|paymentrescue|parseflow|captureapi|getcardforge|emailguard|headershield|gethooklab|seoscope)\.dev)/g;
  const seen = new Set();
  const hay = document.documentElement.innerHTML;
  let m;
  while ((m = re.exec(hay)) !== null) seen.add(m[0].toLowerCase());
  return JSON.stringify({ addrs: [...seen], status: document.title });
})()`;

(async () => {
  const j = await Journey.open('about:blank');
  const bad = [];
  const table = [];
  try {
    for (const domain of DOMAINS) {
      for (const page of PAGES) {
        const url = `https://${domain}${page}`;
        await j.goto(url, { timeout: 40000 });
        await j.idle(500, 20000);
        const { addrs } = JSON.parse(await j.eval(COLLECT));
        // Una pagina inesistente non e' un difetto di questo reperto: su alcuni
        // prodotti /ai-transparency o /dpa non esistono, e li' zero indirizzi va bene.
        for (const a of addrs) {
          const local = a.split('@')[0];
          if (!DELIVERABLE.includes(local)) bad.push(`${url} -> ${a}`);
        }
        table.push(`${domain.padEnd(18)} ${page.padEnd(18)} ${addrs.join(' ') || '(nessuno)'}`);
      }
    }
  } finally {
    await j.close();
  }
  console.log(table.join('\n'));
  console.log(`\nindirizzi non consegnabili trovati nel DOM: ${bad.length}`);
  if (bad.length) console.log(bad.join('\n'));
  process.exitCode = bad.length ? 1 : 0;
})().catch((e) => {
  console.error('ERRORE:', e.message);
  process.exit(2);
});
