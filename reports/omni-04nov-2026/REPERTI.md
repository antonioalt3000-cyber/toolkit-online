# Reperti — round omni-QA del 4 novembre 2026

Formato: passo → atteso → osservato → evidenza.

## R1 — `/<rotta>\` risponde 500 invece di 404 (9 prodotti su 10) — CORRETTO

- **Passo**: `GET https://<dominio>/<rotta esistente>%5C`
- **Atteso**: 404 (o un redirect alla rotta canonica)
- **Osservato**: **500**, pagina `__next_error__`, `X-Matched-Path: /500`. 62 pagine su 273.
  Insieme esatto: tutte le pagine dei 5 round-2 (cfg 11/11, eg 11/11, hsh 11/11, hkl 13/13,
  seo 11/11) e, sui F-series, solo le pagine **dinamiche**: `/pricing` su f1/f2/f3/f4 più
  `/status` su f4. **B7 immune su 39/39.**
- **Causa**: strato di hosting. Lo stesso commit risponde 404 sotto `next start` in locale; i log
  runtime Vercel portavano `Cannot find module './.next/server/pages/<rotta>%5C.js'` (hsh 28 gruppi,
  seo 18). Non è il middleware (ipotesi scartata: il middleware viene eseguito, la risposta 500
  porta un nonce CSP fresco) e non è la versione di Next (16.4.3 su tutti e 10).
- **Fix**: guardia nel middleware — unico nostro codice che gira ancora su quelle richieste.
  Backslash e slash ripetuti collassati, 308 verso il path canonico; `/\evil.com` non può
  diventare `//evil.com`. Test con 6 casi, compresi 3 tentativi di fuga dall'host.
- **Evidenza**: `evidence/<slug>/sweep-public.json`; verifica su preview
  `business-new-headershield-2gac5rlvw.vercel.app`: `/pricing%5C` 500 → **308 → 200**,
  `/nonexistent%5C` → **308 → 404**, `/%5C%5Cevil.com` → 308 sullo stesso host.

## R2 — 8 pagine senza `og:image` (3 prodotti) — CORRETTO su hsh

- **Passo**: leggere `<meta property="og:image">` su ogni pagina della sitemap
- **Atteso**: presente su tutte
- **Osservato**: assente su hsh `/docs /help /pricing /signup /simulate`, seo `/help /seo-audit`,
  eg `/verify-email`. Gli altri 7 prodotti: completi.
- **Causa**: un `openGraph` dichiarato a livello di pagina **sostituisce** quello ereditato, e con
  esso l'immagine che Next attacca da `app/opengraph-image.tsx`. Su hsh la causa era nell'helper
  `pageMetadata()` (5 pagine in un colpo), su seo/eg in `openGraph` scritti inline.
  Controprova eseguita: le pagine **con** og:image non dichiarano `openGraph`, tranne `/` e
  `/r/[token]` che **possiedono** il file immagine nella propria cartella.
- **Fix**: `images` nell'helper/nelle pagine + il test di regressione esistente
  (`layout-share-metadata.test.ts`), che guardava solo `layout.tsx` e la home, ora cammina tutte le
  pagine ed esenta le cartelle che possiedono un file immagine.
- **Autocritica**: al primo giro il test ha dato 2 rossi (`/` e `/r/[token]`) che erano **della
  regola, non del prodotto** — verificati presenti in produzione prima di restringere la regola.

## R3 — `coupon-stats` conta i coupon interni nei totali che vedono i partner — APERTO

- **Passo**: leggere `GET /api/admin/coupon-stats`
- **Atteso**: `totalDelivered` / `totalUsed` / `usagePercent` riferiti alla **campagna** del partner
- **Osservato**: `totalDelivered = SCARD(coupons:valid) + SCARD(coupons:used)`, che include i coupon
  `internal: true` coniati dai nostri collaudi; anche l'elenco `redemptions` li mescola ai clienti
  veri. Ogni round di QA sposta di qualche unità un numero citabile a un partner.
