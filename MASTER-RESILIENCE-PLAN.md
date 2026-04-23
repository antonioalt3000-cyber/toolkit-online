# Master Resilience Plan — 5 SaaS DevToolsmith

> **Creato**: 23 aprile 2026 sera
> **Obiettivo**: sistema self-healing per F1/F2/F3/F4/B7, zero downtime utente, 2x test giornalieri, auto-rollback
> **Budget**: €0/mese — free tier only
> **Basato su**: `AUDIT-5-SAAS.md` (audit code) + `FREE-TIER-RESEARCH-2026.md` (tool research)

---

## 🎯 Principi guida

1. **Zero bug non esiste** → detection veloce + recovery automatico + alert utile
2. **No auto-fix AI in prod** → detect → alert → PR con fix proposto → approvazione utente → deploy
3. **Auto-rollback SI** → health check fallisce post-deploy = revert immediato via Vercel
4. **Zero costi extra** → se una feature richiede pagamento, STOP e chiedo
5. **Layer additivo** → aggiungo monitoring/resilienza, non riscrivo business logic
6. **PR isolate** → ogni fase = 1 branch = 1 PR = 1 commit set coerente

---

## 🔴 Fase 0 — FIX CRITICI SECURITY (priorità assoluta)

> ⚠️ **Prima di monitorare, chiudere le falle.** Monitorare un sistema insicuro è utile ma un attacco attivo è più grave di un bug di UX.

| # | Problema | Repo | Impatto | Effort |
|---|----------|------|---------|--------|
| 0.1 | Password hash SHA-256 → bcrypt/argon2 | F3, F4, B7 | 🔴 Critico — rainbow table attack | 2h/repo + migrazione utenti esistenti |
| 0.2 | Rate limiter fail-open | F1, F2, F3, F4, B7 | 🔴 DDoS se Redis giù | 15 min/repo |
| 0.3 | OCR tesseract.js senza timeout | F4 | 🟠 Function kill su PDF grande = user 500 | 10 min |
| 0.4 | Error boundary globale mancante | B7 | 🟠 Crash page intera | 15 min |
| 0.5 | Health endpoints fake-positive | F1, F2, F3, F4 | 🟠 Monitoring non rileva down reali | 20 min/repo |

**Tempo totale Fase 0**: ~12-15h (gran parte è migrazione password)
**Branch suggeriti**: `security/password-hash-migration` (1 per repo), `security/rate-limiter-fail-closed`

---

## 🟡 Fase 1 — MONITORING INFRASTRUCTURE (zero rischio)

> Tutto esterno ai repo. Nessun codice di produzione toccato. Immediatamente utile.

### 1.1 Setup iniziale (user action)
- [ ] Creare server Discord privato "DevToolsmith Ops"
- [ ] Channel `#alerts-critical`, `#alerts-warn`, `#deploys`
- [ ] Genera webhook URL (copia in `portfolio-config.md`)

### 1.2 UptimeRobot (50 monitor free, 5min interval)
- [ ] Signup con `antonio.alt3000@gmail.com`
- [ ] 25 monitor totali (5 SaaS × 5 endpoint: home, /api/health, /pricing, /signup, /api/ principale)
- [ ] Alert contact = Discord webhook
- [ ] 2 status page (B2B-facing + internal)

### 1.3 Better Stack (10 monitor free, multi-region)
- [ ] Signup — completa buco Asia/Americhe di UptimeRobot (solo EU)
- [ ] 5 monitor critici (home × 5 SaaS) multi-region
- [ ] Status page pubblica `status.toolkitonline.vip` custom domain
- [ ] Alert → stesso Discord

### 1.4 Healthchecks.io (20 cron monitor free)
- [ ] Signup
- [ ] Monitoraggio cron Supabase (se esistono) + cron GitHub Actions
- [ ] Alert silence → Discord

### 1.5 Axiom Logs (0.5 GB/giorno free)
- [ ] Signup
- [ ] Token API per `@axiomhq/nextjs` SDK (installazione in Fase 2)

**Tempo Fase 1**: ~60 min (tutto user action)
**Rischio**: 0 — nessun codice toccato

---

## 🟢 Fase 2 — OBSERVABILITY IN-APP

