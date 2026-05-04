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
