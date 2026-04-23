# SECURITY-DEEP-AUDIT — 5 SaaS Next.js (OWASP + Session + Webhook + CSRF + Injection)

**Data**: 2026-04-23 | **Agent**: angry-chandrasekhar-5174ec | **Estende**: `AUDIT-5-SAAS.md` (resilience baseline)
**Scope**: F1 CompliPilot, F2 AccessiScan, F3 ChurnGuard, F4 ParseFlow/DocuMint, B7 CaptureAPI
**Stato**: 0 utenti paganti, Stripe LIVE, Vercel Pro. Obiettivo: zero rischi pre-go-live.

---

## 1. Matrice OWASP + Controlli Extra

Legenda: `✅` = conforme | `❌` = violazione | `⚠️` = parziale/accettabile ma migliorabile | `N/A` = non applicabile

| Controllo | F1 | F2 | F3 | F4 | B7 |
|---|:---:|:---:|:---:|:---:|:---:|
| **A01 Broken Access Ctrl** — admin auth robust | ❌ | ❌ | ❌ | ❌ | ❌ |
| A01 — IDOR su `/dashboard/*`, `/update-payment/[id]` | ⚠️ | ⚠️ | ❌ | ⚠️ | ⚠️ |
| **A02 Crypto** — password KDF (bcrypt/argon2) | N/A | ❌ SHA-256 | ❌ SHA-256 | N/A (API key) | N/A (API key) |
| A02 — API key storage hashed in Redis | N/A | N/A | N/A | ✅ SHA-256 hash | ❌ plaintext |
| A02 — Cookie `httpOnly+Secure+SameSite` | N/A | ⚠️ Lax | ⚠️ Lax | N/A | N/A |
| **A03 Injection** — Redis key injection in user input | ✅ | ✅ | ⚠️ email | ⚠️ email | ⚠️ email |
| A03 — XSS `dangerouslySetInnerHTML` con user data | ✅ | ✅ | ✅ hardcoded | ✅ hardcoded | ✅ hardcoded |
| **A04 Insecure Design** — rate limit fail-safe | ✅ mem | ❌ open | ❌ open | ❌ open | ❌ open |
| A04 — brute force / account lockout | ❌ | ❌ | ❌ | N/A | N/A |
| A04 — captcha sign/login | ❌ | ❌ | ❌ | ❌ | ❌ |
| **A05 Misconfig** — `NEXT_PUBLIC_*` clean | ✅ | ✅ | ✅ | ✅ | ✅ |
| A05 — security headers (CSP/HSTS) | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| A05 — B7 middleware origin bypass localhost | N/A | N/A | N/A | N/A | ❌ |
| **A06 Vulnerable components** — `pdf-parse` CVE-2025 | N/A | N/A | N/A | ⚠️ | N/A |
| **A07 Auth failures** — session rotation on login | ⚠️ | ⚠️ | ⚠️ | N/A | N/A |
| A07 — password complexity > 8 chars + mix | ❌ solo len>=8 | ❌ | ❌ | N/A | N/A |
| A07 — MFA | ❌ | ❌ | ❌ | ❌ | ❌ |
| A07 — timing-safe password compare | N/A | ❌ `===` | ❌ `===` | N/A | N/A |
| **A08 Integrity** — Stripe webhook `constructEvent` | N/A | ⚠️ | ✅ | ✅ | ✅ |
| A08 — webhook idempotency store | N/A | N/A | ❌ | ❌ | ❌ |
| **A09 Logging** — PII in logs / stack trace leak | ✅ | ✅ | ✅ | ⚠️ err.message to client | ❌ console.warn prod |
| **A10 SSRF** — literal blocklist | ✅ | ✅ | N/A | N/A | ✅ |
| A10 — DNS rebinding protected | ❌ | ❌ | N/A | N/A | ❌ |
| A10 — webhook_url blocklist (B7 register) | N/A | N/A | N/A | N/A | ❌ |
| **B. Session** — token entropy >=128b | ⚠️ locStor | ✅ 256b | ✅ 256b | N/A | N/A |
| B — rotation on privilege change | ❌ | ❌ | ❌ | N/A | N/A |
| B — concurrent session limit | ❌ | ❌ | ❌ | N/A | N/A |
| **C. Webhook** — raw body + signature | N/A | N/A | ✅ | ✅ | ✅ |
| C — timestamp tolerance override safe | N/A | N/A | ✅ default | ✅ default | ✅ default |
| C — idempotency (evita re-process `event.id`) | N/A | N/A | ❌ | ❌ | ❌ |
| **D. CSRF** — stato-changing POST non-webhook | ⚠️ SameSite=Lax | ⚠️ Lax | ⚠️ Lax | ⚠️ Lax | ⚠️ Lax |
| D — CSRF token double-submit | ❌ | ❌ | ❌ | ❌ | ❌ |
| **E. XSS** — user-gen content escape | ✅ | ✅ | ✅ | ✅ | ✅ |
| **F. File upload** — MIME magic bytes check | N/A | N/A | N/A | ❌ solo file.type | N/A |
| F — size limit server enforce | N/A | N/A | N/A | ✅ plan-based | N/A |
| F — path traversal filename | N/A | N/A | N/A | ⚠️ name.substring(100) | N/A |
| **G. API key** — entropy sufficient | N/A | N/A | N/A | ✅ 24B hex | ✅ uuid v4 |
| G — hashed at rest | N/A | N/A | N/A | ✅ | ❌ plaintext Redis |
| G — rotation endpoint | N/A | N/A | N/A | ⚠️ (revoke only) | ✅ regen+revoke |
| **H. Payment** — card never touches server | ✅ Checkout | ✅ Checkout | ✅ Checkout | ✅ Checkout | ✅ Checkout |
| H — refund endpoint protected | N/A | N/A | N/A | N/A | N/A |
| **I. Env** — `.env*` in gitignore | ✅ | ✅ | ✅ | ✅ | ✅ |
| I — no secret leak in git log | ✅ | ✅ | ✅ | ✅ | ⚠️ .env.redis-prod file |

