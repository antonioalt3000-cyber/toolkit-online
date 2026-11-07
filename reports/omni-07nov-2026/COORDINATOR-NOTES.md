# Omni-QA 7 nov 2026 — note del coordinatore (trasversale)

Round avviato il 6 nov 2026 ~23:15 UTC, subito dopo la chiusura del round 4-5 nov. Piano approvato:
`C:\Users\ftass\.claude\plans\pasted-content-id-2c76-role-agisci-encapsulated-pascal.md`.
Flussi: A (F1 F2 F3 F4 B7), B (CFG EG HSH HKL SEO), coordinatore (baseline + trasversale + report).

## Fase 0 — infrastruttura

| voce                                                  | esito                                                                 | prova                                                                                                                                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| produzione serve il commit di master, 10/10           | ✅                                                                    | `/api/health` 23:14 UTC: 67d23a2 60ada0d 1cafcb9 2f9823e f4071e8 95ad34d d6e35e0 cb117da 0c6d0cf 94c5b8d                                                                       |
| 10 repo puliti su master, node_modules reali          | ✅                                                                    | `git status`, `ls`                                                                                                                                                             |
| Chrome 9223                                           | ✅ avviato da me (era spento)                                         | `/json/version` Chrome/156                                                                                                                                                     |
| oracoli (`selftest.cjs`)                              | ✅ contrasto 21 e 4,54; fattura 309,97 + 65,09 = 375,06; A4; MX gmail | output del 6 nov 23:20 UTC                                                                                                                                                     |
| `example.com` non si risolve dal browser              | ⚠️ **ambiente**, non prodotto                                         | resolver locale 192.168.0.1 non risponde; 1.1.1.1, 8.8.8.8 e DoH sì → il selftest mostra «Impossibile raggiungere il sito». Non usare `example.com` come bersaglio dal browser |
| disco C:                                              | ⚠️ 14 GB liberi (95%)                                                 | `df` — nessun checkout o install aggiuntivo                                                                                                                                    |
| `AGENTS.md`/`CLAUDE.md` non tracciati in hsh/hkl      | ✅ benigni                                                            | generati da `next dev` il 14 ott, identici, 678 byte                                                                                                                           |
| `.gitignore` copre `apikey.txt` e PNG in `reports/**` | ✅                                                                    | `git check-ignore -v` (lezione R8)                                                                                                                                             |

## Trasversale in sola lettura

