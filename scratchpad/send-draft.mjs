// Send an existing Gmail draft that lives inline in a thread.
// Usage: node send-draft.mjs <threadHexId> [--go]
//   without --go = INSPECT only (dumps role=button aria-labels, no click)
//   with    --go = attempts to expand draft + click Send (robust retry)
import WebSocket from 'ws';

const threadId = process.argv[2];
const GO = process.argv.includes('--go');
if (!threadId) { console.error('need threadId'); process.exit(1); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const ver = await (await fetch('http://localhost:9223/json/version')).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const msgId = ++id; pending.set(msgId, { resolve, reject });
    const m = { id: msgId, method, params }; if (sessionId) m.sessionId = sessionId;
    ws.send(JSON.stringify(m));
    setTimeout(() => { if (pending.has(msgId)) { pending.delete(msgId); reject(new Error('timeout ' + method)); } }, 30000);
  });
}
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.id && pending.has(msg.id)) { const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id); if (msg.error) reject(new Error(JSON.stringify(msg.error))); else resolve(msg.result); }
});
async function evalOn(sessionId, expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
  if (r.exceptionDetails) throw new Error('EVAL: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
  return r.result.value;
}
ws.on('error', (e) => { console.error('WS ERR:', e.message); process.exit(1); });
ws.on('open', async () => {
  try {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Page.enable', {}, sessionId); await send('Runtime.enable', {}, sessionId);
    await send('Page.navigate', { url: 'https://mail.google.com/mail/u/0/#all/' + threadId }, sessionId);
    await sleep(9000);
    const ready = await evalOn(sessionId, `/accounts.google|signin|ServiceLogin/.test(location.href)?'LOGIN':'OK'`);
    if (ready !== 'OK') { console.error('LOGIN needed'); ws.close(); process.exit(2); }
    // dump buttons
    const dump = await evalOn(sessionId, `(function(){var out=[];document.querySelectorAll('div[role=button]').forEach(function(x){var a=(x.getAttribute('aria-label')||'')+'|'+(x.getAttribute('data-tooltip')||'');if(/send|discard|draft/i.test(a))out.push(a.slice(0,60));});return out.join('\\n');})()`);
    console.log('BUTTONS:\n' + dump);
    const hasEditor = await evalOn(sessionId, `document.querySelector('div[aria-label*="Message Body"],div[g_editable="true"],div[role=textbox][aria-label*="essage"]')?'EDITOR_PRESENT':'NO_EDITOR'`);
    console.log('EDITOR:', hasEditor);
    if (GO) {
      // try to expand a collapsed draft first
      await evalOn(sessionId, `(function(){var d=[].slice.call(document.querySelectorAll('span,div')).find(function(x){return /^Draft$/.test((x.textContent||'').trim())&&x.offsetParent;});if(d){d.click();return 'EXPANDED';}return 'NO_EXPAND';})()`);
      await sleep(2500);
      let act = 'NO_BTN';
      const SENDJS = `(function(){var els=[].slice.call(document.querySelectorAll('div[role=button]'));var b=els.find(function(x){var a=(x.getAttribute('aria-label')||'').trim();return /^send\\b/i.test(a)&&!/schedule|later|discard|option/i.test(a)&&x.offsetParent;});if(b){b.click();return 'CLICKED';}return 'NO_BTN';})()`;
      for (let k = 0; k < 8; k++) { act = await evalOn(sessionId, SENDJS); if (act === 'CLICKED') break; await sleep(2500); }
      console.log('SEND_ACTION:', act);
      await sleep(8000);
    }
    await send('Target.closeTarget', { targetId }); ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); try { ws.close(); } catch {} process.exit(1); }
});