---

## 2. Findings Critici — Path, Snippet, Remediation

### CRIT-1 — Admin auth riusa `STRIPE_SECRET_KEY` come password (tutti i 5 repo)

**Repo**: F1, F2, F3, F4, B7 (pattern identico)
**File**: `src/app/api/admin/coupon-stats/route.ts` (F1/F2/B7) e `app/api/admin/coupon-stats/route.ts` (F3/F4)
**Lines**: 7-9 in tutti

```typescript
const secret = request.headers.get("x-admin-secret");
if (!process.env.STRIPE_SECRET_KEY || secret !== process.env.STRIPE_SECRET_KEY) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Rischio**: se l'header `x-admin-secret` viene loggato (Vercel logs, Sentry, nginx, NDR), il log contiene la chiave Stripe LIVE → account take-over + capacità di creare cariche arbitrarie. Inoltre no way di rotare "admin password" senza rotare Stripe.
**Fix**: introdurre `ADMIN_API_SECRET` env var dedicata (rand 32B hex). Usare `crypto.timingSafeEqual()` per il confronto. Documentare rotation trimestrale.

---

### CRIT-2 — B7 middleware: bypass same-origin via sottostringa "localhost"

**Repo**: B7
**File**: `business-7-capture-api/src/middleware.ts`
**Lines**: 72-74

```typescript
const isSameOrigin =
  origin === `https://${host}` ||
  origin === `http://${host}` ||
  origin.includes("localhost") ||
  origin.includes("127.0.0.1");
```

**Exploit**: `Origin: https://evil-attacker.com/?x=localhost` passa il controllo perché `"...localhost..."` include la sostringa. Consente CSRF cross-origin su `/api/auth/*`, `/api/dashboard`, `/api/keys/*`.
**Fix**: matching stretto. Usare `URL(origin).hostname === "localhost"` (dev-only gate con `NODE_ENV !== 'production'`).

---

### CRIT-3 — B7 webhook registration: SSRF via `webhook_url`

**Repo**: B7
**File**: `business-7-capture-api/src/app/api/webhooks/screenshot-complete/route.ts`
**Lines**: 50-63 (validation) + 113-118 (`fetch`)

L'endpoint accetta un `webhook_url` dell'utente e lo chiama senza passare per `isUrlBlocked` (che esiste in `renderer.ts` e copre localhost, AWS metadata, private IP). Un attaccante logato può fare:
```
POST /api/webhooks/screenshot-complete
{"webhook_url":"https://169.254.169.254/latest/meta-data/iam/security-credentials/"}
```
Vercel serverless: accesso metadata AWS restituisce IAM creds (se la function gira su EC2/Lambda-backed runtime). Anche su Vercel Functions v2 l'SSRF interno è mitigato ma non azzerato.
**Fix**: importare `isUrlBlocked` da `renderer.ts` (già contiene tutte le regole: localhost, 169.254.*, `.internal`, `.local`, private IP ranges v4+v6, credentials) e applicarlo qui prima del `fetch`. Inoltre: `redirect: 'manual'` sul fetch per evitare 302 → private IP.

