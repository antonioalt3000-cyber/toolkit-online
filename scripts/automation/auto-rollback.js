#!/usr/bin/env node
/**
 * auto-rollback.js — self-healing for the 10 SaaS portfolio.
 *
 * Runs as a step in the Watchtower E2E workflow AFTER run.ts has written
 * watchtower-artifacts/<SaaS>-result.json. For every SaaS whose verdict is "red",
 * it decides whether the red is a FRESH-DEPLOY REGRESSION and, if so, rolls the
 * Vercel production alias back to the previous READY deployment (a state that was
 * already live and working) — the safest possible autonomous repair.
 *
 * SAFE-BY-CONSTRUCTION guardrail:
 *   Roll back ONLY if the current production deployment was created within the
 *   last ROLLBACK_MAX_AGE_HOURS (default 4h). A SaaS that was green an hour ago and
 *   is red now after a fresh deploy → the deploy is the cause → reverting it is
 *   correct. A red with an OLD current deploy is NOT a deploy regression (env /
 *   external / data issue) → we DON'T touch prod, the Watchtower alert handles it.
 *
 *   Loop-safe & stateless: after a rollback the promoted (older) deployment becomes
 *   current; its created-time is old, so next run the guardrail no longer fires →
 *   no rollback loop, no state file needed.
 *
 * MODE: env AUTO_ROLLBACK = "execute" (default, real repair) | "report" (log/email
 *   the decision only — used for dry-run validation).
 *
 * Always exits 0 — never fails the monitoring workflow.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const TEAM = 'team_WOhu6OliFMghs2l8QJaxs1Jf';
const PROJECTS = {
  'F1-CompliPilot': { id: 'prj_xuaOCIPv6B0isqPlk5aKDJTSNOae', domain: 'complipilot.dev' },
  'F2-FixMyWeb': { id: 'prj_fyrCXuzxnrl2BmgIaervgBsaU88V', domain: 'fixmyweb.dev' },
  'F3-PaymentRescue': { id: 'prj_1P0v7hO65WRYKJftQoRaBem8MNqo', domain: 'paymentrescue.dev' },
  'F4-ParseFlow': { id: 'prj_B5Z6ZSCuV9nL96M9KAVgmAzr8cLJ', domain: 'parseflow.dev' },
  'B7-CaptureAPI': { id: 'prj_TNZejUAkv1remYW54UgoARFd5Hnd', domain: 'captureapi.dev' },
  // Round-2 SaaS (added 2026-07-09): rollback coverage was missing entirely for
  // these 5 — a fresh-deploy regression on any of them had no autonomous repair.
  'EG-EmailGuard': { id: 'prj_XelejkThdyRDPhB17LrYLjZa4HFs', domain: 'emailguard.dev' },
  'SEO-SEOScope': { id: 'prj_uSJoQXJVI8y9De0g7UqrRkWG6AUM', domain: 'seoscope.dev' },
  'HSH-HeaderShield': { id: 'prj_z9QMVuQk8bpi2i9rvDW7SlnL9LHP', domain: 'headershield.dev' },
  'HKL-HookLab': { id: 'prj_tDBHljcu6SjRg3il9jMziy9b1kdf', domain: 'gethooklab.dev' },
  'CFG-CardForge': { id: 'prj_J2LbuYYyH2sRwUHntGacnavUik8B', domain: 'getcardforge.dev' },
};

const MODE = process.env.AUTO_ROLLBACK || 'execute';
const MAX_AGE_H = Number(process.env.ROLLBACK_MAX_AGE_HOURS || 4);
const TOKEN = process.env.VERCEL_TOKEN || '';
const BREVO = process.env.BREVO_API_KEY || '';
const ARTIFACTS =
  process.env.WATCHTOWER_ARTIFACTS || path.resolve(process.cwd(), 'watchtower-artifacts');
const RECIPIENT = process.env.WATCHTOWER_ALERT_EMAIL || 'antonio.alt3000@gmail.com';

const sha = (d) => String(d?.meta?.githubCommitSha || '').slice(0, 7) || '?';

async function vGet(p) {
  const r = await fetch('https://api.vercel.com' + p, {
    headers: { Authorization: 'Bearer ' + TOKEN },
  });
  if (!r.ok) throw new Error(`vercel ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

async function email(subject, html) {
  if (!BREVO) return;
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'DevToolsmith Auto-Heal', email: 'hello@captureapi.dev' },
        to: [{ email: RECIPIENT, name: 'Antonio' }],
        subject,
        htmlContent: html,
      }),
    });
  } catch (e) {
    console.warn('[rollback] email send failed:', String(e).slice(0, 120));
  }
}

(async () => {
  if (!TOKEN) {
    console.log('[rollback] VERCEL_TOKEN not set — skipping auto-rollback.');
    return;
  }
  if (!fs.existsSync(ARTIFACTS)) {
    console.log(`[rollback] no artifacts dir (${ARTIFACTS}) — nothing to do.`);
    return;
  }
  const reds = fs
    .readdirSync(ARTIFACTS)
    .filter((f) => f.endsWith('-result.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(ARTIFACTS, f), 'utf8')))
    .filter((r) => r.status === 'red');

  if (reds.length === 0) {
    console.log('[rollback] no RED SaaS — nothing to roll back. ✅');
    return;
  }
  console.log(
    `[rollback] ${reds.length} red SaaS: ${reds.map((r) => r.saas).join(', ')} (mode=${MODE})`
  );

  for (const r of reds) {
    const proj = PROJECTS[r.saas];
    if (!proj) {
      console.log(`[rollback] ${r.saas}: no Vercel project mapping — skip.`);
      continue;
    }
    let deps;
    try {
      const data = await vGet(
        `/v6/deployments?projectId=${proj.id}&teamId=${TEAM}&target=production&limit=10`
      );
      deps = (data.deployments || []).filter(
        (d) => d.state === 'READY' && d.target === 'production'
      );
    } catch (e) {
      console.log(`[rollback] ${r.saas}: Vercel API error — skip. ${String(e).slice(0, 150)}`);
      continue;
    }
    if (deps.length < 2) {
      console.log(
        `[rollback] ${r.saas}: <2 READY prod deploys — no previous to roll back to, skip.`
      );
      continue;
    }
    const cur = deps[0];
    const prev = deps.slice(1).find((d) => sha(d) !== sha(cur)) || deps[1];
    const ageH = (Date.now() - cur.created) / 3.6e6;

    if (ageH > MAX_AGE_H) {
      console.log(
        `[rollback] ${r.saas}: RED but current prod ${sha(cur)} is ${ageH.toFixed(1)}h old (> ${MAX_AGE_H}h) → NOT a fresh-deploy regression. Leaving prod untouched; Watchtower alert handles it.`
      );
      continue;
    }

    const line = `${r.saas}: RED + fresh deploy ${sha(cur)} (${ageH.toFixed(1)}h old) → roll back to ${sha(prev)} (${prev.url})`;
    if (MODE !== 'execute') {
      console.log(`[rollback] (report) ${line}`);
      await email(
        `🔧 Auto-rollback (report): ${r.saas}`,
        `<p>${line}</p><p>Mode=report — no action taken.</p>`
      );
      continue;
    }
    console.log(`[rollback] EXECUTING — ${line}`);
    try {
      const out = execSync(
        `npx --yes vercel@latest rollback ${prev.url} --token ${TOKEN} --scope ${TEAM}`,
        { stdio: 'pipe', timeout: 220000 }
      ).toString();
      console.log(`[rollback] ${r.saas} rolled back OK:\n${out.slice(-400)}`);
      await email(
        `🔧 Auto-rollback DONE: ${r.saas} reverted to ${sha(prev)}`,
        `<p><b>${r.saas}</b> went red after deploy <code>${sha(cur)}</code>. Auto-rolled production back to the previous good deploy <code>${sha(prev)}</code> (${prev.url}).</p><p>Next Watchtower run will confirm recovery. If still red, the bad change is NOT the latest deploy — manual look needed.</p>`
      );
    } catch (e) {
      console.error(`[rollback] ${r.saas} rollback FAILED: ${String(e).slice(0, 300)}`);
      await email(
        `⚠️ Auto-rollback FAILED: ${r.saas}`,
        `<p>Tried to roll <b>${r.saas}</b> back from <code>${sha(cur)}</code> to <code>${sha(prev)}</code> but the rollback command failed. Manual action needed.</p><pre>${String(e).slice(0, 400)}</pre>`
      );
    }
  }
})().catch((e) => {
  console.error('[rollback] top-level error:', e);
  process.exit(0);
});
