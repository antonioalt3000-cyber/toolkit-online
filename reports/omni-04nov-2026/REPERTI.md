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

## R9 — 🔑 Il viaggio autenticato locale non era mai riuscito perché **l'ambiente QA non idratava**

- **Passo**: eseguire `track-b/f3-local.cjs` contro l'ambiente locale coi mock (`run-dev.cjs f3`)
- **Atteso**: il giro completo signup → login → checkout → webhook → guasto Redis → cancellazione
- **Osservato (prima)**: ogni asserzione di rete dava `observed=null` e la pagina restava su
  `/signup`. Diagnosi: nessun gestore React sul bottone, **nessuna prop React sul form**, e
  `form.requestSubmit()` non produceva alcuna richiesta. I 7 chunk Next si scaricavano,
  `self.__next_f` c'era, **zero errori di console**, zero risposte ≥400: React semplicemente non si
  attaccava. La stessa pagina **in produzione idrata** (`reactAttached: true`, 12 chunk).
- **Causa**: `run-dev.cjs` avvia `next dev --webpack`. Con Turbopack (`run-dev.cjs f3 turbo`, cioè
  la config `qa26-f3-turbo`) la pagina **idrata**: 27 chunk, React attaccato, `window.next` presente.
- **Perché conta**: è la ragione per cui «il viaggio autenticato completo non è mai stato completato
  su nessuno dei 10» per **quattro round di fila**. In quell'ambiente ogni interazione d'interfaccia
  era morta e l'harness lo riportava come fallimento del prodotto. Non era il prodotto: era `--webpack`.
- **Risultato dopo la correzione**: **40 controlli, 29 PASS**. Fra i verdi, cose mai verificate prima:
  checkout che chiede a Stripe **esattamente** il price id atteso con metadata e `customer_email`
  giusti · checkout senza sessione → 401 · webhook firmato 200 e **firma falsificata → 400** ·
  `invoice.payment_failed` registrato come `pending_recovery` con importo ed email esatti, poi
  transizione a `recovered` · **guasto Redis: 503 su `/api/auth/me`, `/api/dashboard` e
  `/api/auth/login`, NON un logout, e sessione intatta dopo** · cancellare l'account di un altro → 403.
- 🔑 Da fare: cambiare il default di `run-dev.cjs` a Turbopack, o rimuovere le entry `--webpack`.

## R10 — `/api/user/export` e `/api/user/delete` non sono azioni self-service: sono moduli DSAR

- **Passo**: chiamarli da una sessione autenticata
- **Osservato**: `GET /api/user/export` → **200 con la propria documentazione**, non con i dati:
  `{"endpoint":"POST /api/user/export","description":"GDPR Art. 15 … Send {email: string} …",
"maxResponseDays":30}`. `POST /api/user/delete` senza corpo → **400 «Valid email required»**;
  col verbo `DELETE` → 405.
- **Perché conta per l'arretrato non fatto**: l'arretrato diceva «esporre la cancellazione
  self-service su 10 dashboard». Ma dietro non c'è una cancellazione: c'è una **richiesta DSAR con
  SLA di 30 giorni**, che qualcuno deve poi evadere. Un bottone «Elimina il mio account» che in
  realtà apre una richiesta è una promessa diversa da quella che il bottone fa credere — ed è la
  famiglia di difetti che ha già colpito questo portfolio. Quella voce va riscritta prima di essere
  costruita: o si implementa l'erasure vera, o il pulsante dice «richiedi la cancellazione (entro
  30 giorni)». Si lega al reperto storico «DSAR routes were a façade» del 2-4 ago.
- **Conseguenza sui rossi del viaggio**: i check «delete own account → 200», «login dopo cancellazione
  rifiutato» e «nessun record residuo» **non erano misure del prodotto**: pretendevano un'erasure
  immediata da un endpoint che per progetto non la fa. 3 degli 11 rossi sono questo.

### Gli altri rossi del viaggio locale, dichiarati e non diagnosticati a fondo