### 2.1 Sentry SDK × 5 repo
- `npx @sentry/wizard@latest -i nextjs` in ogni repo
- DSN singolo per progetto → 5 progetti Sentry nell'org free
- Config `sentry.server.config.ts` + `sentry.client.config.ts` + `sentry.edge.config.ts`
- Source map upload automatico in build
- `Sentry.captureException` nei catch block esistenti (audit: F2, F3 hanno solo `console.error`)
- **Tuning**: sample rate 100% errors, 10% performance, 5% session replay

### 2.2 /api/health endpoints REALI
Per ogni SaaS, endpoint `/api/health` che:
- Ping DB (Supabase `SELECT 1`)
- Ping Redis (Upstash `PING`)
- Ping Stripe (`account.retrieve()` se F3/altri)
- Return JSON `{ status: "ok|degraded|down", checks: { db, redis, stripe }, timestamp }`
- HTTP 200 se tutto OK, 503 se un check fallisce
- **Copia pattern esistente di B7** (già buono, secondo audit)

### 2.3 /api/ready endpoint
- Stessa cosa più leggera, senza Stripe (probe Kubernetes-style)
- Usato da Vercel per readiness check post-deploy

### 2.4 Error boundary globale
- Aggiungere `app/error.tsx` dove manca (B7 confermato)
- Aggiungere `app/global-error.tsx` per root errors
- Logging Sentry + fallback UI utente

### 2.5 Structured logging
- `@axiomhq/nextjs` SDK in ogni repo
- JSON log con `request_id` correlato
- Sostituire `console.log` sparso con logger strutturato

**Tempo Fase 2**: ~5h totali (1h/repo)
**Branch**: `observability/sentry+health+logging` per repo

---

## 🔵 Fase 3 — AUTOMATED TESTING 2X/GIORNO

### 3.1 Playwright E2E smoke — ogni 12h
**Repo**: toolkit-online (centralizzato) o repo dedicato `devtoolsmith-monitoring`

Per ogni SaaS, test Playwright che:
1. Carica home
2. Verifica form signup visibile
3. Verifica pricing page + Stripe checkout link presente
4. Verifica API principale risponde JSON valido (non HTML 500)
5. Screenshot su fallimento

Workflow `.github/workflows/e2e-2x-daily.yml`:
- `cron: '0 5,17 * * *'` (05:00 e 17:00 UTC = mattina EU + sera EU/mattina Americas)
- Matrix 5 SaaS in parallelo
- On failure → Discord webhook + GitHub Issue auto-open
- Screenshots + HAR file come artifact

**Consumo**: ~6 min × 2 run × 5 SaaS = 60 min/giorno = 1800 min/mese (90% free tier — tight)
**Ottimizzazione**: matrix con `max-parallel: 5`, test stessi 5 siti in 1 job invece di 5 job = 12 min totale × 2 run/giorno × 30gg = 720 min (36%)

### 3.2 Lighthouse CI — ogni 24h
- Workflow `.github/workflows/lighthouse-ci.yml`
- Test performance + SEO + a11y + best practices per 5 home
- Fail se score <80 performance, <90 a11y (F2 è accessibility-focused → soglia alta)
- Storico via Temporary Public Storage (7gg)

### 3.3 Security scan — ogni 24h
- Dependabot: già built-in, abilitare su 5 repo
- CodeQL: abilitare su 5 repo (gratis anche private)
- Socket.dev: install GitHub App su org
- `npm audit` in workflow Playwright — fail su high/critical

### 3.4 SSL cert check — già in `weekly-e2e-deep.yml` ✅
- Già implementato oggi, alert se <14gg validità

**Tempo Fase 3**: ~3h setup + 1h fine-tuning
**Branch**: `ci/e2e-testing-2x-daily`

---

## 🟣 Fase 4 — AUTO-HEALING

### 4.1 Auto-rollback Vercel
- Vercel Instant Rollback: già built-in, configurazione via UI
- Trigger: health check post-deploy fallisce entro 90s → revert
- Alert Discord + email al founder

### 4.2 Known-issues remediation
- Crea `known-issues.md` in ogni repo con pattern errore → azione:
  - "redis connection failed" → clear cache, restart function
  - "supabase 503" → retry 3x, poi fallback mode
  - "stripe timeout" → queue retry
