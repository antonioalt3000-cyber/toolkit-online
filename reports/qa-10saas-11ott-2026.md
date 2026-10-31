# Ricollaudo totale dei 10 SaaS "come un cliente" — round 2, 11 ottobre 2026

Segue la sessione del 6-7 ottobre (37 PR mergiate, gate 60/60, 7.413 test) che aveva chiuso tutto tranne la fase P3 (viaggio cliente completo con login/coupon/piano/email in locale), lasciata ferma al solo canarino F1. Questa sessione chiude quel gap sugli altri 9 SaaS, riverifica l'intero portfolio dopo 4 giorni di inattività e corregge alla radice il difetto trovato.

## Stato finale

**Produzione = master su 10/10** (commit dell'health-check combacia esattamente con l'HEAD locale di ciascun repo). **Nessuna regressione** dai 37 fix del 7 ottobre. **1 difetto reale trovato e corretto**, mergiato, deployato e riverificato in produzione.

## Metodo

Riutilizzato l'harness della sessione del 6-7 ottobre (ambiente locale con Upstash/Stripe/Brevo finti, egress-guard anti-produzione, già validato il 7 ott): per ciascuno dei 9 SaaS non ancora coperti è stato scritto un "canarino" — uno script che esegue l'intero viaggio cliente (signup/login, anti-bot, coupon admin→redeem, upgrade piano via webhook Stripe firmato, email catturate e lette nel contenuto, guasto Redis simulato su ogni endpoint critico, isolamento dalla produzione) usando oracoli indipendenti dove possibile (HMAC calcolati a mano, parsing HTML/vCard/QR indipendente, calendario lavorativo). In totale **~205 controlli automatici** eseguiti sui 10 canarini.

## Matrice 10 SaaS

| SaaS                        | Canarino                                   | Esito         | Difetti confermati |
| --------------------------- | ------------------------------------------ | ------------- | ------------------ |
| F1 CompliPilot              | riconfermato (18 check, identico al 7 ott) | ✅            | nessuno            |
| F2 AccessiScan/FixMyWeb     | nuovo (19 check)                           | ✅ (dopo fix) | **1 — corretto**   |
| F3 ChurnGuard/PaymentRescue | nuovo (26 check)                           | ✅            | nessuno            |
| F4 DocuMint/ParseFlow       | nuovo (24 check)                           | ✅            | nessuno            |
| B7 CaptureAPI               | nuovo (20 check)                           | ✅            | nessuno            |
| EmailGuard                  | nuovo (23 check)                           | ✅            | nessuno            |
| SEOScope                    | nuovo (16 check)                           | ✅            | nessuno            |
| HeaderShield                | nuovo (20 check)                           | ✅            | nessuno            |
| HookLab                     | nuovo (19 check)                           | ✅            | nessuno            |
| CardForge                   | nuovo (20 check)                           | ✅            | nessuno            |

