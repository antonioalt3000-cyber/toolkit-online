// Live oracle: which routes serve the HOME page's title/description (or no og:image) to crawlers and link previews.
const { O, EVID } = require('./helpers.cjs');
const fs = require('fs');
const sites = {
  f3: [
    'https://paymentrescue.dev',
    [
      '/signup',
      '/login',
      '/dashboard',
      '/recovery',
      '/analytics',
      '/redeem',
      '/checkout',
      '/pricing',
      '/contact',
      '/calculator',
      '/tools/churn-predictor',
      '/how-it-works',
      '/case-studies',
      '/free',
      '/help',
      '/faq',
      '/status',
    ],
  ],
  f4: [
    'https://parseflow.dev',
    [
      '/playground',
      '/batch',
      '/login',
      '/dashboard',
      '/redeem',
      '/checkout',
      '/pricing',
      '/contact',
      '/generate',
      '/tools/json-preview',
      '/demo',
      '/free',
      '/formats',
      '/schema',
      '/help',
      '/status',
    ],
  ],
  b7: [
    'https://captureapi.dev',
    [
      '/demo',
      '/playground',
      '/tools/meta-inspector',
      '/dashboard',
      '/redeem',
      '/pricing',
      '/contact',
      '/status',
      '/free',
      '/tools',
      '/use-cases',
      '/help',
      '/faq',
    ],
  ],
};
(async () => {
  const out = {};
  for (const [k, [base, routes]] of Object.entries(sites)) {
    const home = O.seoParse((await O.rawGet(base + '/')).body.toString());
    out[k] = {
      home: { title: home.title, description: home.description, ogImage: home.ogImage },
      issues: [],
    };
    for (const r of routes) {
      const res = await O.rawGet(base + r);
      const m = O.seoParse(res.body.toString());
      const issues = [];
      if (res.status !== 200) issues.push(`HTTP ${res.status}`);
      if (m.title === home.title) issues.push('home title');
      if (m.description === home.description) issues.push('home description');
      if (!m.ogImage) issues.push('no og:image');
      if (issues.length) out[k].issues.push({ route: r, issues, title: m.title });
    }
    console.log(`== ${k} home title: ${home.title}`);
    for (const i of out[k].issues)
      console.log(`   ${i.route}: ${i.issues.join(', ')}  [${i.title}]`);
  }
  fs.writeFileSync(`${EVID}/meta-live-before.json`, JSON.stringify(out, null, 2));
})();
