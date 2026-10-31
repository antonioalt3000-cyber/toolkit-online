// Navigate to a URL on 9223, report whether the BeforeYouGo module + Travelpayouts marker are live.
import WebSocket from 'ws';
const url = process.argv[2];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ver = await (await fetch('http://localhost:9223/json/version')).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const p = new Map();
function send(m, pa = {}, s) { return new Promise((res, rej) => { const i = ++id; p.set(i, { res, rej }); const o = { id: i, method: m, params: pa }; if (s) o.sessionId = s; ws.send(JSON.stringify(o)); setTimeout(() => { if (p.has(i)) { p.delete(i); rej(new Error('timeout ' + m)); } }, 20000); }); }
ws.on('message', d => { const o = JSON.parse(d.toString()); if (o.id && p.has(o.id)) { const { res, rej } = p.get(o.id); p.delete(o.id); o.error ? rej(new Error(JSON.stringify(o.error))) : res(o.result); } });
ws.on('error', e => { console.error('WS', e.message); process.exit(1); });
ws.on('open', async () => {
  try {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Page.enable', {}, sessionId); await send('Runtime.enable', {}, sessionId);
    await send('Page.navigate', { url }, sessionId); await sleep(6000);
    const r = await send('Runtime.evaluate', { expression: `JSON.stringify({hasModule:/before you go/i.test(document.body.innerText||''),tpLinks:[].slice.call(document.querySelectorAll('a[href*="tp.st"]')).slice(0,4).map(a=>a.href),marker553:/553888/.test(document.documentElement.outerHTML)})`, returnByValue: true }, sessionId);
    console.log('URL:', url);
    console.log(r.result.value);
    await send('Target.closeTarget', { targetId }); ws.close(); process.exit(0);
  } catch (e) { console.error('ERR', e.message); process.exit(1); }
});
