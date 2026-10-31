// Customer-journey driver over the port-9223 Chrome (raw CDP, per the
// portfolio's browser rule). Unlike cdp.cjs it keeps ONE socket open for a
// whole journey and acts like a person: real mouse clicks and keystrokes
// (Input.*), real file uploads (DOM.setFileInputFiles), and it records every
// console error, uncaught exception and >=400 response along the way.
// Each journey owns the tab it opens and closes only that tab, so parallel
// QA sessions can share the browser.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CDP = { host: '127.0.0.1', port: 9223 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cdpHttp(method, p) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...CDP, path: p, method }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.end();
  });
}

class Journey {
  constructor(target, ws) {
    this.target = target;
    this.ws = ws;
    this.seq = 0;
    this.pending = new Map();
    this.listeners = [];
    this.consoleErrors = [];
    this.exceptions = [];
    this.badResponses = [];
    this.inflight = new Map();
    this.responses = new Map(); // requestId -> {url,status,mimeType}
    ws.on('message', (raw) => this.onMessage(JSON.parse(raw.toString())));
  }

  static async open(url = 'about:blank', opts = {}) {
    const target = JSON.parse(await cdpHttp('PUT', `/json/new?about:blank`));
    const ws = new WebSocket(target.webSocketDebuggerUrl, {
      perMessageDeflate: false,
      maxPayload: 256 * 1024 * 1024,
    });
    await new Promise((res, rej) => {
      ws.once('open', res);
      ws.once('error', rej);
    });
    const j = new Journey(target, ws);
    await j.send('Page.enable');
    await j.send('Runtime.enable');
    await j.send('Network.enable', { maxPostDataSize: 65536 });
    await j.send('Log.enable');
    await j.send('DOM.enable');
    // background tabs must still hydrate and run timers like a focused tab
    await j.send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await j.send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {});
    if (opts.mobile) await j.viewport(375, 812, true);
    else await j.viewport(opts.width || 1366, opts.height || 900, false);
    if (url !== 'about:blank') await j.goto(url);
    return j;
  }

  send(method, params = {}) {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  onMessage(msg) {
    if (msg.id && this.pending.has(msg.id)) {
      const p = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) p.reject(new Error(`${p.method}: ${JSON.stringify(msg.error)}`));
      else p.resolve(msg.result);
      return;
    }
    const { method, params } = msg;
    if (!method) return;
    if (
      method === 'Runtime.consoleAPICalled' &&
      (params.type === 'error' || params.type === 'assert')
    ) {
      this.consoleErrors.push(
        params.args
          .map((a) => a.value ?? a.description ?? '')
          .join(' ')
          .slice(0, 400)
      );
    } else if (method === 'Log.entryAdded' && params.entry.level === 'error') {
      this.consoleErrors.push(
        `[${params.entry.source}] ${params.entry.text} ${params.entry.url || ''}`.slice(0, 400)
      );
    } else if (method === 'Runtime.exceptionThrown') {
      const d = params.exceptionDetails;
      this.exceptions.push(`${d.text} ${d.exception?.description || ''}`.slice(0, 400));
    } else if (method === 'Network.requestWillBeSent') {
      this.inflight.set(params.requestId, { url: params.request.url, t: Date.now() });
    } else if (method === 'Network.responseReceived') {
      const r = params.response;
      this.responses.set(params.requestId, { url: r.url, status: r.status, mimeType: r.mimeType });
      if (r.status >= 400) this.badResponses.push({ status: r.status, url: r.url });
    } else if (method === 'Network.loadingFinished' || method === 'Network.loadingFailed') {
      if (method === 'Network.loadingFailed' && !params.canceled) {
        const u =
          this.inflight.get(params.requestId)?.url || this.responses.get(params.requestId)?.url;
        this.badResponses.push({ status: 'FAILED', url: `${u || '?'} (${params.errorText})` });
      }
      this.inflight.delete(params.requestId);
    }
    for (const l of this.listeners) l(method, params);
  }

  async viewport(width, height, mobile) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
    });
  }

  /** Waits until no request has been in flight for `quietMs` (max `timeout`). */
  async idle(quietMs = 600, timeout = 20000) {
    const start = Date.now();
    let quietSince = Date.now();
    // analytics beacons and long-polling never "finish": they must not hold the page busy
    const noise =
      /google-analytics|googletagmanager|_vercel\/(insights|speed-insights)|vitals|sentry|plausible|clarity|hotjar|\/__nextjs|webpack-hmr|_next\/webpack/;
    const busy = () =>
      [...this.inflight.values()].filter((r) => !noise.test(r.url) && Date.now() - r.t < 8000)
        .length;
    while (Date.now() - start < timeout) {
      if (busy() > 0) quietSince = Date.now();
      else if (Date.now() - quietSince >= quietMs) return true;
      await sleep(100);
    }
    return false;
  }

  async goto(url, { timeout = 30000 } = {}) {
    const loaded = new Promise((resolve) => {
      const l = (m) => {
        if (m === 'Page.loadEventFired') {
          this.listeners = this.listeners.filter((x) => x !== l);
          resolve();
        }
      };
      this.listeners.push(l);
    });
    await this.send('Page.navigate', { url });
    await Promise.race([loaded, sleep(timeout)]);
    await this.idle();
  }

  async eval(expression) {
    const r = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails)
      throw new Error(
        `eval: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`
      );
    return r.result.value;
  }

  async waitFor(selectorOrExpr, { timeout = 20000, visible = true } = {}) {
    const isExpr = selectorOrExpr.startsWith('js:');
    const expr = isExpr
      ? selectorOrExpr.slice(3)
      : `(() => { const e = document.querySelector(${JSON.stringify(selectorOrExpr)}); if (!e) return false;
          ${visible ? 'const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0;' : 'return true;'} })()`;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await this.eval(expr).catch(() => false)) return true;
      await sleep(150);
    }
    throw new Error(`waitFor timeout: ${selectorOrExpr}`);
  }

  /** Finds an element by CSS selector, or by visible text with "text=..." (buttons/links first). */
  async locate(sel) {
    const expr = sel.startsWith('text=')
      ? `(() => { const t = ${JSON.stringify(sel.slice(5).toLowerCase())};
          const all = [...document.querySelectorAll('button,a,[role=button],label,summary,input[type=submit]')]
            .concat([...document.querySelectorAll('body *')]);
          const e = all.find((n) => (n.innerText || n.value || '').trim().toLowerCase() === t && n.getBoundingClientRect().width > 0)
            || all.find((n) => (n.innerText || n.value || '').trim().toLowerCase().includes(t) && n.getBoundingClientRect().width > 0 && n.children.length === 0);
          if (!e) return null; e.scrollIntoView({block:'center'}); const r = e.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`
      : `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null;
          e.scrollIntoView({block:'center'}); const r = e.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`;
    const pos = await this.eval(expr);
    if (!pos) throw new Error(`element not found: ${sel}`);
    return pos;
  }

  async click(sel, { timeout = 20000 } = {}) {
    let pos = null;
    const start = Date.now();
    while (!pos) {
      try {
        pos = await this.locate(sel);
      } catch (e) {
        if (Date.now() - start > timeout) throw e;
        await sleep(200);
      }
    }
    await sleep(150); // let scrollIntoView settle before reading the click point
    const { x, y } = await this.locate(sel);
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });
    await sleep(120);
  }

  /** Focuses the field with a real click, clears it, then types like a keyboard. */
  async type(sel, text, { clear = true } = {}) {
    await this.waitFor(sel);
    await this.click(sel);
    if (clear) {
      // Select everything and type over it, as a person does. Deleting first
      // would briefly offer "" to controlled inputs that validate on change
      // (e.g. a hex field accepting only /^#.../), which reject it and then
      // receive the new text appended to the old value.
      await this.eval(
        `(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.focus(); if (e.select) e.select(); })()`
      );
      if (!text) {
        await this.send('Input.dispatchKeyEvent', {
          type: 'keyDown',
          key: 'Backspace',
          code: 'Backspace',
          windowsVirtualKeyCode: 8,
        });
        await this.send('Input.dispatchKeyEvent', {
          type: 'keyUp',
          key: 'Backspace',
          code: 'Backspace',
          windowsVirtualKeyCode: 8,
        });
      }
    }
    if (text) await this.send('Input.insertText', { text });
    await sleep(80);
  }

  async press(key) {
    const codes = { Enter: 13, Tab: 9, Escape: 27 };
    const base = { key, code: key, windowsVirtualKeyCode: codes[key] || 0 };
    await this.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      ...base,
      text: key === 'Enter' ? '\r' : undefined,
    });
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  }

  async upload(sel, files) {
    const { root } = await this.send('DOM.getDocument', { depth: -1, pierce: true });
    const { nodeId } = await this.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
    if (!nodeId) throw new Error(`file input not found: ${sel}`);
    await this.send('DOM.setFileInputFiles', { nodeId, files: files.map((f) => path.resolve(f)) });
    await sleep(200);
  }

  async text(sel = 'body') {
    return this.eval(`(document.querySelector(${JSON.stringify(sel)})||{}).innerText || ""`);
  }

  /** Resolves with the first response whose URL contains `part`, including its body. */
  waitForResponse(part, timeout = 60000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`no response matching ${part}`)), timeout);
      const l = async (m, p) => {
        if (m !== 'Network.loadingFinished') return;
        const meta = this.responses.get(p.requestId);
        if (!meta || !meta.url.includes(part)) return;
        this.listeners = this.listeners.filter((x) => x !== l);
        clearTimeout(timer);
        let body = null;
        try {
          const b = await this.send('Network.getResponseBody', { requestId: p.requestId });
          body = b.base64Encoded ? Buffer.from(b.body, 'base64') : b.body;
        } catch {
          /* body evicted */
        }
        resolve({ ...meta, body });
      };
      this.listeners.push(l);
    });
  }

  async screenshot(outPath, { fullPage = false } = {}) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const params = { format: 'png', captureBeyondViewport: fullPage };
    if (fullPage) {
      const m = await this.send('Page.getLayoutMetrics');
      const s = m.cssContentSize || m.contentSize;
      params.clip = { x: 0, y: 0, width: s.width, height: Math.min(s.height, 12000), scale: 1 };
    }
    const r = await this.send('Page.captureScreenshot', params);
    fs.writeFileSync(outPath, Buffer.from(r.data, 'base64'));
    return outPath;
  }

  /** Horizontal overflow check for the mobile viewport. */
  async overflowX() {
    return this.eval(`(() => { const w = document.documentElement.clientWidth;
      const off = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect();
        return r.right > w + 1 && getComputedStyle(e).position !== 'fixed' && r.width > 0; })
        .slice(0, 5).map((e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''));
      return { scrollWidth: document.documentElement.scrollWidth, clientWidth: w, offenders: off }; })()`);
  }

  /**
   * Contrast of an element's text against its effective background. Colours are
   * normalised through a canvas so oklch()/lab()/color-mix() resolve to sRGB
   * exactly as painted (the 6 Oct probe produced false results without this).
   */
  async contrast(sel) {
    return this.eval(`(() => {
      const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null;
      const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
      const rgba = (c) => { cx.clearRect(0,0,1,1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0,0,1,1); const d = cx.getImageData(0,0,1,1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const fg = rgba(getComputedStyle(e).color);
      let n = e, bg = null;
      while (n && n.nodeType === 1) { const cs = getComputedStyle(n);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') { bg = 'gradient:' + cs.backgroundImage.slice(0, 80); break; }
        const c = rgba(cs.backgroundColor); if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent' && c[3] > 0.99) { bg = c; break; }
        n = n.parentElement; }
      if (!bg) bg = rgba(getComputedStyle(document.body).backgroundColor || '#fff');
      const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
      if (typeof bg === 'string') return { fg, bg, ratio: null, note: 'background is an image/gradient: measure from screenshot' };
      const a = lum(fg), b = lum(bg);
      return { fg, bg, ratio: Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100,
        fontSize: getComputedStyle(e).fontSize, fontWeight: getComputedStyle(e).fontWeight };
    })()`);
  }

  report() {
    const ignorable = (u) =>
      /google-analytics|googletagmanager|vercel-scripts|_vercel\/insights|_vercel\/speed-insights|favicon/.test(
        u || ''
      );
    return {
      consoleErrors: [...new Set(this.consoleErrors)],
      exceptions: [...new Set(this.exceptions)],
      badResponses: this.badResponses.filter((r) => !ignorable(r.url)),
    };
  }

  resetLog() {
    this.consoleErrors = [];
    this.exceptions = [];
    this.badResponses = [];
  }

  async close() {
    try {
      this.ws.close();
    } catch {
      /* ignore */
    }
    await cdpHttp('GET', `/json/close/${this.target.id}`).catch(() => {});
  }
}

module.exports = { Journey, sleep };