- `admin generate-coupons` non risponde nell'ambiente locale → a cascata `redeem` 400 e i due check
  sul piano in dashboard. Da capire se è il segreto admin generato dall'ambiente o la rotta.
- `dunning email #1` non trovata nel mock Brevo (una email catturata, ma il mio parser non ne ha
  letto la forma) e il link `update-payment`. Richiede un passaggio dedicato.
- `export own data` conteneva l'email: falso per il motivo di R10.
  Sono **6 rossi** che restano aperti come lavoro di collaudo, non come difetti accertati. Li scrivo
  invece di arrotondarli a verde.

---

# Seguito del 5 novembre 2026 — la voce di arretrato riscritta, e cosa c'era sotto

## R11 — 🔴 Diciotto indirizzi pubblicati rimbalzano, fra cui l'unico canale GDPR di due prodotti

- **Passo**: la voce di arretrato chiedeva di esporre la cancellazione in dashboard. Prima di
  costruire un pulsante che manda a un indirizzo, ho verificato che quell'indirizzo riceva.
  Sonda RCPT su `fwd1.porkbun.com`, senza DATA, spaziata, con controllo interno in ogni passata
  (`evidence/rcpt-probe-05nov-2026.txt`, script `rcpt-probe.py`).
- **Atteso**: gli indirizzi stampati sulle pagine legali accettano posta.
- **Osservato**: **18 rimbalzano con `554 5.7.1 Relay access denied`**, e i quattro controlli
  casuali rimbalzano identici — quindi la sonda discrimina. Fra i 18:
  - `privacy@fixmyweb.dev` e `privacy@captureapi.dev`: l'**unico** canale che la privacy policy
    indica per esercitare i diritti GDPR (_«To exercise these rights, contact us at …»_).
  - `legal@complipilot.dev`: oltre a terms e pricing, è l'indirizzo della **pagina rimborsi**.
    Un cliente che esercita il recesso UE a 14 giorni riceveva un bounce.
  - `security@` su **5/5**: il contatto per le segnalazioni di vulnerabilità. Su CaptureAPI era
    anche quello dichiarato in `.well-known/security.txt`, cioè quello che legge un tool
    automatico di disclosure.
  - `dpo@parseflow.dev`, etichettato _«Data Protection Officer»_ in un DPA firmabile.
  - `sales@captureapi.dev` su `/about` e `/contact`: una richiesta enterprise rimbalzava.
- **Causa alla radice**: questi domini **non hanno catch-all**. Il registrar inoltra solo gli alias
  con una regola esplicita, e le regole esistenti sono `hello@`, `support@`, `contact@` — misurate,
  non assunte: **30 su 30** sui dieci domini. Ogni altro local-part scritto in una pagina è un
  buco nero. Gli MX c'erano su 10/10: non era la ricezione, erano gli alias.
- **Fix**: ogni indirizzo pubblicato ora è uno dei tre consegnabili, sullo stesso dominio. Su
  CompliPilot/FixMyWeb/ParseFlow la `/security` ora coincide con il `security.txt` che già diceva
  `support@` (si contraddicevano). Due etichette «Data Protection Officer» sono diventate
  «Data protection contact»: nessun DPO è nominato, e il corpo del testo lo diceva già mentre il
  titolo no.
- **Anti-regressione**: `__tests__/published-contacts.test.ts` su 10/10. Non è un test di
  ortografia: un local-part fuori lista è una pagina che perde posta in silenzio. Ha trovato da
  sé i 5 `security@` e il `sales@` che la mia lettura delle pagine legali aveva mancato.
  Provato rosso reintroducendo `privacy@fixmyweb.dev` e verde dopo averlo ritirato.

## R12 — La voce «UI di cancellazione» riscritta: la richiesta onesta, non l'erasure finta

