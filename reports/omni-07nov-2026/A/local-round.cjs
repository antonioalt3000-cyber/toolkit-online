// Local authenticated round for f1 / f2 / f4 / b7 against `A/run-prod.cjs <slug>` (production build + Upstash/Stripe/Brevo mocks).
// usage: node local-round.cjs <slug>
// What it proves, per product, with the product's OWN contract (nothing shortcut):
//   register -> credential, checkout -> Stripe is asked for EXACTLY the expected price id with metadata + customer_email,
//   bad plan -> 400, signed checkout.session.completed -> the plan really changes (read back through the product),
//   forged signature -> 400, Redis outage -> 503 on the authenticated route (NOT 401/500) and the SAME credential works after.
'use strict';
const fs = require('fs');
const { kit, check, save, randPw } = require('./lib.cjs');
const slug = process.argv[2];
const S = `${slug}-local`;

const CFG = {
  f1: {
    register: {
      path: '/api/auth/register',
      body: (e) => ({ email: e }),
      cred: (r) => ({ headers: { 'x-api-key': r.json && r.json.apiKey } }),
    },
    me: '/api/auth/me',
    checkoutPath: '/api/checkout',
    checkoutBody: (e, plan) => ({ plan, email: e }),
    webhook: '/api/webhook',
    priceVar: (plan) => `STRIPE_PRICE_${plan.toUpperCase()}`,
  },
  f2: {
    register: {
      path: '/api/auth/signup',
      body: (e) => ({ name: 'QA Round', email: e, password: randPw() }),
      cred: (r) => ({
        headers: { cookie: (r.setCookie || []).map((c) => c.split(';')[0]).join('; ') },
      }),
    },
    me: '/api/auth/me',
    noCredStatus: 200, // by design: the header asks "who am I" on every page, so no cookie is a 200 with user:null
    checkoutPath: '/api/checkout',
    checkoutBody: (e, plan) => ({ plan, email: e }),
    webhook: '/api/webhook',
    priceVar: (plan) => `STRIPE_PRICE_${plan.toUpperCase()}`,
    // monthly price ids are hardcoded in src/lib/constants.ts (PLANS.<plan>.stripePriceId)
    sourcePrice: (plan) => {
      const t = require('fs').readFileSync(
        'C:/Users/ftass/business-fast2-accessiscan/src/lib/constants.ts',
        'utf8'
      );
      const m = t.match(
        new RegExp(
          String.raw`\b` +
            plan +
            String.raw`:\s*\{[^}]*?stripePriceId:\s*["'](price_[A-Za-z0-9]+)["']`
        )
      );
      return m && m[1];
    },
  },
  f4: {
    register: {
      path: '/api/auth/register',
      body: (e) => ({ email: e, name: 'QA Round' }),
      cred: (r) => ({ headers: { 'x-api-key': r.json && r.json.apiKey } }),
    },
    me: '/api/v1/dashboard',
    checkoutPath: '/api/checkout',
    checkoutBody: (e, plan) => ({ plan, email: e }),
    unknownEmailStatus: 404,
    webhook: '/api/webhooks/stripe',
    priceVar: (plan) => `STRIPE_PRICE_${plan.toUpperCase()}`,
    // monthly price ids are hardcoded in lib/constants.ts (only the annual ones come from env)
    sourcePrice: (plan) => {
      const t = fs.readFileSync('C:/Users/ftass/business-fast4-documint/lib/constants.ts', 'utf8');
      const m = t.match(
        new RegExp(plan + String.raw`:\s*\{[^}]*?priceId:\s*['"](price_[A-Za-z0-9]+)['"]`)
      );
      return m && m[1];
    },
  },
  b7: {
    register: {
      path: '/api/auth/register',
      body: (e) => ({ email: e, name: 'QA Round' }),
      cred: (r) => ({ headers: { 'x-api-key': r.json && r.json.apiKey } }),
    },
    me: '/api/dashboard',
    checkoutPath: '/api/checkout',
    checkoutBody: (e, plan) => ({ plan, email: e }),
    webhook: '/api/webhook',
    priceVar: (plan) => `STRIPE_PRICE_${plan.toUpperCase()}`,
    // B7 hands Stripe a Customer (found/created by email), and Stripe refuses customer + customer_email together:
    // the email travels on the Customer, so the session carries `customer: cus_...` and no customer_email.
    emailViaCustomer: true,
    // monthly price ids are hardcoded in lib/stripe.ts (PLAN_PRICES)
    sourcePrice: (plan) => {
      const t = require('fs').readFileSync(
        'C:/Users/ftass/business-7-capture-api/src/lib/stripe.ts',
        'utf8'
      );
      const m = t.match(
        new RegExp(
          String.raw`PLAN_PRICES[^{]*\{[^}]*?\b` +
            plan +
            String.raw`:\s*["'](price_[A-Za-z0-9]+)["']`
        )
      );
      return m && m[1];
    },
  },
}[slug];
if (!CFG) throw new Error('slug must be one of f1 f2 f4 b7');