| voce                                                                                | esito                                             | dettaglio                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CRON_SECRET` su FixMyWeb (R4)                                                      | 🔴 **ancora assente**                             | `vercel env ls production` nessuna riga CRON. Resta al fondatore (accenderla fa partire review-requests e recover-checkouts, che mandano email a clienti reali)                                                                                                                     |
| monitor uptime dopo il retry (`2770099`)                                            | ✅ stabile                                        | nessun commit `status ->` nelle 24 h; ultimo 5 nov 15:38, prima del fix                                                                                                                                                                                                             |
| Brevo, ultimi 3 giorni, **senza** filtro `email=`                                   | ✅ nessun hard bounce, 0 blocked, 0 spam          | 50 delivered (tetto del campione)                                                                                                                                                                                                                                                   |
| 3 soft bounce `hello@seoscope.dev` → indirizzo `cre***@devtoolsmith.dev`            | ℹ️ **della sonda**, 4 nov 20:54-20:56             | «Unable to find MX of domain devtoolsmith.dev»: il riepilogo settimanale di SEOScope mandato all'account creator del collaudo, il cui dominio non riceve posta. Tre invii in 90 s = il cron invocato dal harness. Innocuo, ma conferma che il cron manda anche a indirizzi senza MX |
| 1 soft bounce EmailGuard «Your EmailGuard Key is Ready» → dominio `.pw` di un terzo | ⚠️ **deliverability, fuori dal nostro controllo** | 5 nov 09:26: `551-5.7.1 Your IP is black listed by SpamCop.org` — l'IP condiviso di Brevo è in SpamCop. È la mail con la chiave API di un cliente vero: se il suo MX consulta SpamCop non la riceve. Da riportare al fondatore, non risolvibile dal codice                          |

## Baseline di regressione (coordinatore)

`baseline-run.cjs`: per prodotto `sweep-public` + `journey-public` + `journey-core`; scrive `baseline/<slug>.json`
come segnale di via libera per i flussi A e B. Ordine alternato f1 cfg f2 eg f3 hsh f4 hkl b7 seo.

| slug | sweep                 | pubblico | core                                                           | esito                                                                                                                               |
| ---- | --------------------- | -------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| f1   | 42 pagine, 0 problemi | 6/6      | 7/7                                                            | ✅                                                                                                                                  |
| f2   | 51, 0                 | 6/6      | 12/13                                                          | 🔴 solo R4 (`CRON_SECRET` assente), identico al round del 4 nov: del fondatore                                                      |
| f3   | 33, 0                 | 6/6      | **nessun oracolo** in `journey-core` per f3 (esce 2 in 149 ms) | ⚠️ lacuna della **sonda**, non del prodotto. Cron provati a mano: i 5 di `vercel.json` danno 401 con segreto sbagliato e senza auth |
| f4   | 31, 0                 | 6/6      | 12/12 + 1 non verificato                                       | ✅ percorso positivo dei cron non esercitabile: `CRON_SECRET` è Sensitive e `vercel env pull` la dà vuota (identico al 4 nov)       |
| b7   | 39, 0                 | 6/6      | 11/11                                                          | ✅                                                                                                                                  |
| cfg  | 11, 0                 | 6/6      | 6/6                                                            | ✅                                                                                                                                  |
| eg   | 11, 0                 | 6/6      | 11/11                                                          | ✅                                                                                                                                  |
| hsh  | 11, 0                 | 6/6      | 7/7                                                            | ✅                                                                                                                                  |
| hkl  | 13, 0                 | 6/6      | 14/14                                                          | ✅                                                                                                                                  |
| seo  | 11, 0                 | 6/6      | 10/10                                                          | ✅                                                                                                                                  |

**Esito baseline (6 nov, ~23:30-23:55 UTC):** 253 pagine, 0 non-200, 0 senza og:image, 0 metadata ereditati, 0 h1 multipli, 0 backslash→500; giro pubblico 60/60; commit di produzione = master su 10/10. **Nessuna regressione rispetto al round 4-5 nov.** Grezzi in `baseline/<slug>.json` e `baseline/<slug>.<step>.log`.

## Altre misure trasversali

- **Indirizzi (RCPT, `evidence/rcpt-probe-07nov-2026.txt`)**: i 10 `hello@`/`support@`/`contact@` provati danno `250`; `privacy@fixmyweb.dev` e `privacy@captureapi.dev` danno `554 Relay access denied` come atteso (non devono comparire su nessuna pagina); il **controllo interno** casuale dà `554`, quindi la sonda è valida.
- **Pool partner T0 (`baseline/pools-T0.json`, solo numeri)**: consegnati/usati F1 976/58 · F2 977/76 · F3 469/44 · F4 966/62 · B7 962/58 · CFG 214/10 · EG 214/12 · HSH 214/9 · HKL 214/11 · SEO 214/10; interni HKL 1075. CFG 9→10 usati rispetto al 5 nov: coerente con il riscatto sbloccato a mano per il cliente del «coupon invalido» del 6 nov (il suo indirizzo compare fra i consegnati Brevo): **deduzione, non prova**.
- **Sul disco**: Chrome 9223 lasciato attivo (l'ho avviato io).

## Dove si è fermato il round (usage limit raggiunto) — da riprendere

1. **Contatti nel DOM servito da Vercel**: `contacts-browser-check.cjs` è partito e superava i 7 minuti; l'esito va in `evidence/browser-contacts-07nov-2026.txt` (se vuoto o assente, rilanciarlo: `node reports/omni-07nov-2026/contacts-browser-check.cjs`).
2. **CSP nel browser reale su produzione, 10 prodotti**: NON eseguito (`node csp-browser-check.cjs https://<dominio> / /pricing /redeem`).
3. **Flussi A e B**: sessioni `omni-flow-a` (`local_b4ad6ee7-f5b6-486e-b7d6-1fa1802f22c8`) e `omni-flow-b` (`local_80877682-bc7d-4c63-a478-e5f4d9f2eb3d`) avviate e libere di andare in produzione (marker `baseline/<slug>.json` presenti su 10/10). Leggere `A/FINDINGS.md`, `B/FINDINGS.md` e le loro note finali; **non** verificate da me. Nessuna PR di questo round risulta ancora mergiata da me.
4. **Chiusura**: `node pool-readonly.cjs T1` poi `node pool-readonly.cjs diff T0 T1` (i conteggi partner non devono muoversi per nostra mano); rilancio finale 10/10 con `baseline-run.cjs`; `FINAL-REPORT.md`, `REPERTI.md`, `node progress.cjs table`.
5. **Commit/push** dell'harness e dei report: **non fatto**. Prima scansione dei segreti nelle evidenze (`apikey.txt` e PNG sono già in `.gitignore`); commit in inglese, generico, senza `Co-Authored-By`.
6. **Memoria**: voce di progetto + puntatore in `MEMORY.md` (Edit puntuale, mai `open(...,"w")` prima di serializzare) + session log in `shared-memory`: non fatti.

