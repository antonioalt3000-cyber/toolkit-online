// SEOScope production journey: live audit demo + share link + hostile input.
// Oracles: (1) facts parsed from HTML fetched independently here; (2) the
// weighted score recomputed from the returned check list with the published weights.
const { Journey, sleep, oracles, SITES, Recorder } = require('./lib.cjs');

const W2 = new Set([
  'title',
  'meta-description',
  'h1',
  'word-count',
  'og-tags',
  'viewport',
  'broken-links',
  'render-blocking-scripts',
  'html-weight',
]);
const sv = (s) => (s === 'pass' ? 1 : s === 'warn' ? 0.5 : 0);
function recompute(checks) {
  let num = 0,
    den = 0;
  for (const c of checks) {
    const w = W2.has(c.id) ? 2 : 1;
    num += w * sv(c.status);
    den += w;
  }
  return den ? Math.round((num / den) * 100) : 0;
}
function decode(s) {
  return s == null
    ? s
    : s
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}
const msgNum = (checks, id, re) => {
  const c = checks.find((x) => x.id === id);
  const m = c && (c.message || c.detail || '').match(re);
  return m ? Number(m[1]) : null;
};

(async () => {
  const rec = new Recorder('seo', 'prod-demo');
  const TARGETS = [
    'https://toolkitonline.vip/',
    'https://www.w3.org/WAI/demos/bad/before/home.html',
    'https://github.com/',
  ];
  const j = await Journey.open(`${SITES.seo.prod}/seo-audit`);
  let shareDone = false;
  try {
    for (const [i, url] of TARGETS.entries()) {
      if (i > 0) await sleep(13000);
      await j.type('#audit-demo-url', url);
      const respP = j.waitForResponse('/api/demo', 60000);
      await j.click('form:has(#audit-demo-url) button[type="submit"]');
      const resp = await respP;
      await sleep(1500);
      const data = JSON.parse(resp.body.toString());
      await j.screenshot(rec.ev(`audit-${i + 1}.png`));
      if (resp.status !== 200) {
        rec.check(`audit ${url}: HTTP`, 200, { status: resp.status, data }, false);
        continue;
      }
      const checks = data.checks || data.result?.checks || [];
      const score = data.score ?? data.result?.score;
      rec.check(
        `audit ${url}: punteggio = Σ peso×stato / Σ peso`,
        recompute(checks),
        { score, nChecks: checks.length },
        recompute(checks) === score && checks.length > 10
      );

      const page = await fetch(url, {
        redirect: 'follow',
        headers: { 'user-agent': 'Mozilla/5.0 (QA oracle)' },
      });
      const html = await page.text();
      const f = oracles.seoParse(html);
      const titleRaw = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
      const myTitleLen = titleRaw == null ? null : decode(titleRaw).trim().length;
      const descM = (html.match(/<meta\b[^>]*name\s*=\s*["']description["'][^>]*>/i) || [])[0];
      const myDescLen = descM
        ? decode(
            (descM.match(/content\s*=\s*"([^"]*)"|content\s*=\s*'([^']*)'/i) || [])
              .slice(1)
              .find((x) => x != null) || ''
          ).length
        : null;
      const theirTitle = msgNum(checks, 'title', /Title is (\d+) characters/);
      const theirDesc = msgNum(checks, 'meta-description', /Description is (\d+) characters/);
      const h1c = checks.find((c) => c.id === 'h1');
      const theirH1 = h1c
        ? /Exactly one/.test(h1c.detail)
          ? 1
          : /No <h1>/.test(h1c.detail)
            ? 0
            : msgNum(checks, 'h1', /(\d+) <h1>/)
        : null;
      const canon = checks.find((c) => c.id === 'canonical');
      const altM = ((checks.find((c) => c.id === 'img-alt') || {}).detail || '').match(
        /(\d+)\/(\d+) images have alt/
      );
      const facts = {
        titleLen: myTitleLen,
        descLen: myDescLen,
        h1: f.h1Count,
        canonical: f.canonical ? 'presente' : 'assente',
        viewport: f.viewport,
        // rendered images only (noscript/comments are not painted with JS on); empty alt is not alt text
        imgWithAlt: (() => {
          const vis = html
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
          const imgs = vis.match(/<img\b[^>]*>/gi) || [];
          const withAlt = imgs.filter((t) => {
            const m = t.match(/\balt\s*=\s*("([^"]*)"|'([^']*)')/i);
            return m && (m[2] ?? m[3]).trim().length > 0;
          }).length;
          return imgs.length ? `${withAlt}/${imgs.length}` : null;
        })(),
      };
      const theirs = {
        titleLen: theirTitle,
        descLen: descM ? theirDesc : null,
        h1: theirH1,
        canonical: canon
          ? canon.status === 'warn' && /No canonical/.test(canon.detail)
            ? 'assente'
            : 'presente'
          : null,
        viewport: (checks.find((c) => c.id === 'viewport') || {}).status === 'pass',
        imgWithAlt: altM ? `${altM[1]}/${altM[2]}` : null,
      };
      const dynamic = url.includes('github.com'); // markup varies per request/region: compare only stable facts
      const keys = dynamic ? ['titleLen', 'viewport', 'canonical'] : Object.keys(facts);
      const ok = keys.every((k) => facts[k] === theirs[k]);
      rec.check(
        `audit ${url}: fatti on-page vs HTML scaricato a parte${dynamic ? ' (solo fatti stabili)' : ''}`,
        Object.fromEntries(keys.map((k) => [k, facts[k]])),
        Object.fromEntries(keys.map((k) => [k, theirs[k]])),
        ok
      );
      const ui = await j.eval(
        `document.querySelector('#audit-demo-url').closest('form').parentElement.innerText`
      );
      rec.check(
        `audit ${url}: punteggio a schermo`,
        String(score),
        ui.slice(0, 160).replace(/\s+/g, ' '),
        ui.includes(String(score))
      );

      if (!shareDone) {
        shareDone = true;
        await sleep(13000);
        const shareP = j.waitForResponse('/api/share', 30000);
        await j.click('text=Share result');
        const sr = await shareP.catch((e) => ({
          status: 'none',
          body: Buffer.from(String(e.message)),
        }));
        await j.waitFor('#audit-share-url', { timeout: 15000 }).catch(() => {});
        const link = await j.eval(`(document.querySelector('#audit-share-url') || {}).value || ''`);
        rec.check(
          'share: link pubblico creato',
          'URL /r/<token> su seoscope.dev',
          { status: sr.status, link },
          /^https:\/\/seoscope\.dev\/r\/[A-Za-z0-9_-]+/.test(link)
        );
        if (link) {
          const v = await Journey.open(link);
          const vt = await v.text();
          rec.check(
            'share: la pagina condivisa mostra lo stesso punteggio',
            String(score),
            vt.slice(0, 200).replace(/\s+/g, ' '),
            vt.includes(String(score))
          );
          await v.screenshot(rec.ev('share-view.png'));
          await v.close();
        }
      }
    }
    for (const [label, bad] of [
      ['metadata AWS', 'http://169.254.169.254/latest/meta-data/'],
      ['localhost', 'http://localhost:3000/'],
      ['IP privato', 'http://10.0.0.1/'],
    ]) {
      await sleep(13000);
      await j.type('#audit-demo-url', bad);
      const respP = j.waitForResponse('/api/demo', 30000).catch(() => null);
      await j.click('form:has(#audit-demo-url) button[type="submit"]');
      const resp = await respP;
      rec.check(
        `audit input ostile (${label}): rifiutato`,
        '4xx',
        {
          status: resp && resp.status,
          body: resp && resp.body && resp.body.toString().slice(0, 160),
        },
        !!resp && resp.status >= 400 && resp.status < 500
      );
    }
    const rep = j.report();
    const unexpected = rep.badResponses.filter((r) => !/\/api\/demo/.test(r.url));
    rec.check(
      'audit: console/eccezioni durante il viaggio',
      '0 eccezioni, nessun >=400 oltre ai rifiuti attesi',
      rep,
      rep.exceptions.length === 0 && unexpected.length === 0
    );
  } finally {
    await j.close();
  }
  console.log(
    `== seo prod-demo: ${rec.rows.filter((r) => !r.pass).length} FAIL / ${rec.rows.length}`
  );
})().catch((e) => {
  console.error('JOURNEY ERROR', e);
  process.exitCode = 1;
});
