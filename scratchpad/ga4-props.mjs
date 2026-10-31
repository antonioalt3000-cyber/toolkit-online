// GA4: scorre la lista property del selettore con WHEEL reale (lista virtualizzata) e raccoglie nome+id.
import WebSocket from 'ws';
const TAB = process.argv[2];
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(m, p = {}) { return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + m)); } }, 60000); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('message', d => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL:' + JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; }

const ROWS = `(() => {
  const ps = Array.from(document.querySelectorAll('[role=dialog],[role=listbox],[role=menu],mat-dialog-container')).filter(p => (p.innerText||'').trim());
  const p = ps[ps.length-1]; if (!p) return { rows: [], box: null };
  const lines = (p.innerText||'').split('\\n').map(s=>s.trim());
  const rows = [];
  for (let i=0;i<lines.length-1;i++)
    if (/^\\d{9,10}$/.test(lines[i+1]) && lines[i] && !/^\\d+$/.test(lines[i]) && !/^(chevron_right|star_border|check|search)$/.test(lines[i]))
      rows.push([lines[i], lines[i+1]]);
  const r = p.getBoundingClientRect();
  return { rows, box: { x: r.x + r.width/2, y: r.y + r.height/2 } };
})()`;

ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    const seen = new Map();
    let box = null;
    for (let s = 0; s < 40; s++) {
      const r = await ev(ROWS);
      if (!r || !r.box) { console.error('NESSUN PANNELLO — il selettore è chiuso'); break; }
      box = r.box;
      const before = seen.size;
      r.rows.forEach(([n, i]) => seen.set(i, n));
      if (s > 3 && seen.size === before && s % 4 === 3) { /* continua comunque un po' */ }
      await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: box.x, y: box.y, deltaX: 0, deltaY: 320, button: 'none' });
      await sleep(700);
    }
    const out = Array.from(seen, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
    console.log('TOT:', out.length);
    console.log(JSON.stringify(out));
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); ws.close(); process.exit(1); }
});
ws.on('error', e => { console.error('WS ERR:', e.message); process.exit(1); });
