import WebSocket from 'ws';

const urls = process.argv.slice(2);
if (!urls.length) { console.error('no urls'); process.exit(1); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const ver = await (await fetch('http://localhost:9223/json/version')).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });

let id = 0;
const pending = new Map();
const loadWaiters = [];
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    const m = { id: msgId, method, params };
    if (sessionId) m.sessionId = sessionId;
    ws.send(JSON.stringify(m));
    setTimeout(() => { if (pending.has(msgId)) { pending.delete(msgId); reject(new Error('timeout ' + method)); } }, 30000);
  });
}
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error))); else resolve(msg.result);
    return;
  }
  if (msg.method === 'Page.loadEventFired') { while (loadWaiters.length) loadWaiters.shift()(); }
});
function waitLoad(timeout = 15000) {
  return new Promise((resolve) => {
    let done = false;
    const t = setTimeout(() => { if (!done) { done = true; resolve('timeout'); } }, timeout);
    loadWaiters.push(() => { if (!done) { done = true; clearTimeout(t); resolve('load'); } });
  });
}
async function evalOn(sessionId, expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
  if (r.exceptionDetails) throw new Error('EVAL: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
  return r.result.value;
}
ws.on('error', (e) => { console.error('WS ERR:', e.message); process.exit(1); });
ws.on('open', async () => {
  try {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Page.enable', {}, sessionId);
    await send('Runtime.enable', {}, sessionId);
    for (const url of urls) {
      const w = waitLoad(15000);
      await send('Page.navigate', { url }, sessionId);
      await w;
      await sleep(3200);
      const href = await evalOn(sessionId, 'location.href');
      const title = await evalOn(sessionId, 'document.title');
      const text = await evalOn(sessionId, 'document.body ? document.body.innerText : "NO BODY"');
      console.log('=====PAGE=====');
      console.log('REQ_URL:', url);
      console.log('CUR_URL:', href);
      console.log('TITLE:', title);
      console.log('-----TEXT-----');
      console.log((text || '').slice(0, 6500));
    }
    await send('Target.closeTarget', { targetId });
    ws.close();
    process.exit(0);
  } catch (e) {
    console.error('ERR:', e.message);
    try { ws.close(); } catch {}
    process.exit(1);
  }
});
