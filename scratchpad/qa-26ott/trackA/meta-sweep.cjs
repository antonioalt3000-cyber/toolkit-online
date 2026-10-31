// Meta sweep: every sitemap URL + client-only routes, parsed from raw HTML with
// an independent parser. Flags pages that reuse the HOME title/description
// (inherited metadata) and pages without og:image.
const o = require('../../qa-infra/oracles.cjs');
const fs = require('fs');
const [, , base, extra = ''] = process.argv;
(async () => {
  const sm = (await o.rawGet(`${base}/sitemap.xml`)).body.toString();
  const urls = [
    ...new Set(
      [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
        (m) => base + new URL(m[1]).pathname.replace(/\/$/, '')
      )
    ),
  ];
  for (const p of extra.split(',').filter(Boolean)) urls.push(base + p);
  const home = o.seoParse((await o.rawGet(base + '/')).body.toString());
  const rows = [];
  const queue = [...new Set(urls)];
  const worker = async () => {
    while (queue.length) {
      const u = queue.shift();
      try {
        const r = await o.rawGet(u);
        const m = o.seoParse(r.body.toString());
        const path = u.replace(base, '') || '/';
        rows.push({
          path,
          status: r.status,
          title: m.title,
          homeTitle: path !== '/' && m.title === home.title,
          homeDesc: path !== '/' && m.description === home.description,
          ogImage: !!m.ogImage,
          canonical: m.canonical,
        });
      } catch (e) {
        rows.push({ path: u, status: 'ERR ' + e.message });
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  rows.sort((a, b) => a.path.localeCompare(b.path));
  const host = new URL(base).hostname;
  fs.writeFileSync(
    `C:/Users/ftass/toolkit-online/scratchpad/qa-26ott/evidence/meta-${host}.json`,
    JSON.stringify(rows, null, 1)
  );
  const inherit = rows.filter((r) => r.homeTitle || r.homeDesc);
  const noOg = rows.filter((r) => r.status === 200 && !r.ogImage);
  const bad = rows.filter((r) => r.status !== 200);
  console.log(
    `${host}: ${rows.length} pages | inherit home title/desc: ${inherit.length} | no og:image: ${noOg.length} | non-200: ${bad.length}`
  );
  console.log(
    '  inherit:',
    inherit.map((r) => `${r.path}${r.homeTitle ? '[T]' : ''}${r.homeDesc ? '[D]' : ''}`).join(' ')
  );
  console.log('  no og:image:', noOg.map((r) => r.path).join(' '));
  if (bad.length) console.log('  non-200:', bad.map((r) => `${r.path}=${r.status}`).join(' '));
})();
