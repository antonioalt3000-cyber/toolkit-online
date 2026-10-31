// Track B helpers on top of the shared harness (the shared files are not edited here).
'use strict';
const path = require('path');
const fs = require('fs');
const INFRA = path.resolve(__dirname, '..', '..', 'qa-infra');
const { Journey, sleep } = require(path.join(INFRA, 'cdp-journey.cjs'));
const O = require(path.join(INFRA, 'oracles.cjs'));
const EVID = path.resolve(__dirname, '..', 'evidence');

/** Real-user replace: click the field, Ctrl+A (selectAll), type. One input event, like a person. */
async function setVal(j, sel, value) {
  await j.click(sel);
  await j.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'a',
    code: 'KeyA',
    modifiers: 2,
    windowsVirtualKeyCode: 65,
    commands: ['selectAll'],
  });
  await j.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'a',
    code: 'KeyA',
    modifiers: 2,
    windowsVirtualKeyCode: 65,
  });
  await j.send('Input.insertText', { text: String(value) });
  await sleep(150);
}

const results = [];
function check(saas, step, expected, observed, evidence = '') {
  const ok = JSON.stringify(expected) === JSON.stringify(observed);
  results.push({ saas, step, expected, observed, ok, evidence });
  console.log(
    `${ok ? 'PASS' : 'FAIL'} [${saas}] ${step} | expected=${JSON.stringify(expected)} observed=${JSON.stringify(observed)}`
  );
  return ok;
}
function save(name) {
  const f = path.join(EVID, name);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(results, null, 2));
  const fails = results.filter((r) => !r.ok).length;
  console.log(`== ${results.length} checks, ${fails} FAIL -> ${f}`);
}
const num = (s) => Number(String(s).replace(/[^0-9.-]/g, ''));
module.exports = { Journey, sleep, O, EVID, setVal, check, save, num, results };

// ---- isolated browser context (fresh visitor: no cookies/localStorage of the shared profile) ----
const http = require('http');
const WebSocket = require('ws');
function cdpGet(p) {
  return new Promise((res, rej) =>
    http
      .get({ host: '127.0.0.1', port: 9223, path: p }, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => res(JSON.parse(d)));
      })
      .on('error', rej)
  );
}
async function browserCall(method, params = {}) {
  const { webSocketDebuggerUrl } = await cdpGet('/json/version');
  const ws = new WebSocket(webSocketDebuggerUrl, { perMessageDeflate: false });
  await new Promise((r, e) => {
    ws.once('open', r);
    ws.once('error', e);
  });
  const out = await new Promise((resolve, reject) => {
    ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.id === 1) m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    });
    ws.send(JSON.stringify({ id: 1, method, params }));
  });
  ws.close();
  return out;
}
/** Opens `url` in a brand-new incognito-like browser context; close() also disposes the context. */
async function openIsolated(url, opts = {}) {
  const { browserContextId } = await browserCall('Target.createBrowserContext', {
    disposeOnDetach: false,
  });
  const { targetId } = await browserCall('Target.createTarget', {
    url: 'about:blank',
    browserContextId,
  });
  let target = null;
  for (let i = 0; i < 20 && !target; i++) {
    target = (await cdpGet('/json/list')).find((t) => t.id === targetId);
    if (!target) await sleep(150);
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl, {
    perMessageDeflate: false,
    maxPayload: 256 * 1024 * 1024,
  });
  await new Promise((r, e) => {
    ws.once('open', r);
    ws.once('error', e);
  });
  const j = new Journey(target, ws);
  for (const m of ['Page.enable', 'Runtime.enable', 'Network.enable', 'Log.enable', 'DOM.enable'])
    await j.send(m);
  await j.send('Emulation.setFocusEmulationEnabled', { enabled: true });
  if (opts.mobile) await j.viewport(375, 812, true);
  else await j.viewport(opts.width || 1366, opts.height || 900, false);
  const close = j.close.bind(j);
  j.close = async () => {
    await close();
    await browserCall('Target.disposeBrowserContext', { browserContextId }).catch(() => {});
  };
  if (url !== 'about:blank') await j.goto(url);
  return j;
}
module.exports.openIsolated = openIsolated;

// ---- process-local override: instant scroll + hit-test (pages with CSS `scroll-behavior: smooth`
// animate scrollIntoView, so the shared locate() read coordinates mid-animation and clicks landed on nothing) ----
Journey.prototype.locate = async function locateInstant(sel) {
  const finder = sel.startsWith('text=')
    ? `(() => { const t = ${JSON.stringify(sel.slice(5).toLowerCase())};
        const vis = (n) => { const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
        const pool = [...document.querySelectorAll('button,a,[role=button],label,summary,input[type=submit]')];
        return pool.find((n) => (n.innerText || n.value || '').trim().toLowerCase() === t && vis(n))
          || pool.find((n) => (n.innerText || n.value || '').trim().toLowerCase().includes(t) && vis(n))
          || [...document.querySelectorAll('body *')].find((n) => n.children.length === 0 && (n.innerText || '').trim().toLowerCase().includes(t) && vis(n)) || null; })()`
    : `document.querySelector(${JSON.stringify(sel)})`;
  const pos = await this.eval(`(() => { const e = ${finder}; if (!e) return null;
    e.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    const r = e.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { x, y, hitOk: !!hit && (hit === e || e.contains(hit) || hit.contains(e)) }; })()`);
  if (!pos) throw new Error(`element not found: ${sel}`);
  if (!pos.hitOk) throw new Error(`element covered or off-screen: ${sel}`);
  return { x: pos.x, y: pos.y };
};
