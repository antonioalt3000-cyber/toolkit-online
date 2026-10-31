// Preloaded via NODE_OPTIONS="--require .../egress-guard.cjs" before `next dev`.
// Redirects Brevo + Stripe calls to local mocks, and hard-blocks any other
// call to a real external paid/production service so a QA run can never leak
// into live Stripe/Brevo/Upstash even if a code path forgot to use the
// mocked env.
'use strict';
const fs = require('fs');
const http = require('http');
const https = require('https');

const LOG = process.env.QA_EGRESS_LOG || null;
const BREVO_MOCK = process.env.QA_BREVO_MOCK_URL || 'http://127.0.0.1:8812';
const STRIPE_MOCK_HOST = '127.0.0.1';
const STRIPE_MOCK_PORT = Number(process.env.QA_STRIPE_MOCK_PORT || 8813);

function log(line) {
  const msg = `[${new Date().toISOString()}] ${line}`;
  if (LOG) fs.appendFileSync(LOG, msg + '\n');
  else console.log('[egress-guard]', line);
}

const HARD_BLOCK_HOSTS = [/(^|\.)upstash\.io$/];
const REWRITE_FETCH = [{ match: /(^|\.)api\.brevo\.com$/, to: BREVO_MOCK }];
const STRIPE_HOST_RE = /(^|\.)api\.stripe\.com$/;

function hostnameOf(input) {
  try {
    if (typeof input === 'string') return new URL(input).hostname;
    if (input instanceof URL) return input.hostname;
    if (input && input.hostname) return input.hostname;
    if (input && input.host) return String(input.host).split(':')[0];
  } catch {
    /* fall through */
  }
  return null;
}

// --- patch global.fetch ---
const originalFetch = global.fetch;
if (typeof originalFetch === 'function') {
  global.fetch = function patchedFetch(input, init) {
    const url = typeof input === 'string' || input instanceof URL ? String(input) : input?.url;
    const host = hostnameOf(url);
    if (host) {
      if (HARD_BLOCK_HOSTS.some((re) => re.test(host))) {
        log(`BLOCKED fetch to ${host}: ${url}`);
        throw new Error(`QA-EGRESS-GUARD: blocked real network call to ${host} (${url})`);
      }
      const rewrite = REWRITE_FETCH.find((r) => r.match.test(host));
      if (rewrite) {
        const newUrl = url.replace(/^https?:\/\/[^/]+/, rewrite.to);
        log(`REWRITE fetch ${url} -> ${newUrl}`);
        return originalFetch(newUrl, init);
      }
      if (STRIPE_HOST_RE.test(host)) {
        const newUrl = url.replace(
          /^https?:\/\/[^/]+/,
          `http://${STRIPE_MOCK_HOST}:${STRIPE_MOCK_PORT}`
        );
        log(`REWRITE fetch ${url} -> ${newUrl}`);
        return originalFetch(newUrl, { ...init, cache: 'no-store' });
      }
      // Our local mocks are stateful (not idempotent caches): Next.js's own
      // fetch-patch dedupes/caches by URL across concurrent in-flight calls,
      // which can cross-contaminate two distinct POSTs to the same mock path
      // (e.g. @upstash/redis's auto-pipeline firing two different /pipeline
      // bodies back to back). Force no-store for our mock hosts only.
      if (/^127\.0\.0\.1$/.test(host) || host === 'localhost') {
        return originalFetch(input, { ...init, cache: 'no-store' });
      }
    }
    return originalFetch(input, init);
  };
}

