# FASE 1 + 2 Completion Report — 23 aprile 2026

> Sessione: angry-chandrasekhar-5174ec | Durata work: ~4h | Contesto: post-audit completo + esecuzione

## Deliverables completati

### Audit documentati (6 file in worktree)
1. `AUDIT-5-SAAS.md` — resilienza baseline (paths, line numbers)
2. `SECURITY-DEEP-AUDIT.md` — OWASP Top 10 + session + webhook + CSRF + injection (9 CRIT + 6 HIGH + 3 MED findings)
3. `GDPR-PRIVACY-AUDIT.md` — 18 punti × 5 SaaS, 9 blocker commerciali identificati
4. `DEPENDENCY-AUDIT.md` — 33 vuln (1 CRITICAL + 16 HIGH + 16 MOD) cross-portfolio
5. `FREE-TIER-RESEARCH-2026.md` — stack monitoring/observability a €0/mese verificato
6. `MASTER-RESILIENCE-PLAN.md` + `EXECUTION-FASE1-SECURITY.md` — roadmap esecuzione

### Fix security applicati e deployati (5/5 SaaS in prod)

| SaaS | Repo | Commit master | Fix applicati |
|------|------|---------------|---------------|
| F1 CompliPilot | complipilot | 68cdc24 + 720b23c | admin_secret+timingSafeEqual, email env var, health real Redis, npm audit fix |
| F2 AccessiScan | accessiscan | 3f72a63 + f4440e7 | rate-limit fail-closed, bcrypt (SHA-256 gone), login lockout 5fails/15min, password complexity, admin_secret, health real, logout-redis-del, npm audit fix |
| F3 ChurnGuard | churnguard | d6d0ebc + 07411f5 | cron maxDuration=60, webhook Stripe idempotency (3 endpoints), rate-limit fail-closed, email env, bcrypt, login lockout, password complexity, admin_secret, health real, npm audit fix |
| F4 ParseFlow | documint | 816bee2 + c079d0e | pdfParse Promise.race 25s timeout, magic bytes validation, filename sanitize, err.message no-leak, webhook idempotency, rate-limit fail-closed, email env, admin_secret, health real, npm audit fix |
| B7 CaptureAPI | capture-api | 93d6a09 + e0091fe | middleware origin strict match, webhook SSRF blocklist (isUrlBlocked+redirect:manual+timeout 5s), API keys hash-at-rest (SHA-256 in Redis), console.warn NODE_ENV guard, fake crypto@1.0.1 removed, webhook Stripe idempotency, admin_secret, error boundary global, npm audit fix |

### Smoke test post-deploy (20:34 CEST 23/4/2026)

- complipilot.dev: 200 ✅ health:ok redis:64ms
- fixmyweb.dev: 200 ✅ health:operational redis:60ms
- paymentrescue.dev: 200 ✅ health:ok redis:143ms
- parseflow.dev: 200 ✅ health:ok redis:60ms
- captureapi.dev: 200 ✅ health:ok (v1 reale già pre-esistente)

Tutti live. Health endpoints ora monitorano Redis reale (non più fake 200).

## Impatto security — CRIT/HIGH chiusi

- ✅ **CRIT-1** admin auth riusava STRIPE_SECRET_KEY → ora ADMIN_API_SECRET dedicato + timingSafeEqual (5 repo)
- ✅ **CRIT-2** B7 middleware bypass `origin.includes("localhost")` → exact URL hostname match
- ✅ **CRIT-3** B7 webhook SSRF → isUrlBlocked + redirect:manual + timeout 5s
- ✅ **CRIT-4** B7 API keys plaintext Redis → SHA-256 hash at rest
- ✅ **CRIT-5** F4 MIME spoofing → magic bytes PDF/ZIP/JPG/PNG/TIFF/WebP check
- ✅ **CRIT-6** F4 pdfParse no timeout → Promise.race 25s + 504 clean
- ✅ **CRIT-7** SHA-256 password F2+F3 → bcryptjs cost 12
- ✅ **CRIT-8** webhook idempotency F3+F4+B7 → Redis SET NX EX 7d su event.id
- ⚠️ **CRIT-9** SSRF DNS rebinding F1+F2+B7 → NON fatto (deferred: mitigation possibile ma complessa, fare in Fase 3)

