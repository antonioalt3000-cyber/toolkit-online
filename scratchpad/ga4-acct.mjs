// GA4: naviga per account id e legge il property id dal redirect dell'URL (#/a<ACC>p<PROP>/...).
// Uso: node ga4-acct.mjs <TAB> "388494609:CompliPilot,388319397:CaptureAPI"
import WebSocket from 'ws';
const TAB = process.argv[2];
const ITEMS = process.argv[3].split(',').map(s => { const [id, name] = s.split(':'); return { id, name }; });
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(m, p = {}) { return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + m)); } }, 60000); }); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('message', d => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
async function ev(e) { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL:' + JSON.stringify(r.exceptionDetails).slice(0, 200)); return r.result.value; }

ws.on('open', async () => {
  try {
    await send('Page.enable'); await send('Runtime.enable');
    for (const it of ITEMS) {
      await send('Page.navigate', { url: 'about:blank' }); await sleep(1200);
      await send('Page.navigate', { url: `https://analytics.google.com/analytics/web/#/a${it.id}/` });
      let href = '', prop = null;
      for (let i = 0; i < 14; i++) {
        await sleep(2500);
        href = await ev('location.href');
        const m = href.match(/a\d+p(\d{6,})/);
        if (m) { prop = m[1]; break; }
      }
      // nome property mostrato nel breadcrumb
      const bc = await ev(`(() => { const t = document.body ? document.body.innerText : ''; return t.split('\\n').slice(0, 8).map(s=>s.trim()).filter(Boolean).join(' / '); })()`);
      console.log(`${it.name} (a${it.id}) -> property=${prop || 'NON_RISOLTO'} | breadcrumb: ${bc.slice(0, 120)}`);
    }
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); ws.close(); process.exit(1); }
});
ws.on('error', e => { console.error('WS ERR:', e.message); process.exit(1); });
