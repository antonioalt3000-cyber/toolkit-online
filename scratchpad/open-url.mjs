// Open a URL in a NEW visible tab on Chrome 9223 and leave it open (activated).
import WebSocket from 'ws';
const url = process.argv[2];
if (!url) { console.error('need url'); process.exit(1); }
const ver = await (await fetch('http://localhost:9223/json/version')).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const p = new Map();
function send(m, pa = {}) {
  return new Promise((res, rej) => {
    const i = ++id; p.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method: m, params: pa }));
    setTimeout(() => { if (p.has(i)) { p.delete(i); rej(new Error('timeout ' + m)); } }, 15000);
  });
}
ws.on('message', d => { const o = JSON.parse(d.toString()); if (o.id && p.has(o.id)) { const { res, rej } = p.get(o.id); p.delete(o.id); o.error ? rej(new Error(JSON.stringify(o.error))) : res(o.result); } });
ws.on('error', e => { console.error('WS', e.message); process.exit(1); });
ws.on('open', async () => {
  try {
    const { targetId } = await send('Target.createTarget', { url });
    await send('Target.activateTarget', { targetId });
    console.log('OPENED tab ' + targetId + ' -> ' + url);
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR', e.message); process.exit(1); }
});
