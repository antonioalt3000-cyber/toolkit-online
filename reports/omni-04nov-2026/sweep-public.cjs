#!/usr/bin/env node
/**
 * sweep-public.cjs — rastrellamento della superficie pubblica di un prodotto, via HTTP
 * grezzo, con un parser HTML indipendente da quello del prodotto.
 *
 * Tre domande per pagina:
 *   1. risponde 200?
 *   2. ha metadata propri (title/description non ereditati dalla home) e un og:image?
 *   3. la stessa rotta con un backslash finale risponde 404 o 500?
 *
 * La terza e' il reperto del 4 nov: `<rotta esistente>\` da' 500 su 9 prodotti su 10.
 *
 *   node sweep-public.cjs <slug>
 */
const fs = require('fs');
const path = require('path');
const o = require('C:/Users/ftass/toolkit-online/scratchpad/qa-infra/oracles.cjs');

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

const SLUG = process.argv[2];
const BASE = `https://${DOM[SLUG]}`;
if (!DOM[SLUG]) throw new Error(`slug ignoto: ${SLUG}`);
const EV = path.join(__dirname, 'evidence', SLUG);
fs.mkdirSync(EV, { recursive: true });

/** Le rotte su cui il probe backslash si concentra: quelle che un cliente vede davvero. */
const BACKSLASH_PRIORITY = [
  '/',
  '/pricing',
  '/redeem',
  '/help',
  '/docs',
  '/dashboard',
  '/signup',
  '/login',
];

async function pool(items, width, fn) {
  const queue = [...items];
  const out = [];
  await Promise.all(
    Array.from({ length: width }, async () => {
      while (queue.length) out.push(await fn(queue.shift()));
    })
  );
  return out;
}

(async () => {
  const sm = (await o.rawGet(`${BASE}/sitemap.xml`)).body.toString();
  const paths = [
    ...new Set(
      [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
        (m) => new URL(m[1]).pathname.replace(/\/$/, '') || '/'
      )
    ),
  ].sort();
  if (!paths.length) throw new Error('sitemap vuota o non parsabile');

  const home = o.seoParse((await o.rawGet(`${BASE}/`)).body.toString());

  const pages = await pool(paths, 6, async (p) => {
    try {
      const r = await o.rawGet(BASE + (p === '/' ? '/' : p));
      const m = o.seoParse(r.body.toString());
      return {
        path: p,
        status: r.status,
        title: m.title,
        inheritsHomeTitle: p !== '/' && m.title === home.title,
        inheritsHomeDesc: p !== '/' && m.description === home.description,
        hasDesc: !!m.description,
        ogImage: m.ogImage || null,
        canonical: m.canonical || null,
        h1Count: m.h1Count,
        imagesMissingAlt: m.imagesMissingAlt,
      };
    } catch (e) {
      return { path: p, status: 'ERR', error: e.message };
    }
  });
  pages.sort((a, b) => a.path.localeCompare(b.path));

  const ok200 = pages.filter((p) => p.status === 200).map((p) => p.path);
  const probeSet = [
    ...BACKSLASH_PRIORITY.filter((p) => ok200.includes(p)),
    ...ok200.filter((p) => !BACKSLASH_PRIORITY.includes(p)),
  ];
  const backslash = await pool(probeSet, 4, async (p) => {
    const u = BASE + (p === '/' ? '/' : p) + '%5C';
    try {
      const r = await o.rawGet(u);
      return { path: p, probe: u.replace(BASE, ''), status: r.status };
    } catch (e) {
      return { path: p, probe: u.replace(BASE, ''), status: 'ERR', error: e.message };
    }
  });
  backslash.sort((a, b) => a.path.localeCompare(b.path));

  const noOg = pages.filter((p) => p.status === 200 && !p.ogImage);
  const inherit = pages.filter((p) => p.inheritsHomeTitle || p.inheritsHomeDesc);
  const nonOk = pages.filter((p) => p.status !== 200);
  const fiveHundred = backslash.filter((b) => b.status >= 500);
  const multiH1 = pages.filter((p) => p.status === 200 && p.h1Count > 1);

  const out = {
    slug: SLUG,
    base: BASE,
    at: new Date().toISOString(),
    totals: {
      pages: pages.length,
      non200: nonOk.length,
      noOgImage: noOg.length,
      inheritedMeta: inherit.length,
      multiH1: multiH1.length,
      backslashProbed: backslash.length,
      backslash500: fiveHundred.length,
    },
    pages,
    backslash,
  };
  fs.writeFileSync(path.join(EV, 'sweep-public.json'), JSON.stringify(out, null, 1));

  console.log(
    `${SLUG.padEnd(4)} ${DOM[SLUG].padEnd(18)} pagine=${String(pages.length).padStart(3)} non-200=${nonOk.length} senza-og:image=${noOg.length} meta-ereditati=${inherit.length} h1-multipli=${multiH1.length} backslash-500=${fiveHundred.length}/${backslash.length}`
  );
  if (nonOk.length)
    console.log('     non-200:', nonOk.map((p) => `${p.path}=${p.status}`).join(' '));
  if (noOg.length) console.log('     senza og:image:', noOg.map((p) => p.path).join(' '));
  if (inherit.length)
    console.log(
      '     meta ereditati:',
      inherit
        .map(
          (p) => `${p.path}${p.inheritsHomeTitle ? '[T]' : ''}${p.inheritsHomeDesc ? '[D]' : ''}`
        )
        .join(' ')
    );
  if (multiH1.length)
    console.log('     h1 multipli:', multiH1.map((p) => `${p.path}=${p.h1Count}`).join(' '));
  if (fiveHundred.length)
    console.log('     backslash 500:', fiveHundred.map((b) => b.probe).join(' '));
})().catch((e) => {
  console.error(`ERRORE ${SLUG}:`, e.message);
  process.exit(1);
});