- **Causa**: il totale è calcolato dai due set complessivi; l'indice `<prefix>:coupons:internal`
  esiste già (lo scrive `generate-coupons`, lo ripopola `backfill-internal-coupons`) ma non viene
  usato qui.
- **Fix applicato e verificato in produzione** (CardForge, pilota — PR #52, commit `b9ff115`).
  L'entità era molto maggiore di quanto stimassi:

  |                        | prima                | dopo                                  |
  | ---------------------- | -------------------- | ------------------------------------- |
  | `totalDelivered`       | 291                  | **214** (campagna)                    |
  | `totalUsed`            | 58                   | **9**                                 |
  | `usagePercent`         | **20%**              | **4%**                                |
  | `redemptions` elencate | 58 (ns. QA compresi) | **9**, solo clienti                   |
  | interni, a parte       | —                    | 77 consegnati · 49 usati · 28 residui |

  Cioè **49 dei 58 «riscatti» erano nostri**: il tasso d'uso riferito al partner era sovrastimato
  di **5 volte**, e l'elenco dei «clienti» conteneva 49 nostre email di collaudo. Somma di
  controllo: 214 + 77 = 291, il totale grezzo di prima. La correzione è **retroattiva**: ripulisce
  i numeri gonfiati da tutti i round precedenti senza toccare un solo coupon.

- **Replicato e verificato in produzione su 6 prodotti su 10** (i 4 F-series sono in corso). Cifre
  lette dalla produzione dopo il rilascio — campagna a sinistra, nostri coupon a destra:

  | prodotto     | consegnati | usati | tasso  | **prima**      | interni (consegnati/usati/residui) |
  | ------------ | ---------- | ----- | ------ | -------------- | ---------------------------------- |
  | CardForge    | 214        | 9     | **4%** | 291 · 58 · 20% | 77 / 49 / 28                       |
  | EmailGuard   | 214        | 12    | **6%** | 270 · 50 · 19% | 56 / 38 / 18                       |
  | HeaderShield | 214        | 9     | **4%** | 278 · 52 · 19% | 64 / 43 / 21                       |
  | HookLab      | 214        | 11    | **5%** | 1289 · 58 · 4% | **1075** / 47 / 1028               |
  | SEOScope     | 214        | 10    | **5%** | 290 · 60 · 21% | 76 / 50 / 26                       |
  | CaptureAPI   | 962        | 58    | **6%** | —              | 65 / 42 / 23                       |

  Il tasso d'uso reale della campagna partner è **4-6%**, non il 19-21% che veniva riportato. Su
  HookLab il pool interno era di **1075 coupon**, cioè la quasi totalità di ciò che l'endpoint
  contava come «consegnato».

## R4 — 🔴 FixMyWeb: i 4 job schedulati non sono mai girati (CRON_SECRET assente) — MITIGATO A META'

- **Passo**: leggere come si autenticano i job in `vercel.json` di f2, e chiedere al prodotto se il
  backup esiste
- **Atteso**: i job girano come schedulati
- **Osservato**: f2 è **l'unico dei 9 progetti con cron a non avere `CRON_SECRET`** — assente in
  **ogni** ambiente (26 variabili elencate via `vercel env ls`, nessuna con CRON nel nome; gli altri
  8: presente). Tutti e 4 i job accettano **solo** `Authorization: Bearer $CRON_SECRET`
  (`x-admin-secret` è il canale manuale, che Vercel Cron non invia) e ogni ramo è protetto da
  `cronSecret && …`, quindi con la variabile assente la porta **fallisce chiusa**: 401 a ogni
  invocazione. I 4 job: `/api/cron/review-requests` (10:00), `/api/admin/recover-checkouts`
  (ogni 6h), `/api/admin/backup-coupons` (03:30), `/api/admin/verify-backup` (04:00).
- **Prova dal prodotto stesso**, non dal codice: `GET /api/admin/verify-backup` con il segreto admin
  rispondeva `{"ok":false,"hasBackup":false,"backupChecksum":"","error":"No backup present — run
/api/admin/backup-coupons first"}`. **Il pool coupon del partner non era mai stato salvato.**
- **Mitigazione applicata**: backup eseguito a mano (`POST /api/admin/backup-coupons` con
  `x-admin-secret`): `920` coupon validi + `104` usati, checksum `0047f48b…`, e `verify-backup`
  subito dopo dà `match: true`, deriva 0. Chiave registrata in `REDIS-WRITES.jsonl` **prima** della
  scrittura. Quel job scrive **una sola** chiave (`fmw:backup:coupons:latest`) e non tocca i set
  vivi: verificato nel codice prima di invocarlo.
- 🔴 **Resta al fondatore**: creare `CRON_SECRET` in produzione su f2. **Non l'ho fatto io, e il
  motivo non è tecnico**: accenderlo fa partire `review-requests` e `recover-checkouts`, che
  **mandano email a clienti reali**, potenzialmente un arretrato tutto insieme. La regola di
  portfolio è draft-first su qualunque outbound, quindi la decisione è tua. I due job protettivi
  (backup + verify) non mandano niente: quelli li ho già eseguiti a mano.

## R5 — ParseFlow: l'indirizzo del fornitore era solo-statunitense, e poteva contenere la partita IVA — CORRETTO

- **Passo**: `POST /api/v1/extract` con 4 fatture di prova a layout diverso, chiave di un account
  pagante
- **Atteso**: l'indirizzo estratto è l'indirizzo
- **Osservato**: `extractAddress` era **una sola regex in formato USA** (numero civico + suffisso
  St/Ave/Rd…) applicata a tutto il blocco della parte. Conseguenze misurate:
  `"Via Cavour 12, 20121 Milano"` → `""` (nessun indirizzo europeo poteva combaciare, e la galleria
  dei template di questo prodotto usa «Calle Mayor 14, Madrid»); con `Supplier VAT ID:` sopra
  `Supplier Address:`, il campo tornava **`"09876543210\nSupplier Address"`** — pezzi della partita
  IVA più l'etichetta della riga dopo, consegnati come indirizzo, perché `[A-Za-z\s]+` attraversava
  i newline; e il solo caso funzionante, quello USA, **perdeva il CAP**.
- **Il resto dell'estrazione è esatto**: su tutti e 4 i layout subtotale/IVA/aliquota/totale al
  centesimo (585,75 / 123,01 / 21% / 708,76), le 3 righe con 3×85,50=256,50 · 1×240 · 7×12,75=89,25
  e somma righe == subtotale, numero fattura e date corretti. Un PNG è respinto con **422
  `IMAGE_INPUT_UNSUPPORTED`** (nessun OCR promesso: il claim falso di ottobre resta chiuso).
- **Causa radice**: la nota del 27 ott in `extractor-party-fields.test.ts` diceva che `address` e
  `taxId` «erano dichiarati e mai assegnati». `taxId` fu assegnato; `address` ricevette quella regex.
  Era la metà rimasta dello stesso reperto, non un difetto nuovo.
- **Fix**: ricerca riga per riga — prima l'etichetta esplicita in 11 lingue (e prende il resto della
  riga, CAP compreso), poi le forme europea e statunitense, **mai a cavallo di due righe**, mai su
  una riga che dichiara un altro campo. 5 test nuovi nel file canonico di quella famiglia.
