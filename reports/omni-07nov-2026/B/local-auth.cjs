#!/usr/bin/env node
/**
 * local-auth.cjs — the authenticated money path of a round-2 product, on a PRODUCTION build under mocks.
 *
 *   node A/run-prod.cjs <slug>        (builds with the QA env and starts it with mock Upstash / Stripe / Brevo)
 *   node B/local-auth.cjs <slug>
 *
 * signup -> key -> dashboard -> checkout asks Stripe for EXACTLY the expected price id (and the buyer's email, and
 * the plan in metadata) -> a webhook signed by the real scheme upgrades the account -> a forged / unsigned / stale
 * signature is refused with 400 -> a replayed event changes nothing -> a second checkout is refused (no double
 * billing) -> a Redis outage answers 503 on authenticated routes WITHOUT invalidating the key, which works again
 * the moment Redis returns.
 *
 * Nothing leaves the machine: the egress guard blocks real Upstash / Stripe / Brevo. Every verdict that could pass
 * for the wrong reason has a control (a deliberately wrong expectation must fail).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SLUG = process.argv[2];
const STATE = path.resolve(__dirname, '../../../scratchpad/qa-26ott/state', `${SLUG}.json`);
const S = JSON.parse(fs.readFileSync(STATE, 'utf8'));
const BASE = S.base;
const STRIPE = `http://127.0.0.1:${S.ports.stripe}`;
const UPSTASH = `http://127.0.0.1:${S.ports.upstash}`;
const FIXTURES = path.resolve(
  __dirname,
  '../../../scratchpad/qa-26ott/state',
  `${SLUG}-stripe-fixtures.json`
);
const BREVO_LOG = path.resolve(__dirname, '../../../scratchpad/qa-26ott/logs', `${SLUG}-brevo.log`);
const EVID = path.resolve(__dirname, '..', 'evidence', SLUG);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

function check(what, pass, detail = '') {
  results.push({ what, pass: !!pass, detail: String(detail).slice(0, 400) });
  console.log(
    `${pass ? 'PASS' : 'FAIL'}  ${what}${detail ? '  — ' + String(detail).slice(0, 200) : ''}`
  );
}

async function http(method, p, { headers = {}, body, raw } = {}) {
  const res = await fetch(`${BASE}${p}`, {
    method,
    headers: {
      origin: BASE,
      ...(body !== undefined && raw === undefined ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  return { status: res.status, json, text };
}

function signedWebhook(
  eventObj,
  {
    secret = S.secrets.STRIPE_WEBHOOK_SECRET,
    ts = Math.floor(Date.now() / 1000),
    tamper = false,
  } = {}
) {
  const payload = JSON.stringify(eventObj);
  const sig = crypto.createHmac('sha256', secret).update(`${ts}.${payload}`).digest('hex');
  return { raw: tamper ? payload.replace('"id"', '"id "') : payload, header: `t=${ts},v1=${sig}` };
}

async function stripeSessions() {
  const r = await (await fetch(`${STRIPE}/__qa/sessions`)).json();
  return Array.isArray(r) ? r : r.sessions || Object.values(r);
}

(async () => {
  console.log(`\n=== ${SLUG} — giro autenticato locale su build di produzione (${BASE})\n`);
  fs.mkdirSync(EVID, { recursive: true });
  const email = `qa-local-${SLUG}-${Date.now().toString(36)}@example.org`;
  const plans = ['starter', 'pro', 'business'];

  // 1. signup -> key
  const su = await http('POST', '/api/signup', { body: { email } });
  const key = su.json?.apiKey;
  check(
    'signup: 200 e consegna una chiave',
    su.status === 200 && !!key,
    `HTTP ${su.status} ${String(su.text).slice(0, 90)}`
  );
  if (!key) return;
  const dash0 = await http('GET', '/api/dashboard', { headers: { 'x-api-key': key } });
  check(
    'dashboard con la chiave: 200, piano free, email giusta',
    dash0.status === 200 &&
      dash0.json?.plan === 'free' &&
      String(dash0.json?.email).toLowerCase() === email,
    `HTTP ${dash0.status} plan=${dash0.json?.plan}`
  );
  const noKey = await http('GET', '/api/dashboard');
  check('dashboard senza chiave: 401', noKey.status === 401, `HTTP ${noKey.status}`);
  const badKey = await http('GET', '/api/dashboard', {
    headers: { 'x-api-key': key.slice(0, -4) + 'zzzz' },
  });
  check(
    'dashboard con chiave sbagliata: 401 (non 5xx)',
    badKey.status === 401,
    `HTTP ${badKey.status}`
  );

  // 2. checkout asks Stripe for exactly the expected price
  const created = {};
  for (const p of plans) {
    const em = p === 'pro' ? email : `qa-local-${p}-${Date.now().toString(36)}@example.org`;
    const r = await http('POST', `/api/checkout?plan=${p}`, { body: { email: em } });
    const url = r.json?.url || '';
    check(
      `checkout ${p}: 200 con un url di pagamento`,
      r.status === 200 && /^https?:\/\//.test(url),
      `HTTP ${r.status} ${String(r.text).slice(0, 100)}`
    );
    if (r.status !== 200) continue;
    const id = url.split('/').pop();
    const ses = (await stripeSessions()).find((x) => x.id === id);
    created[p] = ses;
    const params = (ses && ses.params) || {};
    const priceKey = Object.keys(params).find((k) => /^line_items\[0\]\[price\]$/.test(k));
    check(
      `checkout ${p}: chiede a Stripe ESATTAMENTE il price id atteso (price_qa_${p})`,
      params[priceKey] === `price_qa_${p}`,
      `chiesto ${params[priceKey]}`
    );
    check(
      `checkout ${p}: customer_email o customer = l'acquirente, metadata.plan = ${p}`,
      (params.customer_email === em || !!params.customer) && params['metadata[plan]'] === p,
      `email=${params.customer_email} customer=${params.customer} plan=${params['metadata[plan]']}`
    );
    check(
      `checkout ${p}: modalità subscription`,
      params.mode === 'subscription',
      `mode=${params.mode}`
    );
  }
  // control: the price of ANOTHER plan must not match (the oracle can fail)
  if (created.pro) {
    const params = created.pro.params || {};
    const pk = Object.keys(params).find((k) => /^line_items\[0\]\[price\]$/.test(k));
    check(
      'controllo negativo: il price id di "pro" NON coincide con quello di "starter"',
      params[pk] !== 'price_qa_starter'
    );
  }
  const unk = await http('POST', '/api/checkout?plan=non-esiste', { body: { email } });
  check(
    'checkout con piano ignoto: 400',
    unk.status === 400,
    `HTTP ${unk.status} ${String(unk.text).slice(0, 90)}`
  );
  const nop = await http('POST', '/api/checkout', { body: { email } });
  check('checkout senza piano: 400', nop.status === 400, `HTTP ${nop.status}`);
  const cross = await fetch(`${BASE}/api/checkout?plan=pro`, {
    method: 'POST',
    headers: { origin: 'https://evil.example', 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  check("checkout da un'origine esterna: 403 (CSRF)", cross.status === 403, `HTTP ${cross.status}`);

  // 3. webhooks: signed -> 200 and upgrade; forged / unsigned / stale / tampered -> 400
  const ses = created.pro;
  // The Stripe mock re-reads its fixtures on every request. `priceId` is what a subscription retrieve answers: it must
  // be the price the buyer really chose, or the product (rightly) treats the event as another marketplace's.
  const fixturesBefore = fs.existsSync(FIXTURES)
    ? fs.readFileSync(FIXTURES, 'utf8')
    : '{"customerId":"cus_qa_fake"}';
  const setFixtures = (extra) =>
    fs.writeFileSync(FIXTURES, JSON.stringify({ ...JSON.parse(fixturesBefore), ...extra }));
  if (ses) {
    // the event as Stripe would send it: the customer the app created at checkout, the buyer's email
    const sessionObj = {
      ...ses,
      customer: (ses.params && ses.params.customer) || ses.customer,
      customer_email: email,
      customer_details: { email },
    };
    const event = {
      id: `evt_qa_${Date.now()}`,
      object: 'event',
      type: 'checkout.session.completed',
      data: { object: sessionObj },
    };
    const forged = signedWebhook(event, { secret: 'whsec_forged_by_qa' });
    let w = await http('POST', '/api/webhook', {
      raw: forged.raw,
      headers: { 'content-type': 'application/json', 'stripe-signature': forged.header },
    });
    check('webhook con firma FALSA: 400', w.status === 400, `HTTP ${w.status}`);
    w = await http('POST', '/api/webhook', {
      raw: JSON.stringify(event),
      headers: { 'content-type': 'application/json' },
    });
    check('webhook senza header di firma: 400', w.status === 400, `HTTP ${w.status}`);
    const stale = signedWebhook(event, { ts: Math.floor(Date.now() / 1000) - 3600 });
    w = await http('POST', '/api/webhook', {
      raw: stale.raw,
      headers: { 'content-type': 'application/json', 'stripe-signature': stale.header },
    });
    check(
      'webhook con firma giusta ma timestamp di 1 ora fa: 400',
      w.status === 400,
      `HTTP ${w.status}`
    );
    const tampered = signedWebhook(event, { tamper: true });
    w = await http('POST', '/api/webhook', {
      raw: tampered.raw,
      headers: { 'content-type': 'application/json', 'stripe-signature': tampered.header },
    });
    check('webhook con corpo alterato dopo la firma: 400', w.status === 400, `HTTP ${w.status}`);
    const before = await http('GET', '/api/dashboard', { headers: { 'x-api-key': key } });
    check(
      'dopo i 4 rifiuti il piano è ANCORA free (nessuna provvista da un webhook non valido)',
      before.json?.plan === 'free',
      `plan=${before.json?.plan}`
    );

    // a subscription on a price that is NOT ours (another product sharing the Stripe account): acknowledged, never provisioned
    setFixtures({ priceId: 'price_someone_elses_123' });
    const foreignEvent = { ...event, id: `evt_qa_foreign_${Date.now()}` };
    const fsig = signedWebhook(foreignEvent);
    w = await http('POST', '/api/webhook', {
      raw: fsig.raw,
      headers: { 'content-type': 'application/json', 'stripe-signature': fsig.header },
    });
    const afterForeign = await http('GET', '/api/dashboard', { headers: { 'x-api-key': key } });
    check(
      'webhook firmato ma su un price di un ALTRO prodotto: 200 «ignored», il piano NON cambia',
      w.status === 200 && /foreign_price/.test(w.text) && afterForeign.json?.plan === 'free',
      `HTTP ${w.status} ${String(w.text).slice(0, 80)} plan=${afterForeign.json?.plan}`
    );

    setFixtures({ priceId: 'price_qa_pro' });
    const good = signedWebhook(event);
    w = await http('POST', '/api/webhook', {
      raw: good.raw,
      headers: { 'content-type': 'application/json', 'stripe-signature': good.header },
    });
    check(
      'webhook FIRMATO checkout.session.completed: 200',
      w.status === 200,
      `HTTP ${w.status} ${String(w.text).slice(0, 100)}`
    );
    await sleep(500);
    const after = await http('GET', '/api/dashboard', { headers: { 'x-api-key': key } });
    check(
      'dopo il webhook firmato la dashboard mostra il piano pro',
      after.json?.plan === 'pro',
      `plan=${after.json?.plan}`
    );
    w = await http('POST', '/api/webhook', {
      raw: good.raw,
      headers: { 'content-type': 'application/json', 'stripe-signature': good.header },
    });
    const replay = await http('GET', '/api/dashboard', { headers: { 'x-api-key': key } });
    check(
      'lo stesso evento rispedito: nessun errore e il piano non cambia',
      w.status < 500 && replay.json?.plan === 'pro',
      `HTTP ${w.status} plan=${replay.json?.plan}`
    );

    // 4. a second checkout for a paying account is refused
    const again = await http('POST', '/api/checkout?plan=business', { body: { email } });
    check(
      'secondo checkout dello stesso account già pagante: rifiutato (409), non una seconda sottoscrizione',
      again.status === 409,
      `HTTP ${again.status} ${String(again.text).slice(0, 110)}`
    );
  }
  fs.writeFileSync(FIXTURES, fixturesBefore);

  // 5. Redis outage: 503 on authenticated routes, key NOT invalidated
  const setOutage = (on) =>
    fetch(`${UPSTASH}/__qa/outage`, {
      method: 'POST',
      body: JSON.stringify({ on }),
      headers: { 'content-type': 'application/json' },
    });
  await setOutage(true);
  const dOut = await http('GET', '/api/dashboard', { headers: { 'x-api-key': key } });
  const sOut = await http('POST', '/api/signup', {
    body: { email: `qa-out-${Date.now().toString(36)}@example.org` },
  });
  // the checkout reads Redis too (plan lookup / key creation): the flow-A finding on F4 and B7 was a generic catch
  // answering 500 "something went wrong" for what is a temporary outage that a retry fixes
  const cOut = await http('POST', '/api/checkout?plan=starter', {
    body: { email: `qa-out-co-${Date.now().toString(36)}@example.org` },
  });
  const bOut = await http('POST', '/api/billing-portal', { headers: { 'x-api-key': key } });
  await setOutage(false);
  check(
    'Redis giù: il checkout risponde 503 (un riprova lo risolve), non 500',
    cOut.status === 503,
    `HTTP ${cOut.status} ${String(cOut.text).slice(0, 110)}`
  );
  check(
    'Redis giù: il portale di fatturazione risponde 503 o un rifiuto pulito, mai 500',
    bOut.status !== 500 && bOut.status < 600,
    `HTTP ${bOut.status} ${String(bOut.text).slice(0, 90)}`
  );
  check(
    'Redis giù: la dashboard risponde 503, NON 401 (la chiave non viene invalidata)',
    dOut.status === 503,
    `HTTP ${dOut.status} ${String(dOut.text).slice(0, 90)}`
  );
  check('Redis giù: il signup risponde 503, non 500', sOut.status === 503, `HTTP ${sOut.status}`);
  await sleep(600);
  const rec = await http('GET', '/api/dashboard', { headers: { 'x-api-key': key } });
  check(
    'Redis di nuovo su: la STESSA chiave funziona e il piano è intatto',
    rec.status === 200 && (rec.json?.plan === 'pro' || rec.json?.plan === 'free'),
    `HTTP ${rec.status} plan=${rec.json?.plan}`
  );

  // 6. welcome mail went through the Brevo mock to the right address
  let mails = 0;
  try {
    mails = (
      fs.readFileSync(BREVO_LOG, 'utf8').match(new RegExp(email.replace(/[.+]/g, '\\$&'), 'g')) ||
      []
    ).length;
  } catch {
    /* no log */
  }
  check(
    "la email di benvenuto è partita verso il mock Brevo, all'indirizzo giusto",
    mails >= 1,
    `${mails} occorrenze nel log del mock`
  );
})()
  .catch((e) => {
    console.error('LOCAL-AUTH ABORTED:', e && e.stack ? e.stack : e);
    process.exitCode = 2;
  })
  .finally(() => {
    const fails = results.filter((r) => !r.pass).length;
    console.log(`\n--- ${SLUG}: ${results.length - fails}/${results.length} PASS`);
    try {
      fs.writeFileSync(
        path.join(EVID, 'local-auth.json'),
        JSON.stringify({ slug: SLUG, at: new Date().toISOString(), results }, null, 1)
      );
    } catch {
      /* evidence dir */
    }
  });