---

### CRIT-4 — B7 API keys stored plaintext in Redis

**Repo**: B7
**File**: `business-7-capture-api/src/lib/api-store.ts`
**Lines**: 73 (`pipeline.set(\`${KEY_PREFIX}${key}\`, record)`) — chiave Redis = `apikey:{raw_key}`, valore = record con `key` plaintext.

**Rischio**: se Upstash Redis leak (credential compromise, snapshot export, misconfig), ogni API key è rivelata. Paragonato a F4 che hash-a le chiavi (`hashApiKey` SHA-256 in `lib/api-keys.ts:13-15`) è regressione.
**Fix**: seguire pattern F4 — storage con chiave Redis `apikey:{sha256(raw_key)}`, lookup con hash. Richiede migrazione: script che legge chiavi esistenti, hasha, scrive nuove key, cancella vecchie. Prima del deploy, nessun utente pagante = rischio bassissimo.

---

### CRIT-5 — F4 no MIME magic bytes validation

**Repo**: F4
**File**: `business-fast4-documint/app/api/v1/extract/route.ts`
**Lines**: 92-100

```typescript
if (!SUPPORTED_FILE_TYPES.includes(file.type as typeof SUPPORTED_FILE_TYPES[number])) {
```

`file.type` viene dal client multipart `Content-Type` — totalmente sotto controllo attacker. Un file eseguibile può arrivare con `type: "application/pdf"`; `pdfParse` sbaglia a parsare ma il buffer rimane in memoria e `extractFromText` riceve junk. Combined con CRIT-6 (no timeout), un file formato "zip-bomb-as-pdf" può DoSare. Path traversal via `file.name` mitigato solo da `.substring(0, 100)` — non previene caratteri `..`, `/`, `\0`, `<`, `>`.
**Fix**: usare `file-type` npm package (offline magic bytes detection, 0 dep) oppure controllare i primi 4 bytes manualmente: PDF = `%PDF`, DOCX/XLSX = `PK\x03\x04`. Sanitize filename con regex `/[^a-zA-Z0-9._-]/g` e reject se contiene `..`.

---

### CRIT-6 — F4 `pdfParse` senza timeout (confermato da baseline)

**Repo**: F4
**File**: `business-fast4-documint/app/api/v1/extract/route.ts`
**Lines**: 160-166 — già riportato in `AUDIT-5-SAAS.md`. Allegato: `pdf-parse` CVE storici noti (DoS via malformed stream). Nessuna patch CVE su npm audit oggi, ma mitigazione obbligatoria via timeout.
**Fix**: `Promise.race([pdfParse(buffer), new Promise((_,r)=>setTimeout(()=>r(new Error("PDF_TIMEOUT")),25_000))])`.

---

### CRIT-7 — SHA-256 password hashing (F2 + F3) senza bcrypt/argon2

**Repo**: F2, F3 (F4 è API-key based, non ha il problema per password ma hash API key ok)
**File**:
- `business-fast2-accessiscan/src/lib/auth.ts:66-71`
- `business-fast3-churnguard/lib/auth.ts:56-61`

Salt statico da `NEXTAUTH_SECRET` (env var condivisa). SHA-256 veloce → GPU 1 GH/s → 8-char password brute force in minuti. Già riportato baseline ma qui amplio: **anche il salt è static** (non per-user) → rainbow table unica per tutto il DB.
**Fix**: `bcryptjs` cost 12. Migration all'atto del prossimo login: `if (storedHash.length === 64 && /^[0-9a-f]+$/i.test(storedHash)) { /* verifica SHA-256 */ if (match) { await bcrypt.hash(password, 12) → redis.set }`.

---

### CRIT-8 — Webhook NO idempotency (F3, F4, B7)

**File**: F3 `app/api/webhooks/stripe/route.ts:44-47`, F4 `app/api/webhooks/stripe/route.ts:65-69`, B7 `src/app/api/webhook/route.ts:67-74`

