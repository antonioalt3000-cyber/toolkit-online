# Flusso A — FINDINGS (omni-QA 7 nov 2026) — sessione interrotta per limite d'uso

Formato: passo -> atteso -> osservato -> evidenza -> classificazione -> stato.

## A-ENV-1 — il dev server Turbopack di F3 non idrata: ricarica la pagina in ciclo

- Passo: `node scratchpad/qa-infra/run-dev.cjs f3 turbo`, aprire `/signup` in un contesto isolato su Chrome 9223.
- Atteso (R9 del 4 nov): React si attacca, il giro autenticato gira.
- Osservato: il server invia `reloadPage "HMR hash mismatch"` dopo ogni `building`/`restart`; ~610 GET `/signup` in pochi minuti, `#signup-email` non trovato, console: "eval() is not supported" (CSP a nonce senza `unsafe-eval`). Log: `A/logs/f3-dev.log`.
- Classificazione: AMBIENTE/SONDA (non prodotto). Stato: aggirato con build di produzione (`A/run-prod.cjs f3`): `/signup` idrata (react:true, 4 input, 3 s). Causa del loop dev NON risalita.
- CROSS-FAMILY: la stessa CSP a nonce e' sui 10 prodotti; probabile stesso comportamento in dev su tutti. Non verificato.

## Non eseguito

Tutto il resto del mandato (vedi side-session-notes/.../flusso-A-handover.md).

## A-MONEY-1 — percorsi di denaro in produzione (7 nov) — OK su 5/5

- Passo: `A/journey-deep.cjs <slug>`: coupon `internal: true` via `/api/admin/generate-coupons`, riscatto compilando il form nel browser (contesto ISOLATO), feature core. Email `antonio.alt3000+qa07nov<slug>@gmail.com`.
- f1 4/4 (scan, `overallScore` presente) · f3 4/4 · f4 5/5 (chiave `dm_live_` consegnata) · b7 5/5 (PNG 52.880 byte) · f2: vedi sotto. Nessun errore di console, nessun pool partner toccato.
- **A-SONDA-1 (f2, falso rosso)**: al primo giro "la POST non e' mai partita". Causa: il profilo Chrome condiviso era ancora autenticato come `qa04nov-f2` e `click('button[type=submit]')` colpiva un altro submit (menu account) invece del form. Riprodotto in contesto pulito: `/api/redeem` **200**, account Enterprise creato. Correzione nella copia `A/journey-deep.cjs`: `openIsolated` + selettore `form:has(#redeem-code) button[type=submit]`. Classificazione: SONDA (stessa famiglia della lezione 5 nov: "lo stato di partenza e' l'ultima sessione, non il vuoto"). Il `journey-deep.cjs` del coordinatore (non toccato) ha lo stesso difetto: CROSS-FAMILY per il giro B.
- f2, secondo coupon con la stessa email -> **409** e la pagina dice la causa vera ("An account with this email already exists. Sign in first, then redeem your coupon from your dashboard."). Atteso, non e' un difetto.
- Procedura: la mia prova `redeem-probe.cjs` ha riscattato QAOCT-C4E3-DC8B su f2 e **ho registrato la chiave Redis dopo, non prima** (errore di procedura, ora in `REDIS-WRITES.jsonl`). Coupon QAOCT-5D83-97B8 (f2) coniato e non usato (internal).
- Osservazione fuori perimetro: il banner cookie di FixMyWeb dice "serve relevant ads" mentre nessun annuncio e' caricato (AdSense rimosso dalla CSP il 4 nov). Da valutare, non toccato.

## A-F3-LOCAL — giro autenticato locale F3 (build di produzione + mock Upstash/Stripe/Brevo): 48 controlli, 47 PASS + 1 reperto di prodotto

