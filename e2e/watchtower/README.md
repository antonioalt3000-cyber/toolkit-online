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
