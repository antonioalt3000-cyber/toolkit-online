/**
 * Watchtower E2E — runner.
 *
 * Replaces the legacy `qa-deep-*.js` scripts that depended on Chrome
 * port 9223 (manual-only, my PC must be running). This version uses
 * headless Playwright Chromium that runs inside a GitHub Actions Linux
 * runner — no local PC needed.
 *
 * Key differences vs the fake-OK auto-functional-test.yml:
 *   - real navigation (page.goto) with full DOM rendering
 *   - per-page console.error / unhandled exception capture
 *   - per-page network 4xx/5xx tracking on the responses the page
 *     itself issued (not just the document HTTP code)
 *   - optional interaction step that asserts on real DOM state
 *     (e.g. "after redeem, dashboard text contains 'Lifetime'")
 *   - screenshot on any failure, attached to the alert email
 */

import { chromium, request as playwrightRequest, type APIRequestContext, type Browser, type BrowserContext, type Page } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";

import type {
  ConsoleErrorRecord,
  NetworkErrorRecord,
  PageResult,
  PageTest,
  RunResult,
  Severity,
} from "./types.js";

// Brevity: console.log is intentional here — this is a CI runner,
// not production app code. The output is captured by GitHub Actions logs.
/* eslint-disable no-console */

interface RunnerOptions {
  saas: string;
  baseUrl: string;
  pages: PageTest[];
  artifactsDir: string;
}

/**
 * Console messages we care about (real bugs).
 * Filters out:
 *   - the deprecated "ses-shim" warnings
 *   - benign hydration warnings react still emits in dev
 *   - third-party tracker noise (gtm/ga/sentry init logs)
 */
function shouldCaptureConsoleEntry(type: string, text: string): boolean {
  if (type !== "error" && type !== "warning") return false;
  const lower = text.toLowerCase();
  if (lower.includes("ses-shim")) return false;
  if (lower.includes("googletagmanager.com")) return false;
  if (lower.includes("google-analytics.com")) return false;
  if (lower.includes("sentry.io") && lower.includes("transport")) return false;
  return true;
}

/**
 * Network responses we care about. Same shape as old qa-deep scripts:
 * any 4xx/5xx is recorded, but we ignore noisy third-party telemetry
 * 4xx (those are usually CSP / blocked tracker not actual prod bugs).
 */
function shouldCaptureNetworkError(url: string, status: number): boolean {
  if (status < 400) return false;
  // 3rd-party telemetry / analytics — failures here are not our bug
  const noiseSubstrings = [
    "googletagmanager.com",
    "google-analytics.com",
    "doubleclick.net",
    "stats.g.doubleclick.net",
    "vercel-insights.com",
    "vercel.live",
    "_vercel/insights",
    "_vercel/speed-insights",
    "plausible.io",
    "cloudflareinsights.com",
    "beacon.min.js",
    "sentry.io",
    "ingest.sentry.io",
    "cdn.jsdelivr.net",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
  ];
  for (const s of noiseSubstrings) {
    if (url.includes(s)) return false;
  }
  // 401/403 on /api/* of OUR domains may be expected (synthetic call w/o auth).
  // Caller handles those via interaction assertions, not via raw network capture.
  if (status === 401 || status === 403) return false;
  return true;
}

/**
 * Lightweight HTTP-only probe used for /api/health, /sitemap.xml, /robots.txt.
 * Skips browser/DOM overhead. Fails when the body is missing every expected
 * substring (when expectBodyContains is provided).
 */
async function runFetchTest(
  apiCtx: APIRequestContext,
  test: PageTest,
): Promise<PageResult> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();
  const timeoutMs = test.timeoutMs ?? 15_000;
  let ok = true;
  let errorMessage: string | undefined;
  let title: string | undefined;
  const networkErrors: NetworkErrorRecord[] = [];

  try {
    const resp = await apiCtx.get(test.url, { timeout: timeoutMs });
    title = `HTTP ${resp.status()}`;
    if (resp.status() >= 400) {
      ok = false;
      errorMessage = `HTTP ${resp.status()} ${resp.statusText()}`;
      networkErrors.push({ url: test.url, status: resp.status(), method: "GET" });
    } else if (test.expectBodyContains && test.expectBodyContains.length > 0) {
      const body = await resp.text();
      for (const expected of test.expectBodyContains) {
        if (!body.toLowerCase().includes(expected.toLowerCase())) {
          ok = false;
          errorMessage = `Response body missing expected substring "${expected}". Got first 200 chars: ${body.slice(0, 200)}`;
          break;
        }
      }
    }
  } catch (err) {
    ok = false;
    errorMessage = err instanceof Error ? err.message : String(err);
    errorMessage = errorMessage.slice(0, 500);
  }

  return {
    name: test.name,
    url: test.url,
    severity: test.severity,
    ok,
    durationMs: Date.now() - startMs,
    error: errorMessage,
    consoleErrors: [],
    networkErrors,
    screenshotPath: undefined,
    title,
    startedAt,
  };
}

