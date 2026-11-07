# Flusso B — reperti (omni-QA 7 nov 2026)

Prodotti: CardForge `cfg` · EmailGuard `eg` · HeaderShield `hsh` · HookLab `hkl` · SEOScope `seo`.
Formato: passo → atteso → osservato → evidenza → classificazione → stato.
Classificazione: **prodotto** / **sonda** (difetto del mio strumento) / **ambiente**.

> **Stato finale 7 nov**: 15 PR mergiate e verificate in produzione (5 anti-bot + 5 grafico + 5 checkout con Redis giù). Nessuna scrittura in produzione da parte mia (matrice `--prod` con codici finti). Resta fuori, dichiarato, ciò che sta in fondo a questo file («Non eseguito»).

## Metodo

`B/fidelity-matrix.cjs <slug> [redeem|signup] [--only R16,S08]` — matrice «cliente fedele» nel Chrome :9223, nessuna
scorciatoia: orologio ±3 s/5 min/1 h/7 h/1 giorno, fuso+locale RTL, autofill che riempie l'honeypot, invio <1,2 s,
doppio click/Enter, due schede, 3G lento, UA Safari/Firefox mobile, tracker bloccati, refresh dopo il riscatto,
rate limit. Per ogni rifiuto il verdetto chiede: **codice e messaggio dicono la causa vera, e il consiglio è
seguibile?** Isolamento tra scenari con `X-Forwarded-For` diverso per scheda (solo locale).

## Riprodotto nel browser (CardForge, locale, Turbopack + mock)

| id               | cosa                                                                                                                                                                                 | esito                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R01–R15, R17–R22 | riscatto: orologio ±3 s…±1 giorno, fuso/RTL, Safari/Firefox, tracker bloccati, 3G lento, invio veloce + «riprova dopo l'attesa», doppio click/Enter, due schede, refresh, rate limit | **PASS** (24/24 col criterio vecchio di R16)                                                                                                                                                                                              |
| S01–S09          | signup, stessi ambienti                                                                                                                                                              | **PASS** dopo aver corretto la sonda (vedi sotto)                                                                                                                                                                                         |
| **R16**          | autofill riempie l'honeypot → `FORM_UNVERIFIED` «This form could not be verified. **Please reload the page** and try again.»                                                         | **prodotto, minore, APERTO** (residuo noto): il consiglio non può aiutare, il password manager riempie lo stesso campo. Stesso codice per honeypot e per token scaduto (>24 h). Con il criterio «il consiglio è seguibile» R16 è **FAIL** |

Prova negativa: R17/S09 (invio veloce) vengono **rifiutati** con `FORM_TOO_FAST` e il riprova funziona (R17b): il gate non si è spento.

## Riprodotto nel browser — EmailGuard (locale, 7 nov) — evidenza `evidence/eg/`, `B/eg-matrix-*.log`

| id      | passo                                                            | atteso                      | osservato                                                                                                                 | classe                            |
| ------- | ---------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| R07     | riscatto con orologio −7 h (= tab aperto da ~7 h), coupon valido | riscatto                    | 400 `BAD_REQUEST` «**Invalid or expired coupon code.**», coupon intatto (`valid=true`)                                    | **prodotto** (`stale-form` a 6 h) |
| R02b    | orologio +3 s, persona che impiega ~3,6 s                        | riscatto                    | stesso 400 «Invalid or expired coupon code.»: la fascia di skew piccolo è **reale** (CardForge, col token firmato, passa) | **prodotto**                      |
| R16     | autofill riempie `company`                                       | rifiuto che nomini la causa | 400 «**Bot detected.**» (schema zod, prima del controllo anti-bot)                                                        | **prodotto**                      |
| R17     | autofill + click subito                                          | `FORM_TOO_FAST`             | 400 «**Invalid or expired coupon code.**», coupon intatto; il riprova dopo l'attesa funziona (R17b PASS)                  | **prodotto**                      |
| S04     | signup, tab aperto 7 h                                           | iscrizione                  | 400 «**A valid email is required.**» con email valida                                                                     | **prodotto**                      |
| S08/S09 | signup honeypot / invio veloce                                   | rifiuto onesto              | «Bot detected.» / «A valid email is required.» (cause sbagliate)                                                          | **prodotto**                      |

## Riprodotto nel browser — HeaderShield (locale, 7 nov) — `evidence/hsh/`, `B/hsh-matrix-*.log`

| id        | passo                                                                                                 | osservato                                                                                   | classe       |
| --------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| R02b      | orologio +2,5 s, persona che impiega 3,0 s esatti (campi riempiti subito, poi attesa: deterministico) | rifiutata come «troppo veloce» (400, coupon intatto): la fascia di skew piccolo è **reale** | **prodotto** |
| R16       | autofill riempie l'honeypot                                                                           | 400 «**Invalid or expired coupon code.**», coupon intatto (`valid=true`)                    | **prodotto** |
| R17       | autofill + click subito                                                                               | stessa etichetta sbagliata; il riprova dopo l'attesa funziona (R17b PASS)                   | **prodotto** |
| S08       | signup, honeypot riempito                                                                             | **200 di successo finto** («Check your inbox for your key.»), nessuna chiave creata         | **prodotto** |
| R07 / S04 | tab aperto 7 h                                                                                        | accettato (HSH ignora lo stale): **non** è un difetto qui, solo su EmailGuard               | —            |

