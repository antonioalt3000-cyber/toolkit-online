// Drive the Travelpayouts onboarding tab: select "Manual installation", click Choose, dump result.
import WebSocket from 'ws';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const tabs = await (await fetch('http://localhost:9223/json')).json();
const tab = tabs.find(t => t.type === 'page' && /travelpayouts/.test(t.url) && t.webSocketDebuggerUrl);
if (!tab) { console.error('NO travelpayouts tab'); process.exit(1); }
const ws = new WebSocket(tab.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const p = new Map();
function send(m, pa = {}) { return new Promise((res, rej) => { const i = ++id; p.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: pa })); setTimeout(() => { if (p.has(i)) { p.delete(i); rej(new Error('timeout ' + m)); } }, 15000); }); }
ws.on('message', d => { const o = JSON.parse(d.toString()); if (o.id && p.has(o.id)) { const { res, rej } = p.get(o.id); p.delete(o.id); o.error ? rej(new Error(JSON.stringify(o.error))) : res(o.result); } });
ws.on('error', e => { console.error('WS', e.message); process.exit(1); });
async function ev(expr) { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 200)); return r.result.value; }
async function clickAt(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    const r1 = await ev(`(function(){var els=[].slice.call(document.querySelectorAll('h1,h2,h3,h4,div,span,p'));var t=els.find(x=>((x.textContent||'').trim()==='Manual installation'));if(!t)return null;var c=t;for(var i=0;i<6;i++){if(c&&getComputedStyle(c).cursor==='pointer')break;if(!c.parentElement)break;c=c.parentElement;}var r=c.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),tag:c.tagName,cursor:getComputedStyle(c).cursor,w:Math.round(r.width)};})()`);
    console.log('manual_card=' + JSON.stringify(r1));
    if (r1) { await clickAt(r1.x, r1.y); await sleep(1800); }
    const clicked = await ev(`(function(){var els=[].slice.call(document.querySelectorAll('button,[role=button],a'));var b=els.find(x=>/^\\s*choose\\s*$/i.test((x.textContent||'').trim()));if(!b)return 'NO_BTN';if(b.disabled||b.getAttribute('aria-disabled')==='true')return 'DISABLED';b.click();return 'CLICKED';})()`);
    console.log('choose_click=' + clicked);
    await sleep(5000);
    const href = await ev('location.href');
    const snippet = await ev(`(function(){var c=document.querySelector('textarea,pre,code');return c?(c.value||c.textContent||'').slice(0,900):null;})()`);
    const marker = await ev(`(function(){var s=(document.querySelector('textarea,pre,code')||{}).textContent||document.body.innerText||'';var m=s.match(/marker[=:\\s"']*([0-9]{3,})/i)||s.match(/[?&]marker=([0-9]{3,})/i);return m?m[1]:null;})()`);
    const txt = await ev('document.body?document.body.innerText:""');
    console.log('URL=' + href);
    console.log('MARKER=' + marker);
    console.log('SNIPPET=' + snippet);
    console.log('----PAGE----');
    console.log((txt || '').slice(0, 3500));
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR', e.message); process.exit(1); }
});
