// Generic CDP navigate + read helper. Port 9223 only (regola globale).
// Uso: node cdp.mjs <TABID> <URL> [waitMs] [anchor] [sliceLen]
import WebSocket from 'ws';

const TAB = process.argv[2];
const URL_ = process.argv[3];
const WAIT = parseInt(process.argv[4] || '11000', 10);
const ANCHOR = process.argv[5] || '';
const SLICE = parseInt(process.argv[6] || '2500', 10);

const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0;
const pending = new Map();
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
    setTimeout(() => { if (pending.has(msgId)) { pending.delete(msgId); reject(new Error('timeout ' + method)); } }, 60000);
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  }
});
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('EVAL: ' + JSON.stringify(r.exceptionDetails).slice(0, 400));
  return r.result.value;
}
ws.on('open', async () => {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    if (URL_ && URL_ !== '-') { await send('Page.navigate', { url: URL_ }); await sleep(WAIT); }
    const url = await evaluate('location.href');
    const full = await evaluate('document.body ? document.body.innerText : "NO BODY"');
    let idx = 0;
    if (ANCHOR) { const i = full.indexOf(ANCHOR); if (i >= 0) idx = i; }
    console.log('URL:', url);
    console.log('LEN:', full.length, 'ANCHOR_IDX:', idx);
    console.log('=====SLICE=====');
    console.log(full.slice(idx, idx + SLICE));
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); ws.close(); process.exit(1); }
});
ws.on('error', (e) => { console.error('WS ERR:', e.message); process.exit(1); });
