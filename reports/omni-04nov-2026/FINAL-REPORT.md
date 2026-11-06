# Omni-QA dei 10 SaaS — 4-5 novembre 2026

> Mandato: non fidarsi di nessun report, ricollaudare ogni funzione come un cliente via browser
> reale, verificare **matematicamente** gli output, correggere alla radice senza regressioni.
> Due decisioni prese dal fondatore prima di iniziare: riscatti **anche in produzione**, e i tre
> arretrati «aperti per scelta» **dentro** il perimetro.
>
> Formato dei reperti: `REPERTI.md` (passo → atteso → osservato → evidenza). Ledger: `RUN-LEDGER.md`.

---

## 1. Verdetto

**46 pull request aperte, verificate e mergiate, su 10 repo** — contate, non sommate:
`gh pr list --state merged` sui dieci repo con `mergedAt >= 2026-11-04` ed esclusi gli autori
Dependabot. (Di queste, 10 sono del seguito del 5 novembre; la prima stesura di questa riga
sommava due conteggi fatti con filtri diversi, ed è stata rifatta misurando.) Nessuna lasciata a metà. Le PR
Dependabot aperte non sono state toccate. Stato finale misurato in produzione su tutti e 10:

|                                                 | prima del round                     | dopo                           |
| ----------------------------------------------- | ----------------------------------- | ------------------------------ |
| `/<rotta esistente>\`                           | **500** su 62 pagine (9 prodotti)   | **404/308** su 10/10           |
| `og:image` mancante                             | 8 pagine (hsh 5, seo 2, eg 1)       | **0**                          |
| `'unsafe-inline'` in `script-src`               | 5 prodotti su 10                    | **0 su 10**                    |
| nonce CSP per richiesta                         | 5 su 10                             | **10 su 10**                   |
| `npm audit`: critical + high                    | 2 + 1 su 10/10                      | **0**                          |
| `coupon-stats`: tasso d'uso riferito al partner | 19-21%                              | **4-6%** (il vero)             |
| indirizzo fornitore estratto (ParseFlow)        | solo formato USA, o spazzatura      | 11 lingue, riga per riga       |
| calcolatore ROI (PaymentRescue)                 | mostrava un tasso e usava un altro  | campo e calcolo non divergono  |
| backup del pool coupon FixMyWeb                 | **mai eseguito**                    | creato e verificato            |
| `/api/health`                                   | ok 10/10                            | ok 10/10                       |
| indirizzi pubblicati che rimbalzano             | **18** (25 pagine live, 5 prodotti) | **0 su 10** (misurato in prod) |
| cancellazione/export raggiungibili da dashboard | 0 su 10                             | **10 su 10** (come richiesta)  |
| monitor uptime: un timeout = tutto «down»       | 5 oscillazioni, 5 allerte false     | un retry prima di dichiarare   |

**17 reperti**, di cui 10 corretti e verificati in produzione, 1 mitigato a metà e 1 lasciato al
fondatore con la ragione scritta. Il dodicesimo, R11, è arrivato il 5 novembre dalla voce di
arretrato che sembrava la più piccola delle tre: **18 indirizzi stampati sulle pagine legali non
esistevano**, fra cui l'unico canale GDPR di due prodotti e l'indirizzo della pagina rimborsi di un
terzo. **9 falsi rossi del collaudo**, tutti diagnosticati e dichiarati
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

### UI di cancellazione self-service — fatta il 5 novembre, e la voce era sbagliata in due punti

Prima di costruirla ho verificato le due premesse su cui poggiava. Nessuna delle due regge.

**Premessa 1, falsa**: «`/api/user/delete` e `/api/user/export` esistono su 10/10». Esistono sui
**5 F-series**; sui 5 round-2 rispondono **404 in produzione** (misurato). Quella frase è mia, l'ho
scritta il 4 novembre e la correggo qui.

**Premessa 2, falsa**: «la privacy policy descrive la cancellazione come azione dell'utente». Ho
riletto tutte e 10: le F-series dicono _«request deletion»_, le round-2 dicono _«by emailing …»_.
Nessuna promette un interruttore. Non c'era una promessa da raggiungere.

**Decisione: la richiesta onesta, non l'erasure vera.** Non per risparmiare lavoro — perché
l'erasure vera non potrebbe fare ciò che la sua etichetta dice. Le fatture vanno conservate per
legge; il record di riscatto di una licenza lifetime è la prova dell'entitlement che il marketplace
verifica, e cancellarlo distruggerebbe il diritto del cliente insieme alla tracciabilità del
partner. Un pulsante «cancella tutto adesso» mentirebbe. In più sarebbe un percorso distruttivo
nuovo su dati live, su route con **zero** copertura di test, e una decisione già registrata il 2
agosto aveva scelto la via email proprio per non moltiplicare le facciate.

**Costruito**: una carta «Your data» in fondo a **10/10** dashboard — la richiesta dichiarata per
quello che è (una persona, entro 30 giorni), due `mailto:` precompilati, l'indirizzo in chiaro per
chi non ha un client di posta, e una riga su cosa la cancellazione conserva e perché. Sul `mailto:`
invece del POST all'endpoint: cinque modelli di auth diversi, e su ParseFlow e CaptureAPI la
dashboard **non conosce l'email dell'account**, mentre su CompliPilot l'`apiKey` esiste solo per chi
è entrato dal magic link — un pulsante POST avrebbe dato 401 a un'intera classe di utenti.

**E sotto c'era R11.** Verificare che l'indirizzo del pulsante ricevesse posta ha scoperto che 18
indirizzi pubblicati non esistono. Era la voce che sembrava cosmetica.

**Verificato dopo il deploy** (10 PR mergiate, produzione che serve i nuovi commit su 10/10,
confermato dal campo `commit` di `/api/health`, non da `state=READY`):

- **zero indirizzi non consegnabili** — prima su 10 domini × 8 tipi di pagina via HTTP, poi, per
  non fermarsi a un campione, su **253 pagine lette nel browser reale**, con l'elenco preso dalla
  sitemap di ciascun prodotto (42 CompliPilot, 51 FixMyWeb, 33 PaymentRescue, 31 ParseFlow, 39
  CaptureAPI, 11-13 per i round-2). Ogni indirizzo trovato nel DOM è uno dei tre alias provati;
  evidenza in `evidence/browser-contacts-after-05nov-2026.txt`. La scansione che aveva trovato i 25
  guardava cinque tipi di pagina: avrebbe mancato `/refund`, `/about` e `/contact`, dove stavano
  `legal@` e `sales@`;
- il `security.txt` di CaptureAPI ora dichiara `support@`, non il `security@` che rimbalzava;
- la carta **nel browser reale**, con un controllo nei due versi: assente per un ospite vero su
  3/3, presente per il cliente autenticato su 3/3 con i due `mailto:`, la frase dei 30 giorni e la
  riga su cosa si conserva. Ogni `mailto:` punta a un alias provato.

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
5. **Gli alias di posta, se li vuoi davvero** (reperto R11). Ho risolto puntando ogni pagina su
   `hello@`/`support@`/`contact@`, i soli tre con una regola di inoltro. L'alternativa è crearne
   altri (`privacy@`, `security@`, `legal@`, `sales@`): va fatta **dalla UI Porkbun**, l'API non
   gestisce gli inoltri. Se li crei, aggiungi il local-part a `DELIVERABLE` in
   `__tests__/published-contacts.test.ts` nello stesso commit — e provalo con `rcpt-probe.py`
   prima di stamparlo su una pagina.
6. ~~**SPF: i 5 F-series non hanno `include:spf.brevo.com`**~~ — **ritirata il 6 nov, misurata e
   infondata.** Gli `Authentication-Results` di un messaggio realmente arrivato dicono
   `dkim=pass header.i=@paymentrescue.dev header.s=brevo1` e `dmarc=pass`, mentre lo `spf=pass` è
   valutato sul return-path di Brevo (`gw.d.sender-sib.com`): **il nostro record SPF non viene mai
   consultato** per queste email. Aggiungere l'include non cambierebbe nulla di misurabile. Niente
   da fare. (Vedi R17: avevo dedotto l'impatto dal DNS invece di leggerlo da un messaggio arrivato.)
7. 🔴 **PaymentRescue non può inviare un'email di dunning — risposto il 6 nov, serve una tua
   decisione.** La prova che hai autorizzato ha dato `403 The paymentrescue.dev domain is not
