# Ricollaudo totale dei 10 SaaS «come un cliente» — 6-7 ottobre 2026

**Esito in una riga:** produzione e master allineati su 10/10; **37 PR di correzione mergiate e deployate** (4 ondate); gate finale **60/60 step verdi, 7.413 test** (3 ott: 5.697); i difetti del 3 ott sono chiusi o riportati; trovati e chiusi 7 problemi nuovi, tra cui una **RCE critica in `next/og`**. Restano 5 decisioni tue e un perimetro non coperto (vedi §8).

## 1. Cosa è stato fatto

| Fase                                          | Esito                                                                                                                                    |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Preflight                                     | repo allineati, produzione = master 10/10, chiavi creator 8/8, Chrome 9223                                                               |
| P1 gate su master pulito                      | 60/60 step, 0 workflow con `contents: write`, 7.413 test                                                                                 |
| P2 harness locale «clienti finti»             | fake Upstash + stub Brevo/Stripe + guard di rete; 10/10 app avviate in locale, zero accessi a Redis di produzione                        |
| P4 rete a maglia larga (locale, senza chiavi) | 369 route, ogni route × input ostili e con Redis guasto; **0 critical**; SSRF: 0 canary colpiti su ogni payload IP                       |
| P5 produzione da ospite (browser reale)       | 10/10 percorsi: demo/scan con dati inventati, checkout fino a Stripe, redeem con codice falso                                            |
| P5 API produzione con chiavi creator          | ~306 controlli con oracoli indipendenti, **0 difetti di prodotto** (i 12 «FAIL» erano attese vecchie del mio harness)                    |
| P5 autocontrolli                              | **27/27 cron** protetti (401), **12/12 webhook Stripe** respingono firma falsa, run CI/Watchdog su master tutte verdi                    |
| P6 sweep contenuti                            | 293 URL × 3 viewport: 0 React #418, 0 link/immagini rotte, JSON-LD valido, 1 H1 ovunque, 0 overflow mobile; contrasto misurato in 3 modi |
| P7 email                                      | DKIM+DMARC 10/10, Brevo 7 gg: 88 invii / 86 consegnati / 0 bounce                                                                        |

## 2. Difetti del 3 ott: ri-prova in produzione

