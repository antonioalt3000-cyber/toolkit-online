// Read an EXISTING tab on 9223 by URL substring (no navigation). Prints url/title/visible text + primary buttons.
import WebSocket from 'ws';
const sub = process.argv[2];
const tabs = await (await fetch('http://localhost:9223/json')).json();
const tab = tabs.find(t => t.type === 'page' && (t.url || '').includes(sub) && t.webSocketDebuggerUrl);
if (!tab) { console.error('NO tab matching: ' + sub); process.exit(1); }
const ws = new WebSocket(tab.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const p = new Map();
function send(m, pa = {}) { return new Promise((res, rej) => { const i = ++id; p.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: pa })); setTimeout(() => { if (p.has(i)) { p.delete(i); rej(new Error('timeout')); } }, 15000); }); }
ws.on('message', d => { const o = JSON.parse(d.toString()); if (o.id && p.has(o.id)) { const { res, rej } = p.get(o.id); p.delete(o.id); o.error ? rej(new Error(JSON.stringify(o.error))) : res(o.result); } });
ws.on('error', e => { console.error('WS', e.message); process.exit(1); });
async function ev(x) { return (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result.value; }
ws.on('open', async () => {
  try {
    await send('Runtime.enable');
    console.log('URL:', await ev('location.href'));
    console.log('TITLE:', await ev('document.title'));
    const btns = await ev(`[].slice.call(document.querySelectorAll('button,[role=button],a.button,input[type=submit],a')).map(b=>(b.value||b.textContent||'').trim()).filter(t=>t&&t.length<40).slice(0,25).join(' | ')`);
    console.log('BUTTONS/LINKS:', btns);
    console.log('----TEXT----');
    console.log((await ev('document.body?document.body.innerText:""') || '').slice(0, 1800));
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR', e.message); process.exit(1); }
});
