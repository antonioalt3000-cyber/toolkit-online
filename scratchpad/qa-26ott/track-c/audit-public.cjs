// Usage: node audit-public.cjs <saas> [baseUrl]
const { SITES, Recorder, auditPage } = require('./lib.cjs');
const PAGES = {
  eg: ['/', '/verify-email', '/pricing', '/signup', '/redeem', '/dashboard', '/docs', '/help'],
  seo: ['/', '/seo-audit', '/pricing', '/signup', '/redeem', '/dashboard', '/docs', '/help'],
  hsh: ['/', '/simulate', '/pricing', '/signup', '/redeem', '/dashboard', '/docs', '/help'],
  hkl: [
    '/',
    '/pricing',
    '/signup',
    '/redeem',
    '/dashboard',
    '/docs',
    '/help',
    '/verify-stripe-webhook-signatures',
  ],
  cfg: ['/', '/gallery', '/pricing', '/signup', '/redeem', '/dashboard', '/docs', '/help'],
};
(async () => {
  const saas = process.argv[2];
  const base = process.argv[3] || SITES[saas].prod;
  const rec = new Recorder(saas, base.includes('localhost') ? 'local-pages' : 'prod-pages');
  for (const p of PAGES[saas]) {
    try {
      await auditPage(rec, base + p, `pagina ${p}`, {
        ctaTexts: p === '/' ? ['Get free key'] : [],
      });
    } catch (e) {
      rec.check(`pagina ${p}: caricamento`, 'ok', String(e.message), false);
    }
  }
  const fails = rec.rows.filter((r) => !r.pass).length;
  console.log(`== ${saas}: ${rec.rows.length} check, ${fails} FAIL`);
})();
