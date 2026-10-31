import WebSocket from 'ws';
const TAB = process.argv[2];
const ITEMS = process.argv[3].split(',').map(s => { const [id, name] = s.split(':'); return { id, name }; });
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(m, p = {}) { return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + m)); } }, 60000); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('message', d => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL:' + JSON.stringify(r.exceptionDetails).slice(0,200)); return r.result.value; }
ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    for (const it of ITEMS) {
      await send('Page.navigate', { url: 'about:blank' }); await sleep(1000);
      await send('Page.navigate', { url: `https://analytics.google.com/analytics/web/#/p${it.id}/admin/streams/table/` });
      let txt='';
      for (let i=0;i<14;i++){ await sleep(2500); txt = await ev('document.body?document.body.innerText:""'); if (txt.indexOf('G-')>=0 || txt.indexOf('Stream')>=0) break; }
      const mids = (txt.match(/G-[A-Z0-9]{8,12}/g)||[]);
      const urls = (txt.match(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}/gi)||[]).filter(u=>u.indexOf('google')<0).slice(0,4);
      console.log(`${it.name} (p${it.id}) -> MID=${[...new Set(mids)].join(',')||'?'} | URL=${[...new Set(urls)].join(',')||'?'}`);
    }
    ws.close(); process.exit(0);
  } catch(e){ console.error('ERR:', e.message); ws.close(); process.exit(1); }
});
ws.on('error', e => { console.error('WS ERR:', e.message); process.exit(1); });
