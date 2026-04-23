# AUDIT-5-SAAS — Resilienza, Monitoring, Self-Healing
**Data**: 2026-04-23 | **Revisore**: audit agent angry-chandrasekhar | **Budget fix**: ZERO costi aggiuntivi

---

## F1 — CompliPilot (`C:\Users\ftass\business-fast1-complipilot\`)

### 1. Struttura base
- **`/api/health`**: presente in `src/app/api/health/route.ts` — runtime edge, risponde `{status:"ok", service:"complipilot", timestamp}`. Non testa Redis, Stripe o dipendenze reali. Fake-positive.
- **Error boundary**: `src/app/error.tsx` — presente, con reset button. Il blocco `useEffect` ha commento placeholder `// Log to analytics in production` senza implementazione effettiva.
- **Error tracking esterno**: nessuno (no Sentry, no LogRocket).
- **Logging**: zero `console.log/error` nel source. Nessun logging strutturato JSON.

### 2. Resilienza endpoint API
- **Endpoint**: `/api/health`, `/api/scan`, `/api/plan`, `/api/checkout`, `/api/webhook`, `/api/auth/register`, `/api/admin/coupon-stats`, `/api/redeem`, `/api/google-verification`
- **Timeout fetch**: `src/app/api/scan/route.ts` righe 3623-3637 — `AbortController` con 15 000ms + SSRF protection su hostname privati. Corretto.
- **Retry logic**: minima, solo in `/api/auth/register`.
- **Circuit breaker**: assente.
- **Rate limiting**: Upstash Ratelimit in `src/lib/rate-limit.ts` — fallback in-memory (NON fail-open). Se Redis e' assente usa `fallbackMap` (Map locale). Comportamento sicuro.
- **Input validation**: Zod usato solo in `/api/scan`. Altri endpoint: validazione manuale inline.
- **NOTA CRITICA**: auth e' puramente client-side via localStorage (`src/lib/auth.ts`). Nessuna password server-side, nessuna sessione su Redis. Token = UUID nel browser. Un attaccante puo' bypassare i limiti svuotando localStorage.

### 3. Security
- **Security headers** (`next.config.ts`): CSP completa con GTM/Analytics/AdSense, HSTS max-age=63072000 con preload, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. `unsafe-inline` in script-src (necessario per GTM).
- **Secrets hardcoded**: nessuno trovato. Email interna `"antonio.alt3000@gmail.com"` in `src/lib/rate-limit.ts` riga 17 — non e' un secret ma dovrebbe essere env var.
- **CORS**: non configurato esplicitamente. Nessun middleware.
- **Password hashing**: N/A — auth localStorage-only.

### 4. Monitoring
- `.github/workflows/`: nessuno nel repo.
- `vercel.json`: assente.
- README runbook: non rilevato.

### 5. Deploy config
- Build command: `next build` standard.
- No cron, no `maxDuration` a livello progetto.
- Next.js 16.2.1.

### 6. Test esistenti
- Zero file `.test.ts` o `__tests__/` nel source.
- Nessun test script in `package.json`.

### 7. Database / storage
- Upstash Redis via `src/lib/redis.ts` — `getRedis()` ritorna `null` se env vars mancano (fallback null, non crash). Auth e scan count su Redis.
- Nessun Supabase, nessun DB SQL.

---

## F2 — AccessiScan/FixMyWeb (`C:\Users\ftass\business-fast2-accessiscan\`)

### 1. Struttura base
- **`/api/health`**: `src/app/api/health/route.ts` — identico a F1. Runtime edge, fake-positive.
- **Error boundary**: `src/app/error.tsx` — presente.
- **Error tracking**: nessuno.
- **Logging**: zero console nel source.

### 2. Resilienza endpoint API
- **Endpoint**: `/api/health`, `/api/scan`, `/api/checkout`, `/api/webhook`, `/api/auth/{signup,login,logout,me,scans}`, `/api/admin/coupon-stats`, `/api/redeem`, `/api/google-verification`
- **Timeout fetch**: `src/app/api/scan/route.ts` e `src/lib/scanner.ts` — AbortController presente.
- **Retry logic**: assente.
- **Circuit breaker**: assente.
- **Rate limiting**: `src/lib/rate-limit.ts` — **FAIL-OPEN al catch** (riga 66: `return { success: true, remaining: 999, limit: 999 }`). Se Redis e' down o errore, tutte le richieste passano. Sliding window 10 req/giorno.
- **Email bypass**: `src/lib/rate-limit.ts` righe 36-37 — bypass da env var `INTERNAL_EMAILS` (corretto, non hardcoded).
- **Input validation**: nessun Zod. Validazione inline manuale.