- **Decisione**: **pulsante-richiesta**, non erasure vera. Le ragioni sono misurate, non di comodo:
  1. **Nessuna delle 10 privacy policy promette self-service.** Le cinque F-series dicono
     _«request deletion»_; le cinque round-2 dicono _«by emailing …»_. Non c'era una promessa da
     raggiungere.
  2. **Un'erasure vera non potrebbe fare ciò che l'etichetta dice.** Le fatture vanno conservate
     per legge, e il record di riscatto di una licenza lifetime è la prova dell'entitlement che il
     marketplace verifica: cancellarlo distruggerebbe il diritto del cliente e la tracciabilità del
     partner. Un pulsante «cancella tutto adesso» mentirebbe o romperebbe qualcosa.
  3. `/api/user/delete` **non esiste sui 5 round-2** (404 in produzione, verificato) — la voce
     diceva «10 su 10». E dove esiste è un modulo DSAR (R10), con **zero** copertura di test.
  4. Una **decisione già registrata** (2 ago, `dsar-routes-were-a-facade`) aveva scelto la via
     email per i round-2 _proprio_ per non produrre altre facciate. Non la ribalto.
- **Costruito**: una carta «Your data» in fondo a **10/10** dashboard: una frase che dice che è una
  richiesta gestita da una persona entro 30 giorni, due `mailto:` precompilati (oggetto, e sui 5
  round-2 anche l'email dell'account, che lì la dashboard conosce), l'indirizzo in chiaro per chi
  non ha un client di posta, e una riga su cosa la cancellazione **conserva** e perché.
- **Perché il `mailto:` e non il POST all'endpoint**: i cinque F-series hanno cinque modelli di auth
  diversi (cookie su f2/f3, `x-api-key` su f1/f4/b7), **ParseFlow e CaptureAPI non conoscono
  l'email dell'account** nella dashboard, e su CompliPilot l'`apiKey` esiste solo per chi è entrato
  dal magic link: un pulsante POST avrebbe dato 401 a un'intera classe di utenti. L'endpoint resta
  come canale API, documentato dal proprio GET. Il `mailto:` è l'unico canale che funziona per
  tutti e che la policy già dichiara — ora verso una casella che risponde.

## R13 — La mia guardia aveva due buchi, e il mio inserimento un difetto

Secondo giro, cercando apposta i buchi di ciò che avevo appena scritto.

- **La guardia non leggeva i file serviti alla lettera.** `public/` (10 file su CompliPilot, 9 su
  ParseFlow, 11 su CaptureAPI…) e `openapi-rapidapi.json` — quest'ultimo consegnato a un
  marketplace di API — non erano fra le radici scansionate. Un indirizzo lì raggiunge il cliente
  esattamente come in una pagina. Oggi quei file contengono solo `hello@`, quindi **nessun difetto
  live**: era un buco, non un guasto. Ora coperti.
- **La guardia non vedeva gli indirizzi interpolati.** `privacy@${SITE_HOST}` sfuggiva alla regex,
  e su cinque prodotti su dieci l'indirizzo è costruito proprio così: era la forma esatta in cui
  questo difetto sarebbe tornato. Aggiunto un controllo dedicato, con **esenzione nominata** per i
  due soli file che costruiscono legittimamente un indirizzo sul dominio **del cliente** (il
  generatore di privacy policy di CompliPilot e la sonda sintetica `postmaster@` di EmailGuard) più
  l'asserzione che quei file esistano ancora, così un rename non allarga l'esenzione in silenzio.
  Provata rossa aggiungendo `privacy@${BRAND.domain}` a `brand.ts`, verde dopo il ripristino.
- **Un falso positivo mio**: la versione rinforzata accusava `src/lib/email-typo.test.ts` di
  EmailGuard, che costruisce un indirizzo finto. Un test non è pubblicato; la regola ora lo dice
  per iscritto invece di lasciarlo implicito.
- 🔴 **Difetto nel mio stesso inserimento — CompliPilot.** Il ramo principale di quella dashboard
  rende **anche per un ospite**: il gate è `!loaded || !authState`, e un ospite ha un `authState`
  (`isGuest: true`, `user: null`). La carta era incondizionata, quindi un visitatore senza account
  avrebbe letto «Request deletion» per un account che non ha. Avvolta in
  `{authState.user?.email && (…)}`. Gli altri nove sono corretti, e su cinque la prova non è la mia
  lettura del codice: usano `data.email`, quindi **`tsc --noEmit` verde dimostra** che il punto di
  inserimento è nel ramo con `data` non nullo. 🔑 Un tipo può essere un oracolo migliore di una
  rilettura.

