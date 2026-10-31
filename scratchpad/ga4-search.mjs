// GA4: risolve nome property -> id usando il campo di ricerca del selettore. Porta 9223.
// Uso: node ga4-search.mjs <TAB> "Solarflow,Topranked,..."
import WebSocket from 'ws';
const TAB = process.argv[2];
const NAMES = process.argv[3].split(',');
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(m, p = {}) { return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + m)); } }, 40000); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('message', d => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL:' + JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; }
async function click(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); await sleep(70);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
const FINDINPUT = `(() => {
  const ps = Array.from(document.querySelectorAll('[role=dialog],[role=listbox],[role=menu],mat-dialog-container')).filter(p=>(p.innerText||'').trim());
  for (const p of ps) {
    const i = p.querySelector('input[type=text],input:not([type]),input[type=search]');
    if (i) { const r = i.getBoundingClientRect(); if (r.width>0) return { x: r.x + r.width/2, y: r.y + r.height/2 }; }
  }
  const i2 = document.querySelector('input[aria-label*=erca],input[placeholder*=erca],input[aria-label*=earch]');
  if (i2) { const r = i2.getBoundingClientRect(); if (r.width>0) return { x: r.x + r.width/2, y: r.y + r.height/2 }; }
  return null;
})()`;
const READ = `(() => {
  const ps = Array.from(document.querySelectorAll('[role=dialog],[role=listbox],[role=menu],mat-dialog-container')).filter(p=>(p.innerText||'').trim());
  const p = ps[ps.length-1]; if (!p) return [];
  const lines=(p.innerText||'').split('\\n').map(s=>s.trim()); const out=[];
  for (let i=0;i<lines.length-1;i++)
    if (/^\\d{9,10}$/.test(lines[i+1]) && lines[i] && !/^\\d+$/.test(lines[i]) && !/^(chevron_right|star_border|check|search)$/.test(lines[i])) out.push([lines[i],lines[i+1]]);
  return out;
})()`;

ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    const box = await ev(FINDINPUT);
    if (!box) { console.error('CAMPO_RICERCA_NON_TROVATO'); ws.close(); process.exit(1); }
    console.log('INPUT:', JSON.stringify(box));
    const found = {};
    for (const name of NAMES) {
      await click(box.x, box.y); await sleep(300);
      // svuota: ctrl+A poi testo
      await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 2, key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 2, key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65 });
      await sleep(120);
      await send('Input.insertText', { text: name });
      await sleep(2200);
      const rows = await ev(READ);
      found[name] = rows;
      console.log(name, '->', JSON.stringify(rows));
    }
    console.log('=====JSON=====');
    console.log(JSON.stringify(found));
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); ws.close(); process.exit(1); }
});
ws.on('error', e => { console.error('WS ERR:', e.message); process.exit(1); });
