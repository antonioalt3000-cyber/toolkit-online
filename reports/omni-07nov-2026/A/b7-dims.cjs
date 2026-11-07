// B7 CaptureAPI: real pixel dimensions and real byte counts across viewports, plus hostile parameters (never a 500).
// Production, GET /api/v1/screenshot of our own domain. usage: node b7-dims.cjs
'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');
const { check, save, EVID, INFRA } = require('./lib.cjs');
const O = require(path.join(INFRA, 'oracles.cjs'));
const S = 'b7dims';
const KEY = fs.readFileSync(path.join(EVID, 'b7', 'apikey.txt'), 'utf8').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TARGET = encodeURIComponent('https://captureapi.dev/');

function get(p) {
  return new Promise((resolve) => {
    const r = https.request(
      { host: 'captureapi.dev', path: p, headers: { 'x-api-key': KEY }, timeout: 90000 },
      (res) => {
        const c = [];
        res.on('data', (d) => c.push(d));
        res.on('end', () =>
          resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(c) })
        );
      }
    );
    r.on('error', (e) => resolve({ status: 0, headers: {}, body: Buffer.from(String(e.message)) }));
    r.on('timeout', () => r.destroy(new Error('timeout')));
    r.end();
  });
}

(async () => {
  const VIEWPORTS = [
    [320, 568],
    [375, 812],
    [768, 1024],
    [1366, 768],
    [1920, 1080],
    [3840, 2160],
  ];
  for (const [w, h] of VIEWPORTS) {
    await sleep(2500);
    const r = await get(`/api/v1/screenshot?url=${TARGET}&width=${w}&height=${h}`);
    const dims = r.status === 200 ? O.pngDims(r.body) : null;
    check(
      S,
      `${w}x${h}: 200 image/png`,
      [200, true],
      [r.status, /png/.test(r.headers['content-type'] || '')],
      r.status !== 200 ? r.body.toString().slice(0, 140) : ''
    );
    check(
      S,
      `${w}x${h}: the PNG really is ${w}x${h}`,
      { w, h },
      dims && { w: dims.width || dims.w, h: dims.height || dims.h }
    );
    const cl = Number(r.headers['content-length']);
    if (Number.isFinite(cl))
      check(S, `${w}x${h}: Content-Length equals the bytes received`, r.body.length, cl);
  }
  // other formats keep their dimensions
  for (const f of ['jpeg', 'webp']) {
    await sleep(2500);
    const r = await get(`/api/v1/screenshot?url=${TARGET}&width=800&height=600&format=${f}`);
    check(
      S,
      `format=${f}: 200 and the right content-type`,
      [200, true],
      [r.status, new RegExp(f).test(r.headers['content-type'] || '')],
      r.status !== 200 ? r.body.toString().slice(0, 140) : ''
    );
    if (f === 'jpeg' && r.status === 200 && O.jpegDims) {
      const d = O.jpegDims(r.body);
      check(S, 'jpeg: 800x600', { w: 800, h: 600 }, d && { w: d.width || d.w, h: d.height || d.h });
    }
  }
  // hostile parameters: a 4xx that says what is wrong, never a 500 and never a hang
  const BAD = [
    'width=0',
    'width=-1',
    'width=99999',
    'width=abc',
    'height=0',
    'height=-5',
    'height=1e9',
    'width=1.5',
    'width=',
    'format=gif',
    'format=%00',
    'delay=-1',
    'delay=999999',
  ];
  for (const q of BAD) {
    await sleep(1500);
    const r = await get(`/api/v1/screenshot?url=${TARGET}&width=800&height=600&${q}`);
    const body = r.body.toString().slice(0, 140).replace(/\s+/g, ' ');
    check(
      S,
      `hostile ${q}: not a 5xx`,
      true,
      r.status > 0 && r.status < 500,
      `HTTP ${r.status} ${r.headers['content-type'] || ''} ${/image/.test(r.headers['content-type'] || '') ? '(image)' : body}`
    );
  }
  const fails = save('b7/dims.json');
  process.exitCode = fails ? 1 : 0;
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
