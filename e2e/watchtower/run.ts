/**
 * Watchtower E2E — main entry point.
 *
 * Invoked by GitHub Actions every hour:
 *   bun run e2e/watchtower/run.ts
 *
 * Or locally for one-shot test:
 *   bun run e2e/watchtower/run.ts --only F1
 *   bun run e2e/watchtower/run.ts --skip-email
 *
 * Flow:
 *   1. Run F1, F2, F3, F4, B7 sequentially with shared browser process
 *      (each SaaS opens its own browser context — clean cookies/storage)
 *   2. Persist results JSON + screenshots to ./watchtower-artifacts/
 *   3. Decide email mode:
 *        - any yellow/red → CRITICAL ALERT email per failing SaaS
 *        - all green AND digest hour → ROUTINE DIGEST email
 *        - all green AND non-digest hour → silence
 *   4. Exit 0 always (we never want the workflow to fail just because a
 *      SaaS is broken — the failure IS the signal).
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { sendBrevoAlert, sendBrevoDigest, isDigestHour } from "./lib/alert.js";
import { runSaas } from "./lib/runner.js";
import type { RunResult } from "./lib/types.js";

import { F1_BASE_URL, F1_NAME, F1_PAGES } from "./tests/f1-complipilot.js";
import { F2_BASE_URL, F2_NAME, F2_PAGES } from "./tests/f2-fixmyweb.js";
import { F3_BASE_URL, F3_NAME, F3_PAGES } from "./tests/f3-paymentrescue.js";
import { F4_BASE_URL, F4_NAME, F4_PAGES } from "./tests/f4-parseflow.js";
import { B7_BASE_URL, B7_NAME, B7_PAGES } from "./tests/b7-captureapi.js";

/* eslint-disable no-console */

const ARTIFACTS_DIR = path.resolve(process.cwd(), "watchtower-artifacts");

interface SaasPlan {
  saas: string;
  baseUrl: string;
  pages: typeof F1_PAGES;
}

const ALL_SAAS: SaasPlan[] = [
  { saas: F1_NAME, baseUrl: F1_BASE_URL, pages: F1_PAGES },
  { saas: F2_NAME, baseUrl: F2_BASE_URL, pages: F2_PAGES },
  { saas: F3_NAME, baseUrl: F3_BASE_URL, pages: F3_PAGES },
  { saas: F4_NAME, baseUrl: F4_BASE_URL, pages: F4_PAGES },
  { saas: B7_NAME, baseUrl: B7_BASE_URL, pages: B7_PAGES },
];

interface CliFlags {
  only?: string;
  skipEmail: boolean;
}

function parseCli(argv: string[]): CliFlags {
  const flags: CliFlags = { skipEmail: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--only" && argv[i + 1]) {
      flags.only = argv[i + 1]?.toUpperCase();
      i += 1;
    } else if (arg === "--skip-email") {
      flags.skipEmail = true;
    }
  }
  return flags;
}

function buildRunUrl(): string | undefined {
  const server = process.env["GITHUB_SERVER_URL"];
  const repo = process.env["GITHUB_REPOSITORY"];
  const runId = process.env["GITHUB_RUN_ID"];
  if (server && repo && runId) {
    return `${server}/${repo}/actions/runs/${runId}`;
  }
  return undefined;
}

