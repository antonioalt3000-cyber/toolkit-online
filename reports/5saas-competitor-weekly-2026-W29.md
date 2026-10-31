# 5SaaS Competitor Weekly — 2026-W29 (2026-07-18)

**Run type:** FIRST RUN — baseline established. Snapshots dir era vuota → nessun diff possibile. Da W30 in poi il diff sarà attivo.
**Coverage:** 10/11 competitor catturati. Fairly.ai SSL handshake failure → skip (retry W30). BillingLaunch skippato per design (nessun competitor con pricing pubblico).

## Tabella diff (baseline)

| SaaS         | Competitor        | Pricing pubblico | Entry price                       | Delta vs prev |
| ------------ | ----------------- | ---------------- | --------------------------------- | ------------- |
| EAASprint    | Deque             | ❌ quote-only    | —                                 | baseline      |
| EAASprint    | Siteimprove       | ❌ demo-only     | —                                 | baseline      |
| EAASprint    | Hassell Inclusion | ❌               | —                                 | baseline      |
| CRAKit       | Sonatype          | ❌ custom        | —                                 | baseline      |
| CRAKit       | Snyk              | ✅               | $0 → $25/mo/dev → $1,260/yr → Ent | baseline      |
| CRAKit       | FOSSA             | ✅               | $0 → $20/proj/mo → Ent            | baseline      |
| GPAIRegister | Credo AI          | ❌ demo-only     | —                                 | baseline      |
| GPAIRegister | Holistic AI       | ❌               | —                                 | baseline      |
| GPAIRegister | Fairly.ai         | ⚠️ SKIP (SSL)    | —                                 | non catturato |
| DPIAKit      | iubenda           | ✅               | €4.99 → €19.99 → €79.99/site/mo   | baseline      |
| DPIAKit      | Termly            | ✅               | $0 → $10 → $15/mo                 | baseline      |

## Osservazioni rilevanti (baseline, per positioning futuro)

- **EAASprint**: tutti e 3 i competitor sono quote-only / enterprise. Nessuno espone pricing → un tool a11y **self-serve con prezzo pubblico** resta differenziatore. Hassell + Deque puntano forte su "Inclusive AI audit" (nuovo angolo da monitorare).
- **CRAKit**: mercato SBOM biforcato — **self-serve trasparente** (Snyk/FOSSA, con SBOM export già nel Free tier di FOSSA) vs **enterprise custom** (Sonatype, che spinge NIS2/CRA/VEX). Snyk ha un tier "Ignite" ($1,260/yr) tra Team ed Enterprise. FOSSA SBOM export gratis = pressione sul basso di gamma.
- **GPAIRegister**: Credo + Holistic AI = piattaforme governance enterprise senza pricing pubblico, framework-heavy (EU AI Act, NIST, ISO 42001). Nessuno enfatizza **Art.50 transparency notice** in modo specifico → nicchia Art.50 ancora scoperta.
- **DPIAKit**: iubenda e Termly hanno pricing pubblico aggressivo (entry €4.99 / $0). **iubenda ora bundla un accessibility add-on** (€6–50/mo) — cross-sell nel territorio EAASprint, da tenere d'occhio. Termly Pro+ a $15/mo con policy illimitate = benchmark prezzo basso.

## Delta significativi → Slack `#5saas-competitor`

**Nessuno.** Primo run = solo baseline, nessun cambiamento da segnalare. Nessun post (evita noise). Da W30 il diff genererà alert solo su nuove tier / price change / nuove feature.

## Note operative

- Fairly.ai: SSL `HANDSHAKE_FAILURE_ON_CLIENT_HELLO` via WebFetch. Retry W30; se persiste, valutare rag-web-browser (Apify) o rimuovere dalla lista.
- URL corretti (404 sui canonici del task): Sonatype → `sonatype.com/products/pricing`; Credo → `credo.ai` (homepage, no /pricing). Aggiornare il task file con questi URL.
- Firecrawl MCP non disponibile in questa sessione → usato WebFetch (rispetta robots, gratis, cache 15min).
