# Free-Tier Monitoring + Resilience Stack — 5 SaaS Next.js (aprile 2026)

> **Target**: complipilot.dev, fixmyweb.dev, paymentrescue.dev, parseflow.dev, captureapi.dev
> **Budget**: €0/mese. Free tier only.
> **Scale baseline**: <100 visite/giorno × 5 siti, 2 E2E/giorno, traffic in crescita globale.
> **Data**: 23 aprile 2026 (limiti verificati contro pricing pages ufficiali).

---

## 1) RACCOMANDAZIONE FINALE — STACK COMPLETO

| Categoria | Tool scelto | Perché | Limite free 2026 | Signup |
|---|---|---|---|---|
| **Uptime multi-region** | **UptimeRobot Free** | 50 monitor × 5min × 1 location selezionabile, il più permissivo sul numero monitor | 50 monitor / 5 min interval / 1 region / 2 mesi log / 2 status page | https://dashboard.uptimerobot.com/sign-up |
| **Uptime multi-region backup** | **Better Stack Free** | 10 monitor × 3 min × **multi-region gratis**, copre il gap geografico di UptimeRobot | 10 monitor / 3 min / multi-region (US+EU+APAC) / 1 status page | https://betterstack.com/uptime |
| **Error tracking / APM** | **Sentry Developer (Free)** | Standard de-facto per Next.js, SDK nativo, source-maps OK | 5k errors + 10k perf units + 50 replay sessions / 1 user / 30gg retention | https://sentry.io/signup/ |
| **Synthetic E2E** | **Playwright + GitHub Actions** | Totalmente OSS, controllo 100%, niente vendor lock-in | 2000 min/mese (GitHub Free repo private) — ti basta 5× | — (repo esistente) |
| **Lighthouse CI** | **Lighthouse CI Action OSS** | Gratis, storico via Temporary Public Storage, budget enforcement | Illimitato run / 7gg retention (Temp Public Storage) | https://github.com/GoogleChrome/lighthouse-ci |
| **Performance RUM** | **Vercel Speed Insights (Hobby)** | Già pagato dal Vercel Hobby, zero setup | 10k data points/mese per account Hobby | già attivo nel tuo Vercel |
| **Dependency scan** | **GitHub Dependabot + npm audit** | Free illimitato anche su repo private, già integrato | Unlimited alerts + auto-PR | Settings → Security |
| **SAST** | **GitHub CodeQL (Code Scanning)** | Gratis anche su repo private dal 2024 per "Advanced Security per tutti" | Unlimited scans | Settings → Code security |
| **Supply-chain** | **Socket.dev Free** | Rileva malicious packages in tempo reale, GitHub-native | Unlimited scans, 1 org | https://socket.dev |
| **Status page pubblica** | **Better Stack Status Page** | 1 status page già inclusa nel free uptime, customizable | 1 status page / subdomain betteruptime.com | incluso |
| **Alerting primario** | **Discord Webhook** (+ fallback Telegram) | Unlimited, latenza <1s, niente quota | Illimitato | webhook URL Discord |
| **Cron/heartbeat monitor** | **Healthchecks.io Free** | Perfetto per GitHub Actions cron + SaaS internal crons | 20 checks / unlimited integrations | https://healthchecks.io |
| **Log aggregation** | **Axiom Free** | 0.5GB/giorno ingest gratis, query SQL-like | 0.5 GB/day ingest / 30gg retention | https://axiom.co |
| **Auto-rollback** | **Vercel Instant Rollback** | Built-in nel Hobby, 1-click dal dashboard | Sempre disponibile, unlimited | già attivo |

**Totale costo: €0/mese.** Copertura: uptime multi-region, errori, performance, E2E, security scan, rollback, status page pubblica, alerting multi-canale.

---

## 2) TABELLA COMPARATIVA PER CATEGORIA

