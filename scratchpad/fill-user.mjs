import WebSocket from 'ws';
const targetId = process.argv[2];
const username = process.argv[3];
const ver = await (await fetch('http://localhost:9223/json/version')).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pending = new Map();
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const msgId = ++id; pending.set(msgId, { resolve, reject });
    const m = { id: msgId, method, params }; if (sessionId) m.sessionId = sessionId;
    ws.send(JSON.stringify(m));
    setTimeout(() => { if (pending.has(msgId)) { pending.delete(msgId); reject(new Error('timeout ' + method)); } }, 15000);
  });
}
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result); }
});
ws.on('error', (e) => { console.error('WS ERR:', e.message); process.exit(1); });
ws.on('open', async () => {
  try {
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Runtime.enable', {}, sessionId);
    const expr = `(function(){
      var u = document.getElementById('user_login') || document.querySelector('input[name="log"]') || document.querySelector('input[type="email"]');
      if(!u){ return 'NO_USER_FIELD | url='+location.href; }
      u.focus(); u.value = ${JSON.stringify(username)};
      u.dispatchEvent(new Event('input',{bubbles:true}));
      u.dispatchEvent(new Event('change',{bubbles:true}));
      var p = document.getElementById('user_pass') || document.querySelector('input[type="password"]');
      return 'FILLED_USERNAME | pass_field_present='+(!!p)+' | pass_left_empty=true | url='+location.href;
    })()`;
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }, sessionId);
    console.log(r.result && r.result.value);
    ws.close(); process.exit(0);
  } catch (e) { console.error('ERR:', e.message); try { ws.close(); } catch {} process.exit(1); }
});