async function runPageTest(
  context: BrowserContext,
  test: PageTest,
  artifactsDir: string,
  saas: string,
): Promise<PageResult> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();
  const consoleErrors: ConsoleErrorRecord[] = [];
  const networkErrors: NetworkErrorRecord[] = [];
  const timeoutMs = test.timeoutMs ?? 30_000;

  const page: Page = await context.newPage();
  page.setDefaultTimeout(timeoutMs);

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (shouldCaptureConsoleEntry(type, text)) {
      consoleErrors.push({ type, text: text.slice(0, 500) });
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push({
      type: "exception",
      text: (err.message || String(err)).slice(0, 500),
    });
  });
  page.on("response", (resp) => {
    const url = resp.url();
    const status = resp.status();
    if (shouldCaptureNetworkError(url, status)) {
      networkErrors.push({ url, status, method: resp.request().method() });
    }
  });

  let ok = true;
  let errorMessage: string | undefined;
  let title: string | undefined;
  let screenshotPath: string | undefined;

  try {
    await page.goto(test.url, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    });
    // Give SPA hydration + first paint a moment.
    await page.waitForTimeout(2_000);
    title = await page.title();

    if (test.interaction) {
      await test.interaction(page);
    }
  } catch (err) {
    ok = false;
    errorMessage = err instanceof Error ? err.message : String(err);
    errorMessage = errorMessage.slice(0, 500);
  }

  // Even if the interaction step succeeded, surface unhandled JS exceptions
  // (these are real bugs that the legacy curl-based smoke test misses).
  if (ok) {
    const fatalConsole = consoleErrors.filter((e) => e.type === "exception");
    if (fatalConsole.length > 0) {
      ok = false;
      errorMessage = `Page emitted ${fatalConsole.length} unhandled exception(s): ${fatalConsole[0]?.text ?? ""}`.slice(0, 500);
    }
  }

  // P0 pages: any 5xx response is a hard fail. Other severities only fail
  // when the navigation/interaction itself threw.
  if (ok && test.severity === "P0") {
    const serverErrors = networkErrors.filter((n) => n.status >= 500);
    if (serverErrors.length > 0) {
      ok = false;
      const first = serverErrors[0];
      errorMessage = `5xx during P0 page: ${first?.method ?? ""} ${first?.url ?? ""} → ${first?.status ?? ""}`.slice(0, 500);
    }
  }

  if (!ok) {
    try {
      const safeName = test.name.replace(/[^a-z0-9]+/gi, "_").slice(0, 60);
      const file = `${saas}_${safeName}_${Date.now()}.png`;
      const fullPath = path.join(artifactsDir, file);
      await page.screenshot({ path: fullPath, fullPage: true });
      screenshotPath = file;
    } catch (err) {
      console.warn(`[watchtower] screenshot failed for ${test.name}: ${String(err)}`);
    }
  }

  await page.close().catch(() => {});

  return {
    name: test.name,
    url: test.url,
    severity: test.severity,
    ok,
    durationMs: Date.now() - startMs,
    error: errorMessage,
    consoleErrors,
    networkErrors,
    screenshotPath,
    title,
    startedAt,
  };
}

function severityRank(s: Severity): number {
  return s === "P0" ? 0 : s === "P1" ? 1 : 2;
}

/**
 * Run the full set of page tests for one SaaS.
 *
 * On any single P0 page failure we still continue running the remaining
 * pages (so the email lists every issue, not just the first one).
 * The verdict is computed at the end.
 */
export async function runSaas(opts: RunnerOptions): Promise<RunResult> {
  fs.mkdirSync(opts.artifactsDir, { recursive: true });

  const browser: Browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Watchtower/1.0 Safari/537.36",
    locale: "en-US",
  });

  const apiCtx = await playwrightRequest.newContext({
    timeout: 15_000,
    extraHTTPHeaders: {
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) Watchtower-FetchProbe/1.0",
    },
  });

  const startedAt = new Date().toISOString();
  const startMs = Date.now();
  const pages: PageResult[] = [];

  for (const test of opts.pages) {
    const mode = test.mode ?? "page";
    console.log(`[watchtower:${opts.saas}] running ${test.name} (${test.severity}, ${mode})`);
    const result =
      mode === "fetch"
        ? await runFetchTest(apiCtx, test)
        : await runPageTest(context, test, opts.artifactsDir, opts.saas);
    pages.push(result);
    console.log(
      `[watchtower:${opts.saas}] ${result.ok ? "OK" : "FAIL"} ${test.name} ` +
        `(${result.durationMs}ms, ${result.consoleErrors.length} console, ${result.networkErrors.length} net4xx/5xx)`,
    );
    if (!result.ok && result.error) {
      console.log(`  → ${result.error}`);
    }
  }

  await apiCtx.dispose().catch(() => {});
  await context.close().catch(() => {});
  await browser.close().catch(() => {});

  const failures = pages.filter((p) => !p.ok);
  failures.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  const primaryFailure = failures[0];

  let status: "green" | "yellow" | "red" = "green";
  if (primaryFailure) {
    status = primaryFailure.severity === "P0" ? "red" : "yellow";
  }

  // Flag bugs that the automated system cannot self-recover from.
  // - unhandled JS exceptions in production = code bug, manual fix required
  // - persistent 5xx across multiple pages = backend issue, may need redeploy
  //   (we never auto-redeploy without user OK, see watchtower-architecture.md)
  let requiresManualSession = false;
  let manualReason: string | undefined;
  const exceptionPages = failures.filter((f) =>
    f.consoleErrors.some((c) => c.type === "exception"),
  );
  if (exceptionPages.length > 0) {
    requiresManualSession = true;
    manualReason = `${exceptionPages.length} page(s) emitted unhandled JS exceptions: ${exceptionPages
      .map((p) => p.name)
      .join(", ")}`;
  }
  const fivexx = failures.filter((f) =>
    f.networkErrors.some((n) => n.status >= 500),
  );
  if (!requiresManualSession && fivexx.length >= 2) {
    requiresManualSession = true;
    manualReason = `Multiple pages hit 5xx (${fivexx
      .map((p) => p.name)
      .join(", ")}) — likely backend regression`;
  }

  return {
    saas: opts.saas,
    baseUrl: opts.baseUrl,
    startedAt,
    finishedAt: new Date().toISOString(),
    totalDurationMs: Date.now() - startMs,
    pages,
    status,
    primaryFailure,
    requiresManualSession,
    manualReason,
  };
}
