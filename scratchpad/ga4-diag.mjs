// Diagnostica: riapre il selettore GA4 e descrive la struttura del pannello property (scroller virtualizzato).
import WebSocket from 'ws';
const TAB = process.argv[2];
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(m, p = {}) { return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + m)); } }, 40000); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('message', d => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL:' + JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; }
async function click(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', clickCount: 0 }); await sleep(120);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); await sleep(80);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    // assicura selettore aperto: se non ci sono >=2 pannelli, clicca il breadcrumb
    let n = await ev(`Array.from(document.querySelectorAll('[role=dialog],[role=listbox],[role=menu],mat-dialog-container')).filter(p=>(p.innerText||'').trim()).length`);
    if (n < 2) {
      const rect = await ev(`(() => { const c=Array.from(document.querySelectorAll('button,[role=button],[role=combobox],a,div'));
        const b=c.find(e=>/^\\s*(Tutti gli account|All accounts)/i.test(e.innerText||'') && e.getBoundingClientRect().width>0 && e.getBoundingClientRect().width<600);
        if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
      if (rect) { await click(rect.x, rect.y); await sleep(5500); }
      n = await ev(`Array.from(document.querySelectorAll('[role=dialog],[role=listbox],[role=menu],mat-dialog-container')).filter(p=>(p.innerText||'').trim()).length`);
    }
    console.log('PANES:', n);
    const diag = await ev(`(() => {
      const ps = Array.from(document.querySelectorAll('[role=dialog],[role=listbox],[role=menu],mat-dialog-container')).filter(p=>(p.innerText||'').trim());
      const p = ps[ps.length-1]; if (!p) return 'NO_PANE';
      const out = [];
      out.push('PANE tag='+p.tagName+' role='+p.getAttribute('role')+' cls='+(p.className||'').slice(0,90));
      const r = p.getBoundingClientRect(); out.push('rect='+JSON.stringify({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}));
      // tutti i discendenti con overflow scrollabile
      p.querySelectorAll('*').forEach(e => {
        const cs = getComputedStyle(e);
        if ((e.scrollHeight > e.clientHeight + 5) || /auto|scroll/.test(cs.overflowY)) {
          out.push('SCROLLER tag='+e.tagName+' cls='+(typeof e.className==='string'?e.className:'').slice(0,70)+' sh='+e.scrollHeight+' ch='+e.clientHeight+' oy='+cs.overflowY);
        }
      });
      out.push('--- input presenti ---');
      p.querySelectorAll('input').forEach(i => { const b=i.getBoundingClientRect(); out.push('INPUT ph='+(i.placeholder||'')+' aria='+(i.getAttribute('aria-label')||'')+' rect='+Math.round(b.x)+','+Math.round(b.y)+' w='+Math.round(b.width)); });
      out.push('--- innerText (600) ---');
      out.push((p.innerText||'').slice(0,600));
      return out.join('\\n');
    })()`);
    console.log(diag);
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); ws.close(); process.exit(1); }
});
ws.on('error', e => { console.error('WS ERR:', e.message); process.exit(1); });
