import WebSocket from 'ws';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const targets = [
  'https://dealmirror.com/wp-login.php',
  'https://dealfuel.com/wp-login.php',
];
const ver = await (await fetch('http://localhost:9223/json/version')).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const msgId = ++id; pending.set(msgId, { resolve, reject });
    const m = { id: msgId, method, params }; if (sessionId) m.sessionId = sessionId;
    ws.send(JSON.stringify(m));
    setTimeout(() => { if (pending.has(msgId)) { pending.delete(msgId); reject(new Error('timeout ' + method)); } }, 20000);
  });
}
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result); }
});
ws.on('error', (e) => { console.error('WS ERR:', e.message); process.exit(1); });
ws.on('open', async () => {
  try {
    const ids = [];
    for (const url of targets) {
      const { targetId } = await send('Target.createTarget', { url });
      ids.push({ url, targetId });
      await sleep(800);
    }
    // porta in primo piano la tab DealMirror (prima)
    await send('Target.activateTarget', { targetId: ids[0].targetId });
    console.log('OPENED_TABS:');
    for (const t of ids) console.log('  -', t.url, '=>', t.targetId);
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); try { ws.close(); } catch {} process.exit(1); }
});
