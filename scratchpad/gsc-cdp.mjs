import WebSocket from 'ws';

const WSID = process.argv[2];
const ACTION = process.argv[3] || 'scrape';
const NAV_URL = process.argv[4];
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${WSID}`, { perMessageDeflate: false });

let id = 0;
const pending = new Map();
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
    setTimeout(() => { if (pending.has(msgId)) { pending.delete(msgId); reject(new Error('timeout ' + method)); } }, 30000);
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
  if (r.exceptionDetails) throw new Error('EVAL: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
  return r.result.value;
}

ws.on('open', async () => {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    if (ACTION === 'nav' && NAV_URL) {
      await send('Page.navigate', { url: NAV_URL });
      await sleep(9000);
    }
    const url = await evaluate('location.href');
    // Target the 4 metric tiles: labels + big numbers. Grab full innerText and slice around "totali".
    const full = await evaluate('document.body ? document.body.innerText : "NO BODY"');
    const anchor = process.env.ANCHOR || 'Clic totali';
    const idx = full.indexOf(anchor) >= 0 ? full.indexOf(anchor) : 0;
    console.log('CURRENT_URL:', url);
    console.log('TILE_IDX:', idx);
    console.log('=====SLICE=====');
    console.log(full.slice(idx, idx + 1600));
    ws.close();
    process.exit(0);
  } catch (e) {
    console.error('ERR:', e.message);
    ws.close();
    process.exit(1);
  }
});
ws.on('error', (e) => { console.error('WS ERR:', e.message); process.exit(1); });