## Aggiornamento 7 nov (dopo il reset del limite d'uso)

- **Contatti nel DOM servito da Vercel: 0 indirizzi non consegnabili** su tutte le pagine dei 10 prodotti (`evidence/browser-contacts-07nov-2026.txt`). Chiude il punto 1 dell'elenco sopra.
- **CSP in produzione, 10 prodotti × 3 pagine (`/`, `/pricing`, `/redeem`): 30/30 PASS** (`evidence/csp-prod-07nov-2026.txt`): 0 violazioni, React idratato, 0 script inline senza nonce, un nonce per richiesta. Chiude il punto 2.
- 🔴 **Falso rosso della sonda n. 2 del round, mio**: il primo giro CSP dava 30/30 ROSSO perché MSYS ha convertito l'argomento `/` in `C:/Program Files/Git/` e il browser cercava `complipilot.devc/Program Files/Git/` (`ERR_NAME_NOT_RESOLVED`). Era già in memoria («serve `MSYS_NO_PATHCONV=1`») e l'ho ripagato. Rilanciato con la variabile: verde. (Il n. 1: `f3` senza oracolo in `journey-core`.) 🔑 Un rosso che arriva su **tutti** i prodotti con lo stesso testo di errore è quasi sempre della sonda.
- **Flussi A e B ripresi** con `SendMessage` (sessioni idle per limite d'uso). B ha **riprodotto R16 su CardForge** in locale e **letto nel codice** 6 difetti dei 4 fratelli (rifiuto anti-bot con l'etichetta del coupon su EG/HSH/SEO, signup con 200 finto su HSH/HKL/SEO, «Bot detected.» su EG, `stale-form` a 6 h, `bucketByDay` identico nei 5 repo): da riprodurre prima di chiamarli reperti (`B/FINDINGS.md`). A ha solo A-ENV-1 (dev server Turbopack di F3 in loop, aggirato con la build di produzione).

## Verifica indipendente del coordinatore, 7 nov ~01:25 UTC (non dai report dei flussi)

- **12 PR di prodotto mergiate e live**, lette con `gh pr list --state merged` (esclusi Dependabot) e confrontate con `master` remoto (`gh api .../commits/master`) e con il campo `commit` di `/api/health`: **10/10 prodotti allineati** (produzione = master remoto). A: churnguard#88 (`80afb41`), documint#89 (`f27e164`). B: cardforge#57/#58, emailguard#60/#61, headershield#60/#61, hooklab#63/#64, seoscope#66/#67.
- **Scansione segreti** prima di committare: `gitleaks` → 1 segnalazione, **falso positivo** (`journey-core.cjs:706`, costante `qa-colla…` che l'oracolo HMAC di HookLab usa come segreto di prova; riga identica a quella già nel repo da `omni-04nov-2026`). `grep` di `*_live_`, `whsec_`, `xkeysib-`: solo valori di mock locali o prefissi troncati.
- **Lacune residue dichiarate dai flussi** (da chiudere, mandato «completa il tutto»): A → `lineItems` ParseFlow vuoto con migliaia a spazio/segno meno, giri locali f1/f2/f4/b7, subset «cliente fedele» sulle F-series, copy del banner cookie («serve relevant ads» senza annunci). B → riscatto reale in produzione sui 5 round-2, casi limite core, giri locali, `bucketByDay` nel browser.
- Sessione del flusso A **archiviata dall'app**: riattivata da me (`unarchive_session`) per riprendere il suo contesto; entrambi i flussi riavviati con `SendMessage`.
- `journey-deep.cjs` di questo round = versione corretta del flusso A (contesto Chrome isolato: lo stato di partenza del profilo condiviso aveva dato un falso rosso su FixMyWeb).

## Riservato al fondatore (invariato)

`CRON_SECRET` di FixMyWeb (R4, verificato ancora assente) · rotazione `INTERNAL_SECRET_KEY` (F1/F2) · riconiare le chiavi API già in storia git · credenziali Upstash alle preview · ticket Vercel sul soft-404 · alias di posta su Porkbun · documint#79 · PR Dependabot · **nuovo**: l'IP condiviso di Brevo risulta su SpamCop, e la mail con la chiave EmailGuard di un cliente vero ha avuto un soft bounce il 5 nov (non risolvibile dal codice).