Ogni canarino includeva: health, BotID/anti-bot, signup (con test dell'honeypot e del min-time-to-submit), login dove applicabile, generazione e riscatto coupon admin, upgrade di piano via webhook Stripe **firmato correttamente** (ogni repo ha nomi di header/secret propri — vedi "Difformità scoperte" sotto), verifica che l'email di provisioning sia catturata e leggibile, un oracolo indipendente sulla feature principale del prodotto, **simulazione di un'interruzione Redis** con verifica che ogni endpoint critico risponda 503 pulito (non 500, non 401 fuorviante) e che si riprenda in modo idempotente, e infine la prova che zero chiamate siano uscite verso Upstash/Stripe/Brevo reali.

## Il difetto trovato: F2 — un'interruzione Redis veniva letta come "utente disconnesso"

**Causa radice**: `getSession()` in `lib/auth.ts` aveva un `catch` generico che trasformava QUALSIASI errore — incluso un guasto di trasporto Redis — in "nessuna sessione". Di conseguenza, durante un'interruzione Redis (come quella reale del 20-30 settembre, già documentata nel codice), un cliente autenticato vedeva **401 "non autenticato"** su `/api/auth/me` invece di **503 "riprova"** — esattamente lo scenario che aveva già causato l'incidente di settembre su altre route, qui rimasto scoperto. Lo stesso buco (catch generico → 500 invece di 503) era presente in `signup`/`register`, e 4 route derivate (`auth/scans`, `user/api-key`, `user/delete`, `user/export`) non avrebbero gestito correttamente l'eccezione una volta corretto `getSession()`.

Il pattern corretto (`isRedisUnavailable()` + `serviceUnavailable()`) era **già usato** in `login`, `redeem`, `scan` e `resend-credentials` dello stesso repo — il buco era solo nei percorsi che non erano stati toccati dal fix di settembre.

**Fix**: [PR #78](https://github.com/antonioalt3000-cyber/accessiscan/pull/78) — `getSession()` ora rilancia l'errore quando è un guasto Redis (invece di restituire `null`), e gli 8 file che la usano mappano quell'eccezione su 503. Gate verde (tsc, lint, 583 test, build), CI 2/2, squash-merge, deploy confermato in produzione (commit `12293c9`), sanity check post-deploy (comportamento normale invariato: 401 senza sessione, scan con chiave 200).

## Scoperte utili (non difetti, ma differenze da ricordare tra i 10 repo)

- **Nomi campo anti-bot diversi per repo**: F2/F3 `password`-based; i 6 "semplici" usano honeypot+timestamp ma con nomi diversi — EG `company`/`ts`, HSH `website`/`formRenderedAt`, HKL `company_website`/`form_rendered_at`, CFG `company_website`/`form_ts`, SEO `company_url`/`rendered_at`. La risposta al trip varia: EG risponde 400/403 esplicito, SEO/HSH assorbono silenziosamente (200 senza chiave), CFG risponde 400.
- **F3 e F4 richiedono una firma HMAC aggiuntiva** sulle route admin critiche (`ADMIN_SIGNING_SECRET`, opzionale ma attiva se configurato) — F3 usa header `x-signature`/`x-timestamp` su `"ts.body"`, F4 usa `x-admin-timestamp`/`x-admin-signature` su `"ts.METHOD.path.body"`. Gli altri 8 repo accettano il solo `x-admin-secret`.
- **F3 ha un anti-hijack deliberato** sul binding `customerId→userId`: scritto solo se l'account è stato creato da quel checkout o se l'evento porta `metadata.userId` corretto, mai per un account pre-esistente risolto solo per email. Verificato nel codice, non è un difetto — ma va replicato nel fixture di test (serve sempre passare `metadata.userId`) per testare il motore di dunning in futuro.
- **B7 ha un controllo same-origin più stretto** (richiede corrispondenza esatta Origin↔Host, non un allow-list statico come F1): da ricordare per i test locali, serve usare lo stesso host (`127.0.0.1` o `localhost`) sia per l'URL di base che per l'header Origin.

## Fuori perimetro — portfolio-wide, da pianificare separatamente

**Vulnerabilità dev-dependency (non di produzione)**: confermate su almeno 4/10 repo (accessiscan, churnguard, capture-api, cardforge) e quasi certamente sugli altri 6 (stesso toolchain condiviso): **2 critiche** (RCE in `tinypool`, usato da `vitest` — esecutore di test, mai nel runtime servito) + alta/media su `braces`/`chokidar` (via `tailwindcss` 4.x) e `eslint-config-next`. Tutte richiedono bump **major** (vitest 5.x, tailwindcss 4.3.x, eslint-config-next 14.2.x) con rischio di regressione su test/stile — stesso pattern già visto e deliberatamente non affrontato su CaptureAPI/puppeteer-core il 7 ottobre. **Non toccate in questa sessione**: raccomando una sessione dedicata all'aggiornamento di questi 3 tool su tutti i 10 repo, testata a parte.

**Punti già aperti dal 7 ottobre, invariati**: nome pubblico account Stripe «TOOLKIT» nella riga di consenso del checkout (impostazione account, non codice); SPF dei 5 F-series/B7 senza `include:spf.brevo.com`; D14 CompliPilot vende accesso API sul piano Free (decisione di prodotto); tema "Auto" incoerente sulle F-series.

## Cosa NON è stato ripetuto in questa sessione (e perché)

Il contenuto pubblico (meta tag, canonical, contrasto WCAG, claim vs realtà — ~253 URL) e la configurazione DNS/email (SPF/DKIM/DMARC) erano già stati validati a fondo il 7 ottobre e **nessun codice che li riguarda è cambiato** da allora (il fix di questa sessione toccava solo la gestione di un'eccezione Redis in 8 file di autenticazione di un solo repo). Rifare da zero quel sweep non avrebbe trovato nulla di nuovo; i 10/10 commit in produzione sono comunque verificati identici a quelli già passati per quel sweep.

## Verifica finale P1 (gate)

Rieseguita la suite di test completa su tutti i 10 repo (il build era già stato verificato implicitamente lanciando ogni app nel harness): **7.413 test passati su 7.413**, cifra identica a quella del 7 ottobre — zero regressioni, zero drift. Campione di 6 endpoint cron/admin su altrettanti domini: tutti 401 senza segreto, come atteso.

## Consumi

**Zero email reali inviate**: ogni chiamata a Brevo durante i 10 canarini è stata intercettata dall'egress-guard locale e reindirizzata al finto Brevo (mai uscita verso `api.brevo.com`) — le ~10 email "catturate" sono righe in un log locale, non invii effettivi. L'unica interazione reale con Brevo in questa sessione è stata una lettura dei crediti dell'account (`GET /v3/account`, 294 liberi), nessuna scrittura. Upstash: zero comandi di produzione (tutto il viaggio cliente testato contro il Redis finto locale). Nessuna spesa.

## Pulizia

Rimossi tutti i worktree residui (sia quelli del 3 ottobre mai puliti, sia quelli di questa sessione), nessun processo `next`/Chrome rimasto attivo, `git status` pulito su tutti i 10 repo.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