- **Nota onesta**: un letterhead europeo senza etichetta resta vuoto, perché `extractEntity` esce
  prima quando non trova un'ancora per il NOME. È la scelta deliberata del 27 ott (una ricerca non
  ancorata causò il ticket di Rick): non l'ho toccata.

## Autocritica — 4 rossi su 6 erano dell'oracolo, non del prodotto

Dichiarati qui perché un collaudo che non sbaglia mai in proprio favore va guardato con sospetto.

1. **og:image, `/` e `/r/[token]`**: la mia regola «chi dichiara openGraph deve dichiarare images»
   non teneva conto che la cartella che **possiede** il file immagine la riceve comunque. Verificate
   presenti in produzione prima di restringere la regola.
2. **SEOScope titolo/description**: `rawGet` non segue i redirect e `toolkitonline.vip/` fa 308 →
   `/en`. Confrontavo il corpo del redirect con quello che il prodotto aveva letto dopo averlo
   seguito. Poi restava la decodifica delle entità HTML (`&amp;` contro `&`): ancora mia.
3. **CardForge template ignoto**: pretendevo un 4xx. Il fallback a `og-gradient` è dichiarato nei
   docs **e** nell'openapi («Defaults to og-gradient») e applicato uniformemente a theme/trend/size.
4. **CaptureAPI screenshot**: pretendevo byte binari da `POST`. L'endpoint ha due forme volute —
   `GET` dà il PNG, `POST` un involucro JSON multi-viewport con l'immagine in data-URI. Ora
   l'oracolo prova entrambe, e confronta i pixel **dentro** il data-URI con le dimensioni dichiarate.