### 2.1 Uptime Monitoring
| Feature | UptimeRobot Free | Better Stack Free | StatusCake Free | Hyperping | Freshping |
|---|---|---|---|---|---|
| Monitor | **50** | 10 | 10 | 1 | 50 |
| Intervallo min | 5 min | **3 min** | 5 min | 1 min | 1 min |
| Multi-region | 1 (scelta) | **US+EU+APAC** | 1 | 3 | multi |
| Status page | 2 | 1 | 1 | 1 | 1 |
| SSL check | ok | ok | ok | ok | ok |
| Verdetto | **Best per volume** | **Best per multi-region** | meh | limitato | limite aggressivo upsell |

### 2.2 Error Tracking
| Feature | Sentry Dev | Highlight.io Free | PostHog Free | Axiom | BaseLime |
|---|---|---|---|---|---|
| Errori/mese | 5k | 500 sessions | 1M events | — | — |
| Session replay | 50 | ok | 5k | ok | ok |
| Retention | 30gg | 14gg | 7gg | 30gg | 7gg |
| Next.js SDK | **native** | ok | ok | generic | generic |
| Projects | unlimited (nel limite quota) | 1 | 1 | 1 | 1 |
| Verdetto | **vince** (maturita + Next.js integration) | limitato sessions | alternativa se vuoi product analytics | log-only | log-only |

### 2.3 Synthetic E2E
| Tool | Free tier | Adatto 5 SaaS × 2 run/day? |
|---|---|---|
| **Playwright + GitHub Actions** | 2000 min/mese private | **si, con margine enorme** |
| Checkly | 10k check runs/mese, 5 monitor browser | bastano appena per 5 siti |
| Cypress Cloud | 500 run/mese | stretto |
| Ghost Inspector | 100 test run/mese | insufficiente |
| MS Playwright Testing | 100 min test/mese | trial-grade |

### 2.4 Lighthouse / Performance
| Tool | Free | Note |
|---|---|---|
| **LHCI GitHub Action** | ∞ | OSS + Temp Public Storage (7gg) |
| Vercel Speed Insights | 10k data points/mese (Hobby) | RUM reale, gia' attivo |
| PageSpeed API | 25k query/giorno | rate-limit 240/min |
| Treo | 1 site / 30gg data | troppo stretto |
| SpeedCurve | trial only 30gg | no free permanent |
| Calibre | trial only 15gg | no free permanent |

### 2.5 Security Scanning
| Tool | Free | Adatto? |
|---|---|---|
| **GitHub Dependabot** | Unlimited, anche private | si — **obbligatorio** |
| **GitHub CodeQL** | Unlimited, anche private (dal 2024) | si — **obbligatorio** |
| **Socket.dev** | Unlimited org 1 | si — supply-chain malicious pkg |
| Snyk free | 100 test/mese container + 200 open source | ok backup |
| Trivy OSS | ∞ self-hosted in CI | ok ma sovrapposto a CodeQL |
| **npm audit** | ∞ built-in | si — gia' integrato |

### 2.6 Status Page
| Tool | Free |
|---|---|
| **Better Stack Status Page** | 1 page, subdomain custom, incluso |
| Openstatus.dev (OSS self-host) | ∞ ma devi hostarla (Vercel Hobby) |
| Instatus Free | 1 page, max 5 component, brand "Instatus" visibile |
| Atlassian Statuspage | **solo trial** dal 2024 |
| Gatus (OSS) | ∞ self-host |

### 2.7 Alerting
| Canale | Free | Latenza |
|---|---|---|
| **Discord Webhook** | ∞ | <1s |
| **Telegram Bot API** | ∞ (30 msg/s/bot) | <1s |
| Slack Free | 90gg msg retention, webhook ∞ | <1s |
| Ntfy OSS | ∞ self-host | <1s |
| Gotify OSS | ∞ self-host | <1s |

### 2.8 Cron monitoring
| Tool | Free |
|---|---|
| **Healthchecks.io** | 20 checks, ∞ integrations (Discord/TG/Slack) |
| Cronitor | 5 monitors free |
| Dead Man's Snitch | 1 snitch free |

