/**
 * Verifica nel browser reale (CDP :9223) che la carta "Your data" sia dove deve
 * essere e NON dove non deve: su CompliPilot il ramo principale della dashboard
 * rende anche per un ospite, quindi la carta va vista da cliente autenticato e
 * NON vista da chi non ha un account. Un test che controlla solo il caso
 * positivo non avrebbe scoperto quel difetto.
 *
 * Le chiavi non vengono mai stampate: si leggono dal vault e si usano.
 */
const { Journey } = require('../../scratchpad/qa-infra/cdp-journey.cjs');
const { readFileSync } = require('node:fs');

const VAULT = 'C:/Users/ftass/secrets-private/saas-creator-keys.md';

function keyFor(slug) {
  const line = readFileSync(VAULT, 'utf8')
    .split('\n')
    .find(
      (l) => l.includes(`| ${slug} `) || l.includes(`| ${slug} |`) || l.startsWith(`| ${slug}`)
    );
  const m = line && line.match(/`([A-Za-z0-9_]+)`/);
  return m ? m[1] : null;
}

// `#key=` è il deep link del welcome email sui prodotti a chiave; CompliPilot usa
// `?login=` (magic login che scambia la chiave per una sessione localStorage).
const TARGETS = [
  { slug: 'headershield', url: 'https://headershield.dev/dashboard#key=', expect: true },
  { slug: 'captureapi (B7)', url: 'https://captureapi.dev/dashboard#key=', expect: true },
  { slug: 'complipilot (F1)', url: 'https://complipilot.dev/dashboard?login=', expect: true },
];

const PROBE = `(() => {
  const cards = [...document.querySelectorAll('h2')].filter((h) => h.textContent.trim() === 'Your data');
  const card = cards[0] ? cards[0].closest('div') : null;
  const links = card ? [...card.querySelectorAll('a[href^="mailto:"]')] : [];
  return JSON.stringify({
    cards: cards.length,
    labels: links.map((a) => a.textContent.trim()),
    mailtos: links.map((a) => a.getAttribute('href')),
    saysRequest: !!card && /within 30 days/i.test(card.textContent),
    saysKeeps: !!card && /billing records/i.test(card.textContent),
  });
})()`;

(async () => {
  const j = await Journey.open('about:blank');
  let bad = 0;
  try {
    // 1) Ospite: la carta NON deve esserci.
    // Lo storage va svuotato PRIMA, altrimenti non si sta misurando un ospite: il
    // profilo :9223 porta le sessioni dei round precedenti (`complipilot-auth`,
    // `captureapi-dashboard`), e un ritorno con sessione in cache e' un cliente.
    // Senza questo passo la sonda produce due rossi che non sono dei prodotti.
    for (const t of TARGETS) {
      const base = t.url.split('/dashboard')[0];
      await j.goto(`${base}/dashboard`, { timeout: 40000 });
      await j.idle(500, 25000);
      await j.eval(
        '(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} return 1; })()'
      );
      await j.goto(`${base}/dashboard`, { timeout: 40000 });
      await j.idle(800, 25000);
      const r = JSON.parse(await j.eval(PROBE));
      const ok = r.cards === 0;
      if (!ok) bad++;
      console.log(
        `${t.slug.padEnd(18)} OSPITE      carte=${r.cards}  ${ok ? 'OK (assente, come deve)' : '🔴 PRESENTE a chi non ha account'}`
      );
    }
    // 2) Autenticato: la carta deve esserci, con due mailto e le due frasi.
    for (const t of TARGETS) {
      const slug = t.slug.split(' ')[0];
      const key = keyFor(slug);
      if (!key) {
        console.log(`${t.slug.padEnd(18)} AUTENTICATO chiave non trovata nel vault — salto`);
        continue;
      }
      await j.goto(t.url + key, { timeout: 45000 });
      await j.idle(1200, 40000);
      const r = JSON.parse(await j.eval(PROBE));
      const ok =
        r.cards === 1 &&
        r.mailtos.length === 2 &&
        r.saysRequest &&
        r.saysKeeps &&
        r.mailtos.every((h) => /^mailto:(hello|support|contact)@/.test(h));
      if (!ok) bad++;
      console.log(
        `${t.slug.padEnd(18)} AUTENTICATO carte=${r.cards} link=${r.labels.join('/')} ` +
          `30gg=${r.saysRequest} conserva=${r.saysKeeps} ${ok ? 'OK' : '🔴'}`
      );
      for (const h of r.mailtos) console.log(`                   ${h}`);
    }
  } finally {
    await j.close();
  }
  console.log(`\ncontrolli falliti: ${bad}`);
  process.exitCode = bad ? 1 : 0;
})().catch((e) => {
  console.error('ERRORE:', e.message);
  process.exit(2);
});
