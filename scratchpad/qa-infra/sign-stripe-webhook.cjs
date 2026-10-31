// Crafts a validly-signed fake Stripe webhook event and POSTs it to a local
// dev server, exactly reproducing Stripe's signature scheme so the app's own
// `stripe.webhooks.constructEvent` verification passes. No Stripe API call
// is made — this only exercises OUR webhook handler.
// Usage: node sign-stripe-webhook.cjs <targetUrl> <secret> <eventJsonPath>
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');

const [targetUrl, secret, eventJsonPath] = process.argv.slice(2);
if (!targetUrl || !secret || !eventJsonPath) {
  console.error('usage: node sign-stripe-webhook.cjs <targetUrl> <secret> <eventJsonPath>');
  process.exit(1);
}

const body = fs.readFileSync(eventJsonPath, 'utf8');
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${body}`;
const signature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
const header = `t=${timestamp},v1=${signature}`;

const u = new URL(targetUrl);
const req = http.request(
  {
    hostname: u.hostname,
    port: u.port,
    path: u.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Stripe-Signature': header,
    },
  },
  (res) => {
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => {
      console.log('STATUS', res.statusCode);
      console.log('BODY', data);
    });
  }
);
req.on('error', (e) => console.error('REQUEST ERROR', e.message));
req.write(body);
req.end();
