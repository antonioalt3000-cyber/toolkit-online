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