5. **ParseFlow IVA «0»**: cercavo `tax`/`vat`, il campo è `taxAmount` (camelCase, come tutto il
   resto della risposta). Il prodotto era esatto.
6. **HookLab firma**: `provider: "generic"` non esiste (solo stripe/github/shopify), e il mio check
   «rifiuta una firma sbagliata» passava per il 400 di validazione — un verde vacuo. Riscritto.

Inoltre l'harness ereditato sondava su ogni prodotto i cron `review-requests` e `cleanup`: dove non
esistono danno 404, che l'harness contava come PASS. **Su HeaderShield il cron vero (`dispatcher`)
non era mai stato provato.** Ora i cron si leggono dal `vercel.json` di ciascun repo.

## R6 — Le preview non hanno credenziali Upstash: nessuna rotta Redis è verificabile prima della produzione

- **Passo**: verificare sulla preview una rotta che legge Redis (`/api/admin/coupon-stats` di CardForge)
- **Atteso**: la preview risponde coi dati reali (le preview condividono il database di produzione)
- **Osservato**: `500 {"error":"Could not read coupon stats."}`. La rotta nascondeva la causa; dopo
  averla fatta parlare: **`UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN environment variables are
not configured`**. Sulle preview quelle variabili non ci sono, quindi **nessuna** chiamata Redis
  può girare là.
- **Perché conta per il metodo, non solo per quella rotta**: tutto ciò che tocca Redis — riscatti,
  quote, rate-limit, coupon, dashboard — **non è verificabile su preview** su questo progetto. Il
  passaggio «verifica su preview, poi mergia» che ho applicato al fix del backslash (dove funziona,
  perché è puro routing) **non è disponibile** per la metà Redis del portfolio: quella si verifica
  solo in produzione, dopo il merge. È la ragione strutturale per cui i round precedenti
  verificavano certe cose solo in produzione.
- **Costo pagato in questa sessione**: ho attribuito il 500 a `SINTER` e l'ho sostituito, prima di
  scoprire che il comando non c'entrava nulla. Il commit che lo diceva è stato corretto con uno
  successivo che dichiara la causa vera. 🔑 **Un endpoint solo-admin che occulta il proprio errore
  rende indiagnosticabile un guasto a chi ha già passato l'autenticazione**: ora la causa viene
  restituita e registrata.
- 🔴 **Resta al fondatore**: decidere se dare alle preview le credenziali Upstash (anche di un
  database separato) — senza, metà della superficie resta collaudabile solo dopo il merge.

## R7 — PaymentRescue: il calcolatore ROI mostra un tasso di recupero che non usa — APERTO

- **Passo**: su `/calculator`, digitare `65` nel campo «Assumed recovery rate» e leggere i numeri
- **Atteso**: o accetta 65 e lo usa, o lo rifiuta dicendolo
- **Osservato**: il campo numerico **mostra 65**, mentre slider, etichetta e calcolo usano **50**
  (`min="30" max="50"`). Con `15` il campo mostra 15 e il calcolo usa 30. Verificato nel browser
  reale: MRR 48.000 · churn 5,5% · tasso digitato 65% → perdita 2.640 ✓ ma recupero 1.320 (50%)
  invece di 1.716, e annuo 15.840 invece di 20.592.