## R14 — Un file di outreach a terzi era committato nel repo di FixMyWeb

- **Passo**: cercare indirizzi nei file non-TypeScript (il buco di R13).
- **Osservato**: `business-fast2-accessiscan/outreach-emails.json`, **tracciato da git**, contiene
  l'indirizzo di un terzo (`info@tenlive.net`, con nome del referente), il punteggio del suo sito e
  il testo integrale di un messaggio in uscita. È l'output di `scripts/batch-scan-outreach.js`.
- **Come è entrato**: commit `7a72a28`, intitolato **«fix type»**. Un artefatto generato finito
  dentro un commit che parlava d'altro — la forma del `git add -A` già in memoria.
- **Fix**: rimosso dall'indice e aggiunto a `.gitignore` insieme a `scan-results.json` (l'altro
  output degli stessi script, che per fortuna non era tracciato). Il file resta su disco e resta in
  storia: non si cancella nulla. Il repo è privato, quindi non è stata una fuga pubblica — ma dati
  di contatto di terzi e bozze in uscita non stanno nel codice di prodotto.

## R15 — Il monitor di uptime chiamava «down» un singolo inciampo, e mandava un'email ogni volta

- **Passo**: il push dei report è stato rifiutato perché il repo era avanti — l'ultimo commit era
  `chore(uptime): status -> up`. Nella storia recente: up → down → up → down → up, **cinque
  oscillazioni**, e il file di stato contiene solo la parola `up`/`down`, senza dire quale sito né
  perché.
- **Atteso**: lo stato cambia quando un sito è davvero giù.
- **Osservato**, dai log del workflow: nel run **41984539750**
  `🔴 HookLab HTTP ERR · 12000ms — Timeout (12s)` mentre **gli altri sedici** rispondevano in
  356-1919 ms. I run immediatamente prima e dopo hanno HookLab a **893 ms** e **666 ms**.
- **Causa**: `checkSite` fa **un solo tentativo** con timeout 12 s e nessun retry. Un singolo
  inciampo di rete — o un cold start — ribalta lo stato dell'intero portfolio, scrive un commit e
  **manda un'email di allerta**. Cinque oscillazioni = cinque allerte false: è esattamente così che
  una casella impara a ignorare quella vera. È la famiglia già in memoria («429 auto-inflitti ≠
  bug», «la sonda si auto-avvelena»), vista dall'altro lato: non un monitor verde e bugiardo, ma
  **rosso e bugiardo**.
- **Fix**: un retry dopo 2,5 s prima di dichiarare down (`checkWithRetry`). La **sensibilità non
  cambia** — un sito davvero giù fallisce anche il secondo tentativo nello stesso giro, quindi
  l'allerta parte comunque subito — e il primo errore resta stampato nel log (`secondo tentativo;
