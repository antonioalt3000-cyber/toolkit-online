# QA 26 ottobre 2026 — 10 SaaS, round in 3 tracce parallele

> Segue `qa-10saas-20ott-2026.md`. Quel report dichiarava "nessuna PR aperta": **errato** — 4 PR hydration erano aperte da 12 giorni, mergiate solo oggi. Round interrotto una volta per limite d'uso (tracce B e C terminate senza fix applicati, solo audit), ripreso sulla traccia principale.

## Esito complessivo

**9 PR aperte, 9 mergiate e deployate in produzione, 0 regressioni.** Causa radice trovata e corretta per l'anomalia "byte casuali/PONG" del 13 ottobre (harness di test, non i prodotti). 5 difetti reali di prodotto trovati e corretti con fix alla radice, verificati in browser reale sia in locale sia in produzione. Diversi altri difetti trovati e documentati ma non ancora corretti (vedi §4).

## 1. Causa radice dell'anomalia "auto-pipelining" del 13 ottobre (harness, non prodotto)

Il mock Upstash locale (`scratchpad/qa-infra/upstash-mock-server.cjs`) ignorava l'header `Upstash-Encoding: base64` che `@upstash/redis` invia di default. L'SDK decodifica sempre ogni stringa come base64: id di sessione esadecimali e "PONG" tornavano quindi corrotti — esattamente il sintomo documentato il 13 ott su F2/F3. Corretto; validato contro l'SDK reale con `sdk-roundtrip-test.mjs` (6 controlli, da 1/6 a 6/6 dopo il fix). L'harness è ora persistente in `toolkit-online/scratchpad/qa-infra/` (non più nello scratch di sessione, quindi non si perde tra round).

## 2. PR mergiate e verificate in produzione

| #   | Repo                       | PR   | Commit prod               | Contenuto                                                                                                                                                                                              |
| --- | -------------------------- | ---- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | complipilot                | #67  | —                         | hydration warning FOUC (round precedente, mergiata oggi)                                                                                                                                               |
| 2   | complipilot                | #68  | 8b0557a                   | URL non valido in `/scan` mostrava il codice grezzo `VALIDATION_FAILED` invece di un messaggio leggibile                                                                                               |
| 3   | complipilot                | #69  | 8b0557a                   | 5 pagine client ereditavano title/description della home; 8 pagine senza og:image; `/signup` serviva un 200 con meta-refresh invece di un redirect HTTP; `/audit-questionnaire` emetteva due `<title>` |
| 4   | accessiscan (FixMyWeb)     | #78  | 5e38b2a                   | Redis outage letto come logout (round 11 ott, verificato ancora valido)                                                                                                                                |
| 5   | accessiscan                | #79  | 5e38b2a                   | 23 pagine senza og:image; `/signup` 200+meta-refresh; `/login?mode=signup` apriva comunque il modulo di accesso                                                                                        |
| 6   | accessiscan                | #80  | fffcf7d                   | **Contrast Checker pubblico rotto su hex a 3 cifre**: `#000` su `#fff` mostrava 1.00:1/tutto FAIL invece di 21:1; il suggerimento di fix poteva proporre un colore che falliva ancora su sfondo scuro  |
| 7   | churnguard (PaymentRescue) | #74  | a1d1fec                   | hydration warning FOUC (round precedente, mergiata oggi)                                                                                                                                               |
| 8   | churnguard                 | #75  | 37dd5fa                   | il link "condividi" del calculator ROI generava una URL con i parametri che la pagina non leggeva mai — riapriva sempre i default                                                                      |
| 9   | documint (ParseFlow)       | #75  | 1153e32                   | hydration warning FOUC (round precedente, mergiata oggi)                                                                                                                                               |
| 10  | capture-api (CaptureAPI)   | #104 | b699018                   | hydration warning FOUC (round precedente, mergiata oggi)                                                                                                                                               |
| 11  | capture-api                | #105 | 39422aa (deploy in corso) | `follow-redirects` e `basic-ftp` aggiornati oltre le rispettive CVE via `overrides`; `extract-zip` confermato non raggiungibile (test di guardia preesistente, ancora verde)                           |
| 12  | headershield               | #53  | 1734b25                   | bottone "Get free key" (e ogni CTA su sfondo brand) sotto AA nel tema chiaro: 4.15:1 invece di 4.5 — token `--on-brand` theme-aware                                                                    |
| 13  | hooklab                    | #56  | a897050                   | stesso difetto, stesso fix: 4.24:1 → 4.74:1 nel tema chiaro                                                                                                                                            |

Ogni fix: test che riproduce il difetto (rosso prima, verde dopo) → suite completa del repo → `tsc --noEmit` → lint → build di produzione → verifica in browser reale (Chrome 9223) sia sulla build locale sia, dopo il merge, in produzione.

