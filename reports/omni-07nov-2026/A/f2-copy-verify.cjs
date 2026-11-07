// Verifies accessiscan#90 in PRODUCTION, in a real browser with a clean context (so the consent banner shows):
// the banner no longer says it serves ads, the privacy policy no longer names AdSense, the cookie policy still says no advertising cookies.
'use strict';
const { openIsolated, sleep, check, save, EVID } = require('./lib.cjs');
const path = require('path');
(async () => {
  let j;
  try {
    j = await openIsolated('https://fixmyweb.dev/');
    await sleep(4000);
    await sleep(2500);
    const whole = (await j.text()).replace(/\s+/g, ' ');
    const at = whole.search(/We use cookies/i);
    const banner = at >= 0 ? whole.slice(at, at + 220) : '';
    check(
      'f2copy',
      'the consent banner is visible on a first visit',
      true,
      /We use cookies/i.test(banner),
      banner.slice(0, 160)
    );
    check(
      'f2copy',
      'the banner does not say it serves ads',
      false,
      /relevant ads|serve (relevant )?ads/i.test(banner)
    );
    check(
      'f2copy',
      'the banner says what the cookies are for',
      true,
      /analyze site traffic/i.test(banner)
    );
    await j.screenshot(path.join(EVID, 'f2', 'banner-after-copy-fix.png'));
    await j.goto('https://fixmyweb.dev/privacy');
    const privacy = await j.text();
    check(
      'f2copy',
      'the privacy policy no longer names AdSense or promises ads',
      false,
      /adsense|relevant advertis/i.test(privacy)
    );
    check(
      'f2copy',
      'the privacy policy says no advertisements are shown',
      true,
      /show no advertisements/i.test(privacy)
    );
    await j.goto('https://fixmyweb.dev/cookie-policy');
    check(
      'f2copy',
      'the cookie policy still says no advertising cookies are set',
      true,
      /sets no advertising/i.test(await j.text())
    );
  } finally {
    if (j) await j.close();
  }
  const fails = save('f2/copy-verify.json');
  process.exitCode = fails ? 1 : 0;
})().catch((e) => {
  console.error('ERR', e.message);
  process.exitCode = 1;
});