R02b col criterio non deterministico (digitazione reale) era passato su HSH: la fascia dipende dalla velocità di digitazione; per questo la sonda ora riempie e poi attende.

## Riprodotto nel browser — SEOScope e HookLab (locale, 7 nov)

| prodotto | id        | osservato                                                                                                                                                                                                 | classe                             |
| -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| seo      | R02b      | skew = tempo di lettura (3,0 s): 400 «Invalid or expired coupon code.» (con skew 2,5 s era passato: la fascia dipende dalla latenza di idratazione, quindi lo scenario usa skew = attesa, deterministico) | **prodotto**                       |
| seo      | R16 / R17 | 400 «**Invalid or expired coupon code.**» (flat `{error}`, nessun codice), coupon intatto; R17b PASS                                                                                                      | **prodotto**                       |
| seo      | S08       | **200 di successo finto** («This email already has a key. Check your inbox…»)                                                                                                                             | **prodotto**                       |
| seo      | R07 / S04 | tab aperto 7 h accettato                                                                                                                                                                                  | —                                  |
| hkl      | S08       | **200 di successo finto** (`{success:true, plan:"free"}`), nessuna chiave                                                                                                                                 | **prodotto**                       |
| hkl      | S09       | indistinguibile da un successo: la risposta anti-bot imita il successo                                                                                                                                    | **prodotto** (stessa causa di S08) |
| hkl      | R16/R17   | `/redeem` non ha anti-bot: nessun rifiuto possibile, nulla da correggere (controllo assente rispetto ai fratelli: decisione, non fix)                                                                     | —                                  |

Riepilogo riprodotto: **EG 7 scenari rossi, HSH 4, SEO 4, HKL 2** (+ R16 su CardForge). Il pattern «rifiuto anti-bot con etichetta del coupon / email» è confermato su EG, HSH, SEO al riscatto; il «200 finto» al signup su HSH, HKL, SEO; `stale` a 6 h solo su EG.

Controlli positivi (EmailGuard): R01 (baseline) e S01 passano. Nota di sonda: S08/S09 erano verdi nel primo giro per un criterio mio troppo largo («non nomina il coupon»); ora il verdetto esige la causa vera.

## Fix — stato (7 nov)

Disegno applicato come progettato (nessun env nuovo su Vercel): `elapsed_ms` da `performance.now()` (percorso a epoch mantenuto per i bundle in cache, fail-open, **senza** `stale`), `FORM_TOO_FAST` / `FORM_UNVERIFIED` con consiglio seguibile, signup con 400 onesti, attributi anti-autofill sugli honeypot, schema EG che non accusa più la persona. Test **rossi prima** (EG 9, HSH 10, SEO 10), poi verdi; `tsc` ha preso due errori che vitest non vede (`ApiErrorCode` su HSH, tipo del mock su SEO).

| repo         | PR                                                           | gate                                                                                                              | stato                                                                                                                              |
| ------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| EmailGuard   | https://github.com/antonioalt3000-cyber/emailguard/pull/60   | lint 0 · tsc 0 · 64 file / 634 test · build                                                                       | **MERGIATA** `7ba6342` (CI verde: verify, Semgrep, Vercel)                                                                         |
| HeaderShield | https://github.com/antonioalt3000-cyber/headershield/pull/60 | lint 0 · tsc 0 · 71 file / 804 test · build                                                                       | **MERGIATA** `07b3be3` (CI verde: verify, Semgrep, Vercel)                                                                         |
| SEOScope     | https://github.com/antonioalt3000-cyber/seoscope/pull/66     | lint 0 · tsc 0 · 68 file / 851 test · build                                                                       | **MERGIATA** `c8a6dab` (CI verde: verify, Semgrep, Vercel)                                                                         |
| HookLab      | https://github.com/antonioalt3000-cyber/hooklab/pull/63      | lint 0 · tsc 0 · 77 file / 910 test · build; nuovo test di route rosso senza il fix (controllo negativo eseguito) | **MERGIATA** `ea0158e` (CI verde: verify, Semgrep, Vercel)                                                                         |
| CardForge    | https://github.com/antonioalt3000-cyber/cardforge/pull/57    | lint 0 · tsc 0 · 75 file / 809 test · build                                                                       | **MERGIATA** `46d07e7` (CI verde), live letto da `/api/health`; R16 e S08 in produzione: `FORM_UNVERIFIED` con consiglio seguibile |

CardForge (R16): `FORM_UNVERIFIED` (honeypot, consiglio «turn autofill off») ≠ `FORM_EXPIRED` (token scaduto, «reload»); un unico `formRefusal()` con `switch` esaustivo; `form-token-pages.test.ts` ora fallisce anche se **qualunque** sorgente diversa dalle 3 pagine chiama `issueFormToken(` (prima guardava solo `*/page.tsx`). Nota: `CardPlayground` posta l'honeypot da codice (`""`) e non ha input nascosto, quindi non ha nulla da proteggere con gli attributi.

