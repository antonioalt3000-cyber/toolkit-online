/**
 * Watchtower E2E — alert + digest email via Brevo HTTP API.
 *
 * Three email modes:
 *
 *   1. CRITICAL ALERT  → status !== "green" on any of the 5 SaaS.
 *      Sent EVERY hour the failure persists (cooldown handled by run.ts
 *      via Brevo tags, so we don't spam mid-failure).
 *      Subject: "🔴 Watchtower — F1 broken: /scan tool"
 *
 *   2. MANUAL SESSION  → requiresManualSession === true.
 *      A critical failure that the automated layer cannot fix on its own
 *      (e.g. unhandled JS exception). Subject changes so I know I MUST
 *      enter a session with the user.
 *      Subject: "⚠️ Watchtower — Manual session required (F1 unhandled exception)"
 *
 *   3. ROUTINE DIGEST  → all 5 SaaS green at one of the digest hours.
 *      Sent 3x/day (09:00 / 14:00 / 20:00 CEST = 07/12/18 UTC) so the user
 *      gets confirmation the system is alive.
 *      Subject: "🟢 Watchtower — All systems OK (5/5)"
 *
 * The legacy daily-report.js sent ONE generic "All Systems Operational"
 * regardless of reality. This sender does the opposite: contextualised
 * critical alerts when something breaks, regular green digest otherwise.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import type { RunResult } from "./types.js";

/* eslint-disable no-console */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export interface SendOptions {
  recipient: string;
  apiKey: string;
  /** GitHub Actions run URL — set by GITHUB_SERVER_URL + GITHUB_REPOSITORY + GITHUB_RUN_ID. */
  runUrl?: string;
  artifactsDir: string;
}

function statusBadge(status: RunResult["status"]): string {
  if (status === "red") return "🔴";
  if (status === "yellow") return "🟠";
  return "🟢";
}

