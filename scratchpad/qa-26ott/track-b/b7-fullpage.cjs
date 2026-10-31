const { O } = require('./helpers.cjs');
const fs = require('fs'),
  https = require('https');
const vault = fs.readFileSync('C:/Users/ftass/secrets-private/saas-creator-keys.md', 'utf8');
const key = (vault
  .split('\n')
  .find((l) => l.includes('captureapi.dev') && l.includes('`'))
  .match(/`([^`]+)`/) || [])[1];
const T = encodeURIComponent('https://www.w3.org/WAI/demos/bad/before/home.html');
function post(p, body) {
  return new Promise((res, rej) => {
    const b = JSON.stringify(body);
    const r = https.request(
      'https://captureapi.dev' + p,
      {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(b),
        },
      },
      (s) => {
        const c = [];
        s.on('data', (d) => c.push(d));
        s.on('end', () =>
          res({ status: s.statusCode, headers: s.headers, body: Buffer.concat(c) })
        );
      }
    );
    r.on('error', rej);
    r.end(b);
  });
}
(async () => {
  for (const q of ['full_page=true', 'fullPage=true', 'full_page=1']) {
    const r = await O.rawGet(
      `https://captureapi.dev/api/v1/screenshot?url=${T}&width=1280&height=800&${q}`,
      { headers: { 'x-api-key': key } }
    );
    const h = Object.fromEntries(
      Object.entries(r.headers).filter(([k]) => k.startsWith('x-capture') || k === 'content-type')
    );
    console.log(
      q,
      r.status,
      JSON.stringify(O.pngDims(r.body)),
      JSON.stringify(h),
      r.status !== 200 ? r.body.toString().slice(0, 200) : ''
    );
    fs.writeFileSync(`../evidence/b7/fullpage-${q.replace(/[=]/g, '-')}.png`, r.body);
  }
  const pdf = await post('/api/v1/pdf', {
    url: 'https://www.w3.org/WAI/demos/bad/before/home.html',
    format: 'A4',
  });
  console.log(
    'pdf A4',
    pdf.status,
    pdf.headers['content-type'],
    JSON.stringify(O.pdfInfo(pdf.body)),
    pdf.status !== 200 ? pdf.body.toString().slice(0, 200) : ''
  );
  fs.writeFileSync('../evidence/b7/prod-paid.pdf', pdf.body);
  const pdfL = await post('/api/v1/pdf', {
    url: 'https://www.w3.org/WAI/demos/bad/before/home.html',
    format: 'Letter',
  });
  console.log('pdf Letter', pdfL.status, JSON.stringify(O.pdfInfo(pdfL.body)));
  const pdfBad = await post('/api/v1/pdf', {
    url: 'https://www.w3.org/WAI/demos/bad/before/home.html',
    format: 'A9',
  });
  console.log('pdf A9 (unsupported)', pdfBad.status, pdfBad.body.toString().slice(0, 160));
})();
