// HookLab production journey: anonymous endpoint from the UI, real webhooks
// sent to it, byte-exact inspection, share redaction, and signature checks
// (Stripe / GitHub / Shopify) recomputed independently with node:crypto.
const crypto = require('crypto');
const { Journey, sleep, oracles, SITES, Recorder, creatorKey, apiFetch } = require('./lib.cjs');

(async () => {
  const rec = new Recorder('hkl', 'prod-demo');
  const base = SITES.hkl.prod;
  const j = await Journey.open(`${base}/`);
  let endpoint;
  try {
    const respP = j.waitForResponse('/api/demo', 45000);
    await j.click('text=Create test endpoint');
    const resp = await respP;
    endpoint = JSON.parse(resp.body.toString());
    await sleep(1200);
    const ui = await j.text('main');
    await j.screenshot(rec.ev('endpoint-created.png'));
    rec.check(
      'crea endpoint anonimo da UI',
      '201/200 con id e URL su gethooklab.dev, scadenza 7 giorni',
      {
        status: resp.status,
        id: endpoint.id,
        url: endpoint.url,
        expiresInDays: endpoint.expiresInDays,
      },
      resp.status < 300 &&
        /^https:\/\/gethooklab\.dev\/api\/h\/[A-Za-z0-9_-]{10}$/.test(endpoint.url || '') &&
        endpoint.expiresInDays === 7 &&
        ui.includes(endpoint.url)
    );
  } finally {
    await j.close();
  }
  if (!endpoint?.url) return;

  // ---- deliver real webhooks to it ----
  const trace = `qa26-${crypto.randomBytes(4).toString('hex')}`;
  const body = JSON.stringify({
    id: 'evt_qa26',
    type: 'invoice.paid',
    data: { amount: 4242, currency: 'eur', note: 'café ✓ — ünïcødé' },
  });
  const whsec = 'whsec_qa26_local_test_secret';
  const t = Math.floor(Date.now() / 1000);
  const stripeSig = `t=${t},v1=${oracles.hmacHex(whsec, `${t}.${body}`)}`;
  const post = await fetch(endpoint.url, {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
      'x-qa-trace': trace,
      'stripe-signature': stripeSig,
      authorization: 'Bearer qa26-should-be-redacted-in-share',
    },
  });
  const get = await fetch(`${endpoint.url}?step=2&q=hello%20world`, {
    headers: { 'x-qa-trace': trace },
  });
  rec.check(
    "consegna webhook POST + GET all'endpoint",
    '2xx per entrambi',
    { post: post.status, get: get.status },
    post.ok && get.ok
  );

  // ---- inspect in the browser like a developer would ----
  await sleep(1500);
  const ins = await Journey.open(`${base}/inspect/${endpoint.id}`);
  let captures = [];
  try {
    const peekP = ins.waitForResponse('/peek', 30000).catch(() => null);
    await ins.goto(`${base}/inspect/${endpoint.id}`);
    const peek = await peekP;
    await sleep(1500);
    const pj = peek && peek.body ? JSON.parse(peek.body.toString()) : {};
    captures = pj.captures || pj.requests || pj.items || [];
    await ins.screenshot(rec.ev('inspector.png'), { fullPage: true });
    const pc = captures.find((c) => c.method === 'POST');
    const gc = captures.find((c) => c.method === 'GET');
    const hdr = (c, k) => c && c.headers && (c.headers[k] ?? c.headers[k.toLowerCase()]);
    rec.check(
      'inspector: corpo POST identico byte per byte',
      body,
      pc ? (pc.bodyRaw ?? pc.body) : Object.keys(pj),
      !!pc && (pc.bodyRaw ?? pc.body) === body
    );
    // v1 HMAC is redacted on display by design (redaction.ts, covered by redaction.test.ts); t= must survive.
    rec.check(
      'inspector: header inviati catturati (v1 della firma oscurato per scelta)',
      { 'x-qa-trace': trace, 'stripe-signature': `t=${t},v1=[redacted]` },
      pc
        ? { 'x-qa-trace': hdr(pc, 'x-qa-trace'), 'stripe-signature': hdr(pc, 'stripe-signature') }
        : null,
      !!pc &&
        hdr(pc, 'x-qa-trace') === trace &&
        hdr(pc, 'stripe-signature') === `t=${t},v1=[redacted]`
    );
    rec.check(
      'inspector: GET con query string catturato',
      { step: '2', q: 'hello world' },
      gc ? gc.query : null,
      !!gc && gc.query && gc.query.step === '2' && gc.query.q === 'hello world'
    );
    // expand the POST capture like a developer would (rows are collapsed by default)
    await ins.eval(`(() => { const b = [...document.querySelectorAll('button[aria-expanded]')].find((x) => x.textContent.trim().startsWith("POST"));
      if (b) b.setAttribute('data-qa-expand', '1'); return !!b; })()`);
    await ins.click('[data-qa-expand]').catch(() => {});
    await sleep(800);
    await ins.screenshot(rec.ev('inspector-post-expanded.png'), { fullPage: true });
    const page = await ins.text('main');
    rec.check(
      'inspector: la pagina mostra trace e importo',
      `${trace} e 4242 visibili`,
      page.includes(trace) && page.includes('4242'),
      page.includes(trace) && page.includes('4242')
    );
    const rep = ins.report();
    rec.check(
      'inspector: console/eccezioni',
      '0',
      rep,
      rep.exceptions.length === 0 && rep.consoleErrors.length === 0
    );
  } finally {
    await ins.close();
  }

  // ---- share link must redact secrets ----
  const postIdx = captures.findIndex((c) => c.method === 'POST');
  if (postIdx >= 0) {
    const idx = captures[postIdx].index ?? postIdx;
    const sh = await apiFetch(`${base}/api/h/${endpoint.id}/${idx}/share`, {
      method: 'POST',
      headers: { origin: base },
    });
    const rel = sh.json && (sh.json.url || sh.json.shareUrl || sh.json.link);
    const link = rel ? new URL(rel, base).href : null;
    rec.check(
      'share della cattura: link creato',
      'URL /r/<token>',
      { status: sh.status, link },
      sh.status < 300 && !!link
    );
    if (link) {
      const v = await Journey.open(link);
      await sleep(1000);
      const txt = await v.text();
      await v.screenshot(rec.ev('share-view.png'), { fullPage: true });
      rec.check(
        'share: authorization oscurato, contenuto presente',
        "nessun 'qa26-should-be-redacted', trace presente",
        { leaksBearer: txt.includes('qa26-should-be-redacted'), hasTrace: txt.includes(trace) },
        !txt.includes('qa26-should-be-redacted') && txt.includes(trace)
      );
      await v.close();
    }
  }

  // ---- signature verification (paid API, creator key read in-process) ----
  const key = creatorKey('hooklab');
  const vs = (payload) =>
    apiFetch(`${base}/api/v1/verify-signature`, { method: 'POST', key, body: payload });
  const tampered = body.replace('4242', '4243');
  const gh = `sha256=${oracles.hmacHex(whsec, body)}`;
  const shop = oracles.hmacB64(whsec, body);
  const cases = [
    [
      'stripe valida (modalità cattura)',
      {
        provider: 'stripe',
        secret: whsec,
        endpointId: endpoint.id,
        requestIndex: captures[postIdx]?.index ?? postIdx,
      },
      true,
    ],
    [
      'stripe valida (letterale)',
      { provider: 'stripe', secret: whsec, rawBody: body, signature: stripeSig },
      true,
    ],
    [
      'stripe corpo manomesso di 1 byte',
      { provider: 'stripe', secret: whsec, rawBody: tampered, signature: stripeSig },
      false,
    ],
    [
      'stripe segreto sbagliato',
      { provider: 'stripe', secret: whsec + 'x', rawBody: body, signature: stripeSig },
      false,
    ],
    [
      'stripe timestamp oltre la tolleranza',
      {
        provider: 'stripe',
        secret: whsec,
        rawBody: body,
        signature: `t=${t - 1000},v1=${oracles.hmacHex(whsec, `${t - 1000}.${body}`)}`,
        toleranceSeconds: 300,
      },
      false,
    ],
    ['github valida', { provider: 'github', secret: whsec, rawBody: body, signature: gh }, true],
    [
      'github manomessa',
      { provider: 'github', secret: whsec, rawBody: tampered, signature: gh },
      false,
    ],
    [
      'shopify valida',
      { provider: 'shopify', secret: whsec, rawBody: body, signature: shop },
      true,
    ],
    [
      'shopify manomessa',
      { provider: 'shopify', secret: whsec, rawBody: tampered, signature: shop },
      false,
    ],
  ];
  for (const [name, payload, want] of cases) {
    const r = await vs(payload);
    const valid = r.json && (r.json.valid ?? r.json.verified ?? r.json.result?.valid);
    rec.check(
      `verify-signature ${name}`,
      `valid=${want}`,
      { status: r.status, body: r.json },
      r.status === 200 && valid === want
    );
    await sleep(300);
  }
  const noKey = await apiFetch(`${base}/api/v1/verify-signature`, {
    method: 'POST',
    body: { provider: 'stripe', secret: whsec, rawBody: body, signature: stripeSig },
  });
  rec.check('verify-signature senza chiave', '401', noKey.status, noKey.status === 401);
  console.log(
    `== hkl prod-demo: ${rec.rows.filter((r) => !r.pass).length} FAIL / ${rec.rows.length}`
  );
  process.exit(0);
})().catch((e) => {
  console.error('JOURNEY ERROR', e);
  process.exit(1);
});
