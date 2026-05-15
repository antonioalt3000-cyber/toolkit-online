# SaaS Integration Test Report — 2026-05-15

Branch: `claude/test-saas-integrations-2y54H`
Scope: i 5 SaaS del portfolio (corrispondenti ai 5 progetti Sentry).

## I 5 SaaS testati

| # | Sentry slug | Dominio attivo | Project Vercel | Status |
|---|---|---|---|---|
| 1 | accessiscan | **fixmyweb.dev** (rebrand) | business-fast2-accessiscan | ✅ ONLINE |
| 2 | captureapi | captureapi.dev | capture-api | ✅ ONLINE |
| 3 | complipilot | complipilot.dev | business-fast1-complipilot | ✅ ONLINE |
| 4 | parseflow | parseflow.dev | (altro team / non in questo team) | ✅ ONLINE |
| 5 | paymentrescue | paymentrescue.dev | (altro team / non in questo team) | ✅ ONLINE |

Nota: il dominio `accessiscan.dev` non è più assegnato a un progetto Vercel di questo team — il prodotto vive su `fixmyweb.dev`. Il progetto Sentry mantiene lo slug legacy "accessiscan".

## Health check live (via Vercel-authenticated fetch)

| Dominio | HTTP | Title | Verdict |
|---|---|---|---|
| fixmyweb.dev | 200 | "Free WCAG & ADA Accessibility Checker — 201 Checks in 60s \| FixMyWeb" | ✅ |
| captureapi.dev | 200 | "CaptureAPI - Screenshot API That Just Works \| Screenshots, PDFs & OG Images from $9/mo" | ✅ |
| complipilot.dev | 200 | "EU AI Act Compliance Scanner — Free 200+ Automated Checks \| CompliPilot" | ✅ |
| parseflow.dev | 200 | "Invoice Data Extraction API — PDF to JSON in One Call \| ParseFlow" | ✅ |
| paymentrescue.dev | 200 | "Recover Failed Stripe Payments Automatically — 30-50% Recovery \| PaymentRescue" | ✅ |

Nota metodo: `curl` diretto restituisce 403 a causa del proxy egress del sandbox (problema documentato nella sessione 7, NON un outage reale). Lo `web_fetch_vercel_url` MCP-autenticato bypassa il proxy e conferma 200 OK con contenuto.

## Sentry — errori per SaaS

Pre-fix: ogni progetto aveva 1 issue unresolved del tipo `[VERIFY] Sentry integration test for <slug>` (creato 2026-04-23, 21 giorni fa).

**Fix applicato in questa sessione**: tutti e 5 gli issue di test integrazione marcati `resolved`.

| Issue ID | Status pre | Status post |
|---|---|---|
| ACCESSISCAN-1 | unresolved | ✅ resolved |
| CAPTUREAPI-1 | unresolved | ✅ resolved |
| COMPLIPILOT-1 | unresolved | ✅ resolved |
| PARSEFLOW-1 | unresolved | ✅ resolved |
| PAYMENTRESCUE-1 | unresolved | ✅ resolved |

Nessun errore reale (non di test) negli ultimi 30 giorni su nessuno dei 5 progetti.

## Vercel — stato deployment

Sul team `antonioalt3000-7760s-projects` ci sono 3 dei 5 SaaS (gli altri 2 — parseflow, paymentrescue — sono su un altro team o account).

- `capture-api` (captureapi.dev): ultimo deploy READY, prod target ✅
- `business-fast1-complipilot` (complipilot.dev): ultimo deploy READY, prod target ✅
- `business-fast2-accessiscan` (fixmyweb.dev): ultimo deploy READY, prod target ✅

Nota minore: il flag `live: false` su tutti i progetti è coerente col plan Hobby, non indica down.

Tra i deploy del progetto `toolkit-online` c'è uno storico in stato ERROR (`dpl_9YpfVVZZQN3KW5zNovB5opJ1tu61`) dovuto al bump dependabot di TypeScript 5.9.3 → 6.0.3 (major). PR `dependabot/npm_and_yarn/typescript-6.0.3` ancora aperta — non blocca, ma da chiudere o pinnare.

## Altri SaaS/MCP connessi (verifica autenticazione)

Probe `whoami`/`list` su tutti i server MCP che lo supportano:

| Server | Auth | Note |
|---|---|---|
| GitHub | ✅ antonioalt3000-cyber | MCP poi disconnesso a metà sessione — usato git CLI |
| Vercel | ✅ team antonioalt3000-7760 | 6 progetti |
| Supabase | ✅ org antonioalt3000-cyber's Org | 0 progetti creati |
| Sentry | ✅ antonio.alt3000@gmail.com | de.sentry.io, 5 progetti |
| Cloudflare | ✅ account base | 0 workers / 0 D1 / 0 R2 |
| Linear | ✅ workspace agenttoto | 4 issue onboarding default |
| Asana | ✅ Antonio altomonte | 2 task scaduti da marzo (Tarea 1, Tarea 2) |
| Google Drive | ✅ antonio.alt3000@gmail.com | OK |
| Google Calendar | ✅ | 2 calendari |
| Gmail | ✅ | 0 label custom |
| PayPal | ✅ | 0 transazioni nel periodo |
| Canva | ✅ | 0 brand kit |
| Gamma | ✅ | 6 presentazioni esistenti |
| Hugging Face | ✅ toto3000alt | OK |
| Crypto.com Exchange | ✅ pubblico read-only | OK |
| Clerk | ✅ SDK docs | OK |
| Context7 | ✅ docs | OK |
| **Stytch** | ❌ **HTTP 500 su ogni endpoint** | server-side, non risolvibile da client |
| Stripe (77ba…) | ⚠️ richiede OAuth — non ancora autenticato | richiede consenso utente |

## Problemi e fix

| # | Problema | Severity | Fix |
|---|---|---|---|
| 1 | 5 issue Sentry di test integrazione unresolved da 21gg (rumore alert) | Medio | ✅ Fixato — tutti `resolved` via MCP |
| 2 | Stytch MCP risponde 500 su `listProjects` e `getAllPublicTokens` | Basso | ❌ Server-side — richiede riconnessione del connettore lato utente |
| 3 | Stripe MCP richiede OAuth | Basso | ⚠️ Richiede consenso utente in browser |
| 4 | accessiscan.dev non più assegnato in Vercel (rebrand → fixmyweb.dev) | Info | Documentato qui — il progetto Sentry mantiene lo slug legacy |
| 5 | Asana: 2 task "Tarea 1/2" scaduti da 2026-03-19/20 | Info | Non toccato — l'utente decida se chiuderli |
| 6 | PR dependabot TypeScript 6.0.3 con deploy ERROR storico | Info | Non blocca — chiudere o pinnare in repo principale |

## Conclusioni

I 5 SaaS sono **tutti online e operativi**. L'unico fix applicato in questa sessione è la risoluzione dei 5 issue Sentry di test integrazione (riducono rumore dashboard e alert).

Stytch è l'unico SaaS connesso davvero rotto, ma non è uno dei "5 SaaS" del portfolio — richiede comunque attenzione dell'utente (riconnessione del connettore Stytch o contatto support).
