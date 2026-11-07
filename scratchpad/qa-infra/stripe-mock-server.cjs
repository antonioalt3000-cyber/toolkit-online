// Minimal local stand-in for the handful of read-only Stripe API calls these
// webhook handlers make while resolving a crafted event (price/customer
// lookups). Never processes real payments; GET-only surface, 404s anything
// else so an unexpected call is visible in logs rather than silently wrong.
// Usage: node stripe-mock-server.cjs <port> <logfile> <fixturesJsonPath>
'use strict';
const http = require('http');
const fs = require('fs');

const port = Number(process.argv[2] || 8813);
const logFile = process.argv[3] || null;
const fixturesPath = process.argv[4] || null;

function log(line) {
  const msg = `[${new Date().toISOString()}] ${line}`;
  if (logFile) fs.appendFileSync(logFile, msg + '\n');
}

function loadFixtures() {
  if (fixturesPath && fs.existsSync(fixturesPath)) {
    return JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
  }
  return {};
}

// Write surface added 26 Oct: checkout/billing-portal session creation is
// captured (never forwarded) so a QA run can assert the exact price/plan the
// app asked Stripe for, and a later retrieve returns the same session.
const createdSessions = new Map();
let seq = 0;
function flatForm(body) {
  const out = {};
  for (const [k, v] of new URLSearchParams(body || '')) out[k] = v;
  return out;
}

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => handleRequest(req, res, body));
});

function handleRequest(req, res, body) {
  const fixtures = loadFixtures(); // re-read every request: test script can update live
  const url = req.url || '';
  log(`${req.method} ${url}${body ? ' body=' + body.slice(0, 600) : ''}`);
  res.setHeader('Content-Type', 'application/json');

  if (url === '/__qa/sessions' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify([...createdSessions.values()]));
    return;
  }
  if (req.method === 'POST' && url.startsWith('/v1/checkout/sessions')) {
    const id = `cs_qa_${++seq}`;
    const params = flatForm(body);
    const session = {
      id,
      object: 'checkout.session',
      params,
      status: 'complete',
      payment_status: 'paid',
      url: `http://127.0.0.1:${port}/__qa/hosted/${id}`,
      customer: fixtures.customerId || 'cus_qa_fake',
      customer_email: params.customer_email || null,
      customer_details: {
        email: params.customer_email || fixtures.customerEmail || 'qa-fake@localhost',
      },
      subscription: params.mode === 'subscription' ? `sub_qa_${seq}` : null,
      mode: params.mode || null,
      metadata: Object.fromEntries(
        Object.entries(params)
          .filter(([k]) => k.startsWith('metadata['))
          .map(([k, v]) => [k.slice(9, -1), v])
      ),
      client_reference_id: params.client_reference_id || null,
    };
    createdSessions.set(id, session);
    res.writeHead(200);
    res.end(JSON.stringify(session));
    return;
  }
  if (req.method === 'POST' && url.startsWith('/v1/billing_portal/sessions')) {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        id: `bps_qa_${++seq}`,
        object: 'billing_portal.session',
        url: `http://127.0.0.1:${port}/__qa/portal`,
      })
    );
    return;
  }
  const retrieveMatch = url.match(/^\/v1\/checkout\/sessions\/(cs_qa_[0-9]+)(\?|$)/);
  if (req.method === 'GET' && retrieveMatch && createdSessions.has(retrieveMatch[1])) {
    res.writeHead(200);
    // Real Stripe returns `line_items` on a session retrieved with expand[]=line_items. F4 (and any product that
    // decides the plan from the paid price) reads it from there; before 7 Nov 2026 the mock omitted it, so F4's
    // webhook saw "no price" locally. Additive: the price asked at creation, unless a test injects another one.
    const created = createdSessions.get(retrieveMatch[1]);
    const askedPrice = (created.params || {})['line_items[0][price]'];
    const priceForLines = fixtures.priceId || askedPrice || 'price_qa_fake';
    res.end(
      JSON.stringify({
        ...created,
        line_items: { object: 'list', data: [{ price: { id: priceForLines } }], has_more: false },
      })
    );
    return;
  }
  if (req.method === 'GET' && /^\/v1\/customers(\?|$)/.test(url)) {
    res.writeHead(200);
    res.end(JSON.stringify({ object: 'list', data: [], has_more: false }));
    return;
  }
  if (req.method === 'POST' && /^\/v1\/customers(\?|$)/.test(url)) {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        id: `cus_qa_${++seq}`,
        object: 'customer',
        email: flatForm(body).email || null,
      })
    );
    return;
  }

  const lineItemsMatch = url.match(/^\/v1\/checkout\/sessions\/([^/]+)\/line_items/);
  const subMatch = url.match(/^\/v1\/subscriptions\/([^/?]+)/);
  const custMatch = url.match(/^\/v1\/customers\/([^/?]+)/);

  if (lineItemsMatch) {
    const priceId = fixtures.priceId || 'price_qa_fake';
    res.writeHead(200);
    res.end(JSON.stringify({ object: 'list', data: [{ price: { id: priceId } }] }));
    return;
  }
  if (subMatch) {
    const priceId = fixtures.priceId || 'price_qa_fake';
    res.writeHead(200);
    res.end(
      JSON.stringify({
        id: subMatch[1],
        object: 'subscription',
        status: fixtures.subscriptionStatus || 'active',
        customer: fixtures.customerId || 'cus_qa_fake',
        items: { data: [{ price: { id: priceId } }] },
      })
    );
    return;
  }
  if (custMatch) {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        id: custMatch[1],
        object: 'customer',
        email: fixtures.customerEmail || 'qa-fake-customer@localhost',
        deleted: false,
      })
    );
    return;
  }

  log(`UNMOCKED Stripe path ${req.method} ${url}`);
  res.writeHead(404);
  res.end(JSON.stringify({ error: { message: `qa stripe mock: no fixture for ${url}` } }));
}

server.listen(port, '127.0.0.1', () => {
  console.log(`[stripe-mock] listening on http://127.0.0.1:${port}`);
});
