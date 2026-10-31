# QA 26 ott 2026 — regole comuni alle 3 tracce

Piano approvato: `C:\Users\ftass\.claude\plans\pasted-content-id-1f79-role-agisci-curried-ocean.md`

## Tracce (repo disgiunti: nessuna traccia scrive nei repo di un'altra)

| Traccia | Sessione                           | SaaS                                                   | Porte dev        |
| ------- | ---------------------------------- | ------------------------------------------------------ | ---------------- |
| A       | coordinatore (sessione principale) | F1 CompliPilot, F2 FixMyWeb                            | 3201, 3202       |
| B       | qa26-legacy                        | F3 PaymentRescue, F4 ParseFlow, B7 CaptureAPI          | 3203, 3204, 3207 |
| C       | qa26-chassis                       | EmailGuard, SEOScope, HeaderShield, HookLab, CardForge | 3211-3215        |

## Harness (`toolkit-online/scratchpad/qa-infra/`)

- `cdp-journey.cjs` — `Journey.open(url,{mobile})`, `click/type/press/upload/waitFor/text/waitForResponse/contrast/overflowX/screenshot/report/close`. Input reali, focus emulation, cattura console/eccezioni/risposte >=400. Ogni traccia chiude SOLO i tab che apre.
- `oracles.cjs` — contrastRatio, pngDims/jpegDims, pdfInfo, hmacHex/hmacB64, stripeSigHeader, rawGet, doh/emailDns, seoParse, invoiceTotals/makeInvoicePdf.
- `run-dev.cjs <saas>` via `preview_start` con le configurazioni `qa26-<saas>` di `.claude/launch.json` (f1 f2 f3 f4 b7 eg seo hsh hkl cfg). Mock Upstash/Brevo/Stripe per SaaS, segreti di test generati in `qa-26ott/state/<saas>.json`, egress-guard attivo. Email catturate: `GET http://127.0.0.1:<brevo>/__qa/sent`; sessioni checkout: `GET http://127.0.0.1:<stripe>/__qa/sessions`; guasto Redis: `POST http://127.0.0.1:<upstash>/__qa/outage {"on":true}`.
- `sign-stripe-webhook.cjs` — firma webhook per il solo ambiente locale.
- Mock Upstash corretto il 26 ott (base64 `Upstash-Encoding`): l'anomalia "byte casuali / PONG" del 13 ott era dell'harness. Prova: `sdk-roundtrip-test.mjs` 6/6.

## Regole non negoziabili

1. Produzione: nessun account creato, nessuna password inserita, nessuna chiave digitata in un form, nessun pagamento, nessun webhook firmato verso la produzione. Le funzioni a pagamento si chiamano da script con le chiavi creator lette da `~/secrets-private/saas-creator-keys.md` dentro lo script (mai in argv, mai in chat, mai nei report).
2. Locale: viaggio autenticato completo (signup, email, login, quota, redeem, checkout, upgrade via webhook firmato, delete) con valori di test generati in sessione.
3. example.com NON risolve da questa macchina (curl e Chrome): per gli oracoli usare target raggiungibili (github.com, pagine W3C, i nostri domini). Dal lato prodotto (server Vercel) example.com funziona.
4. Ogni output confrontato con un oracolo indipendente; ogni check registrato come "passo → atteso → osservato → evidenza".
5. Fix: riproduci → causa → test che fallisce → fix → suite + `tsc --noEmit` + lint + build → branch da `origin/master` → `git add` SOLO dei file del fix (mai `-A`: CLAUDE.md/AGENTS.md modificati sono dell'utente) → commit inglese generico SENZA Co-Authored-By → PR → CI verde per nome → squash-merge → Vercel READY + `/api/health` commit nuovo + curl non autenticato → rifare il viaggio browser.
6. Verificare la cwd prima di build/git (`cd /c/Users/ftass/<repo> && pwd && ...`). Un `vitest` alla volta per traccia. Se il disco C: scende sotto 8 GB: fermarsi, pulire i `.next` propri.
7. Rate-limit: controllare lo status della chiamata a monte prima di dichiarare un'anomalia (lezione 20 ott).
8. Non toccare: PR Dependabot, DealMirror/DealFuel, Stripe account settings, DNS.

## Evidenze e report

- Evidenze: `toolkit-online/scratchpad/qa-26ott/evidence/<saas>/` (screenshot, JSON delle risposte, output suite).
- Report di traccia: `toolkit-online/reports/qa-10saas-26ott-2026-track-<a|b|c>.md` con: tabella per SaaS (passo → atteso → osservato → evidenza), suite (conteggio vs baseline), PR aperte/mergiate con commit in prod, difetti trovati (causa radice + fix), cose NON coperte (onestà).
- Baseline suite: F1 901, F2 583, EG 569, SEO 796, HSH 749, HKL 875, CFG 717 (F3/F4/B7: rilevare e confrontare con il totale 11 ott 7.413).

## Stato fix trasversali (Fase 0, fatto dal coordinatore)

- PR hydration mergiate: complipilot#67 → c000639, churnguard#74 → a1d1fec, documint#75 → 1153e32, capture-api#104 → b699018 (F4/B7: la traccia B verifica che il deploy arrivi in prod).
- SPF: NON modificato. Prova: intestazioni di un'email reale da captureapi.dev → dkim=pass d=captureapi.dev, spf=pass su bounce Brevo (sender-sib.com), dmarc=pass, consegna Inbox. Brevo usa il proprio return-path → `include:spf.brevo.com` non avrebbe effetto.