- Script `scripts/auto-remediate.js` che applica remediation note

### 4.3 Auto-PR su bug nuovo
- Workflow `.github/workflows/bug-triage.yml`
- Quando E2E fallisce con pattern nuovo (non in known-issues):
  - Raccogli log ultimi 15 min da Axiom
  - Scrivi Issue con stack trace + screenshots + metriche
  - Tag `@antonioalt3000-7760` per review

**Tempo Fase 4**: ~2h

---

## 📝 Fase 5 — DOCUMENTAZIONE

### 5.1 `RUNBOOK.md` per repo
Cosa fare per ogni tipo di alert:
- Discord alert "home 500" → check Vercel status, deploy rollback se necessario
- Discord alert "redis down" → check Upstash console, bypass temporaneo
- Discord alert "stripe 503" → check status.stripe.com, failover LTD link

### 5.2 `ARCHITECTURE.md` per repo
- Diagramma componenti (Next.js, Supabase, Upstash, Stripe, ecc.)
- Flussi critici (signup, checkout, scan principale)

### 5.3 `DISASTER-RECOVERY.md` globale
- Se tutto esplode: ordine restore (DB → deploy → DNS)
- Contatti emergenza (Vercel support, Supabase support)
- Backup location e procedura restore

**Tempo Fase 5**: ~2h

---

## 📊 Sintesi tempo totale

| Fase | Tempo | Rischio | User action |
|------|-------|---------|-------------|
| 0 - Security critical | 12-15h | 🔴 Alto (migrazione utenti) | Review SQL migration |
| 1 - Monitoring infra | 60 min | 🟢 Zero | Discord + signup 3 servizi |
| 2 - Observability | 5h | 🟡 Basso | Review PR |
| 3 - CI testing | 3h | 🟢 Zero (solo CI) | Review PR |
| 4 - Auto-healing | 2h | 🟡 Basso | Config Vercel rollback |
| 5 - Docs | 2h | 🟢 Zero | Review docs |
| **TOTALE** | **~25h** | | |

## 🎯 Ordine di esecuzione raccomandato

**Questa sera (2-3h)**:
1. ✅ Audit + Research done (DONE)
2. Fase 1.1 — Discord server setup (5 min user)
3. Fase 0.2 — Rate limiter fail-closed (75 min total × 5 repo, PR)
4. Fase 0.4 — Error boundary B7 (15 min, PR)
5. Fase 0.3 — OCR timeout F4 (10 min, PR)

**Domani mattina (3-4h)**:
6. Fase 1.2-1.5 — Tutti signup + config (user action 45 min)
7. Fase 0.5 — Health endpoints reali (5 PR)

**Dopodomani (4-5h)**:
8. Fase 2.1 — Sentry × 5 repo
9. Fase 3.1 — Playwright E2E 2x/day

**Settimana 1 fine (5-7h)**:
10. Fase 0.1 — Password hash migration (LA PIÙ RISCHIOSA, richiede migrazione DB)
11. Fase 2.2/2.3 — /api/health + /api/ready reali
12. Fase 3.2/3.3 — Lighthouse + security scan
13. Fase 4 — Auto-healing
14. Fase 5 — Docs

## 🚦 Decision points — utente

Prima di iniziare serve conferma su:

1. **Password migration (0.1)**: come gestire utenti esistenti? Opzioni:
   - A) Force re-login → re-hash al primo login (più sicuro, disagio utente)
   - B) Background job migrate tutti gli hash (più veloce, richiede decrypt SHA-256 impossibile, quindi A è obbligatorio)
   - → **Scelta obbligatoria A**. Ma numero utenti impatted?

2. **Discord**: server già esistente o crearne uno nuovo?

3. **Vercel Hobby ToS**: 5 SaaS Stripe LIVE = rischio ban account. Piano:
   - Upgrade Pro $20/mo sul PRIMO SaaS che fa revenue reale
   - Altri 4 restano Hobby finché free
   - **Accettabile?**

4. **Playwright E2E**: 90% free tier consumato → spazio stretto per altri workflow. OK?

---

**File companion**: `AUDIT-5-SAAS.md`, `FREE-TIER-RESEARCH-2026.md`