verified`: **nessuna email inviata**, il percorso che _è_ il prodotto non ha mai potuto
   funzionare in produzione. Impatto misurato: **zero pagamenti falliti** registrati finora (e il
   digest del prodotto lo diceva già: `0 that got a dunning email · idle`), quindi il difetto è
   **latente**, non ha toccato nessuno — si manifesterebbe alla prima carta rifiutata di un cliente
   di un commerciante. Due rimedi, e la scelta è di prodotto:
   - **verificare `paymentrescue.dev` in Resend** — preserva l'architettura (Resend per il dunning,
     Brevo per il resto), ma i record da aggiungere si vedono solo dalla dashboard Resend: la chiave
     in produzione è _send-only_ e non può leggerli, quindi questo passo è tuo;
   - **spostare il dunning sul canale Brevo già presente nel repo** — `hello@paymentrescue.dev`,
     stessa parità di resilienza, già usato per signup/redeem/digest. **Provato: HTTP 201, arrivato
     in INBOX, `dkim=pass` allineato, `dmarc=pass`.** È tre call-site e l'aggiornamento di due test;
     risolve anche la voce 8, perché `hello@` riceve posta mentre `noreply@` rimbalza. Lo faccio io
     in una PR appena mi dici quale strada.
8. **`noreply@paymentrescue.dev` non ha un Reply-To** (nessun `replyTo` in nessun send di f3, e
   l'indirizzo rimbalza). Le email di dunning arrivano al _cliente del cliente_, che per istinto
   risponde: a noi (`support@paymentrescue.dev`) o al commerciante? Decisione di prodotto.
9. **[documint#79](https://github.com/antonioalt3000-cyber/documint/pull/79) è aperta da 7 giorni**,
   CI tutta verde e `MERGEABLE`, solo documentazione. Corregge il parametro `language` che la
   tabella `/docs` elencava e il codice non legge — il difetto che un cliente lifetime ha
   incontrato il 27 ottobre. Mostrata, non mergiata.
10. **~30 chiavi Redis di collaudo** in produzione, tutte registrate in `REDIS-WRITES.jsonl`: per
    cancellarle serve un token Upstash scrivibile, che `vercel env pull` non fornisce.
11. **PostHog è già bloccato oggi su F2 e B7**: `PostHogInit` punta a `eu.i.posthog.com`, host che
    non è in `connect-src` né prima né dopo questo round. Pre-esistente, segnalato e non toccato:
    allargare `connect-src` è una decisione separata.

---

## 6. Autocritica — 11 falsi rossi, una premessa falsa e una misura sbagliata, tutti miei

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

10. **La premessa dell'arretrato era mia, e falsa in due punti** (5 nov). Avevo scritto che
    `/api/user/delete` e `/api/user/export` «esistono su 10/10»: esistono su 5, e sui round-2
    rispondono 404. E che «la privacy policy descrive la cancellazione come azione dell'utente»:
    nessuna delle 10 lo fa. Entrambe le frasi le avevo scritte **senza aprire le dieci policy né
    interrogare i dieci domini**, e sono rimaste in un report per un giorno. 🔑 Una voce di
    arretrato è una mia affermazione come un'altra: va verificata prima di costruirci sopra, non
    quando si costruisce. Qui la verifica ha cambiato il lavoro — dal pulsante alla posta che non
    arrivava.

11. **Stavo per riportare che manca il DKIM sui 5 F-series. È falso** (5 nov). Avevo interrogato
    `brevo._domainkey`, `mail._domainkey` e `resend._domainkey`: i selettori veri di Brevo sono
    `brevo1`/`brevo2`, e ci sono su **tutti e 10** con chiavi RSA valide. Peggio: i «presenti» che
    leggevo sui 5 round-2 erano un **wildcard** `*._domainkey` verso `pixie.porkbun.com`, che fa
    risolvere qualunque selettore inventato — quella misura non significava nulla in nessuna delle
    due direzioni. 🔑 Un selettore inventato come controllo costa una query e avrebbe smascherato
    il wildcard al primo giro: la stessa lezione del controllo interno nella sonda RCPT, che lì
    avevo applicato e qui no.

12. **«La carta compare a un ospite» su due prodotti: falso, era il mio profilo** (5 nov). La prima
    passata della sonda nel browser ha dato due rossi. Il Chrome su :9223 porta le sessioni dei
    round precedenti in `localStorage` — `captureapi-dashboard`, e `complipilot-auth` con l'email
    del collaudo del 4 novembre — quindi quello che chiamavo «ospite» era **un cliente che
    ritorna**. Svuotando lo storage: carta assente e richiesta di accesso, su 3 prodotti su 3.
    🔑 Una sonda che misura uno stato «non autenticato» deve **creare** quello stato, non
    presumerlo: in un profilo riusato la condizione di partenza è l'ultima sessione, non il vuoto.
    La sonda ora svuota prima di guardare, e il motivo è scritto dentro.

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

- **Il viaggio autenticato completo in locale**: ✅ **eseguito su PaymentRescue** — 40 controlli,
  **29 PASS** — ed è stato trovato il motivo per cui non riusciva da quattro round: l'ambiente QA
  girava `next dev --webpack` e **la pagina non idratava** (reperto R9). Con Turbopack idrata e il
  giro gira. Fra i verdi, cose mai verificate prima: il checkout chiede a Stripe **esattamente** il
  price id atteso, la **firma webhook falsificata viene respinta con 400**, e il **guasto Redis** dà
  503 su `/api/auth/me`, `/api/dashboard` e `/api/auth/login` **senza sloggare**, con la sessione
  intatta dopo. Restano **6 rossi** da capire (coupon admin in locale, email di dunning) e 3 che
  erano aspettative sbagliate dell'harness (R10). **Sugli altri 9 prodotti il giro locale non è
  stato eseguito**: ora però si sa che è possibile.
- **Il guasto Redis** è stato simulato e supera la prova su PaymentRescue; sugli altri 9 no.
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
# indirizzi pubblicati: quali caselle esistono davvero (una passata, spaziata, con controllo)
python -I reports/omni-04nov-2026/rcpt-probe.py

# e poi gli stessi indirizzi letti nel DOM servito da Vercel, non nel sorgente
node reports/omni-04nov-2026/contacts-browser-check.cjs

# monitor: la sonda col retry, sui 17 immobili veri (nessuna email, nessun alert)
node -e "const{checkWithRetry}=require('./scripts/automation/uptime-check.js');const{NETWORK}=require('./scripts/automation/network.js');Promise.all(NETWORK.map(checkWithRetry)).then(r=>console.log(r.filter(x=>!x.ok).length+' down, '+r.filter(x=>x.attempts===2).length+' con retry'))"

# la carta in dashboard, nel browser reale, nei due versi (ospite e cliente)
node reports/omni-04nov-2026/card-browser-check.cjs

# ledger
node reports/omni-04nov-2026/progress.cjs table
```

Slug: `f1 f2 f3 f4 b7 cfg eg hsh hkl seo`. Serve Chrome su :9223 e, per `journey-deep`,
`ADMIN_API_SECRET`/`CRON_SECRET` in `%TEMP%/claude/qa-secrets/<slug>.qa`.

🔑 **Prima di credere a un rosso**: `node scratchpad/qa-infra/selftest.cjs` (oracoli) e
`node scratchpad/qa-infra/sdk-roundtrip-test.mjs <sdk> <mock>` (mock Upstash, 6/6). In questo round
9 rossi su 16 erano della sonda.