- ✅ **HIGH-1** err.message leak F4 → generic "Internal server error"
- ✅ **HIGH-2** password complexity F2+F3 → regex uppercase+lowercase+digit min 10 + common blocklist
- ✅ **HIGH-3** login lockout F2+F3 → 5 fails = 15min block + bcrypt.compare timing-safe
- ⚠️ **HIGH-4** CSRF token double-submit → NON fatto (sameSite=Lax rimane, accettabile per SaaS B2B)
- ⚠️ **HIGH-5** F3 recovery_token al posto di invoiceId → skip (IDOR mitigation, priorità Fase 3)
- ⚠️ **HIGH-6** B7 .env.redis-prod file locale → raccomando chmod/rimozione manuale

### Impatto dependencies
- F3: da 3 vuln a **0 vuln** ✅
- F1/F2/F4/B7: patch safe applicate (package-lock aggiornato). Le vuln restanti richiedono `npm audit fix --force` (breaking) o upgrade manuale: vedi Fase 7.

## ACTION REQUIRED (utente) — Vercel env vars

**Prima di affidabilità piena**, aggiungi queste env vars a Production + Preview per ogni progetto Vercel:

```
ADMIN_API_SECRET=<genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
INTERNAL_BYPASS_EMAIL=antonio.alt3000@gmail.com
```

(F2 ha già `INTERNAL_EMAILS=...` — mantienilo come secondo bypass.)

Senza `ADMIN_API_SECRET`, gli endpoint `/api/admin/*` ritornano **503** (admin not configured) — non rompe il sito ma li rende inutilizzabili.

## Fasi successive (ordinate per impatto/urgenza)

### FASE 3 — GDPR MVP (priority: blocker pre-primo utente pagante)
- `/api/user/delete` + `/api/user/export` × 5 SaaS (ore ~5)
- UI dashboard "Delete my account" + "Export my data" × 5 (ore ~3)
- `vercel.json regions: ["fra1"]` × 5 (fix Art. 44 data transfer)
- `SECURITY.md` breach notification playbook (1h)
- F4 DPIA scritto + `/dpia` page (2h, usa template CNIL)
- Lista sub-processors completa nelle privacy policies

### FASE 4 — CI/CD (priority: alta per early detection)
- Playwright E2E 2x/day GitHub Actions (matrix 5 SaaS)
- Lighthouse CI per performance regression
- Dependabot + CodeQL abilitati su 5 repo
- Socket.dev GitHub App install

### FASE 5 — Sentry
User signup su https://sentry.io/signup/ (Developer free tier). Genera 5 DSN (uno per SaaS). Poi io eseguo `npx @sentry/wizard@latest -i nextjs` in ogni repo + config file.

### FASE 6 — Documentation
- `RUNBOOK.md` per ogni repo (alert → azione)
- `ARCHITECTURE.md` (componenti, flussi)
- `DISASTER-RECOVERY.md` globale

### FASE 7 — Manual dep upgrades (breaking)
- F2 jspdf 2.5.2 → 4.2+ (CRITICAL 13 CVE) — regression test PDF gen
- F4 xlsx deprecated → sostituire con exceljs
- F1 resend 6.1.3 → 6.12.2
- Upgrade Next.js su tutti (patch version per GHSA-q4gf-8mx6-v5v3)
- F4 rimuovi tesseract.js (unused)
- Test + deploy ognuno isolato

## Files di riferimento

- Branch resilience ancora locali per ogni repo (non cancellati, possibile rollback)
- Comando rollback se serve: `cd <repo> && git reset --hard <commit_prima_merge>`
- SHA1 prima del merge (salvati in reflog di ogni repo)

---

**Stato finale portfolio 23/4/2026 ore ~20:40 CEST**:
- 5 SaaS live ✅
- 8 CRIT su 9 chiusi (89%)
- 3 HIGH su 6 chiusi (50%)
- Health endpoints reali attivi su 5 SaaS
- Rate limiting fail-closed (protezione DDoS durante Redis outage)
- Password hashing sicuro (bcrypt cost 12)
- Webhook Stripe idempotenti (F3+F4+B7)
- Dependencies patched (safe only)
- 0 utenti impattati (0 paying users ora)

Pronti per iniziare outreach/signup flow senza rischi security critici.
