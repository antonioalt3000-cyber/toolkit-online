import WebSocket from 'ws';

const WSID = process.argv[2];
const TARGET = process.argv[3]; // full URL to inspect
const DO_REQUEST = process.argv[4] === 'request';
const PROP = 'https://toolkitonline.vip/';
const inspectUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(PROP)}&id=${encodeURIComponent(TARGET)}`;

const ws = new WebSocket(`ws://localhost:9223/devtools/page/${WSID}`, { perMessageDeflate: false });
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
  if (r.exceptionDetails) throw new Error('EVAL: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
  return r.result.value;
}
// find a clickable element by visible text (returns true if clicked)
const clickByText = (needle) => `(() => {
  const els = [...document.querySelectorAll('span,div,a,button')];
  const t = ${JSON.stringify(needle)}.toLowerCase();
  const el = els.find(e => e.offsetParent !== null && (e.textContent||'').trim().toLowerCase() === t)
          || els.find(e => e.offsetParent !== null && (e.textContent||'').trim().toLowerCase().includes(t));
  if (!el) return 'NOTFOUND';
  const c = el.closest('[role="button"],button,a') || el;
  c.click();
  return 'CLICKED:' + (c.textContent||'').trim().slice(0,40);
})()`;

ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    await send('Page.navigate', { url: inspectUrl });
    await sleep(12000); // wait for inspection to run
    let txt = await evaluate('document.body.innerText');
    const grab = (t) => { const i = t.indexOf('Controllo URL'); return i>=0 ? t.slice(i, i+700) : t.slice(0,700); };
    console.log('=== STATE after inspect ===');
    console.log(grab(txt));
    if (DO_REQUEST) {
      // try to click "Richiedi indicizzazione" / "Request indexing"
      let res = await evaluate(clickByText('Richiedi indicizzazione'));
      if (res === 'NOTFOUND') res = await evaluate(clickByText('Request indexing'));
      console.log('CLICK_RESULT:', res);
      if (res.startsWith('CLICKED')) {
        await sleep(45000); // live test runs
        txt = await evaluate('document.body.innerText');
        const done = /richiest|requested|indicizzazione richiesta|added to a priority queue|Indexing requested/i.test(txt);
        console.log('AFTER_REQUEST (snippet):');
        const m = txt.match(/.{0,80}(richiest|requested|priority queue|coda).{0,120}/i);
        console.log(m ? m[0] : txt.slice(0,400));
        console.log('REQUEST_CONFIRMED:', done);
      }
    }
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); ws.close(); process.exit(1); }
});
ws.on('error', (e) => { console.error('WS ERR:', e.message); process.exit(1); });