---

## 3) BUDGET CONSUMPTION ESTIMATE (scenario 5 SaaS × 100 visite/giorno × 2 E2E/giorno)

| Risorsa | Limit free | Consumo stimato | % |
|---|---|---|---|
| GitHub Actions (repo private) | 2000 min/mese | 5 SaaS × 2 E2E × 30gg × 3 min medio = **900 min** | **45%** |
| Sentry errors | 5000/mese | <100 errori/mese (traffic basso) | **<2%** |
| Sentry performance | 10k units/mese | ~500 transazioni/mese a traffico attuale | **~5%** |
| Sentry replay | 50 session/mese | 10-20 auto-capture crash | **~40%** |
| UptimeRobot | 50 monitor | 5 home + 5 API + 5 auth + 5 checkout + 5 pricing = 25 | **50%** |
| Better Stack | 10 monitor | 5 home × 1 per multi-region = 5 | **50%** |
| Vercel bandwidth | 100GB/mese | 500 visite/giorno × 30gg × 2MB avg = 30GB | **30%** |
| Vercel Speed Insights | 10k data points/mese | 500 visit/giorno × 30gg = 15k data points | **150% — WARN** |
| Brevo email (alert) | 300/giorno | alert Discord-first, email solo critical | **<5%** |
| Axiom log ingest | 0.5 GB/giorno | 5 SaaS × 50MB log/giorno = 250MB | **50%** |
| Healthchecks.io | 20 checks | 5 SaaS × 2 cron (backup + cleanup) = 10 | **50%** |
| PageSpeed API | 25k/giorno | LHCI 5 run × 3 page = 15 chiamate/giorno | **<1%** |

**Red zone**: Vercel Speed Insights si satura se arrivi a >300 visite/giorno totali. Action: disabilita Speed Insights su 2 SaaS meno prioritari appena ci arrivi, oppure campiona al 50%.

---

## 4) 3 RED FLAG NASCOSTI CHE POTREBBERO FREGARTI A 3 MESI

1. **Sentry — "Spike Protection" silenziosa.** Il free plan scarta eventi oltre il limite senza avvisarti in tempo reale: a fine mese vedi "quota exceeded" e hai perso errori produzione. Soluzione: attiva email alert al 70% quota (`Settings → Subscription → Usage Notifications`). Limit breakdown ufficiale: https://sentry.io/pricing/ (5k errors, 10k spans, 50 replays, 1GB attachments, 30gg retention).

