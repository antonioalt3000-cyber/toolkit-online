# Execution Plan FASE 1 — Security Hardening Immediato

> **Obiettivo**: chiudere i 9 CRIT + 6 HIGH di `SECURITY-DEEP-AUDIT.md` + quick wins di `AUDIT-5-SAAS.md`
> **Tempo stima**: ~3-4h wall time con 5 agenti paralleli
> **Safety**: ogni agente lavora sul proprio branch `resilience/fase1-security`. No push to master finché lint + build non passano.

---

## REGOLE COMUNI (valgono per tutti gli agenti)

1. **Branch dedicato**: `git checkout -b resilience/fase1-security`
2. **NO push a master direttamente** — push solo al branch dedicato
3. **Verifica obbligatoria prima del commit**:
   ```bash
   npm install      # solo se hai modificato package.json
   npm run lint     # deve passare (errori = 0)
   npm run build    # deve passare (exit 0)
   ```
4. Se lint/build falliscono: FIX prima del commit. Se non riesci a fixare entro 30min, segnala e rollback (`git reset --hard HEAD`).
5. Commit message **generico**: `"security: phase 1 hardening"`. NO dettagli su CVE/strategie.
6. Push branch: `git push -u origin resilience/fase1-security`
7. Report finale con:
   - Lista fix applicati (con file + line)
   - Output lint (OK/errors)
   - Output build (OK/errors)
   - Comando merge pronto per master

---

## SHARED FIX — Applicare a TUTTI 5 i repo

### SHARED-1: `ADMIN_API_SECRET` dedicato (SCORE 25 — CRIT-1)

**File**: `*/api/admin/coupon-stats/route.ts` (path varia per repo, grep prima)

**PRIMA** (vulnerabile):
```typescript
const secret = request.headers.get("x-admin-secret");
if (!process.env.STRIPE_SECRET_KEY || secret !== process.env.STRIPE_SECRET_KEY) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**DOPO**:
```typescript
import { timingSafeEqual } from "crypto";
// ...
const secret = request.headers.get("x-admin-secret");
const expected = process.env.ADMIN_API_SECRET;
if (!expected) {
  return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
}
if (!secret || secret.length !== expected.length) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const secretBuf = Buffer.from(secret);
const expectedBuf = Buffer.from(expected);
if (!timingSafeEqual(secretBuf, expectedBuf)) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Aggiungi `ADMIN_API_SECRET=<rand-32b-hex>` al `.env.example` (con valore dummy).

---

## F1 CompliPilot — `C:/Users/ftass/business-fast1-complipilot/`

### F1.1 — Email bypass → env var
- File: `src/lib/rate-limit.ts:17`
- Cerca `"antonio.alt3000@gmail.com"` hardcoded
- Sostituisci con:
  ```typescript
  const INTERNAL_EMAILS = (process.env.INTERNAL_BYPASS_EMAIL || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  ```
  e usa `INTERNAL_EMAILS.includes(email.toLowerCase())` dove appropriato.

### F1.2 — Health endpoint reale
- File: `src/app/api/health/route.ts`
- Sostituisci il fake 200 con ping Redis reale. Copia pattern da `business-7-capture-api/src/app/api/v1/health/route.ts`.
- Usa `getRedis()` esistente, con `AbortSignal.timeout(3000)`.
- Ritorna `{ status: "ok|degraded|down", checks: { redis: {...} }, timestamp }`.
- HTTP 200 se ok, 503 se down.

### F1.3 — SHARED-1 (ADMIN_API_SECRET)

### F1.4 — (opzionale se tempo) SSRF DNS resolve check
- File: `src/app/api/scan/route.ts:13-29`
- Aggiungi `dns.promises.resolve4(hostname)` e verifica che NESSUN IP ritornato sia privato (10.*, 172.16-31.*, 192.168.*, 127.*, 169.254.*).

### F1 target: 4 fix, ~1h

---

## F2 AccessiScan — `C:/Users/ftass/business-fast2-accessiscan/`

### F2.1 — Rate limit fail-closed
- File: `src/lib/rate-limit.ts:66`
- Cerca catch block che ritorna `{ success: true, remaining: 999, limit: 999 }`
- Sostituisci con `{ success: false, remaining: 0, limit: 0 }` — fail CLOSED

### F2.2 — Health endpoint reale (come F1.2)