### 3. Security
- **Security headers** (`next.config.ts`): manca `Permissions-Policy` rispetto a F1. Manca `X-DNS-Prefetch-Control`. `frame-ancestors 'none'` non esplicito nella CSP. Altrimenti buono.
- **Secrets hardcoded**: nessuno.
- **CORS**: nessun middleware. Nessuna configurazione esplicita.

### 4. Monitoring
- `.github/workflows/`: nessuno. `vercel.json`: assente.

### 5. Deploy config
- Next.js 15.1.0. No cron, no maxDuration.

### 6. Test / 7. Database
- Zero test. Upstash Redis con fail-open su catch.

---

## F3 — ChurnGuard/PaymentRescue (`C:\Users\ftass\business-fast3-churnguard\`)

### 1. Struttura base
- **`/api/health`**: `app/api/health/route.ts` — runtime edge, fake-positive identico agli altri.
- **Error boundary**: `app/error.tsx` — presente, mostra `error.digest` (ID tracciabile).
- **Error tracking**: nessuno.
- **Logging**: zero console nel source.

### 2. Resilienza endpoint API
- **Endpoint**: `/api/health`, `/api/checkout`, `/api/webhook`, `/api/webhooks/{stripe,lemonsqueezy,recovery-event}`, `/api/stripe/{billing-webhook,checkout,connect,connect/callback}`, `/api/auth/{signup,login,logout}`, `/api/dashboard`, `/api/admin/coupon-stats`, `/api/cron/dunning`, `/api/redeem`, `/api/update-payment/[invoiceId]`
- **Timeout**: presente solo in `app/api/webhooks/recovery-event/route.ts`. Il cron `/api/cron/dunning` esegue SCAN iterativo su Redis su tutti gli utenti senza timeout — nessun `maxDuration` dichiarato nell'endpoint. Su piano Vercel Hobby il default e' 10s; con molti utenti il cron puo' essere killato a meta'.
- **Retry logic**: webhook Stripe gestisce idempotenza via Stripe SDK. Recovery event ha retry nel codice.
- **Circuit breaker**: assente.
- **Rate limiting**: `lib/rate-limit.ts` — **FAIL-OPEN al catch** (riga 33: `return { success: true }`). Email `'antonio.alt3000@gmail.com'` hardcoded riga 14 — da spostare in env var.
- **Input validation**: nessun Zod.

### 3. Security — FINDING CRITICO: SHA-256 password hashing
- `lib/auth.ts` righe 56-61:
```typescript
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + (process.env.NEXTAUTH_SECRET || "salt"));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
```
SHA-256 non e' un KDF. E' veloce per design — GPU moderna: >1 miliardo hash/s. Con salt fisso da env var, rainbow table precomputabile. **Remediation**: sostituire con `bcryptjs` (cost 12) o `argon2id`. Richiede migrazione password esistenti su Redis (rehash al next login).
- **Security headers**: buoni (identici F2).
- **CORS**: nessun middleware.

### 4. Monitoring
- `vercel.json`: **unico repo con cron** — `/api/cron/dunning` ogni giorno 09:00 UTC.
- `.github/workflows/`: nessuno.

### 5. Deploy config
- `vercel.json` con cron. Next.js 15.1.0 + turbopack. **GAP**: `app/api/cron/dunning/route.ts` non dichiara `export const maxDuration`. Default Vercel Hobby = 10s. Aggiungere `export const maxDuration = 60;` alla riga 1 del file.

### 6. Test / 7. Database
- Zero test. Upstash Redis come unico store (sessioni, pagamenti, stats, webhook). Molte chiavi senza TTL esplicito (`user:*`, `connected:*`).

---

## F4 — ParseFlow/DocuMint (`C:\Users\ftass\business-fast4-documint\`)

