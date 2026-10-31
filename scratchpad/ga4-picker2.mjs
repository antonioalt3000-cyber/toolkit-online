// GA4: apre il selettore account/property con mouse REALE (Input.dispatchMouseEvent) ed estrae gli ID property.
import WebSocket from 'ws';
const TAB = process.argv[2];
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(m, p = {}) { return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + m)); } }, 60000); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('message', d => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL:' + JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; }
async function click(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', clickCount: 0 });
  await sleep(150);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await sleep(80);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    // rect del breadcrumb selettore
    const rect = await ev(`(() => {
      const cands = Array.from(document.querySelectorAll('button,[role=button],[role=combobox],a,div'));
      const b = cands.find(e => /^\\s*(Tutti gli account|All accounts)/i.test(e.innerText || '') && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().width < 600);
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width/2, y: r.y + r.height/2, t: (b.innerText||'').slice(0,50) };
    })()`);
    console.log('RECT:', JSON.stringify(rect));
    if (!rect) { console.log('NO_BREADCRUMB'); ws.close(); process.exit(1); }
    await click(rect.x, rect.y);
    await sleep(6000);
    const res = await ev(`(() => {
      // raccogli tutti gli id property visibili nel DOM (href o testo)
      const ids = new Set();
      document.querySelectorAll('a[href]').forEach(a => { const m = (a.getAttribute('href')||'').match(/p(\\d{6,})/); if (m) ids.add(m[1]); });
      const txt = document.body.innerText || '';
      (txt.match(/\\b\\d{9,10}\\b/g) || []).forEach(n => ids.add(n));
      // testo del pannello aperto
      const panes = Array.from(document.querySelectorAll('[role=dialog],[role=listbox],[role=menu],.ga-picker,mat-dialog-container'));
      const paneTxt = panes.map(p => (p.innerText||'').slice(0,4000)).join('\\n---PANE---\\n');
      return { ids: Array.from(ids), paneTxt: paneTxt || '(nessun pannello)', bodyLen: txt.length };
    })()`);
    console.log('IDS:', JSON.stringify(res.ids));
    console.log('=====PANE=====');
    console.log(res.paneTxt.slice(0, 5000));
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); ws.close(); process.exit(1); }
});
ws.on('error', e => { console.error('WS ERR:', e.message); process.exit(1); });