### F2.3 — SHA-256 → bcrypt (0 utenti = trivial)
- File: `src/lib/auth.ts` (cerca `hashPassword` con `crypto.subtle.digest("SHA-256", ...)`)
- `npm install bcryptjs @types/bcryptjs`
- Sostituisci implementazione con:
  ```typescript
  import bcrypt from "bcryptjs";
  export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    // Legacy support: se hash è SHA-256 (64 hex chars), verifica vecchio modo e RE-HASH
    if (/^[0-9a-f]{64}$/i.test(hash)) {
      const legacy = await sha256Legacy(password);
      return legacy === hash; // migration handled at call site
    }
    return bcrypt.compare(password, hash);
  }
  async function sha256Legacy(password: string): Promise<string> {
    const data = new TextEncoder().encode(password + (process.env.NEXTAUTH_SECRET || "salt"));
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  ```
- Nel login handler: se `verifyPassword` matcha con legacy SHA-256, re-hash: `const newHash = await hashPassword(password); redis.hset(user:{id}, { password: newHash })`.

### F2.4 — Login lockout + timingSafeEqual
- File: signup/login handler in `src/app/api/auth/login/route.ts`
- Aggiungi counter Redis `login:fails:{email}`, `INCR`, dopo 5 fails setex 900s, controlla prima del check password.
- Usa `bcrypt.compare` (timing-safe) non `===`.

