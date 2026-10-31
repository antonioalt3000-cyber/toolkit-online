# 5SaaS Competitor Weekly — 2026-W30 (2026-07-21)

**Run type:** First diff-active run. W29 established the baseline in-report; snapshot files are written for the first time this week (dir was empty). Diff computed against the W29 baseline table.
**Coverage:** 11/11 competitor captured (BillingLaunch skipped by design — no public-pricing competitors). Fairly.ai now resolves (301 → asenion.ai) → captured this week.
**Method:** WebFetch (Firecrawl MCP unavailable this session). Robots-respecting, cached.

## Tabella diff

| SaaS         | Competitor                 | Pricing             | Entry price                                                      | Delta vs W29                                                                                      |
| ------------ | -------------------------- | ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| EAASprint    | Deque                      | ❌ quote-only       | —                                                                | = (NEW feat: Axe MCP Server, IDE one-click fixes)                                                 |
| EAASprint    | Siteimprove                | ❌ demo-only        | —                                                                | =                                                                                                 |
| EAASprint    | Hassell Inclusion          | ❌ quote-only       | —                                                                | = (HiBot a11y assistant + Inclusive AI audit push)                                                |
| CRAKit       | Sonatype                   | mixed (core custom) | Nexus Pro $1,620/yr; Guide Pro $1,200/yr; Firewall Pro $4,800/yr | 🔺 public product pricing now visible (was "custom" in W29); Lifecycle + SBOM Manager still quote |
| CRAKit       | Snyk                       | ✅                  | $0 → $25/mo/dev → $1,260/yr (Ignite) → Ent                       | = (identical)                                                                                     |
| CRAKit       | FOSSA                      | ✅                  | $0 (SBOM export incl.) → $20/proj/mo (Business) → Ent            | = price; NEW add-ons: AI-snippet scanning + binary scanning                                       |
| GPAIRegister | Credo AI                   | ❌ demo-only        | —                                                                | = (no Art.50; shift to agentic/runtime governance)                                                |
| GPAIRegister | Holistic AI                | ❌ demo-only        | —                                                                | = (no Art.50; Guardian Agents added)                                                              |
| GPAIRegister | **Asenion** (ex-Fairly.ai) | ❌ demo-only        | —                                                                | 🔺 **REBRAND** anch.AI→Fairly→Asenion; repositioned "AI TRiSM"                                    |
| DPIAKit      | iubenda                    | ✅                  | €4.99 → €19.99 → €79.99/site/mo                                  | = price; a11y add-on tiers explicit (Lite €6 / Std €50)                                           |
| DPIAKit      | Termly                     | ✅                  | $0 → $10 → $15/mo (Pro+)                                         | = price; NEW promo SUMMER2026 (-20%)                                                              |

## Delta significativi (highlight)

1. **🔺 GPAIRegister — Fairly.ai rebranded to Asenion.** `fairly.ai` now 301-redirects to `asenion.ai`. Full lineage anch.AI → Fairly AI → Asenion, repositioned as a "next-gen AI governance platform / AI TRiSM" (Assess / Test / Assure, incl. adversarial stress-testing + runtime governance for agentic AI). Still demo-only, still **no Art.50 transparency-notice angle**. Impact: naming/positioning change, not a pricing or feature threat to GPAIRegister's Art.50 niche.

2. **🔺 CRAKit — Sonatype now exposes public pricing** on several products (Nexus Repo, Guide, Firewall). W29 recorded only "custom" — likely a URL/page difference rather than a confirmed price cut, but worth tracking. The CRA-relevant products (Lifecycle, SBOM Manager) remain quote-only. SBOM Manager markets EO 14028 / NIS2 / PCI4 / VEX. Self-serve transparent SBOM pricing remains a CRAKit differentiator on the low end.

3. **FOSSA — new AI-snippet + binary scanning add-ons.** Free tier still bundles SBOM export (5 projects). Low-end pressure persists; add-ons signal a move toward AI-generated-code provenance.

## Positioning signal (unchanged, favourable)

None of the 3 AI-governance competitors (Credo, Holistic, Asenion) markets an **EU AI Act Art.50 transparency notice** specifically → GPAIRegister's Art.50 niche remains uncontested by the majors. All 3 are enterprise governance suites (demo-only, framework-heavy), not self-serve Art.50 tools.

## Slack `#5saas-competitor`

**Not posted.** Two 🔺 deltas exist (Asenion rebrand + Sonatype pricing visibility), but:

- Neither is a competing price cut or a new Art.50/a11y/CRA feature that directly threatens a 5SaaS positioning — borderline for an alert.
- Slack MCP requires authentication and is unavailable in this non-interactive session, so a post could not be made regardless.
  → Documented here; no noise. If the founder wants these surfaced in Slack, post manually or authorize the Slack connector.

## Note operative

- Fairly.ai → **update task file**: replace `https://fairly.ai/` with `https://www.asenion.ai/` for GPAIRegister.
- Credo `/pricing` still 404 → use homepage `credo.ai` (as W29).
- URLs confirmed working this run: Sonatype `sonatype.com/products/pricing`; all others per task file.
- Firecrawl MCP still absent → WebFetch used again (gratis, robots-safe).