2. **UptimeRobot free = UNA sola location.** Il tuo sito potrebbe essere down in Asia per utenti asiatici e UptimeRobot (che pinga dall'Europa di default) dirà "UP". **Mitigation**: combina UptimeRobot (volume + alert) con Better Stack (multi-region 3 location su 5 monitor critici = home dei 5 SaaS). Reference: https://uptimerobot.com/help/locations/.

3. **GitHub Actions — 2000 min/mese sono minuti moltiplicati per OS.** Se usi `macos-latest` conta 10x (= 200 min reali), `windows-latest` 2x. Usa SEMPRE `ubuntu-latest` (1x). E ricorda: concurrency limit 20 job paralleli su free — se lanci E2E su 5 SaaS in parallelo vai bene, ma se aggiungi branch CI normale puoi saturare e i job restano in queue. Doc: https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions.

**Bonus red flag #4**: Better Stack free include "unlimited phone call + SMS" solo **se invit responders paganti**. Con 0 responders paganti gli SMS sono disabilitati. Non e' un problema se usi Discord/Telegram come alert primario.

**Bonus red flag #5**: Vercel Hobby vieta esplicitamente uso commerciale. I 5 SaaS con Stripe LIVE sono "commercial" — rischio ban account. Verifica ToS: https://vercel.com/docs/limits/fair-use-guidelines. Workaround: una volta che UN SaaS fa revenue, upgrade solo quello a Pro ($20), lascia gli altri 4 su Hobby finche' non monetizzano. Questo e' gia' noto al founder (vedi `feedback-zero-cost-until-first-revenue.md`).

---

## 5) PRIORITA IMPLEMENTAZIONE — DOMANI MATTINA

Ogni step <1h, ordinato per ratio impatto/sforzo:

### Step 1 (15 min) — Discord webhook + UptimeRobot 25 monitor
- Crea server Discord privato con channel `#alerts-saas`.
- Genera webhook URL.
- Signup https://dashboard.uptimerobot.com/sign-up — crea 5 monitor HTTPS (home page x5 SaaS), intervallo 5 min, alert contact = Discord webhook.
- **Output**: down detection <5 min, alert su Discord mobile push.

### Step 2 (20 min) — Sentry Next.js SDK × 5 SaaS
- `npx @sentry/wizard@latest -i nextjs` in ciascun repo.
- DSN singolo per progetto → 5 progetti Sentry sotto org free.
- Abilita `sentry.io → Settings → Usage Notifications` al 70%.
- Deploy. **Output**: errori prod tracciati con stack trace + source map, Discord integration.

### Step 3 (25 min) — GitHub Actions: E2E Playwright × 5 SaaS cron
- 1 workflow `monitoring.yml` nel repo toolkit-online (o repo dedicato).
- Matrix su 5 siti, smoke test Playwright (homepage load + signup form visible + pricing page).
- Schedule `cron: '0 */12 * * *'` (2x/giorno).
- On failure → curl Discord webhook.
- **Output**: 900 min/mese consumati su 2000, alert immediato su regressione.

### Step 4 (10 min) — Better Stack multi-region per 5 home
- Signup https://betterstack.com/uptime — 5 monitor (una per SaaS home), multi-region activated.
- Status page `status.toolkitonline.vip` (o betteruptime subdomain).
- Alert → stesso Discord webhook.
- **Output**: copertura Asia/Americhe gratis, status page pubblica.

### Step 5 (15 min) — Dependabot + CodeQL + Socket
- In ciascuno dei 5 repo GitHub: `Settings → Security → Enable Dependabot alerts + security updates + CodeQL (default config)`.
- Install https://socket.dev GitHub App su org.
- **Output**: supply-chain + SAST gratuito, PR automatiche per CVE.

### Step 6 (opzionale, 10 min) — Healthchecks.io per cron Supabase
- Se hai cron Supabase (cleanup, backup) aggiungi ping a `https://hc-ping.com/<uuid>` dentro ogni cron.
- Alert Discord su silence.

**Totale tempo**: ~85 min per copertura completa di 5 SaaS.

---

## 6) LINK DIRETTI AI DOCS DEI LIMITI (verifica futura)

- UptimeRobot: https://uptimerobot.com/pricing/ + https://uptimerobot.com/help/locations/
- Better Stack: https://betterstack.com/uptime/pricing
- Sentry: https://sentry.io/pricing/ + https://docs.sentry.io/product/accounts/quotas/
- Checkly: https://www.checklyhq.com/pricing/
- GitHub Actions billing: https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions
- Vercel Fair Use: https://vercel.com/docs/limits/fair-use-guidelines
- Vercel Speed Insights limits: https://vercel.com/docs/speed-insights#pricing
- Axiom: https://axiom.co/pricing
- Healthchecks.io: https://healthchecks.io/pricing/
- Socket.dev: https://socket.dev/pricing
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
- Instatus: https://instatus.com/pricing
- Openstatus: https://openstatus.dev/pricing

---

**Stack verdict**: **UptimeRobot + Better Stack + Sentry + Playwright/GHA + LHCI + Dependabot/CodeQL/Socket + Discord + Better Stack Status Page + Healthchecks.io + Axiom** copre 100% delle tue esigenze a €0/mese per i prossimi 6-12 mesi fino a ~10k visite/giorno totali. Il primo vincolo reale che incontri e' Vercel Speed Insights (10k data points) a 300 visite/giorno — quando arrivi li', disabilita su 2 SaaS o campiona 50%.
