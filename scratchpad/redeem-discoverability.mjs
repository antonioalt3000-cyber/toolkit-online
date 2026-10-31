// Can a paying LTD buyer find the redeem page from the site itself?
// Rendered DOM, not static HTML: these are Next apps and curl proves nothing.
import WebSocket from 'ws';

const SITES = [
  ['CompliPilot', 'complipilot.dev'], ['FixMyWeb', 'fixmyweb.dev'], ['PaymentRescue', 'paymentrescue.dev'],
  ['ParseFlow', 'parseflow.dev'], ['CaptureAPI', 'captureapi.dev'], ['EmailGuard', 'emailguard.dev'],
  ['SEOScope', 'seoscope.dev'], ['HeaderShield', 'headershield.dev'], ['HookLab', 'gethooklab.dev'],
  ['CardForge', 'getcardforge.dev'],
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ver = await (await fetch('http://localhost:9223/json/version')).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pending = new Map();
const send = (m, par = {}, s) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, { res, rej });
  const o = { id: i, method: m, params: par }; if (s) o.sessionId = s;
  ws.send(JSON.stringify(o));
  setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout ' + m)); } }, 30000);
});
ws.on('message', (d) => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } });

const PROBE = `JSON.stringify({
  anchors: [...document.querySelectorAll('a')]
    .filter(a => /redeem|licen[sc]e|coupon|lifetime/i.test(a.textContent + ' ' + (a.getAttribute('href')||'')))
    .map(a => (a.textContent.trim().slice(0,40) || '(no text)') + ' -> ' + a.getAttribute('href')),
  mentionsRedeem: /redeem|license code|licence code|coupon code/i.test(document.body.innerText)
})`;

ws.on('open', async () => {
  const rows = [];
  for (const [name, host] of SITES) {
    let home = { anchors: [], mentionsRedeem: false };
    let pricing = { anchors: [], mentionsRedeem: false };
    try {
      const { targetId } = await send('Target.createTarget', { url: `https://${host}/` });
      const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
      await send('Runtime.enable', {}, sessionId);
      await sleep(5500);
      home = JSON.parse((await send('Runtime.evaluate', { expression: PROBE, returnByValue: true }, sessionId)).result.value);
      await send('Page.enable', {}, sessionId);
      await send('Page.navigate', { url: `https://${host}/pricing` }, sessionId);
      await sleep(5500);
      pricing = JSON.parse((await send('Runtime.evaluate', { expression: PROBE, returnByValue: true }, sessionId)).result.value);
      await send('Target.closeTarget', { targetId });
    } catch (e) { rows.push([name, host, 'ERR ' + e.message.slice(0, 40), '']); continue; }
    const found = [...new Set([...home.anchors, ...pricing.anchors])];
    rows.push([name, host, found.length ? 'OK' : 'NESSUN ACCESSO', found.slice(0, 3).join(' | ') || (home.mentionsRedeem || pricing.mentionsRedeem ? '(testo sì, link no)' : '')]);
  }
  for (const [n, h, v, d] of rows) console.log(`${n.padEnd(14)} ${h.padEnd(20)} ${v.padEnd(16)} ${d}`);
  ws.close(); process.exit(0);
});
