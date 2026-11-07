// Probe: redeem form in a CLEAN isolated context. usage: node redeem-probe.cjs <slug> <dom> <code> [mobile]
const { openIsolated, sleep, EVID } = require('./lib.cjs');
const path = require('path');
(async () => {
  const [slug, dom, code] = process.argv.slice(2);
  const email = `antonio.alt3000+qa07nov${slug}@gmail.com`;
  const j = await openIsolated('about:blank');
  try {
    const posts = [];
    j.listeners.push((m, p) => {
      if (m === 'Network.requestWillBeSent' && p.request.method === 'POST')
        posts.push(p.request.url);
    });
    await j.goto(`https://${dom}/redeem`);
    await sleep(2500);
    console.log(
      'react attached on form:',
      await j.eval(
        "(()=>{const f=document.querySelector('form');return f?Object.keys(f).some(k=>k.startsWith('__reactProps')):null})()"
      )
    );
    await j.type('#redeem-code', code);
    await j.type('#redeem-email', email);
    const ticked = await j.eval(
      "(()=>{const b=[...document.querySelectorAll('form input[type=checkbox]')];b.forEach(x=>{if(!x.checked)x.click()});return b.length})()"
    );
    console.log('checkboxes ticked:', ticked);
    await sleep(2000);
    console.log(
      'submit disabled?',
      await j.eval("(document.querySelector('button[type=submit]')||{}).disabled")
    );
    const rd = j.waitForResponse('/api/redeem', 20000).catch(() => null);
    await j.click('button[type=submit]');
    const r = await rd;
    console.log(
      'redeem response:',
      r ? r.status + ' ' + String(r.body).slice(0, 160).replace(/\s+/g, ' ') : 'NONE'
    );
    console.log('POSTs seen:', JSON.stringify(posts));
    await sleep(1500);
    console.log('page text:', (await j.text()).replace(/\s+/g, ' ').slice(0, 300));
    await j.screenshot(path.join(EVID, slug, 'redeem-probe.png'));
    console.log(JSON.stringify(j.report()).slice(0, 500));
  } finally {
    await j.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