// --- patch https.request/.get (Stripe's NodeHttpClient uses this) ---
function wrapHttpsRequestFn(originalName) {
  const original = https[originalName];
  https[originalName] = function patchedHttpsRequest(...args) {
    // Normalize the two call shapes: (url[, options], cb) or (options, cb)
    let baseFromUrl = null;
    let optionsArg = null;
    let optionsIdx = -1;
    if (typeof args[0] === 'string' || args[0] instanceof URL) {
      const u = new URL(args[0]);
      baseFromUrl = {
        hostname: u.hostname,
        port: u.port,
        path: `${u.pathname}${u.search}`,
        protocol: u.protocol,
      };
      if (typeof args[1] === 'object' && args[1] !== null) {
        optionsArg = args[1];
        optionsIdx = 1;
      }
    } else if (typeof args[0] === 'object' && args[0] !== null) {
      optionsArg = args[0];
      optionsIdx = 0;
    }
    const host = hostnameOf(args[0]) || (optionsArg && hostnameOf(optionsArg));

    if (host && HARD_BLOCK_HOSTS.some((re) => re.test(host))) {
      log(`BLOCKED https.${originalName} to ${host}`);
      throw new Error(`QA-EGRESS-GUARD: blocked real network call to ${host}`);
    }

    if (host && STRIPE_HOST_RE.test(host)) {
      log(
        `REWRITE https.${originalName} ${host} -> ${STRIPE_MOCK_HOST}:${STRIPE_MOCK_PORT} (as plain http)`
      );
      // Rebuild as a plain http.request against the local mock (no TLS there).
      const merged = { ...(baseFromUrl || {}), ...(optionsArg || {}) };
      merged.hostname = STRIPE_MOCK_HOST;
      merged.host = STRIPE_MOCK_HOST;
      merged.port = STRIPE_MOCK_PORT;
      merged.protocol = 'http:';
      delete merged.ca;
      delete merged.cert;
      delete merged.key;
      delete merged.agent; // an https.Agent here is incompatible with a plain http.request
      delete merged._defaultAgent;
      delete merged.servername;
      const cb = args[optionsIdx === -1 ? 1 : optionsIdx + 1];
      log(
        `REWRITE DEBUG merged=${JSON.stringify({ hostname: merged.hostname, host: merged.host, port: merged.port, path: merged.path, method: merged.method, headers: merged.headers })}`
      );
      const req = http.request(merged, (resp) => {
        log(`REWRITE RESPONSE status=${resp.statusCode}`);
        if (cb) cb(resp);
      });
      req.on('error', (e) => log(`REWRITE REQUEST ERROR to stripe-mock: ${e.stack || e.message}`));
      req.on('socket', (s) => {
        log(`REWRITE socket assigned, connecting=${s.connecting}`);
        // The original caller (e.g. Stripe's NodeHttpClient) called the REAL
        // https.request and so waits for the TLS-only 'secureConnect' event
        // before writing its body. We downgraded the transport to plain
        // http to reach the local mock, so that event never fires natively
        // - forward 'connect' as 'secureConnect' to unblock such callers.
        s.on('connect', () => {
          log('REWRITE socket CONNECTED - forwarding as secureConnect');
          s.emit('secureConnect');
        });
        s.on('close', () => log('REWRITE socket CLOSED'));
        s.on('error', (e) => log(`REWRITE socket ERROR ${e.message}`));
      });
      req.on('finish', () => log('REWRITE request body finished sending'));
      if (originalName === 'get') req.end(); // https.get auto-ends; we bypassed that path
      return req;
    }

    const original_ = original;
    return original_.apply(https, args);
  };
}
wrapHttpsRequestFn('request');
wrapHttpsRequestFn('get');

// --- plain http.request to a blocked host (defensive; unlikely to be hit) ---
const originalHttpRequest = http.request;
http.request = function patchedHttpRequest(...args) {
  const host =
    hostnameOf(args[0]) || hostnameOf(args[0] && typeof args[0] === 'object' ? args[0] : null);
  if (host && HARD_BLOCK_HOSTS.some((re) => re.test(host))) {
    log(`BLOCKED http.request to ${host}`);
    throw new Error(`QA-EGRESS-GUARD: blocked real network call to ${host}`);
  }
  return originalHttpRequest.apply(http, args);
};

// --- force enableAutoPipelining:false on every @upstash/redis client ---
// Reproduced deterministically (standalone, outside Next.js, against our own
// mock AND confirmed independent of mock latency): a Redis instance created
// with the SDK's default enableAutoPipelining:true returns corrupted bytes
// for a GET whose key was built from an immediately-preceding, separately
// awaited GET's result (the extremely common "resolve session -> load user"
// pattern). Not reproducible with pipelining off. Patched at require-time so
// no application source needs touching for QA.
const Module = require('module');
const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  const exported = originalLoad.call(this, request, parent, isMain);
  const isUpstashRedis =
    request === '@upstash/redis' || /[\\/]@upstash[\\/]redis[\\/]/.test(request);
  if (isUpstashRedis && exported && exported.Redis && !exported.Redis.__qaPatched) {
    const RealRedis = exported.Redis;
    class PatchedRedis extends RealRedis {
      constructor(config, ...rest) {
        const patchedConfig =
          config && typeof config === 'object'
            ? { ...config, enableAutoPipelining: false }
            : config;
        super(patchedConfig, ...rest);
      }
    }
    PatchedRedis.__qaPatched = true;
    exported.Redis = PatchedRedis;
    log(
      `PATCHED @upstash/redis Redis class (enableAutoPipelining forced false) for ${request} loaded by ${parent?.filename || '?'}`
    );
  }
  return exported;
};

log('egress-guard active (brevo+stripe -> local mocks, upstash.io direct calls blocked)');
