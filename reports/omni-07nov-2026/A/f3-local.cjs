// PaymentRescue LOCAL authenticated journey (localhost:3203, mocks, local test values only).
const { openIsolated, sleep, EVID, setVal, check, save } = require('./lib.cjs');
const { kit, randPw } = require('./lib.cjs');
const path = require('path');
const K = kit('f3');
const S = 'f3';
const email = `antonio.alt3000+qa07-f3-${Date.now().toString(36)}@gmail.com`;
const password = randPw();
const GROWTH_MONTHLY = 'price_1TEuqgQ4hv1lIuBUgEI2uVnA';

// The plan label in the dashboard header only exists for accounts with Stripe connected (otherwise the page is
// in "Demo Mode"), so the oracle is the plan field the dashboard itself loads from /api/dashboard.
async function dashPlan(j) {
  await j.goto(`${K.app}/dashboard`);
  return j.eval("fetch('/api/dashboard').then((r) => r.json()).then((d) => d.plan || null)");
}
async function userId() {
  const keys = await K.redisKeys();
  const k = keys.find((x) => x.startsWith('pre:user:email:') && x.includes(email.toLowerCase()));
  if (!k) return null;
  const v = await K.redisCmd('GET', k);
  return v && v.result ? String(v.result).replace(/^"|"$/g, '') : null;
}