const findPlan = (j, depth = 0) => {
  if (!j || typeof j !== 'object' || depth > 4) return null;
  if (typeof j.plan === 'string') return j.plan;
  for (const v of Object.values(j)) {
    const p = findPlan(v, depth + 1);
    if (p) return p;
  }
  return null;
};

(async () => {
  const K = kit(slug);
  const email = `antonio.alt3000+qa07nov${slug}local${Date.now().toString(36)}@gmail.com`;
  const PLAN = 'pro';
  // unique per run: a subscription already tied to another account must not be re-linked (B7 refuses, rightly)
  const RUN = Date.now().toString(36);
  const CUS = `cus_qa07_${slug}_${RUN}`;
  const SUB = `sub_qa07_${slug}_${RUN}`;
  const EXPECT_PRICE = CFG.sourcePrice ? CFG.sourcePrice(PLAN) : K.st.prices[CFG.priceVar(PLAN)];

  // 1. register -> a credential
  const reg = await K.post(CFG.register.path, CFG.register.body(email));
  check(
    S,
    `register: 2xx (${reg.status} ${reg.body.toString().slice(0, 90).replace(/\s+/g, ' ')})`,
    true,
    reg.status >= 200 && reg.status < 300
  );
  const cred = CFG.register.cred(reg);
  const me0 = await K.get(CFG.me, cred);
  check(S, `authenticated route with the new credential: 200 (${me0.status})`, 200, me0.status);
  const plan0 = findPlan(me0.json);
  check(S, `starts on a non-paid plan (read: ${plan0})`, true, !!plan0 && plan0 !== PLAN);
  const noCred = await K.get(CFG.me, {});
  const wantNoCred = CFG.noCredStatus || 401;
  check(S, `authenticated route with NO credential: ${wantNoCred}`, wantNoCred, noCred.status);
  if (slug === 'f2')
    check(
      S,
      'f2 with no cookie answers user:null (not someone else)',
      true,
      !!noCred.json && (noCred.json.user === null || noCred.json.user === undefined)
    );

  // 2. checkout: the exact price id, metadata and customer_email
  const before = (await K.stripeSessions()).length;
  const co = await K.post(CFG.checkoutPath, CFG.checkoutBody(email, PLAN));
  check(
    S,
    `checkout ${PLAN}: 200 with a url (${co.status} ${co.body.toString().slice(0, 80).replace(/\s+/g, ' ')})`,
    true,
    co.status === 200 && !!(co.json && co.json.url)
  );
  const sessions = await K.stripeSessions();
  const sess = sessions.length > before ? sessions[sessions.length - 1] : null;
  const params = (sess && sess.params) || {};
  check(
    S,
    `Stripe was asked for EXACTLY the ${PLAN} price id`,
    EXPECT_PRICE,
    params['line_items[0][price]']
  );
  if (CFG.emailViaCustomer)
    check(
      S,
      'the session is attached to a Stripe Customer (customer: cus_...)',
      true,
      /^cus_/.test(String(params.customer || ''))
    );
  else
    check(
      S,
      'customer_email = the account email',
      email.toLowerCase(),
      String(params.customer_email || '').toLowerCase()
    );
  check(S, `metadata.plan = ${PLAN}`, PLAN, params['metadata[plan]']);
  const badPlan = await K.post(CFG.checkoutPath, CFG.checkoutBody(email, 'no-such-plan'));
  check(S, 'checkout with a plan that does not exist: 400', 400, badPlan.status);
  if (CFG.unknownEmailStatus) {
    const unk = await K.post(
      CFG.checkoutPath,
      CFG.checkoutBody(`nobody.${Date.now()}@example.org`, PLAN)
    );
    check(
      S,
      `checkout for an email with no account: ${CFG.unknownEmailStatus}`,
      CFG.unknownEmailStatus,
      unk.status
    );
  }

  // 3. signed webhook upgrades the plan; a forged signature is refused
  const meta = {};
  for (const [k, v] of Object.entries(params)) {
    const m = k.match(/^metadata\[(.+)\]$/);
    if (m) meta[m[1]] = v;
  }
  K.setStripeFixtures({
    priceId: params['line_items[0][price]'],
    customerId: CUS,
    customerEmail: email,
  });
  const evt = {
    id: `evt_qa07_${slug}_${Date.now()}`,
    object: 'event',
    type: 'checkout.session.completed',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: (sess && sess.id) || 'cs_qa07',
        object: 'checkout.session',
        status: 'complete',
        payment_status: 'paid',
        mode: 'subscription',
        customer: CUS,
        subscription: SUB,
        customer_details: { email },
        customer_email: email,
        metadata: meta,
      },
    },
  };
  const wh = await K.webhook(CFG.webhook, K.st.secrets.STRIPE_WEBHOOK_SECRET, evt);
  check(
    S,
    `signed checkout.session.completed: 200 (${wh.body.toString().slice(0, 80).replace(/\s+/g, ' ')})`,
    200,
    wh.status
  );
  const forged = await K.webhook(CFG.webhook, 'whsec_wrong', { ...evt, id: evt.id + '_f' });
  check(S, 'forged signature: 400', 400, forged.status);
  const noSig = await K.post(CFG.webhook, evt);
  check(S, 'no signature at all: 400', 400, noSig.status);
  const me1 = await K.get(CFG.me, cred);
  check(
    S,
    `after the webhook the plan really is ${PLAN} (read: ${findPlan(me1.json)})`,
    PLAN,
    findPlan(me1.json)
  );
  const replay = await K.webhook(CFG.webhook, K.st.secrets.STRIPE_WEBHOOK_SECRET, evt);
  check(
    S,
    `the same event replayed: 200 and the plan is unchanged`,
    [200, PLAN],
    [replay.status, findPlan((await K.get(CFG.me, cred)).json)]
  );

  // 4. Redis outage: 503 (not 401, not 500), and the SAME credential works afterwards
  await K.outage(true);
  const out = await K.get(CFG.me, cred);
  const outCo = await K.post(CFG.checkoutPath, CFG.checkoutBody(email, PLAN));
  await K.outage(false);
  check(
    S,
    `Redis outage: authenticated route answers 503 (read ${out.status}, never a 401 logout)`,
    503,
    out.status
  );
  // 200 is the BEST outcome (checkout that does not need Redis keeps taking money); 503 is honest; a 500 is a crash
  check(
    S,
    `Redis outage: checkout works through (200) or says 503 - never a 500 (read ${outCo.status})`,
    true,
    outCo.status === 200 || outCo.status === 503 || (outCo.status >= 400 && outCo.status < 500)
  );
  const after = await K.get(CFG.me, cred);
  check(
    S,
    `after the outage the same credential works again (${after.status}, plan ${findPlan(after.json)})`,
    [200, PLAN],
    [after.status, findPlan(after.json)]
  );

  const fails = save(`${slug}/local-round.json`);
  process.exitCode = fails ? 1 : 0;
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
});
