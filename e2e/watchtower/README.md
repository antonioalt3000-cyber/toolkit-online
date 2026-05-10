# Watchtower E2E

> Real customer-journey monitoring for the 5 SaaS portfolio.
> Replaces the legacy `auto-functional-test.yml` (HTTP-status-only) that
> reported "All Systems Operational" while real UX bugs went undetected.

## What it does

Every hour a GitHub Actions Linux runner spins up headless Playwright
Chromium and runs **123 page tests across 5 SaaS** with real DOM-aware
assertions — no dependency on my local Chrome 9223, my PC can be off.

| SaaS | Pages | Interactive flows |
|------|-------|-------------------|
| F1 CompliPilot   | 20 | Homepage CTA + scan tool (60s LLM call) + redeem coupon input + dashboard shape + signin email field + signup + checklist toggle |
| F2 FixMyWeb      | 24 | Homepage CTA + WCAG scan + contrast/heading checker + redeem + signin + signup + 4 standalone tools |
| F3 PaymentRescue | 26 | Homepage CTA + churn-predictor (4 options click + verify $ amount) + recovery-rate calculator + redeem + signin + signup |
| F4 ParseFlow     | 25 | Homepage CTA + playground "Try Sample Invoice" + Extract → JSON verify + redeem + signin + signup |
| B7 CaptureAPI    | 28 | Homepage CTA + playground viewport presets + Try It → image rendered + meta-inspector analyze + redeem + signin + signup |
| **Total** | **123** | **23 interactive flows** |

For each page we capture:
- **Console errors** (real `console.error` + unhandled exceptions) — not just status code
- **Network 4xx/5xx** the page itself issued (not just the document HTTP code)
- **Custom assertions** (e.g. "after Extract click, body must contain `confidence|invoice|line item`")
- **Screenshot on failure** attached as artifact + inline in alert email
- **Page title + duration** for trend analysis

## Email behaviour

| Scenario | Subject | Recipient |
|----------|---------|-----------|
| **All 5 SaaS green** at 09:00 / 14:00 / 20:00 CEST (07/12/18 UTC) | `🟢 Watchtower digest — All 5 SaaS OK` | `antonio.alt3000@gmail.com` |
| **All green** at any other hour | (no email — silent run) | — |
| **Any SaaS yellow/red** | `🔴 Watchtower — F2 broken: /scan tool` | `antonio.alt3000@gmail.com`, immediately |
| **Failure with unhandled JS exception** | `⚠️ Watchtower — Manual session required (F2 unhandled exception)` | `antonio.alt3000@gmail.com`, immediately |

Override via repo variables:
- `WATCHTOWER_ALERT_EMAIL` — default `antonio.alt3000@gmail.com`
- `WATCHTOWER_DIGEST_HOURS_UTC` — default `7,12,18` (= 09/14/20 CEST). Set to empty string to disable digest.

## Severity assignment

- `P0` (red on failure) — homepage, dashboard, redeem, scan/playground core, signin, /api/health
- `P1` (yellow on failure) — pricing, signup, secondary tools, content tier landings
- `P2` (yellow only when navigation throws) — legal pages, blog index, sitemap, robots

## File layout

```
e2e/watchtower/
├── README.md                        # this file
├── run.ts                           # entry point (npm run watchtower)
├── lib/
│   ├── types.ts                     # PageTest, RunResult, Severity
│   ├── runner.ts                    # Playwright headless + capture
│   └── alert.ts                     # Brevo HTTP API (alert + digest)
└── tests/
    ├── f1-complipilot.ts
    ├── f2-fixmyweb.ts
    ├── f3-paymentrescue.ts
    ├── f4-parseflow.ts
    └── b7-captureapi.ts
```

## Running locally

```bash
# Run all 5 SaaS (no email if BREVO_API_KEY missing)
npm run watchtower

# One SaaS only
npm run watchtower:one F1

# Dry run (no email even if key set)
npm run watchtower:dry

# CLI flags
npx tsx e2e/watchtower/run.ts --only B7 --skip-email
```

The runner produces:
- `watchtower-artifacts/<saas>-result.json` — structured per-SaaS result
- `watchtower-artifacts/<saas>_<page>_<ts>.png` — screenshot on failure

## Triggering a fresh run on Actions (sandboxed sessions)

