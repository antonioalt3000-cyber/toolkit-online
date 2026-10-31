/**
 * Raw CDP harness — Chrome port 9223, the authenticated session.
 *
 * Three fixes are baked in because each one cost a previous campaign real time:
 *
 *  1. `origin` header on the WebSocket upgrade. Without it Chrome answers 403
 *     and, with no error handler and no timeout, connect() hangs forever
 *     producing no output, no tab and no error at all.
 *  2. Never normalise whitespace inside an injected template literal: `\s`
 *     is not a valid escape there and JavaScript collapses it to `s`, so
 *     `.replace(/\s+/g,' ')` silently becomes `.replace(/s+/g,' ')` and eats
 *     every "s" in the page text. Text is taken RAW and normalised in Node.
 *  3. Wait for CONTENT with a polling assertion, never a fixed sleep. A fixed
 *     2.6s wait produced 17 false alarms on heavy pages in August.
 */
const WebSocket = require("ws");
const http = require("http");

const HOST = "localhost";
const PORT = 9223;

function httpJson(path, method = "GET") {
  return new Promise((resolve, reject) => {
    // http.get(string, options, cb) is NOT accepted by this Node — build the
    // options from a URL instead. And /json/new refuses GET on Chrome 111+
    // ("Using unsafe HTTP verb GET ... supports only PUT"), which the endpoint
    // reports as a plain-text 200, so a naive caller sees a successful request
    // with no id rather than an error.
    const u = new URL(`http://${HOST}:${PORT}${path}`);
    const req = http.request(
      { hostname: u.hostname, port: u.port, path: u.pathname + u.search, method },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            resolve(d ? JSON.parse(d) : null);
          } catch {
            resolve(d);
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(8000, () => req.destroy(new Error("HTTP timeout on /json")));
    req.end();
  });
}

class Tab {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.consoleErrors = [];
    this.failedRequests = [];
    ws.on("message", (raw) => {
      let m;
      try {
        m = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id);
        this.pending.delete(m.id);
        if (m.error) reject(new Error(JSON.stringify(m.error)));
        else resolve(m.result);
        return;
      }
      if (m.method === "Runtime.exceptionThrown") {
        const d = m.params?.exceptionDetails;
        this.consoleErrors.push(d?.exception?.description || d?.text || "exception");
      }
      if (m.method === "Runtime.consoleAPICalled" && m.params?.type === "error") {
        this.consoleErrors.push(
          (m.params.args || []).map((a) => a.value ?? a.description ?? "").join(" "),
        );
      }
      if (m.method === "Network.responseReceived") {
        const r = m.params?.response;
        if (r && r.status >= 400) this.failedRequests.push(`${r.status} ${r.url}`);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 45000);
    });
  }

  async enable() {
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("Network.enable");
  }

  /** Evaluate and return the value. Expressions must NOT normalise whitespace. */
  async eval(expr) {
    const r = await this.send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description || "eval threw");
    }
    return r.result.value;
  }

  async goto(url) {
    this.consoleErrors = [];
    this.failedRequests = [];
    await this.send("Page.navigate", { url });
  }

  /**
   * Poll until `predicate` (a JS expression returning truthy) holds.
   * Returns true if it held, false on timeout — the caller decides what that means.
   */
  async waitFor(expr, timeoutMs = 20000, stepMs = 250) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        if (await this.eval(`(() => { try { return !!(${expr}); } catch (e) { return false; } })()`)) {
          return true;
        }
      } catch {
        /* page mid-navigation — keep polling */
      }
      await new Promise((r) => setTimeout(r, stepMs));
    }
    return false;
  }

  /** Raw text of the document. Normalisation happens in Node, never in the page. */
  async text() {
    const raw = await this.eval("document.body ? document.body.innerText : ''");
    return String(raw || "").replace(/[ \t ]+/g, " ");
  }

  /** Real typing: focus by click, then insertText — React ignores .value writes. */
  async typeInto(selector, value) {
    const box = await this.eval(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      el.scrollIntoView({block:'center'});
      const r = el.getBoundingClientRect();
      return {x: r.x + r.width/2, y: r.y + r.height/2};
    })()`);
    if (!box) throw new Error(`selector not found: ${selector}`);
    for (const type of ["mousePressed", "mouseReleased"]) {
      await this.send("Input.dispatchMouseEvent", {
        type,
        x: box.x,
        y: box.y,
        button: "left",
        clickCount: 1,
      });
    }
    await this.eval(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (el && el.value) { el.focus(); el.select(); }
    })()`);
    await this.send("Input.insertText", { text: value });
    return true;
  }

  async clickSelector(selector) {
    const box = await this.eval(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      el.scrollIntoView({block:'center'});
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return null;
      return {x: r.x + r.width/2, y: r.y + r.height/2};
    })()`);
    if (!box) throw new Error(`not clickable: ${selector}`);
    for (const type of ["mousePressed", "mouseReleased"]) {
      await this.send("Input.dispatchMouseEvent", {
        type,
        x: box.x,
        y: box.y,
        button: "left",
        clickCount: 1,
      });
    }
    return true;
  }

  /**
   * The rejection a browser shows for a failed HTML5 constraint lives OUTSIDE
   * innerText. Reading only the text reports "no error" on a form that did
   * refuse — that produced a false negative in August.
   */
  async nativeValidationMessages() {
    return this.eval(`Array.from(document.querySelectorAll('input,select,textarea'))
      .map(function(e){ return e.validationMessage; })
      .filter(function(m){ return m && m.length; })`);
  }

  async screenshot(file) {
    const r = await this.send("Page.captureScreenshot", { format: "png" });
    require("fs").writeFileSync(file, Buffer.from(r.data, "base64"));
    return file;
  }

  close() {
    try {
      this.ws.close();
    } catch {
      /* already closed */
    }
  }
}

async function newTab(url = "about:blank") {
  const t = await httpJson(`/json/new?${encodeURIComponent(url)}`, "PUT");
  if (!t || !t.id) throw new Error("could not open a tab on 9223");
  return t;
}

/**
 * A tab in a FRESH browser context — no cookies, no localStorage.
 *
 * This matters more than it looks. The automation profile carries authenticated
 * state from earlier QA runs: on 27 Aug a CompliPilot banner reading "Unlimited
 * scans" was briefly taken for a false claim, when in fact localStorage still
 * held an enterprise session minted on 19 Aug. Testing "as a real customer"
 * means deciding WHICH customer, and a first-time visitor needs a clean context.
 */
async function newCleanTab(url = "about:blank") {
  const version = await httpJson("/json/version");
  const wsUrl = version.webSocketDebuggerUrl;
  const browser = await new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl, { origin: `http://${HOST}:${PORT}` });
    const timer = setTimeout(() => {
      ws.terminate();
      reject(new Error("browser WebSocket upgrade timed out"));
    }, 10000);
    ws.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    ws.on("open", () => {
      clearTimeout(timer);
      resolve(new Tab(ws));
    });
  });
  const { browserContextId } = await browser.send("Target.createBrowserContext", {
    disposeOnDetach: false,
  });
  const { targetId } = await browser.send("Target.createTarget", { url, browserContextId });
  return { id: targetId, browserContextId, browser };
}

async function disposeContext(handle) {
  try {
    await handle.browser.send("Target.disposeBrowserContext", {
      browserContextId: handle.browserContextId,
    });
  } catch {
    /* context already gone */
  }
  handle.browser.close();
}

async function connect(targetId) {
  // A background tab gets frozen by Chrome and every eval times out.
  await httpJson(`/json/activate/${targetId}`);
  const wsUrl = `ws://${HOST}:${PORT}/devtools/page/${targetId}`;
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl, { origin: `http://${HOST}:${PORT}` });
    const timer = setTimeout(() => {
      ws.terminate();
      reject(new Error(`WebSocket upgrade timed out for ${targetId}`));
    }, 10000);
    ws.on("error", (e) => {
      clearTimeout(timer);
      reject(new Error(`WebSocket error (403 means the origin header is missing): ${e.message}`));
    });
    ws.on("open", async () => {
      clearTimeout(timer);
      const tab = new Tab(ws);
      await tab.enable();
      resolve(tab);
    });
  });
}

async function closeTab(id) {
  await httpJson(`/json/close/${id}`);
}

module.exports = { httpJson, newTab, newCleanTab, disposeContext, connect, closeTab, Tab };