### 1. Struttura base
- **`/api/health`**: `app/api/health/route.ts` — runtime edge, fake-positive. Nota: il file risponde `"service": "parseflow"` ma il `package.json` ha `"name": "documint"`. Disallineamento nome repo/prodotto.
- **Error boundary**: `app/error.tsx` — presente.
- **Error tracking**: nessuno.
- **Logging**: zero console nel source.

### 2. Resilienza endpoint API
- **Endpoint**: `/api/health`, `/api/v1/{extract,demo,dashboard,documents/[id]}`, `/api/checkout`, `/api/webhooks/{stripe,notifications}`, `/api/auth/register`, `/api/admin/coupon-stats`, `/api/redeem`
- **Timeout**: **ASSENTE su `pdfParse()`**. In `app/api/v1/extract/route.ts` righe 160-166:
```typescript
if (file.type === 'application/pdf') {
  try {
    const pdfData = await pdfParse(buffer);  // NESSUN TIMEOUT
    text = pdfData.text || '';
  } catch {
    text = '';
  }
}
```
Un PDF malformato o molto grande puo' bloccare l'event loop Node.js per > 30s. `maxDuration = 30` dichiarato (riga 14) ma senza AbortController interno: Vercel killa la funzione bruscamente, il client riceve FUNCTION_INVOCATION_TIMEOUT senza messaggio utile. **Nota**: tesseract.js e' nel `package.json` ma NON e' chiamato nel codice — le immagini ritornano 422 "IMAGE_OCR_PRO_REQUIRED" (riga 169-177). Non e' un gap attivo.
- **Rate limiting**: `lib/rate-limit.ts` — **FAIL-OPEN al catch** (riga 47: `return { success: true, remaining: 999 }`). Email `'antonio.alt3000@gmail.com'` hardcoded riga 20.
- **Input validation**: Zod presente su 4 route (il piu' maturo del portfolio).

### 3. Security — FINDING: SHA-256 in auth
- `lib/auth.ts` (pattern identico a F3): `hashPassword` usa `crypto.subtle.digest("SHA-256", ...)`. Stesso rischio.
- **Security headers** (`next.config.ts`): CORS esplicito per `/api/v1/:path*` con `Access-Control-Allow-Origin: *`. Corretto per API pubblica.

### 4. Monitoring / 5. Deploy
- `vercel.json`: assente. No cron. Next.js 15.1.0 + turbopack.

### 6. Test / 7. Database
- Zero test. Upstash Redis — mock completo in `lib/redis.ts` righe 8-25 (tutti i metodi restituiscono no-op silenzioso se env vars mancano).

---

## B7 — CaptureAPI (`C:\Users\ftass\business-7-capture-api\`)

### 1. Struttura base — FINDING CRITICO: no error boundary
- **`/api/health`**: `src/app/api/health/route.ts` — edge, fake-positive.
- **`/api/v1/health`**: `src/app/api/v1/health/route.ts` — **UNICO health reale del portfolio**. Controlla Redis con `AbortSignal.timeout(5000)`, ritorna `{status: "operational"|"degraded"|"outage", services: [{name, status, responseTime}]}`.
- **Error boundary globale**: **ASSENTE**. Nessun file `error.tsx` trovato in `src/app/`. Un crash in un Server Component propaga senza recovery UI. **Remediation**: creare `src/app/error.tsx` (10 min, copiare da F3).
- **Error tracking**: nessuno.
- **Logging**: `src/lib/renderer.ts` riga 101 — `console.warn("chromium-min failed, falling back...")` leaka dettagli interni in produzione.

### 2. Resilienza endpoint API
- **Endpoint**: `/api/health`, `/api/v1/{health,screenshot,pdf,batch,demo}`, `/api/webhooks/screenshot-complete`, `/api/auth/register`, `/api/checkout`, `/api/webhook`, `/api/admin/coupon-stats`, `/api/dashboard`, `/api/dashboard/requests`, `/api/keys/{regenerate,revoke}`, `/api/redeem`
- **Timeout**: `AbortSignal.timeout()` in health v1. Timeout configurati in screenshot/batch/pdf via `maxDuration` (30s).
- **Retry logic**: `src/lib/api-store.ts` ha retry su alcune operazioni Redis. Webhook HMAC verification corretto.
- **Circuit breaker**: assente.
- **Rate limiting**: Upstash su screenshot, pdf, batch, dashboard. **FAIL-OPEN** se catch (stesso pattern F2/F3/F4).
- **Input validation**: Zod nel webhook. Middleware CORS + RapidAPI secret validation in `src/middleware.ts`.
- **CORS middleware**: `src/middleware.ts` — il piu' completo del portfolio. Distingue route pubbliche (`/api/v1/*`) da interne (`/api/auth|checkout|dashboard|keys|webhook`). Interne: same-origin only.

### 3. Security
- **Security headers** (`next.config.ts`): CSP completa. `img-src` include `http:` (potenziale mixed content warning).
- **SSRF protection**: `src/lib/renderer.ts` — `BLOCKED_HOSTS` Set con localhost, 127.0.0.1, metadata endpoints AWS/GCP.
- **Password hashing**: B7 usa API keys (UUID), non password tradizionali. Il `src/app/api/auth/register/route.ts` non ha `hashPassword` — nessun problema qui.
- **console.warn in prod**: `src/lib/renderer.ts:101` — leaka stack trace Chromium. Rimuovere o abbassare a level condizionale su NODE_ENV.

### 4. Monitoring / 5. Deploy
- `vercel.json`: assente. No cron. `.github/workflows/`: nessuno. Next.js 16.1.7.

### 6. Test / 7. Database
- Zero test. Upstash Redis come unico store. `src/lib/api-store.ts` — Redis inizializzato con `|| ""` se env manca (si connette a URL vuoto, crasha a runtime con errore esplicito — meglio degli altri).

---

## Matrice Comparativa

| Feature | F1 | F2 | F3 | F4 | B7 |
|---------|:--:|:--:|:--:|:--:|:--:|
| Health controlla dipendenze reali | ❌ | ❌ | ❌ | ❌ | ✅ (v1) |
| Error boundary globale | ✅ | ✅ | ✅ | ✅ | ❌ |
| Error tracking esterno | ❌ | ❌ | ❌ | ❌ | ❌ |
| Logging strutturato JSON | ❌ | ❌ | ❌ | ❌ | ❌ |
| Timeout su fetch/processing | ✅ | ✅ | ⚠️ | ❌ pdf | ✅ |
| Retry logic | ⚠️ | ❌ | ⚠️ | ❌ | ⚠️ |
| Circuit breaker | ❌ | ❌ | ❌ | ❌ | ❌ |
| Rate limit fail-safe | ✅ mem | ❌ open | ❌ open | ❌ open | ❌ open |
| Input validation schema (Zod) | ⚠️ | ❌ | ❌ | ✅ | ⚠️ |
| Security headers CSP+HSTS | ✅ | ✅ | ✅ | ✅ | ✅ |
| CORS middleware esplicito | ❌ | ❌ | ❌ | ⚠️ config | ✅ |
| Email bypass da env var | ❌ hard | ✅ env | ❌ hard | ❌ hard | N/A |
| Password hashing sicuro | N/A | N/A | ❌ SHA-256 | ❌ SHA-256 | N/A |
| GitHub Actions CI nel repo | ❌ | ❌ | ❌ | ❌ | ❌ |
| vercel.json / cron attivo | ❌ | ❌ | ✅ | ❌ | ❌ |
| maxDuration su endpoint critici | ❌ | ❌ | ❌ cron | ✅ extract | ✅ |
| Test automatizzati | ❌ | ❌ | ❌ | ❌ | ❌ |
| Redis mock silenzioso | ⚠️ null | ⚠️ open | ⚠️ open | ⚠️ mock | ❌ crash |

---

## Top 10 Gap Prioritizzati

| # | GAP | Impatto (1-5) | Facilita' fix (1-5) | Score | Repo |
|---|-----|:---:|:---:|:---:|------|
| 1 | B7 senza error boundary — crash propagato senza recovery | 5 | 5 | 25 | B7 |
| 2 | Health endpoint fake-positive su 4 SaaS — monitor crede tutto OK anche se Redis e' down | 5 | 4 | 20 | F1 F2 F3 F4 |
| 3 | F3 cron dunning senza maxDuration — SCAN Redis killato a meta' su Hobby plan (10s default) | 4 | 5 | 20 | F3 |
| 4 | Rate limit fail-open — Redis down = DDoS gratuita su endpoint costosi (scan, screenshot) | 4 | 4 | 16 | F2 F3 F4 B7 |
| 5 | F4 pdfParse senza timeout — PDF malevolo blocca Node.js, client riceve FUNCTION_INVOCATION_TIMEOUT | 4 | 4 | 16 | F4 |
| 6 | SHA-256 per password — non e' KDF, attaccabile con GPU. Dati utenti a rischio se Redis leak | 5 | 3 | 15 | F3 F4 |
| 7 | Zero error tracking esterno — errori silenti in produzione, nessuna alert | 5 | 3 | 15 | Tutti |
| 8 | Email bypass hardcoded in codice (non env var) — esposta in git history | 3 | 5 | 15 | F1 F3 F4 |
| 9 | Zero test automatizzati — ogni deploy su codice Stripe/webhook e' leap of faith | 5 | 1 | 5 | Tutti |
| 10 | console.warn in B7 renderer.ts:101 — leaka dettagli Chromium in produzione | 2 | 5 | 10 | B7 |

---

## Quick Wins — fix < 30 min ciascuno

1. **B7 error boundary** — creare `business-7-capture-api/src/app/error.tsx` copiando `business-fast3-churnguard/app/error.tsx`. Tempo: 5 min.
2. **F3 cron maxDuration** — aggiungere `export const maxDuration = 60;` riga 1 di `business-fast3-churnguard/app/api/cron/dunning/route.ts`. Tempo: 2 min.
3. **Health reali F1/F2/F3/F4** — copiare logica da `business-7-capture-api/src/app/api/v1/health/route.ts` (ping Redis con `AbortSignal.timeout(3000)`) nei 4 health superficiali. Tempo: 15 min per repo.
4. **Email bypass in env var** — sostituire `"antonio.alt3000@gmail.com"` hardcoded con `process.env.INTERNAL_BYPASS_EMAIL?.split(",") || []` in `business-fast1-complipilot/src/lib/rate-limit.ts:17`, `business-fast3-churnguard/lib/rate-limit.ts:14`, `business-fast4-documint/lib/rate-limit.ts:20`. Tempo: 5 min per repo.
5. **B7 console.warn** — in `business-7-capture-api/src/lib/renderer.ts:101` aggiungere `if (process.env.NODE_ENV !== 'production')` guard. Tempo: 2 min.
6. **Rate limit fail-closed F2** — in `business-fast2-accessiscan/src/lib/rate-limit.ts:66` cambiare il catch da `return { success: true, remaining: 999 }` a `return { success: false, remaining: 0, limit: 0 }`. Stesso fix per F3:33 e F4:47. Tempo: 5 min per repo.

## Major Work — fix > 2 ore

1. **bcrypt password hashing** — F3 `lib/auth.ts:56-61` e F4 (stesso pattern): installare `bcryptjs`, sostituire `hashPassword`, scrivere migration script che rileva hash SHA-256 (64 chars hex) al login e li rehasha. Stima: 4-6h.
2. **Sentry integration** — aggiungere `@sentry/nextjs` free tier (50K events/mese) con `sentry.*.config.ts` per tutti i 5 repo. Stima: 2h per repo (10h tot). Free tier sufficiente per il volume attuale.
3. **CI GitHub Actions nei repo SaaS** — aggiungere `.github/workflows/ci.yml` (lint + build check su PR) a ciascun repo. Copiare da toolkit-online. Stima: 30 min per repo.
4. **F4 pdfParse timeout** — wrappare `pdfParse(buffer)` con `Promise.race([pdfParse(buffer), new Promise((_, reject) => setTimeout(() => reject(new Error("PDF parse timeout")), 25000))])` in `app/api/v1/extract/route.ts:162`. Stima: 1h con test.
5. **Test suite webhook + auth** — Jest per almeno: Stripe webhook signature verification, rate limit logic, hashPassword, cron dunning step calculation. Stima: 1 giorno per repo critico (F3 priorita' massima per i pagamenti).
6. **Monitoring centralizzato** — estendere il workflow `uptime-monitor.yml` di toolkit-online per pingare anche i 5 `/api/health` e il B7 `/api/v1/health`. Alert su GitHub Actions failure. Stima: 45 min.

---

*File generato da audit statico del codice sorgente. Nessun codice modificato.*