primo: …`), perché un sito che ha bisogno del retry a **ogni** giro è un reperto a sua volta.
- **Prove**: 4 test nuovi in `uptime-check.test.ts` (9/9 verdi) che coprono i quattro casi, incluso
  «un 500 persistente resta down, il retry non lo nasconde». E un giro vero sui 17 immobili:
  **17/17 up, zero retry necessari**. `eslint` sui due file toccati: 0 errori; gli errori `tsc` del
  repo sono **2 prima e 2 dopo**, nessuno nei miei file (frammenti preesistenti in `scratchpad/`).

## R16 — 🔴 PaymentRescue non può inviare un'email di dunning: Resend rifiuta il dominio

- **Passo** (autorizzato dal fondatore): invio di prova dalla chiave Resend **di produzione**, da
  `noreply@paymentrescue.dev` al suo stesso indirizzo.
- **Osservato**: `HTTP 403` —
  `{"message":"The paymentrescue.dev domain is not verified. Please, add and verify your domain on
https://resend.com/domains","name":"validation_error","statusCode":403}`. **Nessuna email è
  stata inviata**: il rifiuto arriva prima dell'invio.
- **Significato**: il percorso di dunning — cioè _il prodotto_ — non ha mai potuto inviare in
  produzione. Coerente col DNS: su `paymentrescue.dev` non esiste alcun record Resend (né
  `resend._domainkey` né il sottodominio `send.`), e un selettore inventato non risolve, quindi la
  misura non è falsata da un wildcard.
- **Il codice NON falliva in silenzio**: il 403 è 4xx → `isNonRetriableResendError` interrompe
  subito, `console.error` + `Sentry.captureException`, poi **throw**; il chiamante rilascia la
  claim del passo di dunning e manda un secondo evento a Sentry. Fallisce ad alta voce — verso
  Sentry, non verso una casella che qualcuno legge.
- 🔑 **Impatto misurato, e qui la notizia è buona**: in produzione i pagamenti falliti registrati
  sono **zero** (`failed_payment:*`, `failed_payments:*`, `invoice_owner:*`,
  `dunning:step:sent:*` → 0 chiavi, SCAN in sola lettura). Dei 25 utenti, 23 sono nostri e **2
  sono reali**, ma nessuno dei due ha mai prodotto un pagamento fallito. **Il difetto è latente:
  certo, ma non ha ancora toccato nessuno.** Si manifesterebbe la prima volta che la carta di un
  cliente di un commerciante viene rifiutata — cioè nel momento peggiore per scoprirlo.
- **Corroborazione dal prodotto stesso**: il digest giornaliero del 5 nov (arrivato a
  `support@paymentrescue.dev`) dice `Failed payments 0 · recovered 0 · that got a dunning email 0 ·
Recovery rate: 0% (idle)`. I dati erano onesti e combaciano con la misura: nessun numero gonfiato.
- **Il rimedio esiste già nel repo, e l'ho provato**: lo stesso progetto ha un canale **Brevo**
  sullo stesso dominio (`hello@paymentrescue.dev`), con parità di resilienza (3 tentativi, timeout
  8 s, backoff, 4xx permanenti) e già usato per signup, redeem e digest. Invio di prova:
  **HTTP 201**, `messageId <202611060011.76273801576@smtp-relay.mailin.fr>`, **arrivato in INBOX**
  (non spam) un secondo dopo.
- 🔑 **Ironia da registrare**: il commento di quel file dice _«questo è il SaaS che vende
  deliverability, un POST singolo era l'anello debole»_ — mentre il percorso che _è_ il prodotto
  non poteva inviare affatto. La resilienza era stata messa sul canale secondario.

## R17 — Correzione misurata: l'SPF mancante sui 5 F-series non è un difetto

Avevo elencato al fondatore «aggiungere `include:spf.brevo.com` sui 5 F-series». Gli header del
messaggio arrivato lo smentiscono:

```
dkim=pass header.i=@paymentrescue.dev header.s=brevo1
spf=pass  smtp.mailfrom=bounces-457202026-...@gw.d.sender-sib.com
dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=paymentrescue.dev
```

- Il **DKIM è firmato col nostro dominio** (`header.i=@paymentrescue.dev`, selettore `brevo1`) ed è
  **allineato** → il DMARC passa per via del DKIM.
- L'**SPF è valutato sul return-path di Brevo** (`gw.d.sender-sib.com`), non sul nostro dominio:
  il nostro record SPF **non viene mai consultato** per questi messaggi. Aggiungere l'include
  sarebbe innocuo e **non cambierebbe nulla di misurabile** — e i 5 round-2, che ce l'hanno, non ne
  traggono alcun beneficio.
- 🔑 Avevo dedotto l'impatto dalla configurazione DNS invece di leggerlo da un messaggio arrivato.
  **Una riga di `Authentication-Results` vale più di tre interrogazioni DNS**: dice cosa il
  destinatario ha effettivamente verificato, non cosa avrebbe potuto.