Dopo `constructEvent` non si controlla se `event.id` è già stato processato. Stripe può riconsegnare lo stesso evento (retry su 5xx, quindi gli handler F3 che fallano silenziosamente su `try/catch` + ritornano 500 → Stripe retry → double-process: doppia dunning email, doppia `redis.incrby(recoveredTotal)`, doppio `upgradePlan`.
**Fix**: all'inizio del handler, `await redis.set(\`webhook:processed:${event.id}\`, "1", { nx: true, ex: 86400 * 7 })` → se NX fails, ritornare 200 `{received: true, deduped: true}`.

---

### CRIT-9 — F1 scan senza DNS resolution check (SSRF bypass)

**Repo**: F1 (pattern ripetuto F2, B7)
**File**: `src/app/api/scan/route.ts:13-29` + `3614`
```typescript
if (isPrivateHost(parsedUrl.hostname)) { return 400; }
```

**Bypass**: attaccante registra `evil-ssrf.example.com` con A record `127.0.0.1`. `parsedUrl.hostname = "evil-ssrf.example.com"` → regex `^127\.` non matcha → pass. `fetch()` risolve DNS → chiama `127.0.0.1:PORT` bypassando controlli. Stesso problema per F2 `ssrf-protection.ts` (usa regex sulla URL) e B7 `renderer.ts` (ma mitigato: puppeteer `goto` su private IP blockato da Chrome security solo in alcuni casi).
**Fix**: prima del fetch, `dns.promises.resolve4(parsedUrl.hostname)` + check che nessun IP ritornato sia privato. Usare `undici` dispatcher con IP whitelist. Lavoro medio, ~1h per repo.

---

### HIGH-1 — F4/B7 webhook: `err.message` trapela a client

**File**: F4 `app/api/v1/extract/route.ts:203-206`; pattern ripetuto in register route 94-100.

`const message = error instanceof Error ? error.message : 'Internal server error'; return {error: message}` → lo stack di Node include paths filesystem, library versions, dettagli interni.
**Fix**: generic `"Internal server error"` a client, log interno con request id.

---

### HIGH-2 — Password requirements troppo deboli

**F2/F3 signup**: solo `password.length < 8`. Accetta `"password"`, `"11111111"`, `"qwerty123"`.
**Fix**: regex `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/` + blocklist top-100 common passwords (Have I Been Pwned k-anonymity opzionale).

---

### HIGH-3 — No account lockout / brute force protection login

**F2, F3**: rate limit login è solo per IP, 10/min. Attaccante con botnet (10 IPs) = 100 tentativi/min. Con `storedHash !== inputHash` anche timing-attackable (millisecondi differenza).
**Fix**: dopo 5 tentativi falliti su stesso email → lock 15 min. `crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(inputHash))`.

---

### HIGH-4 — No CSRF token + SameSite=Lax (non Strict)

Tutti i repo: cookie `sameSite: "lax"`. Lax permette navigation top-level GET + form cross-origin. Endpoints `/api/auth/logout`, `/api/keys/regenerate`, `/update-payment/[id]` sono accessibili via CSRF cross-site `<form method=POST>`.
**Fix**: due opzioni complementari:
1. `sameSite: "strict"` (breaks shareable login-from-email flow, accettabile per SaaS B2B)
2. CSRF token double-submit: cookie `csrf_token` (non-httpOnly) + header `X-CSRF-Token` che il client legge e rimanda; middleware verifica.

---

### HIGH-5 — F3 `/update-payment/[invoiceId]` no auth check (IDOR?)

**File**: `business-fast3-churnguard/app/api/update-payment/[invoiceId]/route.ts` — da verificare ma baseline non indica auth.
Da `stripe/route.ts:170-172`: `updatePaymentUrl = \`${APP_URL}/update-payment/${invoiceId}\`` — link inviato via email al merchant's customer. Se l'endpoint API usa solo `invoiceId` (enumerable Stripe `in_xxx`), IDOR potenziale.
**Fix**: generare `recovery_token` random 32B alla creazione del `FailedPayment`, salvare in Redis con TTL 7gg, usare quello nell'URL invece dell'invoice ID.

---

### HIGH-6 — B7 `.env.redis-prod` (3468 byte, 6 apr 2026)

**File**: `business-7-capture-api/.env.redis-prod` — pattern `.env*` in gitignore lo esclude. OK sul tracking. **Ma**: se il file contiene credenziali prod in chiaro sul disk del developer, un malware stealer (es. LummaC2) lo troverebbe. Windows path `C:\Users\ftass\` è readabile da qualsiasi processo user-level.
**Fix**: spostare contenuto in 1Password / Vercel env vars, rimuovere file locale. Almeno: `chmod 400` equivalente Windows (ACL restrittiva), documentare in `portfolio-config.md`.

---

### MED-1 — F4/F3 DoS via email enumeration

Login/signup rispondono differentemente per email esistente vs inesistente (`"Email already registered" 409` vs `"Invalid email or password" 401`). Permette enumerazione user.
**Fix**: signup → sempre 202 `"Check your inbox"` + email reale solo se nuovo. Login → sempre 401 generico.

---

### MED-2 — B7 console.warn in prod (renderer.ts:101)

Già in baseline. Conferma.

---

### MED-3 — F4 redis register route: email lowercase ma `email:${email.toLowerCase()}` key construction permette Redis key injection via email special chars

**File**: F4 register:56 — `redis.get(\`email:${email.toLowerCase()}\`)`. Se email contiene `:` o spazi (passato la regex `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` che **non** include `:` ma sì `._%+-`), si può collidere con altre key Upstash. Regex regge. Ma nessuna normalizzazione Unicode → `"admin@evil.com"` vs `"admın@evil.com"` (ı = U+0131) possibile collision.
**Fix**: `email.normalize('NFKC').toLowerCase()`.

---

### LOW-1 — CSP `unsafe-inline` script-src

Tutti i 5 repo hanno `unsafe-inline` per GTM. Nonce-based CSP migliorerebbe ma complica next.js + analytics. Accettabile.

---

### LOW-2 — Logout endpoint non revoca session token Redis

F2, F3: `logout` cancella solo il cookie. Se il browser dell'attaccante ha il cookie (XSS o shoulder-surf), può continuare a usarlo per 30gg.
**Fix**: logout → `redis.del(KEYS.session(token))` prima di cancellare cookie.

---

## 3. Top 15 Fix Prioritizzati (impatto 1-5 × facilità 1-5 = score max 25)

| # | Finding | Repo | Impatto | Facilità | Score | Stima |
|---|---|---|:---:|:---:|:---:|---|
| 1 | CRIT-1 admin auth → env dedicato + timing-safe | Tutti | 5 | 5 | **25** | 30 min |
| 2 | CRIT-2 B7 middleware origin regex bypass | B7 | 5 | 5 | **25** | 10 min |
| 3 | CRIT-3 B7 webhook_url SSRF blocklist | B7 | 5 | 5 | **25** | 15 min |
| 4 | CRIT-8 webhook idempotency Redis NX SET | F3/F4/B7 | 5 | 4 | **20** | 30 min × 3 |
| 5 | CRIT-6 F4 pdfParse Promise.race timeout | F4 | 4 | 5 | **20** | 20 min |
| 6 | CRIT-5 F4 MIME magic bytes + filename sanitize | F4 | 4 | 5 | **20** | 40 min |
| 7 | HIGH-1 err.message stop leaking to client | F4/B7 | 3 | 5 | **15** | 15 min × 2 |
| 8 | HIGH-3 login lockout 5 fail + timingSafeEqual | F2/F3 | 4 | 4 | **16** | 1h × 2 |
| 9 | CRIT-4 B7 hash API keys at rest + migration | B7 | 4 | 3 | **12** | 3h |
| 10 | CRIT-7 bcrypt migration F2 + F3 | F2/F3 | 5 | 2 | **10** | 4-6h × 2 |
| 11 | HIGH-4 CSRF token double-submit middleware | Tutti | 4 | 3 | **12** | 1h × 5 |
| 12 | HIGH-5 F3 recovery_token al posto di invoiceId | F3 | 4 | 3 | **12** | 1h |
| 13 | CRIT-9 SSRF DNS resolve check F1/F2/B7 | F1/F2/B7 | 3 | 3 | **9** | 1h × 3 |
| 14 | HIGH-2 password complexity regex + HIBP | F2/F3 | 3 | 4 | **12** | 30 min × 2 |
| 15 | LOW-2 logout Redis session delete | F2/F3 | 2 | 5 | **10** | 10 min × 2 |

**Totale effort**: ~35 ore uomo. CRIT-1/2/3 + idempotency + timeout + MIME = 3.5 ore e chiude il 60% del rischio.

---

## 4. Zero-Trust Checklist (20 punti — VERDE prima del primo utente pagante)

| # | Check | Come verificarlo | Target |
|---|---|---|:---:|
| 1 | Admin endpoints usano `ADMIN_API_SECRET` dedicata (non Stripe key) | `grep -r "STRIPE_SECRET_KEY" app/api/admin/` = 0 match | Tutti |
| 2 | `timingSafeEqual` per tutti i confronti di secret/hash | grep `=== input` in route handler = 0 | Tutti |
| 3 | Webhook Stripe: `stripe.webhooks.constructEvent` + raw body | code review | F3/F4/B7 |
| 4 | Webhook idempotency: `SET NX` su `webhook:processed:{event.id}` TTL 7d | grep `webhook:processed:` = 1+ match per repo | F3/F4/B7 |
| 5 | F4 file upload: magic bytes check primi 4 byte prima di `pdfParse` | test manuale con `.exe` rinominato `.pdf` → 400 | F4 |
| 6 | F4 `pdfParse` wrappato in Promise.race 25s timeout | code review | F4 |
| 7 | F4 filename sanitized (`[^a-zA-Z0-9._-]` replaced) | code review | F4 |
| 8 | B7 middleware: origin check stretto (no `.includes("localhost")`) | curl con Origin malicious → 403 | B7 |
| 9 | B7 `/api/webhooks/screenshot-complete` usa `isUrlBlocked` | test `webhook_url=https://169.254.169.254/` → 400 | B7 |
| 10 | B7 API keys hashed in Redis (`apikey:{sha256(key)}`) | Redis `KEYS apikey:*` mostra solo hex 64 char | B7 |
| 11 | F2/F3 password `bcrypt` cost 12 + per-user salt | code review + test hash format `$2a$12$...` | F2/F3 |
| 12 | F2/F3 login: lockout 5 fails per email, 15min | test 5 login falliti → 6° risp 429/423 | F2/F3 |
| 13 | F2/F3 signup: password policy `(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}` | test "password" → 400 | F2/F3 |
| 14 | Rate limit **fail-CLOSED** su catch Redis error | grep catch block in `rate-limit.ts` → `success: false` | F2/F3/F4/B7 |
| 15 | Cookie `sameSite: "strict"` OR CSRF double-submit token | code review + test cross-origin form POST → 403 | Tutti |
| 16 | Logout cancella anche Redis session | grep `KEYS.session` in logout route | F2/F3 |
| 17 | `err.message` mai ritornato al client su 500 | grep `error: message` in catch = 0 | F4/B7 |
| 18 | SSRF: DNS resolve check prima di fetch user URL | code review `dns.resolve4` + private IP check | F1/F2/B7 |
| 19 | `.env*` gitignored + git log grep `sk_live` = 0 | `git log --all -p \| grep sk_live` = 0 | Tutti |
| 20 | Sentry (free tier) attivo su tutti i 5 repo, DSN env var | `@sentry/nextjs` in package.json + sentry.client.config.ts | Tutti |

**Regola operativa**: nessun `/deploy` al prod-branch finché questa checklist non è 20/20 verde.

---

## 5. Appendice — Commands di verifica rapida

```bash
# Verifica idempotency (deve matchare dopo fix)
grep -rn "webhook:processed:" business-fast3-churnguard business-fast4-documint business-7-capture-api

# Verifica admin env dedicata
grep -rn "ADMIN_API_SECRET" business-fast{1,2,3,4}-* business-7-*

# Verifica bcrypt
grep -rn "bcryptjs\|argon2" business-fast2-accessiscan/src business-fast3-churnguard

# Verifica git history pulito
for r in business-fast1-complipilot business-fast2-accessiscan business-fast3-churnguard business-fast4-documint business-7-capture-api; do
  cd "C:/Users/ftass/$r" && git log --all -p | grep -cE "sk_live_[a-zA-Z0-9]{20,}" && echo "$r OK"
done

# Verifica B7 middleware fix (deve ritornare 403)
curl -X POST https://captureapi.dev/api/keys/regenerate \
  -H "Origin: https://attacker.com/?x=localhost" \
  -H "Cookie: session_token=..." # senza cookie valido verifica almeno il 401/403 origin
```

---

**Conclusione**: baseline `AUDIT-5-SAAS.md` copriva resilienza. Questo deep-audit aggiunge 9 finding CRIT + 6 HIGH + 3 MED. Nessun `sk_live` leaked in git history. Il rischio massimo si chiude con le prime 8 righe della tabella "Top 15" (~7 ore di lavoro), portando il portfolio a una postura accettabile per primo paying customer. Zero-trust checklist da eseguire come gate `/deploy`.
