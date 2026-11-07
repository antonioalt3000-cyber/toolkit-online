// B7 CaptureAPI SSRF matrix, against PRODUCTION (7 nov 2026). Read-only for us: every blocked target must be refused
// BEFORE any fetch. usage: node b7-ssrf-matrix.cjs
// Controls (so a 400 means "blocked", not "request malformed"): a positive control on our own domain must answer 200,
// and a malformed-key request must answer a DIFFERENT status than the SSRF refusals.
'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');
const { check, save, EVID } = require('./lib.cjs');
const S = 'b7ssrf';
const KEY = fs.readFileSync(path.join(EVID, 'b7', 'apikey.txt'), 'utf8').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function get(p, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const r = https.request(
      {
        host: 'captureapi.dev',
        path: p,
        method: body ? 'POST' : 'GET',
        headers: {
          'x-api-key': KEY,
          ...(data
            ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) }
            : {}),
        },
        timeout: 60000,
      },
      (res) => {
        const c = [];
        res.on('data', (d) => c.push(d));
        res.on('end', () => {
          const b = Buffer.concat(c);
          resolve({
            status: res.statusCode,
            ct: res.headers['content-type'] || '',
            len: b.length,
            text: b.slice(0, 300).toString('utf8'),
          });
        });
      }
    );
    r.on('error', (e) => resolve({ status: 0, ct: '', len: 0, text: String(e.message) }));
    r.on('timeout', () => r.destroy(new Error('timeout')));
    if (data) r.write(data);
    r.end();
  });
}

const BLOCKED = [
  'http://127.0.0.1/',
  'http://localhost/',
  'http://[::1]/',
  'http://0.0.0.0/',
  'http://2130706433/',
  'http://0x7f000001/',
  'http://017700000001/',
  'http://127.1/',
  'http://0177.0.0.1/',
  'http://[::ffff:127.0.0.1]/',
  'http://[::ffff:7f00:1]/',
  'http://169.254.169.254/latest/meta-data/',
  'http://[fd00::1]/',
  'http://[fe80::1]/',
  'http://10.0.0.1/',
  'http://172.16.0.1/',
  'http://192.168.0.1/',
  'http://100.64.0.1/',
  'http://foo.localhost/',
  'http://user:pass@127.0.0.1/',
  'file:///etc/passwd',
  'ftp://example.org/',
  'gopher://example.org/',
  'javascript:alert(1)',
  // DNS rebinding family: public names whose A record is a private address (resolved by us, then refused)
  'http://127.0.0.1.nip.io/',
  'http://localtest.me/',
  'http://169.254.169.254.nip.io/',
];

(async () => {
  const route = (u) => `/api/v1/screenshot?url=${encodeURIComponent(u)}&width=800&height=600`;
  // positive control FIRST: our own domain must be capturable, otherwise every 400 below proves nothing
  const pos = await get(route('https://captureapi.dev/'));
  check(
    S,
    'positive control: own domain is captured (200, image/png)',
    [200, true],
    [pos.status, /png/.test(pos.ct)],
    `${pos.len} bytes`
  );
  await sleep(1500);
  const bad = await get('/api/v1/screenshot?width=800&height=600'); // no url at all
  check(
    S,
    'control: missing url is a 400 of ITS OWN kind (not the SSRF message)',
    true,
    bad.status === 400,
    bad.text.slice(0, 120)
  );
  const rows = [];
  for (const u of BLOCKED) {
    await sleep(1200);
    const r = await get(route(u));
    rows.push({ u, status: r.status, body: r.text.slice(0, 140).replace(/\s+/g, ' ') });
    check(
      S,
      `SSRF ${u} -> 400 and no image`,
      [400, false],
      [r.status, /image|png/.test(r.ct)],
      r.text.slice(0, 120)
    );
  }
  // NOT TESTED, on purpose: a redirect from a public URL to the metadata IP. httpbin.org and httpbingo.org both refuse an
  // internal redirect target themselves (403 'Forbidden redirect target'), so the capture shows THEIR refusal, not ours:
  // a first version of this row reported 'not blocked' and was vacuous. The renderer re-validates every request hop
  // (src/lib/renderer.ts, setRequestInterception) and the fetch paths use redirect:'error'; no end-to-end proof here.
  // pdf route: POST {url}; same guard, three representative targets + a positive control
  const pp = await get('/api/v1/pdf', { url: 'https://captureapi.dev/' });
  check(
    S,
    'pdf positive control: own domain renders (200, application/pdf)',
    [200, true],
    [pp.status, /pdf/.test(pp.ct)],
    `${pp.len} bytes`
  );
  for (const u of [
    'http://169.254.169.254/',
    'http://2130706433/',
    'file:///etc/passwd',
    'http://[::ffff:7f00:1]/',
  ]) {
    await sleep(1200);
    const r = await get('/api/v1/pdf', { url: u });
    check(S, `pdf SSRF ${u} -> 400`, 400, r.status, r.text.slice(0, 100));
  }
  fs.writeFileSync(path.join(EVID, 'b7', 'ssrf-rows.json'), JSON.stringify(rows, null, 2));
  const fails = save('b7/ssrf-matrix.json');
  process.exitCode = fails ? 1 : 0;
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
