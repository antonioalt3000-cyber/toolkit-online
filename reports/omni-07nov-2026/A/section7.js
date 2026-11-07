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
check(S, 'after recovery the cron sends nothing more', 2, (await mailsFor()).slice(before).length);
await j.goto(`${K.app}/dashboard`);
await sleep(2000);
await j.screenshot(path.join(EVID, S, 'local-dashboard-recovered.png'), { fullPage: true });