## Verificato in PRODUZIONE dopo il merge (7 nov) — nessuna scrittura: coupon finto, signup solo rifiuti

CardForge (`46d07e7`): R16 PASS, S08 PASS; R17 in produzione = **INFO** (il token è firmato al render sul server, e con rete reale + idratazione la sonda supera la soglia di 1,2 s: il gate non rifiuta e risponde il pool coupon al codice finto; in locale R17 → `FORM_TOO_FAST`, provato). Il primo giro in produzione lo aveva segnato FAIL: era la **sonda** (verdetto che non distingueva «il gate ha rifiutato» da «il gate è passato»), corretta.

Commit letti da `/api/health` (non `state=READY`): eg `7ba6342` · hsh `07b3be3` · seo `c8a6dab` · hkl `ea0158e`. `fidelity-matrix.cjs <slug> … --prod` (stessi scenari, Chrome 9223, nessuna scorciatoia):

| prodotto     | R02b (skew 3 s)           | R07 (tab 7 h) | R16 (honeypot)                         | R17 (invio veloce)              | S08 signup honeypot                  |
| ------------ | ------------------------- | ------------- | -------------------------------------- | ------------------------------- | ------------------------------------ |
| EmailGuard   | PASS                      | PASS          | `FORM_UNVERIFIED` «turn autofill off…» | `FORM_TOO_FAST` «wait a moment» | `FORM_UNVERIFIED`                    |
| HeaderShield | PASS                      | PASS          | idem                                   | idem                            | idem                                 |
| SEOScope     | PASS                      | PASS          | idem                                   | idem                            | idem                                 |
| HookLab      | — (redeem senza anti-bot) | —             | —                                      | —                               | `FORM_UNVERIFIED` (prima: 200 finto) |

