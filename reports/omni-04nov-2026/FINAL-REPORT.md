# Omni-QA dei 10 SaaS — 4-5 novembre 2026

> Mandato: non fidarsi di nessun report, ricollaudare ogni funzione come un cliente via browser
> reale, verificare **matematicamente** gli output, correggere alla radice senza regressioni.
> Due decisioni prese dal fondatore prima di iniziare: riscatti **anche in produzione**, e i tre
> arretrati «aperti per scelta» **dentro** il perimetro.
>
> Formato dei reperti: `REPERTI.md` (passo → atteso → osservato → evidenza). Ledger: `RUN-LEDGER.md`.

---

## 1. Verdetto

**36 pull request aperte, verificate e mergiate, su 10 repo** (contate, non stimate:
`gh pr list --state merged` filtrato sull'inizio del round). Nessuna lasciata a metà. Le PR
Dependabot aperte non sono state toccate. Stato finale misurato in produzione su tutti e 10:

|                                                 | prima del round                    | dopo                          |
| ----------------------------------------------- | ---------------------------------- | ----------------------------- |
| `/<rotta esistente>\`                           | **500** su 62 pagine (9 prodotti)  | **404/308** su 10/10          |
| `og:image` mancante                             | 8 pagine (hsh 5, seo 2, eg 1)      | **0**                         |
| `'unsafe-inline'` in `script-src`               | 5 prodotti su 10                   | **0 su 10**                   |
| nonce CSP per richiesta                         | 5 su 10                            | **10 su 10**                  |
| `npm audit`: critical + high                    | 2 + 1 su 10/10                     | **0**                         |
| `coupon-stats`: tasso d'uso riferito al partner | 19-21%                             | **4-6%** (il vero)            |
| indirizzo fornitore estratto (ParseFlow)        | solo formato USA, o spazzatura     | 11 lingue, riga per riga      |
| calcolatore ROI (PaymentRescue)                 | mostrava un tasso e usava un altro | campo e calcolo non divergono |
| backup del pool coupon FixMyWeb                 | **mai eseguito**                   | creato e verificato           |
| `/api/health`                                   | ok 10/10                           | ok 10/10                      |

**7 reperti**, di cui 5 corretti e verificati in produzione, 1 mitigato a metà e 1 lasciato al
fondatore con la ragione scritta. **9 falsi rossi del collaudo**, tutti diagnosticati e dichiarati
in §6: era la parte più probabile di sbagliare, ed è quella su cui ho speso più verifiche.

---

## 2. Il collaudo come cliente

### Giro pubblico nel browser reale — 60/60 PASS

`journey-public.cjs` su 10 prodotti via CDP 9223: home e `/redeem` senza errori di console, senza
risposte ≥400, senza scorrimento orizzontale a 1366 e a 375 px. Evidenze: PNG + `results.json`
per prodotto in `evidence/<slug>/`.

### Superficie pubblica — 273 pagine rastrellate via HTTP

`sweep-public.cjs`, con un parser HTML indipendente da quello dei prodotti: **0 pagine non-200,
0 metadata ereditati dalla home, 0 pagine con `<h1>` multipli**. Ha trovato le 8 pagine senza
`og:image` e le 62 che rispondevano 500 al backslash.

### Cliente pagante, in produzione — 10/10

`journey-deep.cjs`: coupon `internal: true` coniato via `/api/admin/generate-coupons`, riscattato
**nel browser reale** compilando il form, chiave API consegnata e usata. CardForge ha prodotto una
card PNG vera da 27.560 byte; CaptureAPI uno screenshot da 52.880 byte. I pool DealMirror/DealFuel
non sono stati sfiorati. Ogni chiave Redis registrata in `REDIS-WRITES.jsonl` **prima** di nascere.

### Feature core con oracolo matematico — il cuore del mandato

`journey-core.cjs`: per ogni prodotto un oracolo che **ricalcola** la risposta per una strada che
non condivide codice col prodotto. Non «la chiave c'è», ma «il numero è questo e lo riproduco».

| prodotto      | cosa ho ricalcolato                                                                                                                                                                              | esito           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| CompliPilot   | `overallScore` = media esatta delle categorie applicabili (92·35·51·36·86 → **60**) + determinismo su due giri                                                                                   | 7/7             |
| FixMyWeb      | rapporti di contrasto con la formula WCAG su 12 coppie (scarto max 0,0043); `passati + rilievi = controlli` (192+9=201); `score = 192/201 → 96`                                                  | 12/13           |
| PaymentRescue | ROI ricalcolato a mano (25.000 × 9% = 2.250 · ×40% = 900 · ×12 = 10.800)                                                                                                                         | ✅ + reperto R7 |
| ParseFlow     | fattura PDF con totali noti: subtotale 585,75 · IVA 123,01 · 21% · totale 708,76 al centesimo; 3 righe che moltiplicano (3×85,50 · 1×240 · 7×12,75) e sommano al subtotale; PNG respinto **422** | 13/13           |
| CaptureAPI    | `pngDims` = **800×600 esatti**; `size_bytes` dichiarato = byte reali (208.524 = 208.524); PDF A4 595,92×841,92                                                                                   | 11/11           |
| CardForge     | 9 template, dimensioni dichiarate consegnate al pixel; titolo 400 char, vuoto, unicode, hex non valido: mai 500                                                                                  | 6/6             |
| EmailGuard    | MX/SPF/DMARC confrontati col **DNS reale** via DNS-over-HTTPS; i 5 record MX elencati sono quelli veri; lotto di 101 respinto                                                                    | 11/11           |
| HeaderShield  | `score` = punti/massimo (**95 = 95/100**); i 9 rilievi confrontati con gli header veri letti da una connessione indipendente; `fail_under` → **422**                                             | 7/7             |
| HookLab       | HMAC ricalcolato e accettato; `bodyRaw` **byte per byte** il payload spedito; un byte alterato invalida la firma (`SIGNATURE_MISMATCH`)                                                          | 14/14           |
| SEOScope      | `score` = media pesata delle categorie (84,31 → 84); titolo e description identici a quelli letti dal mio parser                                                                                 | 10/10           |

E i **cron veri**, letti dal `vercel.json` di ciascun repo: 200 col proprio segreto, 401/403 con uno
sbagliato. L'harness ereditato sondava su ogni prodotto `review-requests` e `cleanup` e contava il
404 come PASS: su HeaderShield il cron vero (`dispatcher`) **non era mai stato provato**.

---

## 3. I reperti

Dettaglio, riproduzione ed evidenza in `REPERTI.md`. In sintesi:

| #   | cosa                                                                                                    | dove                                                      | stato                               |
| --- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------- |
| R1  | `/<rotta esistente>\` risponde **500** invece di 404 — 62 pagine, 9 prodotti su 10                      | strato di hosting; mitigato nel middleware                | ✅ corretto, 10/10 in prod          |
| R2  | 8 pagine senza `og:image`                                                                               | un `openGraph` di pagina sostituisce l'immagine ereditata | ✅ corretto                         |
| R3  | `coupon-stats` contava i **nostri** coupon nei totali riferiti al partner                               | 10/10 i repo                                              | ✅ corretto, retroattivo            |
| R4  | 🔴 FixMyWeb: i **4 job schedulati non sono mai girati** (`CRON_SECRET` assente)                         | config Vercel                                             | ⚠️ metà mitigata, metà al fondatore |
| R5  | ParseFlow: indirizzo fornitore solo-USA, o contenente pezzi della partita IVA                           | `extractAddress`                                          | ✅ corretto                         |
| R6  | Le **preview non hanno credenziali Upstash**: nessuna rotta Redis è verificabile prima della produzione | config Vercel                                             | 🔴 al fondatore                     |
| R7  | PaymentRescue: il calcolatore mostrava un tasso e ne usava un altro                                     | `/calculator`                                             | ✅ corretto                         |

**Il più grave è R4**, e non per ragioni tecniche. FixMyWeb è **l'unico dei 9 progetti con cron a
non avere `CRON_SECRET`**, in nessun ambiente. Tutti e 4 i suoi job accettano solo
`Authorization: Bearer $CRON_SECRET` e ogni ramo è protetto da `cronSecret && …`: con la variabile
assente la porta **fallisce chiusa**, 401 a ogni invocazione. Fra quei job c'è il backup del pool
coupon del partner, e la prova non viene dal codice ma dal prodotto stesso: `verify-backup`
rispondeva `{"hasBackup":false,"error":"No backup present"}`. **Non era mai stato fatto un backup.**
L'ho eseguito a mano (920 validi + 104 usati, checksum coincidente col vivo, deriva 0).

---

## 4. Gli arretrati entrati nel perimetro

### CSP con nonce — fatta su tutti e 5 i F-series

`'unsafe-inline'` via da `script-src`, nonce per richiesta + `strict-dynamic`. **In produzione:
0 occorrenze di `unsafe-inline` su 10/10, nonce su 10/10.** Verificata nel browser reale, non solo
con curl: **29 pagine** su 5 prodotti, zero violazioni CSP, React idratato con i suoi listener,
zero script inline senza nonce. GTM continua a funzionare; le allowance **AdSense sono state
rimosse** (nessun codice le usava).

🔴 **Il costo, misurato e non stimato**: leggere il nonce nel root layout porta le route fuori dal
prerendering statico. Pagine prerenderizzate prima → dopo: f1 51→5 · f2 58→5 · f3 50→4 · f4 51→6 ·
b7 43→5. Sono ~45 pagine per prodotto che passano da HTML in cache CDN a render server. È
esattamente il trade-off registrato il 4 set 2026 come ragione per scartarla: **ora è pagato**, ed è
l'unica voce di questo round su cui vale la pena tornare se i tempi di risposta peggiorano.

### Major del test runner — e l'arretrato puntava alla versione sbagliata

L'arretrato diceva «vitest 3 → 4». **Non avrebbe chiuso nulla**: gli advisory coprono
`vitest 0.0.95 - 4.1.10`, `tinypool <= 2.1.1` e `@vitest/mocker <= 4.1.11`, quindi anche la 4 è
vulnerabile. `npm audit` indica **una** sola via: `vitest@5.1.0`, con `@types/node ^22` al seguito
(più aderente del `^20` precedente, dato che in produzione gira Node 22/24).

**Fatto su 10/10. `npm audit`: da 2 critical + 1 high + 13 moderate + 1 low a 12 moderate.** Nessuna
modifica ai config, nessun test riscritto per compiacere il runner. Ha però **scoperto 39 test
sbagliati** in 2 repo: mock di `stripe` e di `@upstash/redis` scritti come `vi.fn(() => ({…}))` dove
il prodotto fa `new Stripe(...)` / `new Redis(...)`. Una arrow function non è un costruttore: vitest
3 lo tollerava, vitest 5 no — **e vitest 5 ha ragione**, perché quei mock non rispecchiavano come il
prodotto costruisce i suoi client. Corretti, e i conteggi sono tornati identici al baseline.

### UI di cancellazione self-service — NON fatta

È l'unica delle tre voci che resta aperta, e lo dico senza girarci intorno. `/api/user/delete` e
`/api/user/export` esistono su 10/10 ma nessuna dashboard li espone. È una **feature nuova** su
un'azione irreversibile, su 10 prodotti, e serve un flusso di conferma progettato (digitare
l'email, avviso di definitività, export offerto prima). Non l'ho iniziata perché farla male su
dieci dashboard è peggio che non farla: va progettata una volta e replicata, con il passo
«cancellazione» del viaggio cliente rieseguito su ciascun prodotto dopo.

---

## 5. Cosa resta al fondatore

1. 🔴 **`CRON_SECRET` su FixMyWeb** (reperto R4). Non l'ho creata io e il motivo non è tecnico:
   accenderla fa partire `review-requests` e `recover-checkouts`, che **mandano email a clienti
   reali**, potenzialmente un arretrato tutto insieme. La regola di portfolio è draft-first su
   qualunque outbound. I due job protettivi (backup + verify) non mandano niente e li ho già
   eseguiti a mano.
2. 🔴 **Rotazione di `INTERNAL_SECRET_KEY`** su F1 e F2 — eredità del 31 ott, non toccata: il valore
   in produzione è identico a quello committato il 7 apr, ed è condiviso con il watchdog.
3. 🔴 **Credenziali Upstash alle preview** (reperto R6). Senza, metà della superficie del portfolio
   resta collaudabile **solo dopo** il merge.
4. **Ticket Vercel sul soft-404 pagine** — riproduzione pronta dal 31 ott, serve l'account.
5. **UI di cancellazione self-service** — decidere se farla, vedi §4.
6. **~30 chiavi Redis di collaudo** in produzione, tutte registrate in `REDIS-WRITES.jsonl`: per
   cancellarle serve un token Upstash scrivibile, che `vercel env pull` non fornisce.
7. **PostHog è già bloccato oggi su F2 e B7**: `PostHogInit` punta a `eu.i.posthog.com`, host che
   non è in `connect-src` né prima né dopo questo round. Pre-esistente, segnalato e non toccato:
   allargare `connect-src` è una decisione separata.

---

## 6. Autocritica — 9 falsi rossi, tutti miei

Un collaudo che non sbaglia mai in proprio favore va guardato con sospetto. Questi sono i rossi che
ho prodotto io e che **non** erano difetti del prodotto. Li elenco perché sono la parte di questo
report che vale di più la prossima volta.

1. **og:image su `/` e `/r/[token]`** — la mia regola ignorava che la cartella che **possiede** il
   file immagine la riceve comunque. Verificate in produzione prima di restringere la regola.
2. **SEOScope, titolo e description** — `rawGet` non segue i redirect e `toolkitonline.vip/` fa
   308 → `/en`: confrontavo il corpo del redirect con ciò che il prodotto leggeva dopo averlo
   seguito.
3. **SEOScope, titolo (secondo giro)** — restava la decodifica delle entità HTML (`&amp;` vs `&`).
4. **CardForge, template ignoto** — pretendevo un 4xx. Il fallback a `og-gradient` è dichiarato nei
   docs **e** nell'OpenAPI e applicato uniformemente a `theme`/`trend`/`size`.
5. **CaptureAPI, screenshot** — pretendevo byte binari da `POST`. L'endpoint ha due forme volute:
   `GET` dà il PNG, `POST` un involucro JSON multi-viewport con l'immagine in data-URI.
6. **ParseFlow, IVA «0»** — cercavo `tax`/`vat`; il campo è `taxAmount`, camelCase come tutto il
   resto della risposta. Il prodotto era esatto al centesimo.
7. **HookLab, firma** — `provider: "generic"` non esiste, e il mio check «rifiuta una firma
   sbagliata» passava per il 400 di validazione: un verde **vacuo**, peggio di un rosso.
8. **CSP, «4 violazioni»** — erano errori di **MIME type**: `/_vercel/insights` esiste solo
   sull'edge di Vercel e sotto `next start` risponde `text/plain`. La mia regex cercava «refused to
   execute», frase che CSP e MIME condividono.
9. **CSP, «7 script senza nonce»** — 🔑 il browser **maschera il valore dell'attributo `nonce`** nel
   DOM: si legge solo dalla proprietà IDL `.nonce`, mai da `getAttribute`, per impedirne
   l'esfiltrazione via selettori CSS. La presenza si verifica con `hasAttribute`.

E tre errori di procedura, non di misura:

- **ho attribuito a `SINTER` un 500** che veniva dall'assenza di credenziali Upstash sulla preview.
  Il commit che lo diceva è stato corretto da uno successivo che dichiara la causa vera.
- **ho committato una volta con un test rosso** (il guardiano CSP di f1 che vietava la stringa
  `script-src` nel config). Corretto nel commit successivo, e il guardiano riscritto sull'intento e
  **provato nei due versi**: verde com'è, rosso se si rimette una CSP di documento nel config.
- **`grep -c` con zero risultati esce 1** e ha troncato in silenzio una catena `&&`: lint e build
  non erano girati mentre il mio riepilogo diceva di sì. Rieseguiti, verdi davvero.

---

## 7. Cosa non è stato collaudato

Lo scrivo per non lasciare l'impressione che il round sia esaustivo.

- **Il viaggio autenticato completo in locale coi mock** (signup → verifica email → login →
  esaurimento quota → riscatto → checkout → webhook firmato → **guasto Redis** → cancellazione)
  resta non eseguito, per il quarto round di fila. L'harness c'è e funziona
  (`run-dev.cjs` + mock Upstash/Brevo/Stripe isolati, `POST /__qa/outage`): è tempo, non capacità.
  In produzione quel giro non è inducibile.
- **Il guasto Redis** non è stato simulato da nessuna parte in questo round.
- **Nessun pagamento con carta vera**: il checkout è verificato fino alla pagina Stripe. È un
  vincolo, non una dimenticanza.
- **ParseFlow, letterhead europeo senza etichetta**: il fornitore resta vuoto. È la scelta
  deliberata del 27 ott (una ricerca non ancorata causò il ticket di Rick) e non l'ho toccata.
- **ParseFlow, `/signup`** e **CaptureAPI, `/signup`**: `force-static`, il loro corpo
  prerenderizzato ha script senza nonce. Inerte oggi (307 verso `/free`, il browser scarta il
  corpo), ma è l'unico punto latente della CSP.
- **`Buffer()` deprecato** su ParseFlow `/api/v1/extract` e `/api/v1/demo` (4 occorrenze nei log
  runtime): non risalito alla dipendenza che lo causa.

---

## 8. Come rifare questo round

```bash
# superficie pubblica + probe backslash, un prodotto
node reports/omni-04nov-2026/sweep-public.cjs <slug>
# giro pubblico nel browser reale
node reports/omni-04nov-2026/journey-public.cjs <slug>
# feature core con oracolo matematico + cron veri
node reports/omni-04nov-2026/journey-core.cjs <slug>
# cliente pagante in produzione (conia e riscatta: registra le chiavi)
node reports/omni-04nov-2026/journey-deep.cjs <slug>
# CSP nel browser reale (console, idratazione, nonce) contro un build di produzione
node reports/omni-04nov-2026/csp-browser-check.cjs http://localhost:<porta> / /pricing /redeem
# ledger
node reports/omni-04nov-2026/progress.cjs table
```

Slug: `f1 f2 f3 f4 b7 cfg eg hsh hkl seo`. Serve Chrome su :9223 e, per `journey-deep`,
`ADMIN_API_SECRET`/`CRON_SECRET` in `%TEMP%/claude/qa-secrets/<slug>.qa`.

🔑 **Prima di credere a un rosso**: `node scratchpad/qa-infra/selftest.cjs` (oracoli) e
`node scratchpad/qa-infra/sdk-roundtrip-test.mjs <sdk> <mock>` (mock Upstash, 6/6). In questo round
9 rossi su 16 erano della sonda.