### F2.5 — Password complexity
- File: signup handler
- Regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/`
- Blocklist top 10 common passwords: `["password", "password123", "123456789", "qwerty123", ...]`
- Return 400 con messaggio chiaro.

### F2.6 — Logout Redis session delete
- File: `src/app/api/auth/logout/route.ts`
- Aggiungi `await redis.del(KEYS.session(token))` prima di cancellare il cookie.

### F2.7 — SHARED-1 (ADMIN_API_SECRET)

### F2 target: 7 fix, ~2h

---

## F3 ChurnGuard/PaymentRescue — `C:/Users/ftass/business-fast3-churnguard/`

### F3.1 — Rate limit fail-closed
- File: `lib/rate-limit.ts:33`
- Catch → `{ success: false }` (fail CLOSED)

### F3.2 — Email bypass env var
- File: `lib/rate-limit.ts:14`
- Come F1.1

### F3.3 — SHA-256 → bcrypt
- File: `lib/auth.ts:56-61`
- Come F2.3

### F3.4 — Login lockout + timingSafeEqual (come F2.4)

### F3.5 — Password complexity (come F2.5)

### F3.6 — Logout Redis session (come F2.6)

### F3.7 — Cron dunning maxDuration
- File: `app/api/cron/dunning/route.ts`
- Aggiungi riga 1: `export const maxDuration = 60;`

### F3.8 — Webhook Stripe idempotency
- File: `app/api/webhooks/stripe/route.ts` (dopo `constructEvent`)
- Aggiungi:
  ```typescript
  const already = await redis.set(`webhook:processed:${event.id}`, "1", { nx: true, ex: 86400 * 7 });
  if (already !== "OK") {
    return NextResponse.json({ received: true, deduped: true });
  }
  ```

### F3.9 — Health endpoint reale (come F1.2, path `app/api/health/route.ts`)

### F3.10 — Recovery token invece di invoiceId (opzionale se tempo)
- File: `app/api/update-payment/[invoiceId]/route.ts`
- Genera `recovery_token` random 32B alla creazione del FailedPayment, salva in Redis TTL 7gg
- URL usa token invece di invoice ID
- Lookup con token, non ID

### F3.11 — SHARED-1 (ADMIN_API_SECRET)

### F3 target: 10 fix, ~3h

---

## F4 ParseFlow/DocuMint — `C:/Users/ftass/business-fast4-documint/`

### F4.1 — Rate limit fail-closed
- File: `lib/rate-limit.ts:47`
- Come F2.1

### F4.2 — Email bypass env var
- File: `lib/rate-limit.ts:20`
- Come F1.1

### F4.3 — SHA-256 → bcrypt
- File: `lib/auth.ts`
- Come F2.3

### F4.4 — pdfParse timeout 25s
- File: `app/api/v1/extract/route.ts:160-166`
- Wrap con:
  ```typescript
  const pdfData = await Promise.race([
    pdfParse(buffer),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("PDF_TIMEOUT")), 25_000))
  ]);
  ```

### F4.5 — Magic bytes validation
- File: `app/api/v1/extract/route.ts:92-100`
- `npm install file-type` oppure controllo manuale:
  ```typescript
  const sig = buffer.subarray(0, 4);
  const isPDF = sig[0]===0x25 && sig[1]===0x50 && sig[2]===0x44 && sig[3]===0x46; // %PDF
  const isZip = sig[0]===0x50 && sig[1]===0x4B && sig[2]===0x03 && sig[3]===0x04; // DOCX/XLSX
  if (!isPDF && !isZip) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  ```

### F4.6 — Filename sanitize
- Regex: `const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 100);`
- Reject se contiene `..` originariamente: `if (file.name.includes("..")) return 400`

### F4.7 — `err.message` non leak a client
- File: `app/api/v1/extract/route.ts:203-206`, register route 94-100
- Log internally, ritorna generic `"Internal server error"`

### F4.8 — Webhook Stripe idempotency (come F3.8)

### F4.9 — Health endpoint reale (come F1.2)

### F4.10 — Login lockout (come F2.4)

### F4.11 — Password complexity (come F2.5)

### F4.12 — Rimuovi tesseract.js (unused)
- `npm uninstall tesseract.js`
- Verifica nessun import attivo prima

### F4.13 — SHARED-1 (ADMIN_API_SECRET)

### F4 target: 13 fix, ~3-4h

---

## B7 CaptureAPI — `C:/Users/ftass/business-7-capture-api/`

### B7.1 — Error boundary globale
- Crea `src/app/error.tsx` (copia da `business-fast3-churnguard/app/error.tsx` e adatta import alias)
- Crea `src/app/global-error.tsx` (wrap con `<html><body>` per root errors)

### B7.2 — Middleware origin fix
- File: `src/middleware.ts:72-74`
- Sostituisci:
  ```typescript
  origin.includes("localhost") ||
  origin.includes("127.0.0.1");
  ```
  con:
  ```typescript
  (() => {
    if (process.env.NODE_ENV !== "production") {
      try {
        const u = new URL(origin);
        return u.hostname === "localhost" || u.hostname === "127.0.0.1";
      } catch { return false; }
    }
    return false;
  })();
  ```

### B7.3 — Webhook SSRF blocklist
- File: `src/app/api/webhooks/screenshot-complete/route.ts:50-63` (validation) + riga 113 (fetch)
- Import `isUrlBlocked` da `src/lib/renderer.ts`
- Prima del `fetch(webhook_url)`:
  ```typescript
  if (await isUrlBlocked(webhook_url)) {
    return NextResponse.json({ error: "webhook_url not allowed" }, { status: 400 });
  }
  ```
- Nel fetch: `fetch(webhook_url, { redirect: "manual", signal: AbortSignal.timeout(5000) })`

### B7.4 — Console.warn NODE_ENV guard
- File: `src/lib/renderer.ts:101`
- Avvolgi con: `if (process.env.NODE_ENV !== "production") { console.warn(...) }`

### B7.5 — Rimuovi fake crypto package
- `npm uninstall crypto` (è un trojan-ish, Node ha builtin)
- Verifica che nessun import da `require("crypto")` sia cambiato (Node builtin è l'unico corretto)

### B7.6 — API keys hash at rest (CRIT-4)
- File: `src/lib/api-store.ts:73` (e lookup correlato)
- Pattern: chiave Redis `apikey:{sha256(raw_key)}` invece di plaintext
- Copia pattern da `business-fast4-documint/lib/api-keys.ts:13-15` (`hashApiKey` SHA-256)
- Migration: 0 utenti ora, ma aggiungi script `scripts/migrate-apikeys.ts` per sicurezza futura

### B7.7 — Rate limit fail-closed (pattern simile agli altri, cercare con grep)

### B7.8 — Webhook idempotency
- File: `src/app/api/webhook/route.ts:67-74` (main Stripe webhook)
- Come F3.8

### B7.9 — SHARED-1 (ADMIN_API_SECRET)

### B7.10 — (opzionale) SSRF DNS resolve check su renderer
- File: `src/lib/renderer.ts` — aggiungi DNS resolve prima di Chrome goto

### B7 target: 10 fix, ~3h

---

## POST-FASE 1: Verifica finale (main thread)

Dopo che tutti 5 agenti hanno completato:

1. Review branch di ogni repo
2. Merge `resilience/fase1-security` → `master` in ordine: F1, F2, F3, F4, B7
3. Attendi Vercel deploy per ogni SaaS
4. Test smoke: `curl -sI https://<saas>/` → 200 per tutti 5
5. Test negative: provare curl con `Origin: https://evil.com/?x=localhost` su B7 → 403
6. Aggiorna `AUDIT-5-SAAS.md` con status "✅ FIXED" per ogni voce chiusa
7. Committa log fix in `shared-memory/security-fix-log-23apr.md`

---

## FASE 2 (prossima): Dependencies

Dopo FASE 1 verificata, main thread esegue:
```bash
cd business-fast1-complipilot && npm audit fix && npm run build && git commit -am "deps: audit fix" && git push
# ripeti per F2, F3, F4, B7
```
Più upgrade Next.js: `npm i next@latest` (tutti).

## FASE 3: GDPR MVP

DSAR endpoints (`/api/user/export` + `/api/user/delete`) + `vercel.json regions: ["fra1"]` + `SECURITY.md` breach playbook.

## FASE 4: CI/CD

Dependabot configs + Playwright 2x/day + Lighthouse CI + CodeQL.