- **Causa**: `min`/`max` su un `input[type=number]` **non limitano** il valore digitato in HTML —
  governano solo la validazione e le frecce. Il valore digitato resta a schermo, lo stato React
  viene limitato: il campo e il calcolo divergono.
- **Attenuante**: l'etichetta accanto dice «Recoverable per Month (50%)», quindi chi guarda bene
  vede la cifra vera. **Aggravante**: è un calcolatore il cui output è una cifra in denaro che un
  cliente può citare, e lo standard di progetto chiede validazione con messaggio visibile su ogni
  input. Con un valore nell'intervallo (48%) è tutto corretto.
- **Parentela**: è la stessa famiglia del difetto del 26 ott («il calcolatore ignorava i propri
  parametri»), non lo stesso: qui usa un parametro **diverso** da quello che mostra.
- **Verificato per contrasto, con i valori predefiniti**: 25.000 × 9% = 2.250 · ×40% = 900 · ×12 =
  10.800, tutti esatti. La matematica è giusta; è l'ingresso a divergere.

## Autocritica — altri 3 falsi rossi della sonda CSP

7. **«4 violazioni CSP»** sulle pagine di PaymentRescue erano errori di **MIME type**: gli endpoint
   `/_vercel/insights` e `/_vercel/speed-insights` esistono solo sull'edge di Vercel e sotto
   `next start` rispondono 404 / `text/plain`. La mia regex cercava «refused to execute», frase che
   CSP e MIME condividono. Ora riconosce solo le violazioni che **nominano la policy**.
8. **«7 script inline senza nonce»**: 🔑 il browser **maschera il valore dell'attributo `nonce`** nel
   DOM — si legge solo dalla proprietà IDL `.nonce`, mai da `getAttribute` — per impedire
   l'esfiltrazione del nonce via selettori CSS. La presenza si verifica con `hasAttribute`. Dopo la
   correzione: **0** script inline senza nonce su 4 pagine su 4.
9. **«il calcolatore sbaglia»** su 2 casi su 3: avevo scelto valori fuori dall'intervallo dichiarato
   (`min=30 max=50`). Il difetto vero, trovato guardando _perché_, è un altro e più preciso: vedi R7.

## R8 — 7 chiavi API di account paganti sono versionate nel repo — RIMOSSE DALL'INDICE, restano in storia

- **Passo**: preparare il commit degli artefatti di questo round
- **Atteso**: nessun segreto fra i file da versionare
- **Osservato**: lo `git add` metteva in staging **7 `apikey.txt`**, cioè le chiavi che il riscatto
  consegna a un account enterprise. Controllando, **le 7 del round del 31 ott erano già
  committate**: `reports/omni-31ott-2026/evidence/{b7,cfg,eg,f4,hkl,hsh,seo}/apikey.txt`.
  Il `.gitignore` escludeva i PNG di evidenza (`reports/**/evidence/**/*.png`) ma non loro.
- **Perché conta**: sono chiavi funzionanti di account enterprise, in un repository, nella storia.
  Il repo è privato, il che limita l'esposizione ma non la annulla: chiunque abbia accesso al
  clone le ha. Ed è la seconda volta che quel round perde chiavi — la sua nota di trasparenza
  dichiarava già 5 chiavi creator finite in chiaro in un transcript locale.
- **Fatto**: `reports/**/apikey.txt` (e i PDF di evidenza) aggiunti al `.gitignore`; le 7 esistenti
  rimosse dall'indice con `git rm --cached` (restano su disco, fuori da git); **nessuna delle 7
  chiavi di questo round è stata committata** — verificato con `git diff --cached --name-status`,
  che mostra solo rimozioni.
- 🔴 **Resta al fondatore**: le chiavi sono **ancora nella storia** di git e lì non le tolgo (serve
  riscrivere la storia). La via pulita è **riconiarle**: sono 7 account di collaudo, il riscatto
  costa un coupon `internal: true` a testa. Si somma alla riconiatura delle 5 chiavi creator già
  chiesta dal round del 31 ott.
