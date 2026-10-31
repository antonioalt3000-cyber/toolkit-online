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

// Per review: author, date, rating, comment DOM id, and the gravatar hash.
// The gravatar hash is md5(lowercased email): identical hashes across different
// products mean the same mailbox authored them.
const EXTRACT = `JSON.stringify([...document.querySelectorAll('.commentlist li')].map(li => {
  const img = li.querySelector('img.avatar, img[src*="gravatar"]');
  const src = img ? img.getAttribute('src') || '' : '';
  const m = src.match(/avatar\\/([a-f0-9]{32,64})/i);
  return {
    id: li.id || null,
    author: (li.querySelector('.woocommerce-review__author, .comment-author .fn, .fn')||{}).textContent?.trim() || null,
    date: (li.querySelector('time, .woocommerce-review__published-date')||{}).getAttribute?.('datetime') || (li.querySelector('.woocommerce-review__published-date')||{}).textContent?.trim() || null,
    rating: (li.querySelector('[class*="star-rating"]')||{}).getAttribute?.('title') || null,
    gravatar: m ? m[1] : (src ? src.slice(0,110) : null)
  };
}))`;

ws.on('error', (e) => { console.error('WS ERR:', e.message); process.exit(1); });
ws.on('open', async () => {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId); await send('Runtime.enable', {}, sessionId);
  for (const url of urls) {
    const w = waitLoad(); await send('Page.navigate', { url }, sessionId); await w; await sleep(4200);
    const r = await send('Runtime.evaluate', { expression: EXTRACT, returnByValue: true }, sessionId);
    console.log('### ' + url.split('/product/')[1]);
    for (const rev of JSON.parse(r.result.value || '[]')) {
      console.log(`   ${String(rev.rating || '').padEnd(17)} | ${String(rev.author || '').padEnd(18)} | ${String(rev.date || '').slice(0, 10).padEnd(10)} | ${rev.id || ''} | grav=${rev.gravatar}`);
    }
  }
  await send('Target.closeTarget', { targetId }); ws.close(); process.exit(0);
});