- Ambiente: `A/run-prod.cjs f3` (il dev Turbopack non e' utilizzabile, vedi A-ENV-1). Script: `A/f3-local.cjs`, evidenza `evidence/f3/local-journey-A2.json`.
- PASS, fra gli altri: checkout -> **price id esatto** (growth mensile `price_1TEuqg…`, scale annuale) con metadata plan/cycle/userId e `customer_email` giusti; checkout senza sessione 401; webhook billing firmato 200, **firma falsa 400**; **Redis giu' -> 503 su `/api/auth/me`, `/api/dashboard`, `/api/auth/login`, sessione intatta dopo (200)**.
- **Dunning end-to-end contro il mock Brevo (nuovo dal 6 nov, churnguard#87)**: `invoice.payment_failed` Connect -> record `pending_recovery` 4900 eur con l'email esatta -> **1** messaggio al cliente finale, destinatario esatto, mittente `hello@paymentrescue.dev`, nome visualizzato = commerciante, corpo con **49.00** e link `update-payment/<invoice>?t=<token>` -> **evento ripetuto: 200 e nessun secondo messaggio** -> record invecchiato di 3,2 giorni, cron `/api/cron/dunning` con segreto sbagliato **401**, col giusto **200** (`emailsSent:1`) -> **1** nuovo messaggio (passo 2), stesso importo e stesso link, testo diverso dal passo 1 -> `payment_succeeded` -> `recovered` con timestamp -> il cron non invia piu' nulla (conteggio fermo a 2).
- I 6 rossi aperti del 4 nov, classificati: (1) coupon admin "non risponde in locale" = **sonda**: la risposta e' `{sample:[…]}` e il giro leggeva `codes`; (2) a cascata redeem 400 e 2 check sul piano = stessa causa; (3) email di dunning "non trovata" = nel 4 nov il dunning passava da Resend (non mockato), ora passa da Brevo e si vede; (4) link `update-payment` idem; (5)(6) `export own data` / erasure = aspettative sbagliate (modulo DSAR, R10), ora asseriti per quello che sono (export documenta "30 giorni", delete di un indirizzo altrui 403).
- **A-SONDA-2**: il piano nella dashboard (testo "(X plan)") compare solo con Stripe collegato; senza, la pagina e' in "Demo Mode". Oracolo sostituito con il campo `plan` di `/api/dashboard`.
- **A-F3-1 (PRODOTTO, corretto)**: dopo un upgrade la dashboard mostra il piano vecchio fino a 30 s. Passo: pagare Growth (webhook), aprire la dashboard (cache 30 s), riscattare un coupon Scale -> il riscatto risponde "Scale (Lifetime) plan activated" ma `/api/dashboard` dice `growth`. Causa: lo snapshot in cache (`cached("dashboard", userId, 30)`) contiene `plan` e `isConnected`, e **nessun writer** del piano invalida la cache (redeem, `billing-webhook`, LemonSqueezy, provision); idem per il collegamento Stripe ("Demo Mode" per 30 s dopo il collegamento). Fix alla radice: `plan`, `email`, `isConnected` letti live e sovrapposti alla cache (1 GET in piu'), cosi' nessun writer deve ricordarsi di invalidare. Test rosso prima (2/3 falliscono su master), verde dopo. Gate: lint 0 err (71 warn, come prima), tsc 0, 69 file/720 test (baseline 68/717), build ok. **PR [churnguard#88](https://github.com/antonioalt3000-cyber/churnguard/pull/88)**. Stesso schema nei fratelli: cercato `cached(` in f1/f2/f4/b7 -> nessuna occorrenza, non applicabile.

## A-F3-CALC — oracolo ROI del calcolatore (mancava in journey-core): 74 controlli, 0 rossi in produzione

- `A/f3-calc-oracle.cjs`: digitazione reale nel browser, aritmetica indipendente (perdita = MRR x churn; recuperabile = perdita x tasso; annuo = x12), 8 casi: headline 25.000x9%x40%x12 = **10.800** · MRR 0 · MRR -5000 (usato 0, avviso) · recupero 65 (usato 50, avviso) · recupero 15 (usato 30) · churn 99 (usato 30, avviso) · MRR 1e9 (usato 10.000.000, avviso) · limite 50 accettato. Nessun NaN/Infinity/undefined. Chiude R7 del 4 nov: campo e calcolo non divergono, e ogni valore fuori limite e' dichiarato a schermo.
- **Controllo negativo**: con `QA_PERTURB=1` (limite recupero 45 invece di 50) l'oracolo diventa **rosso (4 FAIL)**; senza, 0 FAIL. Anche una aspettativa errata (10.801) non si trova nella pagina.

## A-F3-1 — CHIUSO e verificato in produzione

- churnguard#88 squash-mergiata il 7 nov 00:55Z -> master `80afb41`; `/api/health` di paymentrescue.dev serve `80afb41` (letto dal campo `commit`).
- Verifica sul vivo (`A/f3-prod-plan-verify.cjs`, 5/5): signup reale -> `/api/dashboard` dice `free` (cache riempita) -> coupon internal coniato -> riscatto come stesso account 200 -> **la lettura immediatamente successiva dice `scale`** (152 ms dopo). Prima del fix: `free` per fino a 30 s.
- Rilancio sul commit nuovo: giro pubblico 6/6, sweep 33 pagine (non-200 0, og:image mancanti 0, h1 multipli 0, backslash-500 0/33).
- Procedura: account QA `antonio.alt3000+qa07novf3plan@gmail.com` + coupon registrati in `REDIS-WRITES.jsonl` PRIMA della creazione.

## A-B7-SSRF — matrice SSRF su CaptureAPI in produzione: 34 controlli, 0 rossi

- `A/b7-ssrf-matrix.cjs`: **27** bersagli su `/api/v1/screenshot` -> tutti **400** e nessuna immagine: 127.0.0.1, localhost, [::1], 0.0.0.0, **decimale 2130706433, esadecimale 0x7f000001, ottale 017700000001**, 127.1, 0177.0.0.1, **IPv6-mapped** [::ffff:127.0.0.1] e [::ffff:7f00:1], **metadata 169.254.169.254**, [fd00::1], [fe80::1], 10/8, 172.16/12, 192.168/16, CGNAT 100.64/10, `*.localhost`, `user:pass@127.0.0.1`, `file://`, `ftp://`, `gopher://`, `javascript:`, e **DNS rebinding via nomi pubblici** (`127.0.0.1.nip.io`, `localtest.me`, `169.254.169.254.nip.io`). Su `/api/v1/pdf` (POST `{url}`): 4 bersagli -> 400.
- Controlli interni: **controllo positivo** (il proprio dominio si cattura: 200 `image/png`; il PDF 200 `application/pdf`) e `url` mancante = 400 di tipo diverso: cosi' un 400 significa "bloccato", non "richiesta malformata".
- **A-SONDA-3 (due falsi rossi miei)**: (1) il PDF rispondeva 405 perche' la sonda usava GET: la rotta e' POST. (2) "redirect verso 169.254.169.254" aveva dato 200 PNG, ma il PNG (`evidence/b7/redirect-capture.png`) mostra "Forbidden redirect target: redirect target is an internal address": **e' il rifiuto di httpbin.org**, non nostro (httpbin e httpbingo rifiutano da soli un redirect interno). Quella riga era **vacua** e l'ho tolta.
- **NON PROVATO**: redirect da URL pubblico verso IP interno end-to-end (servirebbe un redirector che non si autoprotegge, e non posso esporne uno). Letto nel codice: `src/lib/renderer.ts` rivalida ogni richiesta del browser (`setRequestInterception`, anche i salti di redirect) e i percorsi fetch usano `redirect: "error"`; coperto da test unitari, non da una prova di produzione. Nota dello stesso codice: la chiusura piena del DNS rebinding dinamico per il browser richiede controllo dell'egress di piattaforma (dichiarato nel sorgente).

## A-F4-MX — matrice di estrazione fatture ParseFlow in produzione: 88 controlli, 73 PASS, 15 rossi = DIFETTI DI PRODOTTO (non di sonda)

- `A/f4-invoice-matrix.cjs`, 13 fatture sintetiche con totali calcolati qui dalle righe (mai letti dal prodotto), account enterprise del giro `journey-deep`; evidenza `evidence/f4/invoice-matrix.json` + `matrix-rows.json` (verita' vs letto vs risposta grezza).
- **Esatti al centesimo (totale, imponibile, IVA, somma = totale, IVA = aliquota x imponibile)**: IT 22% `1.234,50`, ES 21%/10%/4%, PT 23%, US `1,234.56` con IVA 0%, mezzo centesimo (IVA 0,11 su 1,05), totale zero, DE 19%.
- **Difetti** (tutti restituiti con **HTTP 200**, senza alcun segnale di errore):
  1. 🔴 **Numeri sbagliati in silenzio con migliaia a spazio (formato europeo `2 434,56`, FR/PL/SE/NO/CZ)**: FR 20% -> `subtotal -52.35`, `total 434.56`, `taxRate 0` contro 2.434,56 / 2.921,47 / 20%. L'homepage e le FAQ dichiarano «both European and US number formats understood automatically».
  2. 🔴 **PL: l'IVA viene restituita come totale** (`total 736` = l'IVA, `subtotal 0`, `taxRate 0`; vero 3.200 / 3.936 / 23%): l'etichetta «Razem netto / Do zaplaty» non e' nel vocabolario e il ripiego `subtotal + tax` fa il resto.
  3. **NL: tutto zero** (`Subtotaal / BTW / Totaal` assenti dal vocabolario); le righe vengono estratte, i totali no.
  4. 🔴 **Nota di credito: il segno si perde**: `-120.00 / -25.20 / -145.20` stampati, `120 / 25.2 / 145.2` restituiti.
  5. **Numero fattura vuoto** per `Rechnungsnummer` (DE), `Facture n°` (FR), `Fatura n.º` (PT), `Factuurnummer` (NL), `Faktura nr` (PL): i pattern conoscono solo `rechnung (nr|nummer)` con spazio, `factura`, `fattura`, `invoice`.
- Causa (lib/extractor.ts, `extractAmounts` + pattern `invoiceNumber`): vocabolario di etichette limitato a EN/IT/ES/DE-parziale/FR-parziale; i pattern europei accettano solo il punto come separatore delle migliaia (`\d{1,3}(?:\.\d{3})*,\d{1,2}`); nessun segno.
- Controlli interni: PNG -> 422 (atteso, nessun OCR promesso); un PDF che non e' una fattura (ricetta) non viene presentato come fattura con totali (200 senza `total`, o errore: vedi json).
- Stato: **APERTO -> in corso di correzione** (churnguard non c'entra: repo `business-fast4-documint`). Fix pianificato test-first e additivo (etichette, separatori migliaia a spazio/NBSP/apostrofo, segno), da rilanciare con questa stessa matrice.

## A-B7-DIMS — dimensioni e byte reali di CaptureAPI in produzione: 34 controlli, 0 rossi

- `A/b7-dims.cjs` (GET `/api/v1/screenshot` del nostro dominio): viewport **320x568, 375x812, 768x1024, 1366x768, 1920x1080, 3840x2160** -> PNG reale esattamente di quelle dimensioni (header PNG letto indipendentemente) e `Content-Length` == byte ricevuti; `format=jpeg|webp` 200 con il content-type giusto, jpeg 800x600.
- **Parametri ostili** (13): `width=0|-1|99999|abc|1.5|(vuoto)`, `height=0|-5|1e9`, `format=gif|%00`, `delay=-1|999999` -> **sempre 400 `VALIDATION_FAILED` con messaggio che nomina il campo** ("width: Too small…", "format: Invalid option…"); mai 5xx, mai attese. Nessun reperto.

## A-RESIDUI (1) — `Buffer()` deprecato su ParseFlow `/api/v1/extract` e `/api/v1/demo`: causa trovata, dipendenza di terzi

- Nel codice nostro (`app/ lib/ components/`) **nessuna** occorrenza di `new Buffer(` / `Buffer(` (solo `Buffer.from|alloc|concat…`).
- La causa e' `pdf-parse@1.1.4`, che incorpora pdf.js 1.10.x: `node_modules/pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js:6996` e `v1.10.88/build/pdf.js:7121` fanno `input = new Buffer(literals)` (DEP0005). Solo un avviso nei log runtime, nessun effetto funzionale.
- Non correggibile senza sostituire `pdf-parse` (libreria ferma alla 1.1.x) o patcharla: non e' un cambio da fare in questo giro. **Stato: causa identificata, accettato come avviso di dipendenza**; sostituire il parser PDF e' una decisione di prodotto (rischio di regressione sull'estrazione).
- Nota a margine: `pdf-parse` direttamente sul PDF sintetico dell'oracolo da' «bad XRef entry», ma il prodotto lo estrae regolarmente in produzione (matrice F4): il prodotto non usa quel percorso nudo.

## A-RESIDUI (2) — PostHog «bloccato dalla CSP» su F2/B7: in produzione **non e' attivo**

- `PostHogInit` fa `posthog.init` **solo se** `NEXT_PUBLIC_POSTHOG_KEY` e' definita. `vercel env ls` (solo NOMI) su f2 e b7: **nessuna variabile PostHog**. Quindi in produzione PostHog non parte mai e il blocco CSP e' **latente**: nessun cliente ne soffre oggi, nessun dato perso.
- Resta vero che (a) se la chiave venisse impostata, la CSP bloccherebbe `eu.i.posthog.com` in silenzio; (b) `layout.tsx` fa `dns-prefetch` + `preconnect` verso `eu.i.posthog.com` su ogni pagina anche se non verra' mai usato.

## A-RESIDUI (3) — `/signup` `force-static` su F4 e B7: misurato, inerte, lasciato aperto con motivo

- `parseflow.dev/signup` e `captureapi.dev/signup` rispondono **307 -> /free** (`X-Matched-Path: /signup`). La pagina e' un `redirect("/free")` con `dynamic = "force-static"`. Ma la risposta 307 porta anche un corpo prerenderizzato di **41.356 / 49.902 byte con 16 `<script>` senza nonce** + `<meta refresh>`.
- Impatto: **nessuno per un browser** (segue `Location` e scarta il corpo; la CSP a nonce bloccherebbe quegli script comunque). Visibile solo a un client che non segue i redirect (scraper, `curl`): vede una pagina HTML intera.
- Fix possibile e piccolo (togliere la pagina e mettere il redirect in `next.config` -> nessun corpo), ma e' un cambio su 2 repo per un difetto senza effetto sul cliente. **Stato: aperto per scelta, con motivo.** Se qualcuno sostituisce quella pagina con contenuto lasciando `force-static`, la CSP la renderebbe morta: e' l'unico rischio, ed e' nel commento di sorgente.

## A-FEDELE (F-series) — il gate con orologio del client NON esiste nelle F-series (letto nel codice)

- Cercato in f1-f4 e b7 (`form_ts`, `checkHumanForm`, `honeypot`, `too_fast`, `botid`, `elapsed`): nessuna rotta di riscatto o iscrizione le usa (le occorrenze di `elapsed` sono nelle rotte admin). La famiglia del bug CardForge (rifiuto con l'etichetta sbagliata per orologio del client) **non si applica** a queste cinque rotte. NON ho eseguito la matrice nel browser sulle F-series: lettura del codice, non prova di browser.
- Gli scenari del Flusso B che restano pertinenti anche qui (doppio invio / due schede, tracker bloccati, Safari/Firefox mobile, refresh dopo il riscatto) **non sono stati eseguiti** sulle F-series in questo giro. Il doppio consumo del coupon e' pero' coperto dal giro locale F3 (stesso coupon una seconda volta -> 4xx) e dal 409 di F2 sul secondo riscatto con la stessa email.

## A-F1F2-EDGE — casi limite di CompliPilot e FixMyWeb in produzione: 0 difetti

- **F1** (`A/f12-edge.cjs`, chiave creator del vault, mai stampata): 10 URL non validi/ostili (`not a url`, vuoto, `ftp://`, `javascript:`, `file://`, `127.0.0.1`, `169.254.169.254`, `2130706433`, `[::1]`, host da 300 caratteri) -> **tutti 4xx, mai 5xx**; pagina con corpo vuoto (200) e pagina 404 -> nessun 5xx e nessun punteggio NaN/null; **determinismo**: la stessa pagina due volte -> stesso `overallScore`, 200/200.
- **F2** (`A/f2-edge-browser.cjs`, dall'interno del browser reale): **controllo positivo** (scan legittimo dalla pagina: 200 con punteggio numerico), poi gli stessi 10 ostili -> 4xx **che non e' il 403 del gate anti-bot**; vuota/404 senza 5xx ne' NaN; determinismo ok. 14/14.
- **A-SONDA-4 (verde vacuo evitato)**: la prima passata su F2 era fatta fuori dal browser e ogni richiesta dava **403** (gate anti-bot): i suoi «4xx» sui URL ostili erano **vacui**, perche' 403 viene prima di qualunque validazione. Non li conto: ho rifatto F2 da dentro la pagina, con controllo positivo e con l'esclusione esplicita del 403.
- I 12 contrasti WCAG e `passati+rilievi=controlli` di F2, l'oracolo F1 (media categorie) sono nel baseline del coordinatore (`journey-core`: f1 7/7, f2 12/13 con la sola R4 che e' del fondatore).

## A-F4-MX — CHIUSO e verificato in produzione

- **documint#89** squash-mergiata -> master `f27e164`; `parseflow.dev/api/health` serve `f27e164` (letto dal campo `commit`).
- Stessa matrice (`A/f4-invoice-matrix.cjs`, oracolo non modificato) sul commit nuovo: **da 15 rossi a 0 — 91/91**. Ora esatti al centesimo anche FR `2 434,56` (2.434,56 / 486,91 / 2.921,47 / 20%), NL (9.387,20 / 1.971,31 / 11.358,51 / 21%), PL (3.200 / 736 / 3.936 / 23%), nota di credito con il segno (-120 / -25,20 / -145,20 / 21%), e i numeri di fattura di DE, FR, PT, NL, PL. Totale = imponibile + IVA e IVA = aliquota x imponibile verificati su tutti i casi.
- Suite F4 del coordinatore rilanciata sul commit nuovo: `journey-core` **12/12** (+1 non verificabile: `CRON_SECRET` Sensitive, invariato), giro pubblico **6/6**, sweep **31 pagine** (non-200 0, og:image mancanti 0, h1 multipli 0, backslash-500 0/31).
- Gate nel repo prima del merge: lint 0 errori (38 warning), `tsc` 0, **65 file / 719 test**, build con BUILD_ID; il nuovo test era rosso 10/14 su master e verde 14/14 dopo. Un test di input ostile (20.000 gruppi di cifre dopo `Total:`) pinna che le forme piu' larghe restano lineari.
- **Residuo dichiarato, NON corretto**: le **righe** della fattura (`lineItems`) non vengono estratte quando le cifre di riga usano la migliaia a spazio o il segno meno (FR e nota di credito: `lineItems: []`). I totali sono ora esatti, le righe no. Il parser di riga (`parseNumber`, ~riga 1024) non e' stato toccato in questo giro.
- **Residuo dichiarato**: il nome del fornitore resta vuoto sui letterhead senza etichetta (scelta deliberata del 27 ott, invariata).

## A-LOCAL-ROUNDS — giri locali autenticati su F1, F2, F4, B7 (build di produzione + mock Upstash/Stripe/Brevo): 70 controlli

Script `A/local-round.cjs <slug>` con `A/run-prod.cjs <slug>`; evidenza `evidence/<slug>/local-round.json`. Per prodotto, col **suo** contratto: registrazione → credenziale, checkout → **price id esatto** + metadata + `customer_email`, piano inesistente 400, `checkout.session.completed` firmato → il piano cambia davvero (riletto dal prodotto), **firma falsa 400**, **nessuna firma 400**, evento ripetuto 200 senza cambiare il piano, **Redis giù → 503 sulla rotta autenticata (mai 401/500) e la STESSA credenziale funziona dopo**.

- **F1 17/17** · **F2 18/18** · **F4 17/18** · **B7 16/17**. Tutti: price id chiesto a Stripe esatto, webhook firmato accettato e piano aggiornato, firma falsa respinta, 503 senza logout, credenziale valida dopo il guasto.
- **A-LOCAL-1 (PRODOTTO, F4 + B7)**: con Redis giù il **checkout risponde 500** («Checkout error. Please try again.»), non 503. Le altre rotte dei due prodotti dicono `isRedisUnavailable → 503`; il checkout ha un `catch` generico. F1 e F2, nello stesso scenario, rispondono 200 (il loro checkout non dipende da Redis). Impatto: un 500 e' un allarme falso e un messaggio sbagliato nel momento in cui un cliente sta per pagare. Stato: vedi sotto (fix in corso).
- Falsi rossi miei, tutti corretti: (1) il prezzo atteso letto dall'ambiente (`STRIPE_PRICE_*`): **F2, F4, B7 hanno i prezzi mensili scritti nel sorgente** (`constants.ts`/`lib/stripe.ts`), solo gli annuali sono env; ora l'oracolo li legge dal sorgente. (2) B7 non manda `customer_email`: passa a Stripe un **Customer** (Stripe vieta customer + customer_email insieme), l'email viaggia sul Customer: corretto il controllo. (3) id `customer`/`subscription` costanti fra due giri: B7 rifiuta, giustamente, di riagganciare una sottoscrizione gia' legata a un altro account. (4) F1 col checkout a Redis giu' risponde 200, ed e' il comportamento migliore: la regola ora fallisce solo su un 500. (5) F2 `/api/auth/me` senza cookie risponde 200 con `user: null` **per progetto** (l'header lo chiede a ogni pagina).
- **A-MOCK-1 (ambiente)**: il mock Stripe condiviso (`scratchpad/qa-infra/stripe-mock-server.cjs`) non metteva `line_items` nella sessione ripresa con `expand[]=line_items`: F4 decide il piano da li' e vedeva «foreign_price». Aggiunto in modo **solo additivo** (il prezzo chiesto alla creazione, o quello iniettato dai test). CROSS-FAMILY: il mock e' condiviso col Flusso B.

## A-F4-LINEITEMS — righe fattura con migliaia a spazio / segno meno (residuo di A-F4-MX)

- **documint#90** mergiata -> `6c81931`, live. Righe tabellari con migliaia a spazio e segno; `parseNumber` con segno e virgola decimale riconosciuta anche quando nessuna cifra e' abbastanza grande da attivare il rilevatore EU (prima `45,50` poteva diventare 4550 in una fattura EU con cifre tutte < 1.000); la guardia di riga accetta importi negativi (nota di credito). Test: 4/10 rossi su master, 10/10 verdi. Gate: lint 0, tsc 0, 66 file / 729 test, build.
- **Prova in produzione dopo #90** (matrice estesa alle righe: righe attese, qty x unit = importo, somma righe = imponibile; 130 controlli): da 6 rossi (`fr-20` e nota di credito, righe) a **3**: **la nota di credito e' ora esatta nelle righe**, le righe francesi restavano `[]`.
- **Causa del residuo, trovata leggendo il testo vero**: l'estrattore NON vede `Deplacement      1      1 234,56      1 234,56` con i buchi tra le colonne, ma **`Deplacement 1 1 234,56 1 234,56`** (spazi collassati: `lib/pdf-text.ts` -> `A/logs/fr20-text.json`). I miei test unitari usavano righe con buchi larghi: **la sonda non vedeva la forma reale del dato**. Lezione: leggere l'input vero del componente prima di scrivere il test.
- **documint#91** (in corso): un pattern aggiuntivo, provato solo se nessun altro combacia, con due cifre finali che portano la virgola decimale (l'ancora) e accettato solo se qty x unit = importo al centesimo (la prova): una divisione sbagliata fallisce l'identita' e la riga resta fuori, mai cifre inventate. Test 4/15 rossi su master; test di costo su input ostile. Gate: lint 0, tsc 0, 66 file / 734 test, build.

## A-COPY — promesse del sito rispetto a cio' che il prodotto fa

- **Banner cookie, 10 prodotti**: solo **FixMyWeb** diceva «…and serve relevant ads» (F3/F4/B7 dicono «improve your experience and analyze site traffic»; F1 e i 5 round-2: nessuna frase sugli annunci). E la **privacy policy di F2** elencava «Advertising cookies — Google AdSense for serving relevant advertisements», mentre nessuno script pubblicitario carica (AdSense via dalla CSP il 4 nov) e la **cookie policy dello stesso prodotto** dice «sets no advertising or cross-site tracking cookies»: tre testi in contraddizione.
- **accessiscan#90** mergiata -> `946e843`, live. Banner: stessa frase degli altri prodotti. Privacy: «we show no advertisements and run no ad network; the "Advertising" choice only sets Google's consent signals for our analytics tag, off unless you switch it on». Test che legge i tre file visibili al visitatore (rosso 2/3 su master). **Verificato sul vivo nel browser** (contesto pulito, banner presente, `f2-copy-verify.cjs` 6/6): niente piu' «ads»/AdSense, la cookie policy dice ancora «sets no advertising».
- 🔴 Il primo giro della verifica live passava a vuoto: il mio selettore non trovava il banner e il controllo «non dice ads» era verde su una stringa vuota. Ora il controllo pretende prima che il banner sia presente.
- **Residuo minore, non corretto**: la privacy policy di F4 dice «optional analytics/advertising cookies with your consent» (la sua cookie policy dice che non ne imposta); e il **toggle «Advertising»** esiste nei banner di F1, F2, F3, F4 e pilota i segnali Consent Mode (`ad_storage`, `ad_user_data`, `ad_personalization`) senza che nessun annuncio sia mostrato. Se tenerlo e' una decisione del fondatore/legale (cambia lo stato di consenso salvato): non toccato.
- **Documentazione ParseFlow vs estrazione**: il blog diceva che i PDF multipagina sono gestiti «tracciando i confini di pagina». **Esito vero** (PDF a 2 pagine reale, `f4-multipage.cjs` 4/4: 6 righe di entrambe le pagine in un solo array, intestazione ripetuta e piè di pagina NON diventano righe, totali esatti), **meccanismo falso** (nessun tracciamento di pagina nel codice): frase corretta nella stessa PR #90. Il changelog citava «-30% di errori sulle fatture multipagina» senza alcuna misura: frase tolta.

## A-F4-LINEITEMS — CHIUSO e verificato in produzione (stato finale)

- **documint#91** squash-mergiata -> master `fdc5278`; `parseflow.dev/api/health` serve `fdc5278` (letto dal campo `commit`).
- **Matrice F4 estesa alle righe** (`A/f4-invoice-matrix.cjs`, oracolo non modificato rispetto al giro «rosso»): **130/130 — da 6 rossi a 0.** Per ogni fattura: righe lette = righe scritte, quantita' x unitario = importo, somma righe = imponibile. Ora esatte anche le righe francesi `1 200,00` / `1 234,56` e le righe della nota di credito `-100,00` / `-20,00`.
- `baseline-run.cjs f4` sul commit nuovo: **VERDE** (sweep 31 pagine 0 problemi · giro pubblico 6/6 · `journey-core` 12/12 + 1 non verificabile, `CRON_SECRET` Sensitive, invariato) · `healthBefore` = `healthAfter` = `fdc5278`.
- Suite F4 nel repo: 66 file / 734 test (prima 65 / 719).
- Il vincolo aritmetico (qty x unit = importo al centesimo) e' la ragione per cui la riga collassata e' ora sicura: un test pinna che `Item 2 1 000,00 1 500,00` NON produce una riga.

## A-LOCAL-1 — checkout con Redis giu' risponde 500 (F4 + B7): fix in due PR

- **documint#92** (F4) e **capture-api#114** (B7): `catch` del checkout -> `isRedisUnavailable(error)` => `serviceUnavailable()` (503, `Retry-After: 60`, codice `SERVICE_UNAVAILABLE`; B7 nella sua busta `{error:{code,message,status}}`); ogni altro errore resta 500. Test 2/4 rossi su master (outage come `fetch failed` e come quota Upstash), 4/4 verdi dopo; gli altri due fissano il percorso felice e che un errore non-outage resti 500.
- Gate: F4 lint 0 errori (38 warning), tsc 0, 67 file / 733 test, build · B7 lint 0 errori (77 warning), tsc 0, 68 file / 951 test, build.
- Stato: vedi la sezione di chiusura piu' sotto (merge e verifica in produzione).

## STATO FINALE (7 nov, dopo il secondo mandato del coordinatore)

| PR                                                                              | repo          | cosa                                                            | master / produzione | verifica                              |
| ------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------- | ------------------- | ------------------------------------- |
| [churnguard#88](https://github.com/antonioalt3000-cyber/churnguard/pull/88)     | PaymentRescue | dashboard col piano vecchio fino a 30 s                         | `80afb41`           | sul vivo 5/5                          |
| [documint#89](https://github.com/antonioalt3000-cyber/documint/pull/89)         | ParseFlow     | totali/numero fattura EU sbagliati o vuoti                      | `f27e164`           | matrice 15 rossi -> 0                 |
| [documint#90](https://github.com/antonioalt3000-cyber/documint/pull/90)         | ParseFlow     | righe con migliaia a spazio e segno; copy multipagina/changelog | `6c81931`           | righe nota di credito esatte          |
| [accessiscan#90](https://github.com/antonioalt3000-cyber/accessiscan/pull/90)   | FixMyWeb      | banner e privacy promettevano annunci inesistenti               | `946e843`           | banner+privacy letti nel browser, 6/6 |
| [documint#91](https://github.com/antonioalt3000-cyber/documint/pull/91)         | ParseFlow     | righe collassate su spazi singoli, con vincolo aritmetico       | `fdc5278`           | **matrice con righe 130/130**         |
| [documint#92](https://github.com/antonioalt3000-cyber/documint/pull/92)         | ParseFlow     | checkout con Redis giu': 500 -> 503                             | `c6f6728`           | locale 18/18 + prod = commit          |
| [capture-api#114](https://github.com/antonioalt3000-cyber/capture-api/pull/114) | CaptureAPI    | checkout con Redis giu': 500 -> 503                             | `1945ec8`           | locale 17/17 + prod = commit          |

**A-LOCAL-1 CHIUSO.** Prima della correzione: F4 17/18 e B7 16/17, l'unico rosso reale era il checkout a 500. Dopo (build di produzione del branch del fix, stessi mock): **F4 18/18, B7 17/17**; la regola «nessun 500 con Redis giu'» e' verde su entrambi (il checkout risponde 503). Il guasto Redis NON e' riprodotto in produzione (non si tocca Upstash di produzione): in produzione e' provato che il commit servito e' quello con la correzione, e che la baseline e' verde.
**Baseline del coordinatore sui commit finali**: `baseline-run.cjs f4 b7` -> **f4 VERDE `c6f6728`** (sweep 31 pagine · pubblico 6/6 · core 12/12 + 1 non verificabile) · **b7 VERDE `1945ec8`** (sweep 39 · pubblico 6/6 · core 11/11).
**Matrice F4 sul commit finale `c6f6728`: 130/130.**

### NON eseguito / dichiarato (onesto)

- **«Cliente fedele» sulle F-series in produzione** (tracker bloccati, refresh dopo il riscatto, doppio invio / due schede, UA Safari-Firefox mobile): **non eseguito.** Letto nel codice che le F-series non hanno il gate con orologio del client; il doppio consumo del coupon e' coperto indirettamente (F3 locale: stesso coupon due volte -> 4xx; F2 produzione: secondo riscatto stessa email -> 409 con la causa vera). Il resto non e' provato.
- **Redirect da URL pubblico verso IP interno su B7**, end-to-end: non provabile senza un redirector che non si autoprotegga (httpbin e httpbingo rifiutano da soli); letto nel codice, non provato.
- **Redis giu' non riprodotto in produzione** (vincolo): provato solo in locale con mock e sul commit servito.
- **Dunning reale e pagamento con carta vera**: vincoli.
- **Gli oracoli F1 (media categorie) e F2 (12 contrasti)** sono quelli del baseline del coordinatore, non rifatti da me.
- **Residui miei non corretti, con motivo**: (1) `Buffer()` deprecato = `pdf-parse@1.1.4`, dipendenza di terzi; (2) PostHog su F2/B7 non attivo in produzione (manca la chiave), decisione del fondatore; (3) `/signup` force-static F4/B7 inerte per i browser; (4) privacy di F4 dice «optional analytics/advertising cookies» e il toggle «Advertising» esiste in F1-F4 senza annunci (decisione fondatore/legale, cambia lo stato di consenso); (5) parser PDF: il prodotto estrae solo testo selezionabile, nessun OCR (dichiarato dal prodotto stesso).
- **Errori miei di procedura**: le chiavi Redis del riscatto fatto con `redeem-probe.cjs` su f2 le ho registrate dopo la scrittura; e due volte la sonda non vedeva la forma vera del dato (righe con buchi larghi invece che collassati; selettore del banner che non trovava nulla): rimediato, e la verifica del banner ora pretende che il banner sia presente.
- **File fuori da `A/`** toccato: `scratchpad/qa-infra/stripe-mock-server.cjs` (additivo: `line_items` nel retrieve della sessione). E' un file tracciato di `toolkit-online`: lo committa il coordinatore. `scratchpad/qa-26ott/selftest-invoice.pdf` risulta modificato dal selftest degli oracoli, non da me di proposito.
