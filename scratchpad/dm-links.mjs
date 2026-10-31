import WebSocket from 'ws';
const urls = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ver = await (await fetch('http://localhost:9223/json/version')).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pending = new Map(); const loadWaiters = [];
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const msgId = ++id; pending.set(msgId, { resolve, reject });
    const m = { id: msgId, method, params }; if (sessionId) m.sessionId = sessionId;
    ws.send(JSON.stringify(m));
    setTimeout(() => { if (pending.has(msgId)) { pending.delete(msgId); reject(new Error('timeout ' + method)); } }, 30000);
  });
}
ws.on('message', (d) => {
  const msg = JSON.parse(d.toString());
  if (msg.id && pending.has(msg.id)) { const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id); if (msg.error) reject(new Error(JSON.stringify(msg.error))); else resolve(msg.result); return; }
  if (msg.method === 'Page.loadEventFired') { while (loadWaiters.length) loadWaiters.shift()(); }
});
function waitLoad(t = 20000) { return new Promise((res) => { let done = false; const timer = setTimeout(() => { if (!done) { done = true; res('timeout'); } }, t); loadWaiters.push(() => { if (!done) { done = true; clearTimeout(timer); res('load'); } }); }); }
ws.on('error', (e) => { console.error('WS ERR:', e.message); process.exit(1); });
ws.on('open', async () => {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId); await send('Runtime.enable', {}, sessionId);
  const seen = new Set();
  for (const url of urls) {
    const w = waitLoad(); await send('Page.navigate', { url }, sessionId); await w; await sleep(4000);
    const r = await send('Runtime.evaluate', { expression: `JSON.stringify([...new Set([...document.querySelectorAll('a[href*="/product/"]')].map(a=>a.href.split('?')[0].replace(/\\/$/,'')))])`, returnByValue: true }, sessionId);
    JSON.parse(r.result.value || '[]').forEach((h) => seen.add(h));
  }
  console.log([...seen].join('\n'));
  await send('Target.closeTarget', { targetId }); ws.close(); process.exit(0);
});
