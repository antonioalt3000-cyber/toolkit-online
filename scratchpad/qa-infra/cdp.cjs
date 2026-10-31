// Minimal raw Chrome DevTools Protocol driver over the port-9223 debugger,
// per the portfolio's absolute browser-automation rule (raw CDP only, no
// browser-automation MCP). CLI usage:
//   node cdp.cjs new-tab [url]
//   node cdp.cjs navigate <targetId> <url>
//   node cdp.cjs eval <targetId> <jsExpression>
//   node cdp.cjs screenshot <targetId> <outPngPath>
//   node cdp.cjs close <targetId>
'use strict';
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const CDP_HOST = '127.0.0.1';
const CDP_PORT = 9223;

function httpGet(path) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: CDP_HOST, port: CDP_PORT, path }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function httpPut(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: CDP_HOST, port: CDP_PORT, path, method: 'PUT' }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

async function newTab(url) {
  const data = await httpPut(`/json/new?${encodeURIComponent(url || 'about:blank')}`);
  return JSON.parse(data);
}

async function listTabs() {
  const data = await httpGet('/json/list');
  return JSON.parse(data);
}

async function closeTab(targetId) {
  await httpGet(`/json/close/${targetId}`);
}

function withSocket(wsUrl, fn) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const eventHandlers = [];
    ws.on('open', async () => {
      const send = (method, params = {}) =>
        new Promise((res, rej) => {
          const mid = ++id;
          pending.set(mid, { res, rej });
          ws.send(JSON.stringify({ id: mid, method, params }));
        });
      const onEvent = (handler) => eventHandlers.push(handler);
      try {
        const result = await fn({ send, onEvent, ws });
        ws.close();
        resolve(result);
      } catch (e) {
        ws.close();
        reject(e);
      }
    });
    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      } else if (msg.method) {
        for (const h of eventHandlers) h(msg.method, msg.params);
      }
    });
    ws.on('error', reject);
  });
}

async function navigate(targetId, url) {
  const tabs = await listTabs();
  const tab = tabs.find((t) => t.id === targetId);
  if (!tab) throw new Error(`target ${targetId} not found`);
  return withSocket(tab.webSocketDebuggerUrl, async ({ send, onEvent }) => {
    await send('Page.enable');
    const loaded = new Promise((resolve) => {
      onEvent((method) => {
        if (method === 'Page.loadEventFired') resolve();
      });
    });
    await send('Page.navigate', { url });
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 15000))]);
    return { navigated: url };
  });
}

async function evalJs(targetId, expression) {
  const tabs = await listTabs();
  const tab = tabs.find((t) => t.id === targetId);
  if (!tab) throw new Error(`target ${targetId} not found`);
  return withSocket(tab.webSocketDebuggerUrl, async ({ send }) => {
    const result = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(JSON.stringify(result.exceptionDetails));
    }
    return result.result.value;
  });
}

async function screenshot(targetId, outPath) {
  const tabs = await listTabs();
  const tab = tabs.find((t) => t.id === targetId);
  if (!tab) throw new Error(`target ${targetId} not found`);
  const data = await withSocket(tab.webSocketDebuggerUrl, async ({ send }) => {
    const result = await send('Page.captureScreenshot', { format: 'png' });
    return result.data;
  });
  fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
  return outPath;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  let out;
  if (cmd === 'new-tab') out = await newTab(rest[0]);
  else if (cmd === 'list') out = await listTabs();
  else if (cmd === 'navigate') out = await navigate(rest[0], rest[1]);
  else if (cmd === 'eval') out = await evalJs(rest[0], rest[1]);
  else if (cmd === 'screenshot') out = await screenshot(rest[0], rest[1]);
  else if (cmd === 'close') out = await closeTab(rest[0]);
  else throw new Error(`unknown cmd ${cmd}`);
  console.log(JSON.stringify(out));
}

main().catch((e) => {
  console.error('CDP ERROR', e.message);
  process.exit(1);
});