let j;
(async () => {
  j = await openIsolated(`${K.app}/signup`);
  // 1. signup in the UI
  await setVal(j, '#signup-name', 'Rescue QA Ltd');
  await setVal(j, '#signup-email', email);
  await setVal(j, '#signup-password', password);
  await sleep(2500); // anti-bot minimum fill time is a human pace, not a script pace
  const su = j.waitForResponse('/api/auth/signup', 30000);
  await j.click('button[type="submit"]');
  const sr = await su.catch(() => null);
  check(S, 'signup: POST /api/auth/signup 200', 200, sr && sr.status);
  await j
    .waitFor("js:location.pathname.startsWith('/dashboard')", { timeout: 30000 })
    .catch(() => {});
  check(S, 'signup: lands on /dashboard', '/dashboard', await j.eval('location.pathname'));
  check(S, 'signup: dashboard shows Free plan', 'free', await dashPlan(j));
  const me = await j.eval("fetch('/api/auth/me').then(r => r.status)");
  check(S, 'signup: /api/auth/me 200 with the new session', 200, me);
  await j.screenshot(path.join(EVID, S, 'local-dashboard-free.png'), { fullPage: true });

  // 2. duplicate signup -> generic answer + "account exists" email to the owner, no second account
  const dup = await K.post('/api/auth/signup', { name: 'Dup', email, password: randPw() });
  const mails1 = await K.sentEmails();
  check(S, `duplicate signup: generic response (HTTP ${dup.status})`, true, dup.status < 500);
  check(
    S,
    'duplicate signup: account-exists email to the owner',
    true,
    mails1.some(
      (m) =>
        JSON.stringify(m.payload?.to || '').includes(email) &&
        /already|exists|account/i.test(m.payload?.subject || '')
    )
  );

  // 3. logout, wrong password, real login (UI)
  await j.eval("fetch('/api/auth/logout', { method: 'POST' }).then(r => r.status)");
  await j.goto(`${K.app}/login`);
  await setVal(j, '#login-email', email);
  await setVal(j, '#login-password', password + 'x');
  let lr = j.waitForResponse('/api/auth/login', 30000);
  await j.click('button[type="submit"]');
  const bad = await lr.catch(() => null);
  check(S, 'login wrong password: 401', 401, bad && bad.status);
  await sleep(500);
  check(
    S,
    'login wrong password: error shown',
    true,
    /invalid|incorrect|wrong/i.test(await j.text())
  );
  await setVal(j, '#login-password', password);
  lr = j.waitForResponse('/api/auth/login', 30000);
  await j.click('button[type="submit"]');
  const good = await lr.catch(() => null);
  check(S, 'login correct password: 200', 200, good && good.status);
  await j
    .waitFor("js:location.pathname.startsWith('/dashboard')", { timeout: 30000 })
    .catch(() => {});
  check(S, 'login: lands on /dashboard', '/dashboard', await j.eval('location.pathname'));

  // 4. checkout from the UI (monthly, then annual): the session the app asks Stripe for
  await j.goto(`${K.app}/checkout?plan=growth`);
  const co = j.waitForResponse('/api/stripe/checkout', 30000);
  await j.click('text=Subscribe — $59/mo');
  const cr = await co.catch(() => null);
  check(S, 'checkout growth monthly: 200', 200, cr && cr.status);
  await sleep(800);
  await j.goto(`${K.app}/checkout?plan=scale`);
  await j.click('text=Annual');
  await sleep(400);
  const co2 = j.waitForResponse('/api/stripe/checkout', 30000);
  await j.click('text=Subscribe — $990/yr');
  const cr2 = await co2.catch(() => null);
  check(S, 'checkout scale annual: 200', 200, cr2 && cr2.status);
  const sess = await K.stripeSessions();
  const uid = await userId();
  const s1 = sess[sess.length - 2]?.params || {},
    s2 = sess[sess.length - 1]?.params || {};
  check(
    S,
    'checkout growth monthly: Stripe asked for the Growth monthly price',
    GROWTH_MONTHLY,
    s1['line_items[0][price]']
  );
  check(
    S,
    'checkout growth monthly: metadata plan/cycle/user',
    ['growth', 'monthly', uid],
    [s1['metadata[plan]'], s1['metadata[cycle]'], s1['metadata[userId]']]
  );
  check(S, 'checkout growth monthly: customer_email = account email', email, s1.customer_email);
  check(
    S,
    'checkout scale annual: Stripe asked for the Scale annual price',
    K.st.prices.STRIPE_PRICE_SCALE_ANNUAL,
    s2['line_items[0][price]']
  );
  // anonymous checkout must not create a session
  const anon = await K.post('/api/stripe/checkout', { plan: 'growth' });
  check(S, 'checkout without session: 401', 401, anon.status);

  // 5. Stripe confirms payment -> plan upgraded (own-account billing webhook)
  K.setStripeFixtures({ priceId: GROWTH_MONTHLY, customerId: 'cus_qa26_f3', customerEmail: email });
  const evt = {
    id: `evt_qa26_${Date.now()}`,
    object: 'event',
    type: 'checkout.session.completed',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: sess[sess.length - 2]?.id || 'cs_qa_1',
        object: 'checkout.session',
        status: 'complete',
        payment_status: 'paid',
        mode: 'subscription',
        customer: 'cus_qa26_f3',
        subscription: 'sub_qa26_f3',
        customer_details: { email },
        customer_email: email,
        metadata: { userId: uid, plan: 'growth', cycle: 'monthly' },
      },
    },
  };
  const wh = await K.webhook(
    '/api/stripe/billing-webhook',
    K.st.secrets.STRIPE_WEBHOOK_SECRET,
    evt
  );
  check(
    S,
    `billing webhook checkout.session.completed: 200 (${wh.body.toString().slice(0, 80)})`,
    200,
    wh.status
  );
  const forged = await K.webhook('/api/stripe/billing-webhook', 'whsec_wrong', evt);
  check(S, 'billing webhook with a forged signature: 400', 400, forged.status);
  check(S, 'dashboard after payment: Growth plan', 'growth', await dashPlan(j));
  await j.screenshot(path.join(EVID, S, 'local-dashboard-growth.png'), { fullPage: true });

  // 6. redeem a lifetime coupon minted by the admin endpoint (signed request)
  const gen = await K.admin('/api/admin/generate-coupons', {
    prefix: 'QAT',
    count: 1,
    internal: true,
  });
  const code = gen.json && (gen.json.sample?.[0] || gen.json.codes?.[0] || gen.json.coupons?.[0]);
  check(
    S,
    `admin generate-coupons: 200 with a code (${gen.status})`,
    true,
    gen.status === 200 && !!code
  );
  await j.goto(`${K.app}/redeem`);
  await setVal(j, '#redeem-email', email);
  await setVal(j, '#redeem-code', code || 'NONE');
  await j.click('#redeem-confirm').catch(() => {});
  const rd = j.waitForResponse('/api/redeem', 30000);
  await j.click('button[type="submit"]');
  const rr = await rd.catch(() => null);
  check(S, `redeem: 200 (${rr && String(rr.body).slice(0, 100)})`, 200, rr && rr.status);
  check(S, 'dashboard after redeem: Scale plan', 'scale', await dashPlan(j));
  const again = await K.post('/api/redeem', { email, code }, { headers: { origin: K.app } });
  check(
    S,
    'same coupon a second time: rejected 4xx',
    true,
    again.status >= 400 && again.status < 500
  );

  // 7. dunning end-to-end on a merchant's end customer (Connect), against the Brevo MOCK:
  //    failed -> email #1 (exact amount + address) -> replay is idempotent -> day 3 via the cron -> recovered
  const acct = 'acct_qa07f3merchant';
  await K.redisCmd('SET', `pre:user:connected_acct:${acct}`, uid);
  const END = 'end.customer.qa07@example.org';
  const inv = {
    id: `in_qa07_${Date.now()}`,
    object: 'invoice',
    customer: 'cus_endcustomer_qa07',
    customer_email: END,
    customer_name: 'End Customer',
    amount_due: 4900,
    currency: 'eur',
    status: 'open',
    attempt_count: 1,
    last_finalization_error: null,
  };
  const failEvt = {
    id: `evt_qa07_f_${Date.now()}`,
    object: 'event',
    type: 'invoice.payment_failed',
    account: acct,
    created: Math.floor(Date.now() / 1000),
    data: { object: inv },
  };
  const mailsFor = async () =>
    (await K.sentEmails()).filter((m) => JSON.stringify(m.payload?.to || '').includes(END));
  const before = (await mailsFor()).length;
  const CONNECT = K.st.secrets.STRIPE_CONNECT_WEBHOOK_SECRET;
  const fail = await K.webhook('/api/stripe/webhook', CONNECT, failEvt);
  check(S, 'connect invoice.payment_failed: 200', 200, fail.status);
  const fpKey = (await K.redisKeys()).find(
    (k) => k.includes(inv.id) && /failed_payment|:failed:/.test(k) && !k.includes('owner')
  );
  const rawRec = fpKey ? await K.redisCmd('GET', fpKey) : null;
  const rec = rawRec && rawRec.result ? JSON.parse(rawRec.result) : null;
  check(
    S,
    'failed payment recorded: pending_recovery, amount 4900 eur, exact address',
    ['pending_recovery', 4900, 'eur', END],
    rec ? [rec.status, rec.amount, rec.currency, rec.customerEmail] : null
  );
  const m1 = (await mailsFor()).slice(before);
  check(S, 'dunning #1: exactly one message to the end customer', 1, m1.length);
  const p1 = m1[0] && m1[0].payload ? m1[0].payload : {};
  check(
    S,
    'dunning #1: recipient is exactly the end customer',
    [{ email: END }],
    (p1.to || []).map((t) => ({ email: t.email }))
  );
  check(
    S,
    'dunning #1: sender is hello@paymentrescue.dev (a mailbox that receives replies)',
    'hello@paymentrescue.dev',
    p1.sender && p1.sender.email
  );
  check(
    S,
    'dunning #1: display name is the merchant, not us',
    'Rescue QA Ltd',
    p1.sender && p1.sender.name
  );
  const html1 = String(p1.htmlContent || '');
  check(
    S,
    'dunning #1: body states the exact amount 49.00',
    true,
    /49[.,]00/.test(html1),
    (html1.match(/.{20}49[.,]00.{10}/) || [''])[0]
  );
  check(
    S,
    'dunning #1: body carries the signed update-payment link for THIS invoice',
    true,
    new RegExp(`/update-payment/${inv.id}\\?t=[A-Za-z0-9_-]{8,}`).test(html1)
  );
  // replay of the same Stripe event: no second message
  const replay = await K.webhook('/api/stripe/webhook', CONNECT, failEvt);
  check(
    S,
    'replayed event: 200 and NO second message',
    [200, 1],
    [replay.status, (await mailsFor()).slice(before).length]
  );
  // day 3: age the record, run the dunning cron with its own secret, expect step 2
  if (rec) {
    await K.redisCmd(
      'SET',
      fpKey,
      JSON.stringify({ ...rec, failedAt: new Date(Date.now() - 3.2 * 86400000).toISOString() })
    );
  }
  const cronBad = await K.get('/api/cron/dunning', {
    headers: { authorization: 'Bearer wrong-secret' },
  });
  check(
    S,
    'dunning cron with a wrong secret: 401/403',
    true,
    cronBad.status === 401 || cronBad.status === 403
  );
  const cron = await K.get('/api/cron/dunning', {
    headers: { authorization: `Bearer ${K.st.secrets.CRON_SECRET}` },
  });
  check(
    S,
    `dunning cron with the right secret: 200 (${String(cron.body).slice(0, 100)})`,
    200,
    cron.status
  );
  const m2 = (await mailsFor()).slice(before);
  check(S, 'cron: exactly one NEW message (step 2), to the same address', 2, m2.length);
  const html2 = String((m2[1] && m2[1].payload && m2[1].payload.htmlContent) || '');
  check(
    S,
    'cron step 2: still the exact amount 49.00 and the same invoice link',
    true,
    /49[.,]00/.test(html2) && html2.includes(`/update-payment/${inv.id}`)
  );
  check(
    S,
    'step 1 and step 2 differ (a real sequence, not the same text twice)',
    true,
    html1 !== html2
  );
  const ok = await K.webhook('/api/stripe/webhook', CONNECT, {
    id: `evt_qa07_s_${Date.now()}`,
    object: 'event',
    type: 'invoice.payment_succeeded',
    account: acct,
    created: Math.floor(Date.now() / 1000),
    data: { object: { ...inv, status: 'paid', amount_paid: 4900 } },
  });
  check(S, 'connect invoice.payment_succeeded: 200', 200, ok.status);
  const rec2 = fpKey ? JSON.parse((await K.redisCmd('GET', fpKey)).result) : null;
  check(
    S,
    'failed payment transitions to recovered with a timestamp',
    ['recovered', true],
    rec2 ? [rec2.status, !!rec2.recoveredAt] : null
  );
  await K.get('/api/cron/dunning', {
    headers: { authorization: `Bearer ${K.st.secrets.CRON_SECRET}` },
  });
  check(
    S,
    'after recovery the cron sends nothing more',
    2,
    (await mailsFor()).slice(before).length
  );
  await j.goto(`${K.app}/dashboard`);
  await sleep(2000);
  await j.screenshot(path.join(EVID, S, 'local-dashboard-recovered.png'), { fullPage: true });

  // 8. Redis outage: authenticated routes answer 503, not 401/500; then recover
  await K.outage(true);
  const cookie = await j.eval('document.cookie');
  const meOut = await j.eval("fetch('/api/auth/me').then(r => r.status)");
  const dashOut = await j.eval("fetch('/api/dashboard').then(r => r.status)");
  const loginOut = await K.post('/api/auth/login', { email, password });
  await K.outage(false);
  check(S, 'Redis outage: /api/auth/me 503 (not a logout)', 503, meOut);
  check(S, 'Redis outage: /api/dashboard 503', 503, dashOut);
  check(S, 'Redis outage: /api/auth/login 503', 503, loginOut.status);
  await sleep(500);
  check(
    S,
    'after outage: /api/auth/me back to 200 (session intact)',
    200,
    await j.eval("fetch('/api/auth/me').then(r => r.status)")
  );

  // 9. DSAR modules (R10): documented as requests with a 30-day SLA, NOT instant erasure
  const exp = await j.eval(
    "fetch('/api/user/export').then(async r => ({ s: r.status, t: (await r.text()).slice(0, 600) }))"
  );
  check(
    S,
    'export endpoint documents itself as a 30-day request',
    true,
    exp.s === 200 && /maxResponseDays|30/.test(exp.t)
  );
  const other = await j.eval(
    `fetch('/api/user/delete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'someone.else@example.org', confirm: true }) }).then(r => r.status)`
  );
  check(S, "delete request for someone else's address: 403", 403, other);
  console.log('cookie present during outage:', !!cookie);
  const rep = j.report();
  check(S, 'journey: uncaught exceptions', [], rep.exceptions);
  console.log('console errors seen:', JSON.stringify(rep.consoleErrors.slice(0, 8)));
  await j.close();
  save('f3/local-journey-A2.json');
})().catch((e) => {
  console.error('ERR', e);
  process.exitCode = 1;
  if (j) return j.close();
});
