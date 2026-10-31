// Generic local stand-in for the Upstash Redis REST API, backed by RedisEngine.
// Usage: node upstash-mock-server.cjs <port> <logfile>
'use strict';
const http = require('http');
const fs = require('fs');
const { RedisEngine } = require('./redis-engine.cjs');
const { runEval } = require('./eval-bridge.cjs');

const port = Number(process.argv[2] || 8811);
const logFile = process.argv[3] || null;
const engine = new RedisEngine();
let outage = false; // toggled via /__qa/outage to simulate a Redis-down window

function log(line) {
  const msg = `[${new Date().toISOString()}] ${line}`;
  if (logFile) fs.appendFileSync(logFile, msg + '\n');
}

function runOne(cmdArr) {
  const [cmd, ...rest] = cmdArr;
  const lc = String(cmd).toLowerCase();
  if (lc === 'eval' || lc === 'evalsha') {
    const [script, numKeys, ...krest] = rest;
    const n = Number(numKeys);
    const keys = krest.slice(0, n);
    const args = krest.slice(n);
    if (lc === 'evalsha') {
      const src = engine.scripts.get(script);
      if (!src) return { error: 'NOSCRIPT No matching script' };
      return { result: runEval(engine, src, keys, args) };
    }
    // cache by a cheap content key so a later EVALSHA with the same text would work too
    engine.scripts.set(script, script);
    return { result: runEval(engine, script, keys, args) };
  }
  if (lc === 'script') {
    // SCRIPT LOAD <src> -> fake sha = the script itself (good enough for our mock)
    return { result: rest[1] ?? rest[0] };
  }
  try {
    return { result: engine.dispatch(cmdArr) };
  } catch (e) {
    return { error: String(e.message || e) };
  }
}

const ARTIFICIAL_LATENCY_MS = Number(process.env.QA_MOCK_LATENCY_MS || 0);

// Real Upstash honours the `Upstash-Encoding: base64` request header that
// @upstash/redis sends by default: every string in `result` comes back
// base64-encoded and the SDK base64-decodes it. Answering in plain text made
// the SDK "decode" any value that happens to be valid base64 (32-hex session
// ids, "PONG") into random bytes - the root cause of the 13-14 Oct F2/F3
// "auto-pipelining" anomaly.
function encodeResult(v) {
  if (typeof v === 'string') return Buffer.from(v, 'utf8').toString('base64');
  if (Array.isArray(v)) return v.map(encodeResult);
  return v;
}
function maybeEncode(r, wantsB64) {
  if (!wantsB64 || !r || !('result' in r)) return r;
  return { ...r, result: encodeResult(r.result) };
}

const server = http.createServer((req, res) => {
  res.setHeader('Connection', 'close');
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    if (ARTIFICIAL_LATENCY_MS > 0) {
      setTimeout(handle, ARTIFICIAL_LATENCY_MS);
    } else {
      handle();
    }
    function handle() {
      try {
        const url = req.url || '/';
        const wantsB64 = String(req.headers['upstash-encoding'] || '').toLowerCase() === 'base64';

        if (url === '/__qa/outage' && req.method === 'POST') {
          outage = JSON.parse(body || '{}').on === true;
          log(`OUTAGE set to ${outage}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ outage }));
          return;
        }
        if (url === '/__qa/dump' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([...engine.store.keys()]));
          return;
        }
        if (url === '/__qa/flush' && req.method === 'POST') {
          engine.store.clear();
          res.writeHead(200);
          res.end('OK');
          return;
        }

        if (outage) {
          // Simulate Upstash being unreachable: hang then reset, mirroring a real
          // outage's connection failure rather than a clean REST error reply.
          log(`OUTAGE active - refusing ${req.method} ${url}`);
          req.socket.destroy();
          return;
        }

        // Upstash supports two wire styles: the SDK POSTs a JSON array body to
        // "/" (or "/pipeline"/"/multi-exec"); hand-written fetches (e.g. a
        // health check doing `fetch(url + "/ping")`) use GET/POST with the
        // command as URL path segments and no body.
        if (url !== '/' && url !== '/pipeline' && url !== '/multi-exec' && !body) {
          const segments = url.split('/').filter(Boolean).map(decodeURIComponent);
          const r = runOne(segments);
          log(`PATH-STYLE ${req.method} ${url} -> ${JSON.stringify(r)}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(r));
          return;
        }

        const payload = body ? JSON.parse(body) : null;

        if (url === '/pipeline' || url === '/multi-exec') {
          const results = (payload || []).map((cmdArr) => {
            const r = runOne(cmdArr);
            log(`${url} ${JSON.stringify(cmdArr)} -> ${JSON.stringify(r)}`);
            return maybeEncode(r, wantsB64);
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(results));
          return;
        }

        // single command: body is the command array itself
        const r = runOne(payload);
        log(`${JSON.stringify(payload)} -> ${JSON.stringify(r)}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(maybeEncode(r, wantsB64)));
      } catch (e) {
        log(`ERROR ${e.stack}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(e.message || e) }));
      }
    }
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[upstash-mock] listening on http://127.0.0.1:${port}`);
});