function severityBadge(s: "P0" | "P1" | "P2"): string {
  if (s === "P0") return "🔴 P0";
  if (s === "P1") return "🟠 P1";
  return "🟡 P2";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readScreenshotInline(artifactsDir: string, file: string): string | undefined {
  try {
    const full = path.join(artifactsDir, file);
    const buf = fs.readFileSync(full);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// CRITICAL ALERT (per-SaaS, fired immediately on any yellow/red)
// ---------------------------------------------------------------------------

function buildAlertHtml(run: RunResult, opts: SendOptions): string {
  const failed = run.pages.filter((p) => !p.ok);
  const inlineImg = run.primaryFailure?.screenshotPath
    ? readScreenshotInline(opts.artifactsDir, run.primaryFailure.screenshotPath)
    : undefined;

  const failuresHtml = failed
    .map((p) => {
      const consoleSnippet = p.consoleErrors
        .slice(0, 5)
        .map((c) => `<li><code>[${escapeHtml(c.type)}]</code> ${escapeHtml(c.text)}</li>`)
        .join("");
      const netSnippet = p.networkErrors
        .slice(0, 5)
        .map(
          (n) =>
            `<li><code>${n.status}</code> ${escapeHtml(n.method)} ${escapeHtml(n.url)}</li>`,
        )
        .join("");
      return `
        <tr>
          <td style="padding:10px;border:1px solid #ddd;vertical-align:top;">
            <div><strong>${severityBadge(p.severity)} — ${escapeHtml(p.name)}</strong></div>
            <div style="font-size:12px;color:#555;">${escapeHtml(p.url)}</div>
            ${p.error ? `<div style="margin-top:6px;color:#b30000;"><strong>Error:</strong> ${escapeHtml(p.error)}</div>` : ""}
            ${p.consoleErrors.length > 0 ? `<div style="margin-top:6px;"><strong>Console (${p.consoleErrors.length}):</strong><ul style="margin:4px 0;">${consoleSnippet}</ul></div>` : ""}
            ${p.networkErrors.length > 0 ? `<div style="margin-top:6px;"><strong>Network 4xx/5xx (${p.networkErrors.length}):</strong><ul style="margin:4px 0;">${netSnippet}</ul></div>` : ""}
          </td>
        </tr>`;
    })
    .join("");

  const manualBox = run.requiresManualSession
    ? `<div style="background:#fff3cd;border:1px solid #ffc107;padding:12px;margin:16px 0;border-radius:4px;">
         <strong>⚠️ MANUAL SESSION REQUIRED</strong><br>
         ${escapeHtml(run.manualReason ?? "Pattern indicates a bug not auto-recoverable.")}
         <br><br>
         <em>Open a Claude Code session in <code>toolkit-online</code> and ask: "Watchtower segnala bug ${escapeHtml(run.saas)} — entriamo in sessione".</em>
       </div>`
    : "";

  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#222;max-width:760px;margin:0 auto;">
  <h2>${statusBadge(run.status)} Watchtower E2E — ${escapeHtml(run.saas)}</h2>
  ${manualBox}
  <p style="color:#555;">
    <strong>Verdict:</strong> ${run.status.toUpperCase()} ·
    <strong>Pages tested:</strong> ${run.pages.length} ·
    <strong>Failed:</strong> ${failed.length} ·
    <strong>Duration:</strong> ${(run.totalDurationMs / 1000).toFixed(1)}s
  </p>
  <p style="color:#555;font-size:12px;">
    Run started ${escapeHtml(run.startedAt)} · Base URL <code>${escapeHtml(run.baseUrl)}</code>
    ${opts.runUrl ? ` · <a href="${escapeHtml(opts.runUrl)}">GitHub Actions run</a>` : ""}
  </p>

  <h3>Failures</h3>
  <table style="border-collapse:collapse;width:100%;">
    ${failuresHtml || "<tr><td>No failure (this email should not have been sent — bug in alert logic).</td></tr>"}
  </table>

  ${
    inlineImg
      ? `<h3 style="margin-top:24px;">Screenshot of primary failure: ${escapeHtml(run.primaryFailure?.name ?? "")}</h3>
         <img src="${inlineImg}" alt="failure screenshot" style="max-width:100%;border:1px solid #ddd;" />`
      : ""
  }

  <hr style="margin-top:32px;" />
  <p style="font-size:11px;color:#999;">
    Watchtower E2E · real customer-journey monitoring · runs hourly on GitHub Actions<br>
    Replaces the legacy <code>auto-functional-test.yml</code> that did only HTTP-status checks.
  </p>
</body></html>`;
}

export async function sendBrevoAlert(run: RunResult, opts: SendOptions): Promise<void> {
  if (run.status === "green") {
    console.log(`[watchtower:${run.saas}] status green — no alert email sent.`);
    return;
  }

  const subject = run.requiresManualSession
    ? `⚠️ Watchtower — Manual session required (${run.saas} · ${run.primaryFailure?.name ?? "bug"})`
    : `${statusBadge(run.status)} Watchtower — ${run.saas} broken: ${run.primaryFailure?.name ?? "failure"}`;

  const html = buildAlertHtml(run, opts);

  const payload = {
    sender: { name: "Watchtower E2E", email: "hello@captureapi.dev" },
    to: [{ email: opts.recipient }],
    subject,
    htmlContent: html,
    tags: [
      "watchtower-alert",
      `saas:${run.saas}`,
      `status:${run.status}`,
      run.requiresManualSession ? "manual-session" : "auto-recoverable",
    ],
  };

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": opts.apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo alert send failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { messageId?: string };
  console.log(`[watchtower:${run.saas}] alert sent → messageId=${data.messageId ?? "?"}`);
}

// ---------------------------------------------------------------------------
// ROUTINE DIGEST (aggregated, 3x/day, only when all green)
// ---------------------------------------------------------------------------

/**
 * Decide whether THIS hourly run should also trigger a routine digest email.
 * Digest hours (UTC): 07:00 / 12:00 / 18:00.
 * That maps to 09:00 / 14:00 / 20:00 CEST in Italian summer time.
 * Override via env WATCHTOWER_DIGEST_HOURS_UTC="7,12,18".
 */
export function isDigestHour(date: Date = new Date()): boolean {
  const raw = process.env["WATCHTOWER_DIGEST_HOURS_UTC"] ?? "7,12,18";
  const hours = raw
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 23);
  return hours.includes(date.getUTCHours());
}

function buildDigestHtml(runs: RunResult[], opts: SendOptions): string {
  const total = runs.length;
  const green = runs.filter((r) => r.status === "green").length;
  const yellow = runs.filter((r) => r.status === "yellow").length;
  const red = runs.filter((r) => r.status === "red").length;
  const totalPages = runs.reduce((sum, r) => sum + r.pages.length, 0);

  const rows = runs
    .map((r) => {
      const failed = r.pages.filter((p) => !p.ok);
      const failedNames = failed
        .slice(0, 3)
        .map((p) => `${severityBadge(p.severity)} ${escapeHtml(p.name)}`)
        .join("<br>");
      return `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${statusBadge(r.status)} <strong>${escapeHtml(r.saas)}</strong></td>
          <td style="padding:8px;border:1px solid #ddd;">${r.pages.length} pages</td>
          <td style="padding:8px;border:1px solid #ddd;">${failed.length === 0 ? "—" : failedNames}</td>
          <td style="padding:8px;border:1px solid #ddd;font-size:12px;">${(r.totalDurationMs / 1000).toFixed(1)}s</td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#222;max-width:760px;margin:0 auto;">
  <h2>🟢 Watchtower digest — All systems OK (${green}/${total})</h2>
  <p style="color:#555;">
    <strong>Date:</strong> ${escapeHtml(new Date().toISOString())} ·
    <strong>Pages tested:</strong> ${totalPages} across ${total} SaaS<br>
    <strong>Status counts:</strong> 🟢 ${green} · 🟠 ${yellow} · 🔴 ${red}
    ${opts.runUrl ? ` · <a href="${escapeHtml(opts.runUrl)}">GitHub run</a>` : ""}
  </p>
  <table style="border-collapse:collapse;width:100%;margin-top:12px;">
    <thead>
      <tr style="background:#f5f5f5;">
        <th style="padding:8px;border:1px solid #ddd;text-align:left;">SaaS</th>
        <th style="padding:8px;border:1px solid #ddd;text-align:left;">Coverage</th>
        <th style="padding:8px;border:1px solid #ddd;text-align:left;">Issues (top 3)</th>
        <th style="padding:8px;border:1px solid #ddd;text-align:left;">Duration</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <hr style="margin-top:32px;" />
  <p style="font-size:11px;color:#999;">
    Routine digest sent 3x/day (09:00 / 14:00 / 20:00 CEST) when all 5 SaaS are green.<br>
    Critical alerts are sent immediately to ${escapeHtml(opts.recipient)} at any hour.<br>
    To stop these emails, set <code>WATCHTOWER_DIGEST_HOURS_UTC=""</code> in repo secrets.
  </p>
</body></html>`;
}

export async function sendBrevoDigest(runs: RunResult[], opts: SendOptions): Promise<void> {
  const allGreen = runs.every((r) => r.status === "green");
  if (!allGreen) {
    // When something is yellow/red the per-SaaS alert email already covers it.
    // Skip digest to avoid mixed signals.
    console.log("[watchtower:digest] skipping — not all SaaS green this run.");
    return;
  }

  const total = runs.length;
  const subject = `🟢 Watchtower digest — All ${total} SaaS OK`;
  const html = buildDigestHtml(runs, opts);

  const payload = {
    sender: { name: "Watchtower E2E", email: "hello@captureapi.dev" },
    to: [{ email: opts.recipient }],
    subject,
    htmlContent: html,
    tags: ["watchtower-digest", "status:green"],
  };

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": opts.apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo digest send failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { messageId?: string };
  console.log(`[watchtower:digest] sent → messageId=${data.messageId ?? "?"}`);
}
