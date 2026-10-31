// Fill the CJ Network Profile "Descripción" field on the network-profile/general tab.
import WebSocket from 'ws';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DESC = process.argv[2];
if (!DESC) { console.error('need desc'); process.exit(1); }
const tabs = await (await fetch('http://localhost:9223/json')).json();
const tab = tabs.find(t => t.type === 'page' && (t.url || '').includes('network-profile/general') && t.webSocketDebuggerUrl);
if (!tab) { console.error('NO CJ network-profile tab'); process.exit(1); }
const ws = new WebSocket(tab.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const p = new Map();
function send(m, pa = {}) { return new Promise((res, rej) => { const i = ++id; p.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: pa })); setTimeout(() => { if (p.has(i)) { p.delete(i); rej(new Error('timeout ' + m)); } }, 15000); }); }
ws.on('message', d => { const o = JSON.parse(d.toString()); if (o.id && p.has(o.id)) { const { res, rej } = p.get(o.id); p.delete(o.id); o.error ? rej(new Error(JSON.stringify(o.error))) : res(o.result); } });
ws.on('error', e => { console.error('WS', e.message); process.exit(1); });
async function ev(x) { const r = await send('Runtime.evaluate', { expression: x, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 200)); return r.result.value; }
async function clickAt(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
const rectOf = (finderExpr) => `(function(){var el=${finderExpr};if(!el)return null;el.scrollIntoView({block:'center'});var r=el.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),ok:r.width>0};})()`;
ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    // 1) click EDITAR (near Descripción). Grab the first EDITAR button.
    const editRect = await ev(rectOf(`[].slice.call(document.querySelectorAll('button,[role=button],a')).find(function(b){return /^\\s*editar\\s*$/i.test((b.textContent||'').trim());})`));
    console.log('editar=' + JSON.stringify(editRect));
    if (editRect) { await clickAt(editRect.x, editRect.y); await sleep(2000); }
    // 2) focus the textarea and type
    const taRect = await ev(rectOf(`document.querySelector('textarea')`));
    console.log('textarea=' + JSON.stringify(taRect));
    if (!taRect) { console.log('NO_TEXTAREA'); ws.close(); process.exit(0); }
    await clickAt(taRect.x, taRect.y); await sleep(400);
    await ev(`(function(){var t=document.querySelector('textarea');if(t){t.focus();t.select&&t.select();}})()`);
    await send('Input.insertText', { text: DESC });
    await sleep(600);
    const len = await ev(`(document.querySelector('textarea')||{}).value?document.querySelector('textarea').value.length:0`);
    console.log('inserted_len=' + len);
    // 3) click Guardar/Save
    const saveRect = await ev(rectOf(`[].slice.call(document.querySelectorAll('button,[role=button]')).find(function(b){return /^\\s*(guardar|save|guardar cambios|aplicar)\\s*$/i.test((b.textContent||'').trim())&&!b.disabled;})`));
    console.log('save=' + JSON.stringify(saveRect));
    if (saveRect) { await clickAt(saveRect.x, saveRect.y); await sleep(2500); }
    const finalLen = await ev(`(function(){var t=document.querySelector('textarea');return t?t.value.length:(document.body.innerText.match(/(\\d+)\\s*de\\s*4000/)||[])[1]||'saved?';})()`);
    console.log('final=' + finalLen);
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR', e.message); process.exit(1); }
});
