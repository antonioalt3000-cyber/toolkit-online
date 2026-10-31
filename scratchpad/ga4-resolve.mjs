// GA4: apre il selettore (click mouse reale) e risolve nome->propertyId usando il campo di ricerca INTERNO al pannello.
// Uso: node ga4-resolve.mjs <TAB> "Solarflow,Topranked,..."
import WebSocket from 'ws';
const TAB = process.argv[2];
const NAMES = process.argv[3].split(',');
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(m, p = {}) { return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + m)); } }, 45000); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('message', d => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL:' + JSON.stringify(r.exceptionDetails).slice(0, 250)); return r.result.value; }
async function click(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', clickCount: 0 }); await sleep(140);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); await sleep(90);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
const PANES = `Array.from(document.querySelectorAll('[role=dialog],[role=listbox],[role=menu],mat-dialog-container')).filter(p=>(p.innerText||'').trim())`;
// input DENTRO il pannello (esclude la search della top bar, che sta sopra y=60)
const PANEINPUT = `(() => {
  const ps = ${PANES};
  for (let i = ps.length - 1; i >= 0; i--) {
    const ins = Array.from(ps[i].querySelectorAll('input'));
    for (const inp of ins) { const r = inp.getBoundingClientRect(); if (r.width > 40 && r.y > 60) return { x: r.x + r.width/2, y: r.y + r.height/2, y0: Math.round(r.y) }; }
  }
  return null;
})()`;
const READ = `(() => {
  const ps = ${PANES}; const p = ps[ps.length-1]; if (!p) return [];
  const lines=(p.innerText||'').split('\\n').map(s=>s.trim()); const out=[];
  for (let i=0;i<lines.length-1;i++)
    if (/^[0-9]{9,10}$/.test(lines[i+1]) && lines[i] && !/^[0-9]+$/.test(lines[i]) && !/^(chevron_right|star_border|check|search)$/.test(lines[i])) out.push([lines[i],lines[i+1]]);
  return out;
})()`;

ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    let n = await ev(`${PANES}.length`);
    if (n < 2) {
      const rect = await ev(`(() => { const c=Array.from(document.querySelectorAll('button,[role=button],[role=combobox],a,div'));
        const b=c.find(e=>/^\\s*(Tutti gli account|All accounts)/i.test(e.innerText||'') && e.getBoundingClientRect().width>0 && e.getBoundingClientRect().width<600);
        if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
      if (!rect) { console.error('BREADCRUMB_NON_TROVATO'); ws.close(); process.exit(1); }
      await click(rect.x, rect.y); await sleep(6000);
      n = await ev(`${PANES}.length`);
    }
    console.log('PANES:', n);
    const box = await ev(PANEINPUT);
    console.log('PANE_INPUT:', JSON.stringify(box));
    if (!box) { console.error('INPUT_INTERNO_NON_TROVATO'); ws.close(); process.exit(1); }
    const found = {};
    for (const name of NAMES) {
      await click(box.x, box.y); await sleep(350);
      await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 2, key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 2, key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65 });
      await sleep(150);
      await send('Input.insertText', { text: name });
      await sleep(2500);
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
