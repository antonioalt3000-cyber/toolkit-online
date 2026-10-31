// GA4: enumera TUTTI gli account e le loro property (nome + id) dal selettore. Porta 9223.
// Panes osservati: [vuoto, ACCOUNT, PROPERTY] -> uso gli ultimi due.
import WebSocket from 'ws';
const TAB = process.argv[2];
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(m, p = {}) { return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + m)); } }, 60000); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('message', d => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL:' + JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; }
async function click(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', clickCount: 0 }); await sleep(120);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); await sleep(80);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

// helper JS iniettato: elenco pannelli non vuoti
const HELPERS = `
window.__panes = () => Array.from(document.querySelectorAll('[role=dialog],[role=listbox],[role=menu],mat-dialog-container'))
  .filter(p => (p.innerText||'').trim().length > 0);
window.__rows = (p) => {
  if (!p) return [];
  const lines = (p.innerText||'').split('\\n').map(s => s.trim());
  const out = [];
  for (let i = 0; i < lines.length - 1; i++)
    if (/^\\d{9,10}$/.test(lines[i+1]) && lines[i] && !/^\\d+$/.test(lines[i]) && !/^(chevron_right|star_border|check|search)$/.test(lines[i]))
      out.push([lines[i], lines[i+1]]);
  return out;
};
window.__scroll = (p) => {
  if (!p) return false;
  let best = null, bh = 0;
  p.querySelectorAll('*').forEach(e => { if (e.scrollHeight > e.clientHeight + 20 && e.clientHeight > bh) { best = e; bh = e.clientHeight; } });
  const el = best || p; const before = el.scrollTop;
  el.scrollTop = before + Math.max(200, el.clientHeight - 60);
  return el.scrollTop !== before;
};
true;`;

async function harvest(which) { // which: 'acc' (penultimo) | 'prop' (ultimo)
  const seen = new Map();
  const sel = which === 'prop' ? `ps[ps.length-1]` : `ps[ps.length-2]`;
  for (let s = 0; s < 30; s++) {
    const rows = await ev(`(() => { const ps = window.__panes(); return window.__rows(${sel}); })()`);
    (rows || []).forEach(([n, i]) => seen.set(i, n));
    const moved = await ev(`(() => { const ps = window.__panes(); return window.__scroll(${sel}); })()`);
    if (!moved) break;
    await sleep(800);
  }
  return Array.from(seen, ([id, name]) => ({ id, name }));
}

ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    await ev(HELPERS);
    let n = await ev('window.__panes().length');
    console.log('PANES_INIZIALI:', n);
    if (n < 2) { // apri il selettore
      const rect = await ev(`(() => {
        const c = Array.from(document.querySelectorAll('button,[role=button],[role=combobox],a,div'));
        const b = c.find(e => /^\\s*(Tutti gli account|All accounts)/i.test(e.innerText||'') && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().width < 600);
        if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 };
      })()`);
      if (!rect) throw new Error('breadcrumb non trovato');
      await click(rect.x, rect.y); await sleep(5500);
      await ev(HELPERS);
      n = await ev('window.__panes().length');
      console.log('PANES_DOPO_CLICK:', n);
    }
    const accounts = await harvest('acc');
    console.log('ACCOUNTS:', JSON.stringify(accounts));
    const all = {};
    for (const acc of accounts) {
      await ev(HELPERS);
      const r = await ev(`(() => {
        const ps = window.__panes(); const p = ps[ps.length-2]; if (!p) return null;
        const el = Array.from(p.querySelectorAll('*')).find(e => e.children.length === 0 && (e.innerText||'').trim() === ${JSON.stringify(acc.name)});
        if (!el) return null;
        const b = (el.closest('[role=option],[role=row],li,tr') || el.parentElement || el).getBoundingClientRect();
        if (b.width === 0 || b.height === 0) return null;
        return { x: b.x + Math.min(70, b.width/2), y: b.y + b.height/2 };
      })()`);
      if (!r) { all[`${acc.name}|${acc.id}`] = 'ROW_NON_CLICCABILE'; console.log('ACC', acc.name, acc.id, '-> ROW_NON_CLICCABILE'); continue; }
      await click(r.x, r.y); await sleep(3500);
      await ev(HELPERS);
      const props = await harvest('prop');
      all[`${acc.name}|${acc.id}`] = props;
      console.log('ACC', acc.name, acc.id, '->', JSON.stringify(props));
    }
    console.log('=====JSON=====');
    console.log(JSON.stringify(all));
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); ws.close(); process.exit(1); }
});
ws.on('error', e => { console.error('WS ERR:', e.message); process.exit(1); });