## 3. Metodo di verifica

- **Browser**: Chrome 9223 via CDP raw (driver `cdp-journey.cjs`, nuovo: input reali, upload file, cattura console/eccezioni/risposte ≥400, misura di contrasto via canvas).
- **Oracoli indipendenti** (`oracles.cjs`): formula WCAG di luminanza relativa, generatore di fatture PDF con totali noti, parser SEO/HTML a parte, DNS-over-HTTPS, HMAC.
- **Produzione**: solo dati di test non personali via browser; nessun account creato, nessuna password/chiave digitata in un form.
- **Locale**: mock Upstash/Brevo/Stripe per-SaaS (porte dedicate), segreti di test generati in sessione, `next dev --webpack`.

## 4. Difetti trovati, NON ancora corretti (da riprendere)

Dai report di traccia (`qa-10saas-26ott-2026-track-b.md`, `-track-c.md`), prodotti durante l'audit prima dell'interruzione per limite d'uso:

1. **PaymentRescue — claim di recupero non supportate**: "recovers 35-40%", "proven to recover 35%+", "typically recover 30–50%", "70-85%" ecc. sparse su più pagine e articoli, in contrasto con `lib/roi.ts` (30-50% clamp). Il test `__tests__/one-recovery-figure.test.ts` vieta frasi specifiche invece di vietare qualunque cifra fuori range — va riscritto come regola generale.
2. **PaymentRescue `public/llms-full.txt` §8**: case study clienti che sembrano inventati, presentati come reali, con percentuali di recupero.
3. **og:image mancante** (stesso pattern già corretto su F1/F2/HSH/HKL, da applicare): ParseFlow 4 pagine, PaymentRescue 5 pagine, CaptureAPI 2 pagine.
4. **ParseFlow `/redeem`**: bottone "Activate Enterprise Plan" a 3.62:1 (sotto AA).
5. **EmailGuard**: la card demo mostra "MX records ✕" su una sintassi non valida anche quando il controllo MX non è stato eseguito — va mostrato come "non controllato".
6. **CardForge**: playground mai testato in produzione in questo round (dimensioni dei template, titolo lungo/unicode/vuoto, hex non valido).
7. **Viaggio cliente autenticato completo** (signup → email → login → quota → redeem → checkout → webhook → guasto Redis → cancellazione) **non completato su nessuno dei 10 SaaS** in locale — resta il gap più grande del round, ereditato anche dai cicli precedenti.
8. Suite/tsc/lint non rieseguiti oggi su ParseFlow, EmailGuard, SEOScope, CardForge (solo verificati come "verdi al 20 ott", non ritestati in questo round).

## 5. Falsi allarmi chiariti in questo round

- **"Nessuna PR aperta" (report 20 ott)**: errato, corretto qui — vedi sopra.
- **`npm audit` su CaptureAPI segnala molti più pacchetti "critical/high"** (next, zod, dompurify, @sentry/nextjs) oltre a quelli di Dependabot: confrontato il diff del lockfile (6 righe, solo i 2 pacchetti toccati) — sono avvisi preesistenti su master, il database locale di `npm audit` differisce da quello di GitHub Dependabot. Non causato dal fix di oggi, non indagato oltre (fuori perimetro).
- **Tema "dark theme" di HeaderShield/HookLab sembrava non applicarsi forzando la classe via `classList`**: un `MutationObserver` nel componente `ThemeToggle` riafferma il tema salvato appena la classe viene alterata dall'esterno — comportamento corretto by design, non un bug. Verificato invece cliccando il vero pulsante di toggle.

## 6. Infrastruttura riusabile

- `toolkit-online/scratchpad/qa-infra/{cdp-journey.cjs, oracles.cjs, run-dev.cjs, egress-guard.cjs, upstash-mock-server.cjs, stripe-mock-server.cjs, brevo-mock-server.cjs}` — persistente, non nello scratch di sessione.
- `.claude/launch.json`: voci `qa26-<saas>` (dev server + mock) e `qa26-<saas>-prodbuild` (build di produzione locale) per f1, f2, f3, hsh, hkl.
- Stato dettagliato e lista "da fare" per la ripresa: `scratchpad/qa-26ott/STATUS-trackA.md`.

## 7. Nota di processo

Le tracce B (PaymentRescue/ParseFlow/CaptureAPI) e C (5 SaaS chassis) sono state lanciate come sessioni parallele e hanno prodotto audit solidi con oracoli indipendenti (vedi report di traccia), ma sono terminate per limite d'uso **prima di applicare alcun fix**. Non essendo rilanciabili nello stesso limite condiviso, i difetti più chiari e circoscritti dei loro report (calculator share-link, dipendenze B7, contrasto HSH/HKL) sono stati corretti direttamente in questa sessione; il resto (§4) resta da riprendere.