A Claude Code session running inside a sandbox with egress restrictions
(e.g. `host_not_allowed` 403s on the SaaS domains, blocked
`cdn.playwright.dev`) cannot execute the watchtower locally — every page
will fail with `ERR_CERT_AUTHORITY_INVALID` from the proxy MITM, not from
real bugs. Don't trust those local results; use Actions instead.

To trigger a fresh run from such a session:

```bash
# From a machine with gh + repo write access
gh workflow run watchtower-e2e.yml --ref master
gh run watch                                  # follow the run
gh run view --log                             # full log if needed
```

Or via UI: https://github.com/antonioalt3000-cyber/toolkit-online/actions/workflows/watchtower-e2e.yml
→ "Run workflow" → branch `master` → optional `only: F1|F2|F3|F4|B7`.

The hourly schedule (`5 * * * *`) means a fresh run is at most ~60 min
away even without manual dispatch.

## Environment variables (CI)

`.github/workflows/watchtower-e2e.yml` consumes the following. Configure in
GitHub UI → Settings → Secrets and variables → Actions.

| Name | Type | Default | Purpose |
|------|------|---------|---------|
| `BREVO_API_KEY` | Secret (required) | — | Brevo HTTP API key for sending alert + digest emails. Without it, runs are silent (still produce JSON + screenshots, just don't notify). |
| `WATCHTOWER_ALERT_EMAIL` | Var (optional) | `antonio.alt3000@gmail.com` | Recipient for both critical alerts and routine digests. |
| `WATCHTOWER_DIGEST_HOURS_UTC` | Var (optional) | `7,12,18` | Comma-separated UTC hours when an "all green" run produces a digest email. Set empty to disable digest entirely. Default = 09 / 14 / 20 CEST. |
| `WATCHTOWER_ALERT_HOURS_UTC` | Var (optional) | `5,10,16,19` | Comma-separated UTC hours when persistent failures produce a critical alert. Manual-session failures bypass this gate (always sent). Set to `*` to revert to legacy hourly mode. |

Local one-off runs only need `BREVO_API_KEY` if you want emails. Use
`npm run watchtower:dry` to skip email entirely.

## CI workflow

Defined in `.github/workflows/watchtower-e2e.yml`.

- Trigger: `cron: "5 * * * *"` (every hour at minute 5) + `workflow_dispatch`
- Runner: `ubuntu-latest`
- Timeout: 30 minutes (typical run ~10 min sequential)
- Cost: **0 €/month** — repo is public so GitHub Actions Linux minutes are unlimited
- Artifacts retained 14 days

## How this differs from the legacy `auto-functional-test.yml`

| Legacy fake-OK | Watchtower E2E |
|----------------|----------------|
| `curl --max-time 15` HTTP status code only | Real Playwright Chromium navigation |
| Pages with broken UI return 200 → reported OK | DOM assertions catch broken UI |
| Webhook with `{}` returns 400 (signature gate) → reported OK | Real customer-journey: redeem coupon, dashboard plan, scan result |
| One generic "🟢 All Systems Operational" email | Contextualised alert with screenshot + console errors + 5xx URLs |
| Catches: nothing real | Catches: missing tier names, scanner result not rendering, redeem field missing, dashboard blank, JS exceptions, calculator option without $ amount, playground extract not producing JSON, viewport presets crashing |

## Related files

- `.github/workflows/auto-functional-test.yml.disabled` — legacy workflow renamed (not deleted, can be reverted)
- `.github/workflows/uptime-monitor.yml` — kept active, runs every 5 min as fast HEAD canary
- `.github/workflows/daily-automation.yml` — kept active, marketing automation (not functional testing)
- `~/qa-deep-{f1,f2,f3,f4,b7}.js` — original CDP raw scripts (port 9223), still usable manually
- `~/daily-e2e-2x.sh` — orchestrator for the manual qa-deep scripts

## Notes for future expansion

- Adding redeem-coupon test that actually USES an owner coupon (CPL/FMW/PRE/PFL/CAP) requires synthetic accounts with cookie state. See `~/shared-memory/internal-admin-access.md` for accesses. Not yet wired (would require persistent storage state via Playwright `storageState`).
- Adding `/api/v1/screenshot` synthetic POST with watchtower API key requires creating dedicated API keys per SaaS. See `~/marketing-drafts/W2-monday/watchtower-architecture.md` §Env vars for the design.
- Auto-recovery (Vercel redeploy on persistent 5xx) intentionally NOT implemented — `requiresManualSession` flag is the user's signal to enter a Claude Code session and debug live.
