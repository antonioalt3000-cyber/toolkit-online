# 5 SaaS Weekly Review — Week 29 of 2026 (2026-07-13 → 2026-07-19)

> Scope: EAASprint · CRAKit · BillingLaunch · GPAIRegister · DPIAKit
> Run: automated scheduled task `5saas-weekly-review`. Data = live at run time (2026-07-19).
> Sibling report same week: [`5saas-competitor-weekly-2026-W29.md`](5saas-competitor-weekly-2026-W29.md) (competitor pricing baseline).

## TL;DR

- **MRR (5 new):** $0 (Δ $0 WoW) — no active subscriptions.
- **Services / one-shot revenue this week:** $0.
- **Signups / new customers (7d):** 0 across all 5.
- **Stripe products:** 16/16 prescelti present ✅ (expected count met).
- **Domains live:** 0/5 — still not resolving publicly → GSC + uptime + SSL sections skipped.
- **Outreach:** no data (no `outreach-logs/` dir, 0 mentions in `email-sent-log.md`).
- **Content published:** 0 — no live publishing pipeline for these 5.
- **Stage:** pre-launch. Assets ready, blocked on founder actions (domains + deploy). No customer-facing surface yet.

## Stripe snapshot (account `acct_1TEp0TQ4hv1lIuBU` = TOOLKIT)

- Active subscriptions: **0**
- Payment intents last 7d: **0 total**, 0 succeeded, $0.
- Prescelti products found (16, by name — `business_id` metadata **not set** on any):

| Business      | Products                          | Count     |
| ------------- | --------------------------------- | --------- |
| EAASprint     | Starter / Pro / Enterprise Audit  | 3         |
| CRAKit        | Solo / Team / Business / LTD Solo | 4         |
| BillingLaunch | Basic / Pro / Enterprise          | 3         |
| GPAIRegister  | Solo / Team / Business            | 3         |
| DPIAKit       | Solo / Team / Business            | 3         |
| **Total**     |                                   | **16** ✅ |

## Per-business breakdown

All five share the same status this week — **pre-launch, no traffic, no revenue**:

- **EAASprint** — MRR $0. Domain `eaasprint.com` not live. 3 products staged. No outreach, no content. Rec: (services model) start manual outreach; no infra blocker for a service sale.
- **CRAKit** — MRR $0. `crakit.dev` not live. 4 products (incl. LTD). Rec: CRA deadline is the hook — ship domain + landing to capture inbound.
- **BillingLaunch** — MRR $0. `billinglaunch.com` not live. Repo present at `~/billinglaunch`. Rec: productized service — deploy landing, it needs no subscription infra to sell.
- **GPAIRegister** — MRR $0. `gpairegister.com` not live. Rec: competitor gap confirmed (Art.50 niche uncovered, see competitor report) — first mover advantage still open.
- **DPIAKit** — MRR $0. `dpiakit.com` not live. Rec: competitors (iubenda/Termly) price aggressively low — validate pricing before launch.

## Cross-business anomalies (deterministic)

1. 🔴 **Invalid live Stripe key in `~/secrets-private/stripe-keys.txt`** — KEY#1 (`sk_live_…LDv1`) returns `invalid_request_error: Invalid API Key`. Dead/rotated key still stored. Action: remove or replace; confirm it was intentionally revoked.
2. 🟠 **5/5 domains not live** — DNS for all 5 resolves to `192.168.0.1` (gateway/no public A record). Blocker since 17 Apr 2026 (Porkbun checkout pending). SSL check N/A.
3. 🟠 **0 signups 7 days straight (all 5)** — expected pre-launch; not a regression, but nothing is being tested yet.
4. 🟡 **16 products lack `business_id` metadata** — the skill's designed Stripe filter (`metadata.business_id`) would return nothing; this run matched by name prefix instead. Add `business_id` metadata to the 16 products so future automated filtering works.
5. 🟡 **No outreach instrumentation** — `shared-memory/outreach-logs/` does not exist; nothing logged for these 5. If outreach starts, create the dir + log.

_Not flagged this week: MRR drop (no MRR), error rate (no deploys), content=0 (no pipeline yet, expected)._

## Focus for next week (top 3)

1. **Unblock launch surface** — the entire portfolio is gated on domain purchase + deploy (founder action). Nothing else moves the needle until at least one of the 5 has a live landing page.
2. **Fix Stripe hygiene** — remove the invalid live key; add `business_id` metadata to the 16 products so the pipeline can filter deterministically.
3. **Start with the 3 service-model businesses** (EAASprint, BillingLaunch + CRAKit LTD) — these can generate revenue via manual outreach + a single landing page, without full subscription infra. Lowest-friction path to first euro.

## Run notes

- Stripe MCP (`77ba6eda…`) not connected this session → queried Stripe REST API directly with stored key.
- GSC / uptime / SSL skipped by design (no live domains).
- Slack `#5saas-digest`: Slack MCP not authorized this session → post **not** sent (see delivery note).
- Founder email: draft prepared (not auto-sent).
