// Local stand-in for Brevo's transactional email API. Captures what would
// have been sent instead of actually sending it. Usage: node brevo-mock-server.cjs <port> <logfile>
'use strict';
const http = require('http');
const fs = require('fs');

const port = Number(process.argv[2] || 8812);
const logFile = process.argv[3] || null;
const sentLog = [];

function log(line) {
  const msg = `[${new Date().toISOString()}] ${line}`;
  if (logFile) fs.appendFileSync(logFile, msg + '\n');
}

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    if (req.url === '/__qa/sent' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(sentLog));
      return;
    }
    if (req.url === '/v3/smtp/email' && req.method === 'POST') {
      let parsed = null;
      try {
        parsed = JSON.parse(body);
      } catch {
        /* ignore */
      }
      const messageId = `<qa-mock-${Date.now()}@localhost>`;
      sentLog.push({ at: new Date().toISOString(), payload: parsed, messageId });
      log(`CAPTURED EMAIL to=${JSON.stringify(parsed?.to)} subject=${parsed?.subject}`);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ messageId }));
      return;
    }
    if (req.url === '/v3/account' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ email: 'qa-mock@localhost', plan: [{ credits: 999999 }] }));
      return;
    }
    log(`UNHANDLED ${req.method} ${req.url}`);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found in brevo mock' }));
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[brevo-mock] listening on http://127.0.0.1:${port}`);
});
