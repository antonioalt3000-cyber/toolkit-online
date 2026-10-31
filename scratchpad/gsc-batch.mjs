// GSC batch: rendimento 90gg per N property url-prefix. Porta 9223.
import WebSocket from 'ws';
const TAB = process.argv[2];
const DOMAINS = process.argv[3].split(',');
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id; pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
    setTimeout(() => { if (pending.has(msgId)) { pending.delete(msgId); reject(new Error('timeout ' + method)); } }, 60000);
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('message', d => {
  const m = JSON.parse(d.toString());
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
});
async function ev(e) {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('EVAL:' + JSON.stringify(r.exceptionDetails).slice(0, 200));
  return r.result.value;
}
ws.on('open', async () => {
  await send('Page.enable'); await send('Runtime.enable');
  for (const dom of DOMAINS) {
    // prova url-prefix, poi fallback sc-domain
    const candidates = [`https://${dom}/`, `sc-domain:${dom}`];
    let out = { domain: dom, resource: null, tile: null, note: '' };
    for (const res of candidates) {
      const u = `https://search.google.com/search-console/performance/search-analytics?resource_id=${encodeURIComponent(res)}&num_of_days=90`;
      try {
        await send('Page.navigate', { url: u });
        let txt = '';
        for (let i = 0; i < 15; i++) {
          await sleep(2000);
          txt = await ev('document.body ? document.body.innerText : ""');
          if (/Clic totali/.test(txt) || /non hai accesso|non .{0,20}verificat|Seleziona una propriet/i.test(txt)) break;
        }
        const i = txt.indexOf('Clic totali');
        if (i >= 0) {
          out.resource = res;
          out.tile = txt.slice(i, i + 200).replace(/\n+/g, ' | ').replace(/\s{2,}/g, ' ');
          break;
        }
        out.note = /non hai accesso/i.test(txt) ? 'NO_ACCESS' : 'NO_TILE';
      } catch (e) { out.note = 'ERR:' + e.message.slice(0, 100); }
    }
    console.log(JSON.stringify(out));
  }
  ws.close(); process.exit(0);
});
ws.on('error', e => { console.error('WS ERR:', e.message); process.exit(1); });