In produzione «R02b/R07 PASS» significa che il gate **non** ha rifiutato (con un codice finto risponde il pool coupon «Invalid or expired coupon code.»: l'unico caso in cui quel testo è onesto). Nessun coupon consumato, nessun account creato. Prima del fix lo stesso R02b/R07 rispondeva col testo del coupon **per il gate**: i due casi erano indistinguibili, ora lo sono.

## Rilancio della suite sui commit mergiati (7 nov) — `baseline-run.cjs cfg eg hsh hkl seo`

Tutti VERDI, nessun rosso: **cfg `46d07e7`** sweep 11 pagine 0 problemi · pubblico 6/6 · core 6/6 — **eg `7ba6342`** 6/6 · 11/11 — **hsh `07b3be3`** 6/6 · 7/7 — **hkl `ea0158e`** 6/6 · 14/14 — **seo `c8a6dab`** 6/6 · 10/10. Le baseline pre-fix sono in `B/baseline-pre-fix/` (il rilancio sovrascrive `baseline/<slug>.json`). Sullo stesso commit: R02b/R07/R16/R17/S08 in produzione con la matrice `--prod` (sopra).

## Riscatto reale in produzione, sui commit finali (7 nov) — `A/journey-deep.cjs <slug>` (contesto Chrome isolato)

Coupon `internal: true` coniato via `/api/admin/generate-coupons`, riscattato **nel browser reale** col plus-alias del fondatore (`antonio.alt3000+qa07nov<slug>@gmail.com`), chiavi registrate in `REDIS-WRITES.jsonl`. Sul codice con i form nuovi (`elapsed_ms`):

| prodotto     | esito    | prova                                        |
| ------------ | -------- | -------------------------------------------- |
| CardForge    | 5/5 PASS | card PNG vera, 27.560 byte, firma `89504e47` |
| EmailGuard   | 5/5 PASS | verifica email con `score`                   |
| HeaderShield | 5/5 PASS | scan con voto                                |
| HookLab      | 5/5 PASS | lista endpoint                               |
| SEOScope     | 5/5 PASS | audit con punteggio (67)                     |

Nessun errore di console nel viaggio autenticato; nessun pool partner toccato. (Nota: `reports/omni-07nov-2026/journey-deep.cjs` in radice richiede un `lib.cjs` che esiste solo in `A/`: la versione eseguibile è `A/journey-deep.cjs`.)

## Matrice con SUCCESSO in produzione, coupon `internal` veri (7 nov) — `fidelity-matrix.cjs <slug> redeem --only R01,R02b,R07,R18,R19,R20,R21,R22 --prod-real`

Coniati via `/api/admin/generate-coupons` con `internal:true` (lo script **rifiuta di continuare** se la risposta non dice `internal`), chiavi registrate in `REDIS-WRITES.jsonl` prima della scrittura, riscatto solo col plus-alias del fondatore, scenari distanziati di 14 s (limite reale 5/min per IP). Nessun pool partner toccato.

| prodotto     | R01  | R02b skew 3 s | R07 tab 7 h | R18 doppio click | R19 doppio Enter | R20 due schede                         | R21 refresh+riuso  | R22 rate limit                                    |
| ------------ | ---- | ------------- | ----------- | ---------------- | ---------------- | -------------------------------------- | ------------------ | ------------------------------------------------- |
| CardForge    | PASS | PASS          | PASS        | 1 richiesta      | 1 richiesta      | 1 vittoria, l'altra «already redeemed» | «already redeemed» | 429 «Too many requests. Please slow down.»        |
| EmailGuard   | PASS | PASS          | PASS        | 1 richiesta      | 1 richiesta      | idem                                   | idem               | 429, UI «Too many attempts — please retry in 2s.» |
| HeaderShield | PASS | PASS          | PASS        | 1 richiesta      | 1 richiesta      | idem                                   | idem               | 429 «slow down»                                   |
| SEOScope     | PASS | PASS          | PASS        | 1 richiesta      | 1 richiesta      | idem                                   | idem               | 429 «slow down»                                   |

**5/5 prodotti, 8/8 scenari ciascuno: 40/40 PASS.**

R20 e R21: il messaggio «This coupon has already been redeemed.» è onesto (il coupon È stato riscattato, dalla scheda gemella). R22: il rifiuto dice di rallentare, non «coupon invalido».

## Casi limite della feature core, in produzione (7 nov) — `B/core-edge.cjs <slug>`, oracolo + controllo negativo

| prodotto     | esito      | cosa                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CardForge    | 4/4 PASS   | 9 template × 8 titoli (vuoto, 1, 400 e **10.000** caratteri, emoji, RTL, **NUL**, **CRLF**) = **72 PNG su 72 alla dimensione dichiarata**, content-type `image/png`, `IEND` presente, nessun header iniettato dal CRLF, **nessun 5xx**. Controlli negativi: una dimensione sbagliata di 1 px e un PNG troncato vengono rilevati                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| HookLab      | 19/19 PASS | payload 1 B · ~1 MB (la cattura è **troncata a 64 KiB e lo dichiara** con `truncated:true`) · 2 MB (200, nessun 5xx) · non-UTF8 con byte nulli (lista ancora 200, `bodyIsJson:false`) · header duplicati (`"alfa, beta"`, entrambi sopravvivono) · firma Stripe **ricalcolata da me**: fresca `valid:true`; un byte alterato `SIGNATURE_MISMATCH`; timestamp di 1 h fa `TIMESTAMP_OUT_OF_TOLERANCE` (tolleranza 300 s) · un payload firmato da 100 KB: la verifica della richiesta memorizzata risponde 400 **«Captured body was truncated at 64KB, so its signature cannot be verified. Use literal rawBody mode.»**: la causa vera e la via d'uscita, non un finto `SIGNATURE_MISMATCH`                                                                                                                                                                                                  |
| HeaderShield | 21/21 PASS | `score` = punti/massimo su **un nostro sito (95/100)** e su **un bersaglio volutamente scadente (example.com, 0/100)**: 9 rilievi ciascuno confrontati con gli header letti da una **connessione indipendente** (per example.com via DoH, perché il resolver locale non lo risolve: artefatto d'ambiente); `fail_under` al **confine esatto** (= score passa 200, = score+1 → 422) su entrambi; bersagli ostili (`127.0.0.1`, `169.254.169.254`, `localhost`, `file://`, `[::1]`, non-URL, vuoto) → 400, nessun dato; `fail_under` = `abc`/`-5`/`101`/`1e9` → 400, mai 5xx. Controllo negativo: ricalcolare con un massimo sbagliato (+10) smentisce il prodotto                                                                                                                                                                                                                           |
| SEOScope     | 86/86 PASS | su **16 pagine reali** (le 10 home/dashboard/pricing/docs dei nostri prodotti, 2 di toolkitonline.vip, `httpbin.org/html` che **non ha `<title>`**, una pagina Wikipedia): titolo (assente → fail, 70-71 car. → warn con il conteggio giusto nel messaggio, 48-59 → pass) e titolo letto = parser indipendente; `<h1>` 0 → fail / 1 → pass; `score` = **media pesata** delle categorie (Δ ≤ 0,3) su ogni pagina; controllo negativo: la media NON pesata si discosta; un URL `text/plain` → 422 «Target is not an HTML page» (la causa vera); bersagli ostili → 422, mai 5xx. **Non esercitati in produzione, dichiarato**: `noindex` (nessuna pagina letta ne aveva uno: le dashboard sono bloccate da robots.txt, non da noindex) e **più `<h1>`** (nessuna pagina reale ne aveva più di uno): una pagina fixture pubblica servita come `text/html` non esiste senza pubblicare qualcosa |
| EmailGuard   | 12/12 PASS | gmail.com, outlook.com, emailguard.dev, toolkitonline.vip, un dominio **inesistente** (DNS: nessun MX/SPF/DMARC → 200 con `mx:false`, `valid:false`): verdetti MX/SPF/DMARC **uguali al DNS reale via DoH**; lotto di **100** accettato con 100 risultati nello stesso ordine e verdetto MX = DNS; lotto di **101** respinto 400 «Too big: expected array to have <=100 items» senza risultati parziali; lotto vuoto → 200 `{count:0,results:[]}`; spazzatura → 400, mai 5xx. Controllo negativo: l'aspettativa MX invertita non regge su nessun dominio                                                                                                                                                                                                                                                                                                                                   |

Errori **miei** (sonda), corretti prima di crederci: HookLab «verifica richiesta troncata» — l'oracolo pretendeva 200 e chiamava difetto un 400 con il messaggio giusto; EmailGuard «lotto vuoto» — pretendevo un 4xx, il contratto `200 count 0` è difendibile (resta vietato un 5xx o un risultato inventato).

## Giri locali autenticati su BUILD DI PRODUZIONE con mock Upstash/Stripe/Brevo (7 nov) — `A/run-prod.cjs <slug>` + `B/local-auth.cjs <slug>`

| prodotto     | esito                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------- |
| CardForge    | **34/34 PASS**                                                                                |
| EmailGuard   | **34/34 PASS** (porta 3311)                                                                   |
| HeaderShield | **34/34 PASS** (porta 3313)                                                                   |
| HookLab      | 35/36 → **rosso di prodotto R-CO** (checkout con Redis giù = 500) → corretto → **36/36 PASS** |
| SEOScope     | **36/36 PASS** sul build col fix (primo giro locale di questo prodotto)                       |

CardForge, in dettaglio (stessa catena su ogni prodotto): signup → chiave → dashboard (200 con la chiave, **401 senza**, **401 con chiave sbagliata**, mai 5xx) · checkout `starter`/`pro`/`business`: chiede a Stripe **esattamente** `price_qa_<piano>`, modalità subscription, customer dell'acquirente, `metadata.plan` giusto (controllo negativo: il price di `pro` ≠ quello di `starter`) · piano ignoto → 400 `UNKNOWN_PLAN`, senza piano → 400, origine esterna → 403 · webhook: firma **falsa** 400, **senza header** 400, firma giusta con timestamp di **1 h fa** 400, **corpo alterato dopo la firma** 400, e dopo i 4 rifiuti il piano è **ancora free** · webhook firmato su un price di **un altro prodotto**: 200 `ignored: foreign_price`, piano invariato (isolamento dal marketplace) · webhook firmato col price giusto: 200 e dashboard `pro`; lo stesso evento rispedito: piano invariato · secondo checkout dello stesso account già pagante: **409 `ALREADY_SUBSCRIBED`** (nessuna doppia fatturazione) · **Redis giù: dashboard 503 (non 401), signup 503 (non 500); Redis di nuovo su: la STESSA chiave funziona e il piano è intatto** · email di benvenuto verso il mock Brevo, indirizzo giusto.

Nota di metodo: «checkout senza sessione → 401» è una proprietà di F3; i checkout dei round-2 sono per ospiti per progetto (email nel corpo, nessun account richiesto), quindi per loro la prova equivalente è «dashboard senza chiave → 401» e «checkout ripetuto da un account pagante → 409».
Errore mio, corretto: il primo giro dava 3 rossi perché il mock Stripe risponde alla `subscriptions.retrieve` con `price_qa_fake`, e il prodotto — giustamente — lo trattava come il price di un altro prodotto. Il mock rilegge le fixture a ogni richiesta: ora lo script imposta `priceId` prima del webhook, e lo stesso comportamento è diventato un controllo in più.

## 🔴 R-CO — con Redis giù il checkout rispondeva **500** invece di 503 (stesso schema segnalato dal flusso A su F4/B7)

- **Passo**: build di produzione di HookLab sotto mock, Redis spento (`/__qa/outage`), `POST /api/checkout?plan=starter`.
- **Atteso**: 503 con `Retry-After`, come fanno `/api/dashboard`, `/api/signup` e `/api/billing-portal` (`lib/redis-errors.ts`, incidente Upstash 20-30 set).
- **Osservato**: **500** `{"error":{"code":"INTERNAL_ERROR","message":"Could not start checkout."}}` — come se avesse sbagliato la nostra logica, mentre è una condizione temporanea che un riprova risolve e **nulla è stato addebitato** (la sessione Stripe nasce per ultima). Il portale di fatturazione, nello stesso giro, rispondeva già 503 giusto.
- **Causa**: il `catch` finale del checkout non chiedeva `isRedisUnavailable()`. **Nei 5 repo** il catch ha la stessa forma (letto nel codice; riprodotto nel browser/HTTP solo su HookLab).
- **Fix** (5 PR, `fix/checkout-redis-outage`): il catch chiede `isRedisUnavailable()` e risponde `serviceUnavailable(CHECKOUT_UNAVAILABLE_MESSAGE)` — «Temporary service issue on our side — you were not charged. Please retry in a few minutes.». **Guardia** che legge la route **senza i commenti** (un commento che spiega il fix non può soddisfarla): rossa prima su 5/5, verde dopo. Verifica comportamentale: HookLab 500 → **503**, **36/36**; SEOScope **36/36**.
- PR **mergiate** (CI verde) e **live** (commit da `/api/health`): https://github.com/antonioalt3000-cyber/cardforge/pull/59 `9ed8924` · https://github.com/antonioalt3000-cyber/emailguard/pull/62 `4ed29e6` · https://github.com/antonioalt3000-cyber/headershield/pull/62 `951f6f1` · https://github.com/antonioalt3000-cyber/hooklab/pull/65 `454cfab` · https://github.com/antonioalt3000-cyber/seoscope/pull/68 `805a51d`. Giro locale sul build del fix: **36/36 su tutti e 5** (cfg, eg, hsh, hkl, seo), con «Redis giù → checkout 503».
- **CROSS-FAMILY**: il flusso A ha già visto lo stesso 500 su F4 e B7; su questi 5 era identico. Nessun altro repo controllato da me.

Ambiente: un `next dev` di HookLab rimasto vivo da una sessione precedente rispondeva al posto del build nuovo (30/36 con firme webhook «invalide» e il 500 ancora presente: il rosso era **dell'ambiente**, non del fix); un handle ereditato da un processo non mio teneva occupata la 3211 (EADDRINUSE) — i round-2 girano ora su 33xx (`B/run-prod-b.cjs`).

## `bucketByDay` — orologio del cliente contro timestamp del server (7 nov)

- **Riprodotto a livello di logica, non ancora nel browser**: `bucketByDay` (identico in `components/Charts.tsx` dei 5 repo) confronta `Date.now()` del browser con i `timestamp` ISO del server e scarta `ago < 0`. Un test mirato (`charts-bucket.test.ts`) è **rosso su 5/5**: una richiesta registrata dal server 5 minuti «avanti» rispetto al browser sparisce dallo sparkline di attività della dashboard.
- **Fix**: fino a 1 giorno di skew conta come «oggi»; oltre non è skew, è spazzatura e resta ignorata (test per entrambi). Branch `fix/chart-client-clock` nei 5 repo, gate completo VERDE su tutti (tsc 0, lint 0, test cfg 812 · eg 637 · hsh 807 · hkl 913 · seo 854, build). PR **mergiate** (CI verde) e **live** (commit letto da `/api/health`): https://github.com/antonioalt3000-cyber/cardforge/pull/58 `31179ca` · https://github.com/antonioalt3000-cyber/emailguard/pull/61 `a7c67a1` · https://github.com/antonioalt3000-cyber/headershield/pull/61 `6300b91` · https://github.com/antonioalt3000-cyber/hooklab/pull/64 `d26a190` · https://github.com/antonioalt3000-cyber/seoscope/pull/67 `3134a48`. Suite rilanciata su questi commit: **5/5 VERDE** (cfg 6/6·6/6, eg 6/6·11/11, hsh 6/6·7/7, hkl 6/6·14/14, seo 6/6·10/10; 0 problemi su 11-13 pagine ciascuno).
- **CROSS-FAMILY — esito del controllo**: `grep bucketByDay` (e `Date.now()` con `ago/diff`) in `src/app/components/lib` dei 5 F-series (`business-fast1..4`, `business-7-capture-api`) → **nessuna occorrenza**. Il pattern è solo dello chassis round-2. Nessun reperto per il flusso A.
- Limite dichiarato: il caso «dashboard con orologio −5 min» **non** è stato ancora esercitato nel browser (serve una chiave e una richiesta reale nel mock); la prova è il test sulla funzione pura.

## (storico) Letto nel codice prima della riproduzione — tutto poi RIPRODOTTO nel browser e corretto, tranne il punto 5

I quattro fratelli usano ancora un `Date.now()` del browser come timestamp anti-bot e non hanno il token firmato di CardForge.

1. **EG/HSH/SEO `/api/redeem`**: un rifiuto anti-bot (honeypot, invio veloce) risponde **«Invalid or expired coupon code.»** — la stessa etichetta sbagliata del difetto originario. Il coupon non viene bruciato (il controllo precede il claim), ma il cliente legge che il suo codice è invalido.
2. **EG, cause multiple**: (a) `anti-bot.ts` rifiuta come bot un form più vecchio di **6 h** (`stale-form`): vale per un tab lasciato aperto e per un orologio **indietro** di >6 h; il test `anti-bot.test.ts` lo codifica; (b) `redeemSchema`/`signupSchema` hanno `company: z.string().max(0, "Bot detected.")`: un password manager che riempie `company` fa leggere a una persona **«Bot detected.»** _prima_ che il controllo anti-bot giri (ramo honeypot della route = codice morto); (c) l'honeypot si chiama `name="company"`, il nome che l'autofill di Chrome mappa su «organizzazione».
3. **Signup dei fratelli, rifiuto anti-bot**: EG → 400 «A valid email is required.» (l'email è valida); **HSH/HKL/SEO → 200 «successo» finto** («Check your inbox for your key» / `{success:true}` / «This email already has a key»): la persona aspetta una chiave che non esiste. CardForge invece risponde onesto (`FORM_TOO_FAST`/`FORM_UNVERIFIED`).
4. **Fascia di skew piccolo** (scenario `R02b`, pronto, mai eseguito sui fratelli): un orologio avanti di δ secondi sposta la finestra dell'invio veloce di δ; chi impiega ~3,6 s con un orologio +3 s viene visto a ~0,6 s e rifiutato come «troppo veloce». Col token firmato di CardForge **R02b passa** (verificato).
5. **HookLab `/api/redeem`** non ha anti-bot (solo BotID/rate limit): nessun rischio di falso rifiuto, ma controllo assente rispetto ai fratelli. Da decidere, non da «correggere».
6. **`bucketByDay` in `components/Charts.tsx`, identico nei 5 repo**: confronta `Date.now()` del browser con i `timestamp` ISO del server e scarta `ago < 0`. Con l'orologio del cliente **indietro**, le richieste degli ultimi minuti **spariscono dallo sparkline** della dashboard. Display-only, ma è stato client invisibile al QA. Va riprodotto nel giro autenticato (`D01`: chiamata API + dashboard con orologio −5 min) e cercato nei F-series (CROSS-FAMILY).

### Fix che avrei fatto (progettato, nessuna riga scritta nei repo)

- **Fratelli: nessun segreto di firma esiste** (`SIGNING_SECRET`/`signed-url` assenti nei 4 repo; non creo env su Vercel). Quindi **non** replicare `form-token.ts`: misurare il tempo con `performance.now()` sul client (monotono, niente orologio) e inviare `elapsed_ms`; il server decide su quello, con il percorso a epoch mantenuto solo per i bundle in cache (fail-open, senza `stale`).
- **Tutti**: un rifiuto anti-bot ha codice e messaggio propri, mai quello del coupon/email: `FORM_TOO_FAST` «That was too quick — please wait a moment and submit again.»; honeypot `FORM_UNVERIFIED` con consiglio **seguibile** («turn autofill off for this page … or contact support»); su CardForge il token scaduto diventa `FORM_EXPIRED` («reload»). Signup dei fratelli: 400 onesti al posto dei 200 finti. Rimuovere il `max(0,"Bot detected.")` di EG.
- Attributi `data-1p-ignore`, `data-lpignore="true"`, `data-bwignore`, `data-form-type="other"` sugli honeypot (riduce i falsi positivi alla radice).
- CardForge: `form-token-pages.test.ts` scopre i minter solo in `*/page.tsx`: estendere a **qualsiasi** sorgente che chiama `issueFormToken(` (oltre alle 3 pagine fissate), così un quarto minter in un layout non sfugge.
- `bucketByDay`: trattare un timestamp nel futuro entro 1 giorno come «oggi» (`ago = max(0, ago)`).

Stato: branch vuoto `fix/form-refusal-causes` creato in `business-new-cardforge` e **rimosso** a fine sessione (nessun commit).

## Sonda (miei errori, dichiarati)

1. `generate-coupons` restituisce solo 5 codici in `sample`; ne usavo 40 → dal sesto scenario `code = undefined`, campo `required` vuoto, nessun POST: sembrava «nessuna risposta» del prodotto. Ora si leggono da `csv`, e `next()` lancia se i coupon finiscono.
2. Probe troppo veloce: su un form a **un solo campo** compilavo in <1,2 s e leggevo il rifiuto del gate come difetto (S05–S07, 3 falsi rossi). Ora 1,8 s di «lettura» in tutti gli scenari non-veloci; il controllo negativo (S09 veloce) resta rifiutato.
3. Il mock Redis non supporta `KEYS`/`SCAN`: l'isolamento dei rate limit è per IP (`X-Forwarded-For`), non per cancellazione.
4. `selftest.cjs` va lanciato **dalla propria cartella** (`scratchpad/qa-infra`): da altrove scrive in `C:\Users\ftass\qa-26ott\` e fallisce con ENOENT. Ha modificato `scratchpad/qa-26ott/selftest-invoice.pdf` (già `M` all'avvio).
5. Ho filtrato i processi con una regex troppo larga (`run-dev.cjs cfg`) e ho provato a terminare anche shell non mie; Windows ha rifiutato i figli altrui. Nessun processo di altre sessioni è stato terminato (verificato dall'elenco). Usare **solo** il PID del listener sulla porta.
6. `next dev` riscrive `AGENTS.md` nei repo che lo tracciano (CardForge: `# `→`## `): benigno, non committare.

## CROSS-FAMILY (per il coordinatore)

- `bucketByDay` (punto 6) potrebbe esistere nei dashboard dei F-series: da cercare con `grep bucketByDay` prima di nominare uno scrittore.
- Il pattern «rifiuto anti-bot con l'etichetta del coupon/email» e «successo finto al signup» è dello chassis round-2; non verificato sui F-series.

## `bucketByDay` nel browser reale (7 nov) — `B/dash-clock.cjs cfg`

Build di produzione di CardForge sotto mock, una **richiesta reale** con la chiave (registrata dal server col suo orologio), dashboard aperta col browser a: orologio corretto → barra di oggi **accesa**; **5 minuti indietro** → accesa (era il caso rotto: la richiesta stava nel «futuro» del browser); 5 minuti avanti → accesa; **controllo negativo 2 giorni indietro** → spenta (oltre un giorno non è skew: l'oracolo può diventare rosso). **7/7 PASS.** Limite: il confronto prima/dopo il fix è nel test della funzione pura (rosso 5/5 → verde); nel browser ho provato solo il codice col fix, perché il build precedente non esisteva più.

## Riepilogo finale (7 nov)

**15 PR mergiate, CI verde, live (commit letto da `/api/health`) — 3 famiglie × 5 prodotti:**

| famiglia                              | cardforge | emailguard | headershield | hooklab | seoscope |
| ------------------------------------- | --------- | ---------- | ------------ | ------- | -------- |
| anti-bot onesto + `performance.now()` | #57       | #60        | #60          | #63     | #66      |
| `bucketByDay` e orologio del cliente  | #58       | #61        | #61          | #64     | #67      |
| checkout con Redis giù → 503          | #59       | #62        | #62          | #65     | #68      |

(link: `https://github.com/antonioalt3000-cyber/<repo>/pull/<n>`). Commit finali in produzione: **cfg `9ed8924` · eg `4ed29e6` · hsh `951f6f1` · hkl `454cfab` · seo `805a51d`**. Suite `baseline-run.cjs` su questi commit: **5/5 VERDE** (sweep 0 problemi, pubblico 6/6, core 6/6 · 11/11 · 7/7 · 14/14 · 10/10).

**Provato in produzione, dopo i fix:** riscatto reale con coupon `internal: true` 5/5 (`A/journey-deep.cjs`) · matrice con **successo** R01/R02b/R07/R18–R22 **8/8 su tutti e 5** (40/40) · matrice di rifiuto (`--prod`, codici finti) · casi limite della feature core (cfg 4/4, hkl 19/19, eg 12/12, hsh 21/21, seo 86/86). **Provato in locale su build di produzione:** giro autenticato 36/36 su tutti e 5 (checkout → price id atteso, webhook firmato 200 / firma falsa, senza header, vecchia e alterata 400, price di un altro prodotto ignorato, secondo checkout 409, Redis giù → 503 senza invalidare la chiave); `bucketByDay` nel browser 7/7.

## NON provato / aperto (stato vero)

- **Matrice di fedeltà completa sui fratelli**: su eg/hsh/hkl/seo ho eseguito R01/R02b/R07/R16/R17 e S01/S04/S08/S09 (rossi → fix → verdi in produzione) e, con coupon veri, R01/R02b/R07/R18–R22. **Non** eseguiti su di loro: R03–R06, R08–R15 (orologi ±1 h/±1 giorno, fusi/RTL, UA mobili, tracker bloccati, 3G), R17b, S02–S03, S05–S07. La matrice **completa** (24 + 9 scenari) l'ho eseguita solo su CardForge, in locale.
- **UA Safari/Firefox con BotID in produzione** e **cookie di terze parti disattivati**: non provati (in locale BotID non gira; l'emulazione CDP dei cookie non è stata tentata).
- **SEOScope**: i rami `robots-meta = fail` (noindex) e `h1 = warn` (più `<h1>`) **non sono stati esercitati in produzione**: nessuna pagina reale raggiungibile li conteneva e non esiste un host fixture che serva HTML nostro come `text/html` senza pubblicare qualcosa.
- **Checkout con Redis giù**: riprodotto 500 empiricamente **solo su HookLab**; sugli altri 4 il catch è identico (letto nel codice) e la guardia era rossa prima. `/api/checkout/complete` (conferma post-pagamento) **non** controllata per lo stesso schema.
- **Giri locali autenticati**: sono a livello HTTP (nessun browser): i form e le pagine sono coperti dalla matrice nel browser, non da questo giro.
- **`coupon-stats` retroattivo / pool partner**: non toccati da me (sola lettura del coordinatore).
- **HookLab `/redeem` senza anti-bot** (solo BotID e rate limit): nessun fix. **Decisione del fondatore**: aggiungere il gate come sugli altri quattro, ora che è onesto, oppure lasciare così.
- Il mock Stripe risponde alla `subscriptions.retrieve` con un `price_qa_fake` salvo fixture: il prodotto lo tratta (giustamente) come price di un altro prodotto; lo script imposta la fixture prima del webhook.

## Errori della mia sonda in questa tornata (tutti corretti prima di crederci)

HookLab «verifica richiesta troncata» (pretendevo 200, il prodotto dà il 400 col messaggio giusto) · EmailGuard «lotto vuoto» (pretendevo 4xx) · SEOScope: fixture `text/plain` da httpbin (il prodotto la rifiuta giustamente) · HeaderShield: lettore indipendente senza DNS per example.com (artefatto d'ambiente) · `local-auth`: fixture Stripe senza `priceId` (3 rossi) · **ambiente**: un `next dev` di HookLab rimasto vivo rispondeva al posto del build nuovo (30/36 con il bug ancora presente), un handle ereditato da un processo non mio teneva la 3211 (round-2 ora su 33xx), mock orfani di sessioni precedenti.

## Per il fondatore

- **Decidere HookLab `/redeem`** (gate anti-bot sì/no).
- Nessun'altra azione nuova da questo flusso. Restano le voci già note (rotazione chiavi, Dependabot, Porkbun/Vercel, CRON_SECRET di FixMyWeb).