async function main(): Promise<void> {
  const cli = parseCli(process.argv.slice(2));

  const apiKey = process.env["BREVO_API_KEY"] ?? "";
  const recipient = process.env["WATCHTOWER_ALERT_EMAIL"] ?? "antonio.alt3000@gmail.com";

  if (!cli.skipEmail && !apiKey) {
    console.warn("[watchtower] BREVO_API_KEY not set — emails will NOT be sent.");
  }

  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

  const plans = cli.only
    ? ALL_SAAS.filter((s) => s.saas.toUpperCase().startsWith(cli.only ?? ""))
    : ALL_SAAS;

  if (plans.length === 0) {
    console.error(`[watchtower] no SaaS matching --only ${cli.only}`);
    process.exit(2);
  }

  const runs: RunResult[] = [];
  for (const plan of plans) {
    console.log(`\n=== ${plan.saas} (${plan.pages.length} pages) ===`);
    try {
      const result = await runSaas({
        saas: plan.saas,
        baseUrl: plan.baseUrl,
        pages: plan.pages,
        artifactsDir: ARTIFACTS_DIR,
      });
      runs.push(result);
      const file = path.join(ARTIFACTS_DIR, `${plan.saas}-result.json`);
      fs.writeFileSync(file, JSON.stringify(result, null, 2));
      console.log(`[watchtower:${plan.saas}] verdict=${result.status} written → ${file}`);
    } catch (err) {
      console.error(`[watchtower:${plan.saas}] FATAL`, err);
      runs.push({
        saas: plan.saas,
        baseUrl: plan.baseUrl,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        totalDurationMs: 0,
        pages: [],
        status: "red",
        primaryFailure: undefined,
        requiresManualSession: true,
        manualReason: `Fatal runner error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Email decision
  // -------------------------------------------------------------------------
  if (cli.skipEmail) {
    console.log("\n[watchtower] --skip-email flag set, no emails will be sent.");
    printSummary(runs);
    return;
  }

  if (!apiKey) {
    console.warn("\n[watchtower] No BREVO_API_KEY, summary only:");
    printSummary(runs);
    return;
  }

  const runUrl = buildRunUrl();
  const sendOpts = { recipient, apiKey, runUrl, artifactsDir: ARTIFACTS_DIR };

  // 1. Critical alerts (one email per failing SaaS)
  const failing = runs.filter((r) => r.status !== "green");
  for (const run of failing) {
    try {
      await sendBrevoAlert(run, sendOpts);
    } catch (err) {
      console.error(`[watchtower:${run.saas}] alert send error:`, err);
    }
  }

  // 2. Routine digest only when ALL green AND we are at a digest hour.
  if (failing.length === 0 && isDigestHour()) {
    try {
      await sendBrevoDigest(runs, sendOpts);
    } catch (err) {
      console.error("[watchtower:digest] send error:", err);
    }
  } else if (failing.length === 0) {
    console.log(
      `[watchtower] all green and not a digest hour (UTC ${new Date().getUTCHours()}h) — silent run.`,
    );
  }

  printSummary(runs);
  writeStepSummary(runs);
}

function statusEmoji(s: RunResult["status"]): string {
  return s === "red" ? "🔴" : s === "yellow" ? "🟠" : "🟢";
}

function printSummary(runs: RunResult[]): void {
  console.log("\n=== SUMMARY ===");
  for (const r of runs) {
    const failed = r.pages.filter((p) => !p.ok).length;
    console.log(
      `  ${r.status.padEnd(6)} ${r.saas.padEnd(18)} ${r.pages.length} pages, ${failed} failed, ${(r.totalDurationMs / 1000).toFixed(1)}s`,
    );
  }
  const overall = runs.every((r) => r.status === "green") ? "green" : "yellow/red";
  console.log(`\n  Overall: ${overall}`);
}

/**
 * Write a Markdown report into $GITHUB_STEP_SUMMARY so the run page on
 * GitHub Actions has a publicly-visible breakdown of every SaaS + every
 * failing page. This makes results readable WITHOUT downloading artifacts
 * (which would require a GitHub token).
 */
function writeStepSummary(runs: RunResult[]): void {
  const file = process.env["GITHUB_STEP_SUMMARY"];
  if (!file) return;
  const lines: string[] = [];
  const overall = runs.every((r) => r.status === "green") ? "green" : "yellow/red";
  lines.push(`# Watchtower E2E — overall ${statusEmoji(runs.every((r) => r.status === "green") ? "green" : runs.some((r) => r.status === "red") ? "red" : "yellow")} ${overall.toUpperCase()}`);
  lines.push("");
  lines.push(`Run started: \`${runs[0]?.startedAt ?? "n/a"}\``);
  lines.push("");
  lines.push("| SaaS | Status | Pages | Failed | Duration | Manual session? |");
  lines.push("|------|--------|-------|--------|----------|-----------------|");
  for (const r of runs) {
    const failed = r.pages.filter((p) => !p.ok).length;
    lines.push(
      `| **${r.saas}** | ${statusEmoji(r.status)} ${r.status} | ${r.pages.length} | ${failed} | ${(r.totalDurationMs / 1000).toFixed(1)}s | ${r.requiresManualSession ? "⚠️ YES" : "no"} |`,
    );
  }
  lines.push("");

  for (const r of runs) {
    const failed = r.pages.filter((p) => !p.ok);
    if (failed.length === 0) continue;
    lines.push(`## ${statusEmoji(r.status)} ${r.saas} — ${failed.length} failure(s)`);
    if (r.requiresManualSession && r.manualReason) {
      lines.push("");
      lines.push(`> ⚠️ **Manual session required:** ${r.manualReason}`);
    }
    lines.push("");
    for (const p of failed) {
      lines.push(`### ${p.severity} · ${p.name}`);
      lines.push(`- URL: \`${p.url}\``);
      if (p.error) lines.push(`- Error: ${p.error}`);
      if (p.consoleErrors.length > 0) {
        lines.push(`- Console errors (${p.consoleErrors.length}):`);
        for (const c of p.consoleErrors.slice(0, 5)) {
          lines.push(`  - \`[${c.type}]\` ${c.text.replace(/`/g, "'").slice(0, 250)}`);
        }
      }
      if (p.networkErrors.length > 0) {
        lines.push(`- Network 4xx/5xx (${p.networkErrors.length}):`);
        for (const n of p.networkErrors.slice(0, 5)) {
          lines.push(`  - \`${n.status}\` ${n.method} ${n.url}`);
        }
      }
      if (p.screenshotPath) {
        lines.push(`- Screenshot: \`${p.screenshotPath}\` (uploaded as artifact)`);
      }
      lines.push("");
    }
  }

  // Detail of green SaaS — show coverage so user sees what was actually checked
  lines.push("## Coverage detail (green SaaS)");
  for (const r of runs.filter((x) => x.status === "green")) {
    lines.push(`- ${statusEmoji(r.status)} **${r.saas}** — ${r.pages.length} pages, all OK`);
  }

  try {
    fs.appendFileSync(file, lines.join("\n") + "\n");
    console.log(`[watchtower] step summary written to ${file}`);
  } catch (err) {
    console.warn(`[watchtower] could not write step summary: ${String(err)}`);
  }
}

main().catch((err) => {
  console.error("[watchtower] FATAL top-level error:", err);
  process.exit(1);
});