D2, D4 (0 errori #418 su 293 pagine × 3), D9–D11 e D19 (fattura e DOCX caricati dal browser: numero `INV-2026-0457` e totale 1.875,50 corretti; nessun claim OCR), D12 (SSRF → 422 «Internal/private URLs…»), D16 (brand corretto in testata su 8/8 checkout), D17 (checkout da ospite → link `signup?next=` / `login?next=`), D5–D8 (suite F1 54/54 con oracolo sul testo di legge) : **chiusi**. D1, D3, D15, D18: coperti da test e CI (non riproducibili in produzione senza guasto o login). **D13 era chiuso solo a metà** (vedi N1). **D14** resta decisione tua.

## 3. Difetti nuovi trovati oggi

| ID     | Gravità                  | Cosa                                                                                                                                                                                                                                                                                                                                     | Stato                                                                                                    |
| ------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **N0** | critica                  | Next.js 16.2–16.3.5 **RCE in `next/og` ImageResponse** (GHSA-vcvr-r3jv-pc5j, 30 set): tutti e 10 i prodotti usano `next/og`; in più sharp (advisory di oggi), dompurify ecc.                                                                                                                                                             | ✅ next 16.3.8 su 10/10, mergiato e verificato live                                                      |
| N1     | media                    | `og:title`/`og:description` della home ereditati da 209 pagine su 273 (condivisione social); `og:url`=home su 39                                                                                                                                                                                                                         | ✅ 209→~11 (restano pagine client senza `metadata`), og:url 39→0                                         |
| N2     | media                    | `canonical` assente su 95 pagine                                                                                                                                                                                                                                                                                                         | ✅ 95→0 (`./` nel layout)                                                                                |
| N2b    | bassa                    | **effetto collaterale mio**: con `./` la 404 di CompliPilot emetteva canonical `/_not-found`                                                                                                                                                                                                                                             | ✅ trovato dopo il deploy, corretto (#64); 404 senza canonical e noindex su 10/10                        |
| N3     | media                    | PaymentRescue home: etichetta «35%» ma calcolo al 40%; «ROI annuale» era il recuperato lordo                                                                                                                                                                                                                                             | ✅ etichetta dalle costanti, titolo «Estimated revenue recovered per year», nota sulle ipotesi           |
| N5     | media                    | Body JSON `null`/`[null]`/`"str"` → **500 invece di 400** su ~20 route di 9 repo; F2 login/signup senza corpo → 500; `%` malformato nel path → 500; **Redis guasto non mappato a 503** su 8 route; hostname di metadata cloud non bloccati per nome; errori di rete grezzi nel corpo; F2 scan di un dominio inesistente → 503 fuorviante | ✅ helper unico + test di contratto per repo                                                             |
| **N6** | **alta (accessibilità)** | **Contrasto WCAG**: testo invisibile (1.06–2.8:1) in tema chiaro/scuro su FixMyWeb (prodotto di accessibilità!), CompliPilot, PaymentRescue, ParseFlow, CaptureAPI, SEOScope (113/100/111 pagine su 268 nei 3 modi)                                                                                                                      | ✅ **113→0, 100→2, 111→0**; i 2 residui sono testo su sfondo a gradiente (verificati a vista: leggibili) |
| N7     | bassa                    | B7: `/api/v1/demo` con URL bloccato → HTTP 500                                                                                                                                                                                                                                                                                           | ✅ 400                                                                                                   |

## 4. PR mergiate (37)

- **Sicurezza (10):** complipilot#62 · accessiscan#73 · churnguard#70 · documint#71 · capture-api#101 · emailguard#50 · seoscope#54 · headershield#50 · hooklab#53 · cardforge#45
- **Meta/canonical/404/ROI (11):** complipilot#63+#64 · accessiscan#74 · churnguard#71 · documint#72 · capture-api#100 · emailguard#51 · seoscope#55 · headershield#51 · hooklab#54 · cardforge#46
- **Robustezza API (10):** complipilot#65 · accessiscan#75+#77 · churnguard#72 · documint#74 · capture-api#102 · seoscope#56 · headershield#52 · hooklab#55 · cardforge#47
- **Contrasto (6):** accessiscan#76 · complipilot#66 · churnguard#73 · documint#73 · capture-api#103 · seoscope#57
  Ogni PR: test rossi su master e verdi dopo (anche guardie anti-ricaduta: test di contratto sui `route.ts`, sui meta del layout, sulle coppie di colore), gate completo, CI verde.

## 5. Errori di misura miei (trovati e corretti, per onestà)

(1) probe del contrasto estratto come testo senza valutare il template → regex disattivata → un falso «0 pagine» (scoperto perché contraddiceva un caso visto a vista); (2) parser colori senza `oklch()` → falsi «bianco su bianco» in tema chiaro; (3) un agente ha ucciso per porta un server del mio P4 (rieseguito); (4) il disco C: si è riempito durante gate, harness e agenti in parallelo (causa esatta non accertata: un `node_modules` pesa ~0,7 GB, quindi non bastano da soli): risolto cancellando `node_modules`/`.next` dei worktree (libero da ~15 a ~36 GB), regola «un repo alla volta».

## 6. Consumi

Upstash: **non leggibile** (console non loggata nel profilo 9223, nessun login per vincolo): stima mie chiamate in produzione ≈ 5.000 comandi (poco sopra il budget di 4.000; ~3 giri di suite API + percorsi da ospite). Brevo: 0 invii dal QA (credito 295/300). GitHub Actions: +37 PR × (Lint&Build, Semgrep, Lighthouse dove presente) ≈ +250–350 min stimati sul mese: da controllare in Billing. Nessuna spesa.

## 7. Account / dati di prova

Produzione: **nessun account o coupon creato**. Locale: solo valori di test in `harness/seed.json` (scratchpad), mai in chat.

## 8. Cosa resta a te / non coperto

**Decisioni tue**

1. **Stripe, nome pubblico dell'account** (N4): la riga «autorizzi **TOOLKIT** ad addebitarti» e «Paga in modo sicuro su TOOLKIT» in tutti i checkout vengono da Stripe → Settings → Business → Public details (non dal codice); stesso tema del descrittore bancario «TOOLKITONLINE».
2. **SPF dei 5 prodotti F-series/B7** (complipilot, fixmyweb, paymentrescue, parseflow, captureapi): manca `include:spf.brevo.com` (i 5 nuovi lo hanno); DMARC passa via DKIM, ma conviene allinearli (DNS Porkbun). DMARC è `p=none` ovunque.
3. **D14**: CompliPilot vende «API access» come Pro+ ma la chiave Free funziona.
4. **CaptureAPI**: restano 2 vulnerabilità _high_ transitive (`basic-ftp` via puppeteer-core, `braces` via next-sitemap) il cui fix richiede un major/rimpiazzo; `puppeteer-core` è fissato a 24.40.0 (24.43 rompe i tipi). ParseFlow: 5 _moderate_ (mammoth/exceljs) lasciate di proposito.
5. Tema «Auto»: CP/PR/PF/B7 aprono scuri anche con OS chiaro (design dichiarato nel codice), FixMyWeb apre chiaro anche con OS scuro; i 5 nuovi seguono l'OS.

**Residui minori (non corretti)**: ~11–15 pagine client senza `metadata` (signup, redeem, dashboard…) mostrano ancora titolo/descrizione della home nei meta; `og:image` assente sulle pagine con `openGraph` proprio senza immagine (F1 7, F2 23, F3 5, F4 4, HSH 5); colonna statica «Recoverable (35%)» in un articolo blog di PaymentRescue; una riga di FixMyWeb con rapporto dichiarato 2.9:1 che misura 4.91; HeaderShield e HookLab: AA 4.15–4.24:1 sul bottone «Get free key» (borderline, non corretto).

**Non coperto (onestà)**: i **flussi con login/piano/coupon/email in locale** (P3) non sono stati eseguiti oltre al canarino su CompliPilot: dashboard con piano e quota veri (classe D15), riscatto coupon con mint locale, contenuto delle email di benvenuto, webhook Stripe firmati che cambiano piano, monitor+cron con alert, F3 dunning. Le chiavi creator hanno coperto le funzioni premium via API, ma non il browser autenticato. L'SSRF dietro autenticazione è stato verificato in produzione con le chiavi creator (suite), non con la matrice locale. L'harness locale (`harness/`, `contract/`) è pronto per rifarlo. Non toccati per regola: PR Dependabot (10 aperte), toolkit-online#21, bozze email api.market/quicksaasbrowser (invio tuo), DealMirror/DealFuel.

## 9. Evidenze

Scratchpad sessione `95537c0f`: `qa-06ott/STATUS.md` (tracker), `evidence/` (p0, p4, p5, p6, sweep2, final), `gate2/SUMMARY.txt`, `harness/`, `contract/`. Piano: `.claude/plans/pasted-content-id-741a-ehi-gemini-purrfect-rivest.md`.
