// GA4: report "Acquisizione traffico" 90gg per N property ID.
// La griglia GA4 non usa <tr>: si estrae da innerText ancorando all'ultima riga "Totale".
// Uso: node ga4-report.mjs <TAB> "543133826:EmailGuard,..." [YYYYMMDD] [YYYYMMDD]
import WebSocket from 'ws';
const TAB = process.argv[2];
const ITEMS = process.argv[3].split(',').map(s => { const [id, name] = s.split(':'); return { id, name }; });
const D0 = process.argv[4] || '20260430';
const D1 = process.argv[5] || '20260729';
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(m, p = {}) { return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + m)); } }, 90000); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('message', d => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL:' + JSON.stringify(r.exceptionDetails).slice(0, 200)); return r.result.value; }

ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    for (const it of ITEMS) {
      const params = encodeURIComponent(`_u..nav=maui&_u.date00=${D0}&_u.date01=${D1}`);
      const url = `https://analytics.google.com/analytics/web/#/p${it.id}/reports/explorer?params=${params}&r=lifecycle-traffic-acquisition-v2&collectionId=life-cycle`;
      await send('Page.navigate', { url: 'about:blank' }); await sleep(1200);
      await send('Page.navigate', { url });
      let txt = '';
      for (let i = 0; i < 20; i++) {
        await sleep(2500);
        txt = await ev('document.body ? document.body.innerText : ""');
        if (txt.indexOf('Totale') >= 0 && txt.length > 2000) break;
      }
      const cur = await ev('location.href');
      const period = (txt.match(/\d{1,2} \w{3} - \d{1,2} \w{3} \d{4}/) || ['periodo?'])[0];
      const k = txt.lastIndexOf('\tTotale\t') >= 0 ? txt.lastIndexOf('\tTotale\t') : txt.lastIndexOf('Totale');
      const body = k >= 0 ? txt.slice(k, k + 1300) : '(nessuna riga Totale)';
      console.log('### ' + it.name + ' (p' + it.id + ')  URL_OK=' + (cur.indexOf(it.id) >= 0 ? 'si' : 'NO') + '  PERIODO=' + period);
      console.log(body.split('\n').map(s => s.trim()).filter(Boolean).join(' | ').slice(0, 1100));
      console.log('---');
    }
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); ws.close(); process.exit(1); }
});
ws.on('error', e => { console.error('WS ERR:', e.message); process.exit(1); });
