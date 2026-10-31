const { O } = require('./helpers.cjs');
const fs = require('fs');
const vault = fs.readFileSync('C:/Users/ftass/secrets-private/saas-creator-keys.md', 'utf8');
const key = (vault
  .split('\n')
  .find((l) => l.includes('captureapi.dev') && l.includes('`'))
  .match(/`([^`]+)`/) || [])[1];
const shot = async (u, extra) => {
  const r = await O.rawGet(
    `https://captureapi.dev/api/v1/screenshot?url=${encodeURIComponent(u)}&width=1280&height=800&full_page=true${extra}`,
    { headers: { 'x-api-key': key } }
  );
  const h = Object.fromEntries(
    Object.entries(r.headers).filter(([k]) => k.startsWith('x-capture'))
  );
  return { status: r.status, dims: O.pngDims(r.body), h, body: r.body };
};
(async () => {
  const W3C = 'https://www.w3.org/WAI/demos/bad/before/home.html';
  const a = await shot(W3C, '&hide_cookie_banners=false&block_chats=false');
  console.log('W3C banners OFF', a.status, JSON.stringify(a.dims), JSON.stringify(a.h));
  fs.writeFileSync('../evidence/b7/fullpage-w3c-bannersoff.png', a.body);
  const b = await shot(W3C, '&delay=1000');
  console.log('W3C delay=1000', b.status, JSON.stringify(b.dims), JSON.stringify(b.h));
  const c = await shot('https://www.w3.org/WAI/fundamentals/accessibility-intro/', '');
  console.log('W3C intro (long)', c.status, JSON.stringify(c.dims), JSON.stringify(c.h));
  fs.writeFileSync('../evidence/b7/fullpage-w3c-intro.png', c.body);
  const d = await shot('https://paymentrescue.dev/calculator', '');
  console.log('paymentrescue calculator', d.status, JSON.stringify(d.dims), JSON.stringify(d.h));
})();
