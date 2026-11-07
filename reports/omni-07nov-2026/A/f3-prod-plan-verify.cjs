// Verifies churnguard#88 IN PRODUCTION: after an upgrade by coupon the dashboard must show the new plan on the very next
// read (before the fix: stale for up to 30 s). Writes: one QA account (plus-alias of the founder) + one internal coupon,
// both registered in REDIS-WRITES.jsonl BEFORE they are created.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { openIsolated, sleep, setVal, check, save, EVID, randPw } = require('./lib.cjs');
const S = 'f3prod';
const DOM = 'https://paymentrescue.dev';
const email = 'antonio.alt3000+qa07novf3plan@gmail.com';
const PROGRESS = path.resolve(__dirname, '..', 'progress.cjs');
const note = (key, nota) =>
  execFileSync('node', [PROGRESS, 'redis', '--repo', 'f3', '--key', key, '--nota', nota], {
    stdio: 'ignore',
  });

function adminSecret() {
  const f = 'C:/Users/ftass/AppData/Local/Temp/claude/qa-secrets/f3.qa';
  for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = l.match(/^ADMIN_API_SECRET="?([^"\r\n]*)"?$/);
    if (m) return m[1];
  }
  return '';
}

(async () => {
  let j;
  try {
    note(
      `pre:user:email:${email} (+ pre:user:<id>, session, cache:dashboard:<id>)`,
      'flusso A: verifica prod churnguard#88, registrato PRIMA della creazione'
    );
    j = await openIsolated(`${DOM}/signup`);
    await sleep(2500);
    await setVal(j, '#signup-name', 'Plan Fresh QA');
    await setVal(j, '#signup-email', email);
    await setVal(j, '#signup-password', randPw());
    await sleep(2500);
    const su = j.waitForResponse('/api/auth/signup', 30000);
    await j.click('form:has(#signup-email) button[type="submit"]');
    const sr = await su.catch(() => null);
    check(
      S,
      'signup in production: POST 200',
      200,
      sr && sr.status,
      sr ? String(sr.body).slice(0, 100) : ''
    );
    await j
      .waitFor("js:location.pathname.startsWith('/dashboard')", { timeout: 30000 })
      .catch(() => {});
    const plan = () =>
      j.eval(
        "fetch('/api/dashboard').then((r) => r.json()).then((d) => d.plan || ('ERR ' + JSON.stringify(d).slice(0, 80)))"
      );
    const p1 = await plan();
    check(S, 'before the upgrade the dashboard says free (and fills its 30 s cache)', 'free', p1);
    // mint an internal coupon, then redeem it as the SAME logged-in account (existing-user path)
    const res = execFileSync('curl', [
      '-s',
      '--max-time',
      '60',
      '-X',
      'POST',
      `${DOM}/api/admin/generate-coupons`,
      '-H',
      `x-admin-secret: ${adminSecret()}`,
      '-H',
      'Content-Type: application/json',
      '-d',
      JSON.stringify({ prefix: 'QAOCT', count: 1, internal: true }),
    ]).toString();
    const code = (JSON.parse(res).sample || [])[0];
    check(S, 'internal coupon minted', true, !!code, code || res.slice(0, 100));
    if (code) note(`coupons:used -> ${code}`, 'flusso A: verifica prod churnguard#88');
    await j.goto(`${DOM}/redeem`);
    await sleep(2000);
    await setVal(j, '#redeem-code', code);
    await setVal(j, '#redeem-email', email);
    await j.eval(
      "(() => { document.querySelectorAll('form input[type=checkbox]').forEach((b) => { if (!b.checked) b.click(); }); })()"
    );
    await sleep(2000);
    const rd = j.waitForResponse('/api/redeem', 30000);
    await j.click('form:has(#redeem-code) button[type="submit"]');
    const rr = await rd.catch(() => null);
    check(
      S,
      'redeem as the existing account: 200',
      200,
      rr && rr.status,
      rr ? String(rr.body).slice(0, 110) : ''
    );
    const t0 = Date.now();
    const p2 = await plan();
    check(
      S,
      `the VERY NEXT dashboard read already says scale (read ${Date.now() - t0} ms after the redeem)`,
      'scale',
      p2
    );
    await j.screenshot(path.join(EVID, 'f3', 'prod-plan-fresh.png'));
  } finally {
    if (j) await j.close();
  }
  const fails = save('f3/prod-plan-verify.json');
  process.exitCode = fails ? 1 : 0;
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
