# QA 26 ott 2026 — Traccia B (PaymentRescue, ParseFlow, CaptureAPI) — PARZIALE

> Interrotta per limite d'uso. Nessuna PR aperta, nessun codice prodotto modificato. Evidenze: `scratchpad/qa-26ott/evidence/{f3,f4,b7}/`, script: `scratchpad/qa-26ott/track-b/`.

## Fatto

| Area                                               | Esito                                                                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy hydration in prod                           | parseflow 1153e32 ✅, captureapi b699018 ✅, paymentrescue a1d1fec ✅                                                                 |
| PaymentRescue calculator (prod, browser)           | 6/6 casi = oracolo `lib/roi.ts`, clamp inclusi (churn 1-30, rate 30-50)                                                               |
| PaymentRescue churn predictor (prod)               | 5/5 casi (score, livello, churn 6 mesi), confini 25 e 70 inclusi                                                                      |
| ParseFlow playground (prod, upload reale)          | 23/23: fattura US (1332.80), fattura EU "1.234,56" (5626.38), fixture INV-2026-0042 (5201.79) esatte al centesimo; JSON UI = JSON API |
| CaptureAPI demo/playground/meta-inspector (prod)   | 5/5 + 15/15 (visitatore anonimo isolato: 800×600 png/jpeg, clamp 1920×1080 dichiarato, SSRF 169.254/localhost/10.x → 400) + 4/4       |
| CaptureAPI a pagamento (chiave creator via script) | 9/9: 1024×768, full page 4388 px, PDF A4 5 pp, formato A9 → 400, OG 1200×630, SSRF → 400                                              |
| Locale F3                                          | harness sbloccato (vedi note), signup → dashboard verificato; viaggio completo `f3-local.cjs` lanciato ma NON letto                   |

## Difetti trovati (NON ancora corretti)

1. **PaymentRescue — link "condividi" del calculator**: copia `?mrr=&churn=&txn=` ma la pagina non legge i parametri → il link riapre i default (verificato in prod). Manca anche il tasso di recupero nel link.
2. **PaymentRescue — affermazioni di recupero non sostenute** (contro la regola scritta in `lib/roi.ts`): "{SITE_NAME} recovers 35-40%" (stripe-churn-prevention), "proven to recover 35%+" (dunning-automation), "PaymentRescue customers typically recover 30–50%" (faq-client), 35-40%/20-40%/60-70% in pagine e blog, "Recoverable (35%)" nel blog, "Typical recovery rate 70-85%" in case-studies. La guardia `__tests__/one-recovery-figure.test.ts` vieta frasi precise invece della regola → va riscritta per vietare qualunque cifra di recupero diversa da 30-50% e ogni pretesa di misura.
3. **PaymentRescue `public/llms-full.txt` §8**: casi cliente inventati presentati come reali ("Berlin-based DevTools… 47%", "French DTC food brand…") + tassi attribuiti a concorrenti con nome senza fonte. Da rimuovere/etichettare come illustrativi.
4. **og:image mancante (prod)** su 11 pagine: F3 /recovery /pricing /calculator /tools/churn-predictor /free; F4 /playground /free /blog/pdf-parsing-guide /case-studies; B7 /free /screenshot-api (openGraph proprio senza `images` → perde l'immagine ereditata).
5. **ParseFlow /redeem**: bottone "Activate Enterprise Plan" attivo a 3.62:1 (bianco su cyan-600, 16px semibold) < AA 4.5.

## Osservazioni (non difetti)

- Title/description: nessuna pagina delle 3 app serve più quelli della home (fix "b" già presente).
- F3: ogni pagina pubblica fa `GET /api/auth/me` → 401 in console per gli anonimi (risposta corretta, rumore + invocazione inutile).
- F3: API `/api/user/delete` ed `/export` esistono ma nessun bottone in dashboard; la privacy descrive la cancellazione come azione dell'utente.
- CaptureAPI: siti dietro Cloudflare (es. w3.org) restituiscono la pagina di verifica, catturata con 200 senza segnalazione al cliente (UA dichiarato di proposito).

## Da fare

- Leggere `track-b/f3-local.log` (server `qa26-f3-turbo` attivo su 3203) e completare: checkout→mock Stripe, webhook upgrade, redeem, dunning, guasto Redis, export/delete.
- Viaggi locali F4 e B7 (`qa26-f4-turbo`, `qa26-b7-turbo`).
- Fix 1-5 + B7 `overrides` follow-redirects 1.16.1 / basic-ftp 6.2.1 + chiusura motivata alert extract-zip.
- Suite vitest + tsc + lint dei 3 repo; mobile 375px della sweep pubblica da rieseguire (`public-sweep.cjs`, il bug del mio helper è corretto).

## Modifiche all'harness condiviso

- `qa-infra/run-dev.cjs`: 2° argomento opzionale `turbo` (default invariato) + voci `qa26-{f3,f4,b7}-turbo` in launch.json. Motivo: `next dev --webpack` + CSP senza `unsafe-eval` → React non idrata nel browser.
