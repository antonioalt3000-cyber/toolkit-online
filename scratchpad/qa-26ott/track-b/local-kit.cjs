// Local-environment kit for Track B journeys: reads the run-dev state file (LOCAL test secrets only),
// talks to the per-SaaS mocks, signs Stripe webhooks and admin requests exactly like the real senders.
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');

function state(saas) {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', 'state', `${saas}.json`), 'utf8')
  );
}

function req(method, url, { headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body == null ? null : typeof body === 'string' ? body : JSON.stringify(body);
    const r = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method,
        headers: {
          ...(data != null
            ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) }
            : {}),
          ...headers,
        },
      },
      (res) => {
        const c = [];
        res.on('data', (d) => c.push(d));
        res.on('end', () => {
          const buf = Buffer.concat(c);
          let json = null;
          try {
            json = JSON.parse(buf.toString());
          } catch {
            /* not json */
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: buf,
            json,
            setCookie: res.headers['set-cookie'] || [],
          });
        });
      }
    );
    r.on('error', reject);
    if (data != null) r.write(data);
    r.end();
  });
}

function kit(saas) {
  const st = state(saas);
  const P = st.ports;
  const app = `http://localhost:${P.app}`;
  return {
    st,
    app,
    get: (p, o) => req('GET', app + p, o),
    post: (p, body, o = {}) => req('POST', app + p, { ...o, body }),
    sentEmails: async () => (await req('GET', `http://127.0.0.1:${P.brevo}/__qa/sent`)).json || [],
    stripeSessions: async () =>
      (await req('GET', `http://127.0.0.1:${P.stripe}/__qa/sessions`)).json || [],
    redisKeys: async () => (await req('GET', `http://127.0.0.1:${P.upstash}/__qa/dump`)).json || [],
    redisCmd: async (...cmd) =>
      (
        await req('POST', `http://127.0.0.1:${P.upstash}/`, {
          body: cmd,
          headers: { authorization: 'Bearer qa-local-token' },
        })
      ).json,
    outage: async (on) =>
      (await req('POST', `http://127.0.0.1:${P.upstash}/__qa/outage`, { body: { on } })).json,
    setStripeFixtures: (obj) =>
      fs.writeFileSync(
        path.resolve(__dirname, '..', 'state', `${saas}-stripe-fixtures.json`),
        JSON.stringify(obj)
      ),
    /** POSTs a Stripe-signed event (same scheme as Stripe: t=..,v1=HMAC(t.body)). */
    webhook: async (route, secret, event, extraHeaders = {}) => {
      const body = JSON.stringify(event);
      const t = Math.floor(Date.now() / 1000);
      const v1 = crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
      return req('POST', app + route, {
        body,
        headers: { 'stripe-signature': `t=${t},v1=${v1}`, ...extraHeaders },
      });
    },
    /** Admin call with x-admin-secret and, when configured, the HMAC request signature. */
    admin: async (
      route,
      bodyObj,
      { signingHeader = 'x-signature', tsHeader = 'x-timestamp' } = {}
    ) => {
      const body = JSON.stringify(bodyObj);
      const headers = { 'x-admin-secret': st.secrets.ADMIN_API_SECRET };
      if (st.secrets.ADMIN_SIGNING_SECRET) {
        const ts = String(Math.floor(Date.now() / 1000));
        headers[signingHeader] = crypto
          .createHmac('sha256', st.secrets.ADMIN_SIGNING_SECRET)
          .update(`${ts}.${body}`)
          .digest('hex');
        headers[tsHeader] = ts;
      }
      return req('POST', app + route, { body, headers });
    },
  };
}

const randPw = () => 'Qa26!' + crypto.randomBytes(9).toString('base64url');
module.exports = { kit, req, randPw };
