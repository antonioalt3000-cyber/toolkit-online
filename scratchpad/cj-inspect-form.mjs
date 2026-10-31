// Click EDITAR on the CJ account info tab and dump the editable form fields.
import WebSocket from 'ws';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sub = process.argv[2] || 'account/settings/general';
const tabs = await (await fetch('http://localhost:9223/json')).json();
const tab = tabs.find(t => t.type === 'page' && (t.url || '').includes(sub) && t.webSocketDebuggerUrl);
if (!tab) { console.error('NO tab ' + sub); process.exit(1); }
const ws = new WebSocket(tab.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const p = new Map();
function send(m, pa = {}) { return new Promise((res, rej) => { const i = ++id; p.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: pa })); setTimeout(() => { if (p.has(i)) { p.delete(i); rej(new Error('t')); } }, 15000); }); }
ws.on('message', d => { const o = JSON.parse(d.toString()); if (o.id && p.has(o.id)) { const { res, rej } = p.get(o.id); p.delete(o.id); o.error ? rej(new Error(JSON.stringify(o.error))) : res(o.result); } });
ws.on('error', e => { console.error('WS', e.message); process.exit(1); });
async function ev(x) { const r = await send('Runtime.evaluate', { expression: x, returnByValue: true }); return r.result.value; }
async function clickAt(x, y) { await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }); }
ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    const er = await ev(`(function(){var b=[].slice.call(document.querySelectorAll('button,[role=button],a')).find(function(x){return /^\\s*editar\\s*$/i.test((x.textContent||'').trim());});if(!b)return null;b.scrollIntoView({block:'center'});var r=b.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()`);
    console.log('editar=' + JSON.stringify(er));
    if (er) { await clickAt(er.x, er.y); await sleep(2200); }
    const fields = await ev(`JSON.stringify([].slice.call(document.querySelectorAll('input,select,textarea')).map(function(e,i){var lbl=e.getAttribute('aria-label')||e.name||e.placeholder||'';var pl=e.closest('label');if(!lbl&&pl)lbl=(pl.textContent||'').trim().slice(0,30);return{i:i,tag:e.tagName,type:e.type||'',label:lbl.slice(0,35),opts:e.tagName==='SELECT'?[].slice.call(e.options).map(function(o){return o.text}).slice(0,8):undefined,val:(e.value||'').slice(0,25)}}))`);
    console.log(fields);
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR', e.message); process.exit(1); }
});
