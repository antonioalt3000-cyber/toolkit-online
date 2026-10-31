// Apre il selettore account/property GA4 e ne estrae l'elenco. Porta 9223.
import WebSocket from 'ws';
const TAB = process.argv[2];
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(m, p = {}) {
  return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + m)); } }, 60000); });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('message', d => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL:' + JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; }

ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    // clicca il breadcrumb selettore ("Tutti gli account" / nome account)
    const clicked = await ev(`(() => {
      const cands = Array.from(document.querySelectorAll('button,[role=button],a'));
      const b = cands.find(e => /Tutti gli account|All accounts/i.test(e.innerText || ''));
      if (b) { b.click(); return 'clicked:' + (b.innerText||'').slice(0,40); }
      return 'NOT_FOUND';
    })()`);
    console.log('PICKER:', clicked);
    await sleep(5000);
    // dump del modal: cerca liste con id numerici
    const dump = await ev(`(() => {
      const dlg = document.querySelector('[role=dialog]') || document.body;
      return (dlg.innerText || '').slice(0, 6000);
    })()`);
    console.log('=====PICKER_TEXT=====');
    console.log(dump);
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); ws.close(); process.exit(1); }
});
ws.on('error', e => { console.error('WS ERR:', e.message); process.exit(1); });
