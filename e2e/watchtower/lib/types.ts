/**
 * Watchtower E2E — type definitions
 *
 * Real customer-journey monitoring for the 5 SaaS portfolio.
 * Replaces the superficial HTTP-status-only auto-functional-test.yml.
 */

import type { Page } from "playwright";

export type Severity = "P0" | "P1" | "P2";

/**
 * Description of a single page-level test inside a SaaS run.
 * - `url`: absolute URL to navigate to
 * - `name`: human-readable identifier (e.g. "Homepage", "/scan tool")
 * - `severity`: P0 = down (homepage, dashboard); P1 = degraded (tool action);
 *               P2 = warning (secondary page broken)
 * - `interaction`: optional async function performing real user actions
 *                  on the loaded page (form fill, click, wait for DOM result).
 *                  MUST throw when an assertion is broken.
 */
export interface PageTest {
  url: string;
  name: string;
  severity: Severity;
  interaction?: (page: Page) => Promise<void>;
  /** Hard timeout for the entire test, default 30s. */
  timeoutMs?: number;
  /**
   * "page" (default) — full browser navigation with DOM, useful for HTML pages
   *                    where we want console/exception capture and interaction.
   * "fetch" — plain HTTP GET via Playwright request API. Use for non-HTML
   *           endpoints like /api/health (JSON), /sitemap.xml, /robots.txt.
   *           Skips browser overhead, asserts on response body text.
   */
  mode?: "page" | "fetch";
  /**
   * Only used when mode === "fetch": substring(s) the response body MUST
   * contain. Test fails if any expected substring is missing.
   */
  expectBodyContains?: string[];
  /**
   * Only used when mode === "fetch": HTTP method (default GET).
   */
  fetchMethod?: "GET" | "POST" | "HEAD";
  /**
   * Only used when mode === "fetch": JSON body to send (POST only).
   */
  fetchBody?: unknown;
  /**
   * Only used when mode === "fetch": HTTP headers to inject.
   * Useful for `x-api-key` probes against authenticated endpoints.
   * Read API key from process.env to keep it out of git.
   */
  fetchHeaders?: Record<string, string>;
  /**
   * Only used when mode === "fetch": expected HTTP status range
   * (default 200-399). Use 200 to require exact 200, or [200, 299].
   */
  expectStatus?: number | [number, number];
  /**
   * Skip the test (with a log line, no failure) if any of these env vars
   * is unset or empty. Useful for authenticated probes that depend on a
   * repo secret being configured — when the secret is missing we want
   * the test to be SKIPPED, not flag a false alert.
   */
  skipIfEnvMissing?: string[];
}

export interface NetworkErrorRecord {
  url: string;
  status: number;
  method: string;
}

export interface ConsoleErrorRecord {
  type: string;
  text: string;
}

/**
 * Outcome of a single PageTest.
 */
export interface PageResult {
  name: string;
  url: string;
  severity: Severity;
  ok: boolean;
  durationMs: number;
  /** Set when ok === false. Brief message describing what broke. */
  error?: string;
  /** Captured browser console errors / unhandled exceptions. */
  consoleErrors: ConsoleErrorRecord[];
  /** HTTP responses with status >= 400 observed during the page lifecycle. */
  networkErrors: NetworkErrorRecord[];
  /** PNG screenshot path on failure (relative to artifacts dir). */
  screenshotPath?: string;
  /** Document title captured at end of page run. */
  title?: string;
  /** Timestamp ISO 8601 when test started. */
  startedAt: string;
}

/**
 * Aggregated outcome of an entire SaaS run.
 */
export interface RunResult {
  saas: string;
  baseUrl: string;
  startedAt: string;
  finishedAt: string;
  totalDurationMs: number;
  pages: PageResult[];
  /** Verdict computed from page severities. */
  status: "green" | "yellow" | "red";
  /** Most critical failing page (when status !== "green"). */
  primaryFailure?: PageResult;
  /**
   * True when the failure pattern indicates a bug that the automated
   * watchtower CANNOT fix on its own (e.g. unhandled exception, broken
   * UI logic). The alert email switches to a "⚠️ enter session" subject
   * so I know I have to debug live with the user.
   */
  requiresManualSession?: boolean;
  /** Short rationale for requiresManualSession, included in email. */
  manualReason?: string;
}
