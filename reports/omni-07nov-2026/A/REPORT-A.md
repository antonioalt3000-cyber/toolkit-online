# Flusso A — report (omni-QA 7 nov 2026) · F1 CompliPilot · F2 FixMyWeb · F3 PaymentRescue · F4 ParseFlow · B7 CaptureAPI

> **Aggiornamento finale (7 nov, dopo il secondo mandato)**: lo stato vero e le 7 PR mergiate sono nella sezione «STATO FINALE» in fondo a `A/FINDINGS.md`. Cambiamenti rispetto a questo testo: le righe fattura di ParseFlow sono ora corrette (documint#90, #91; matrice con righe 130/130); il checkout di F4 e B7 con Redis giu' ora risponde 503 (documint#92, capture-api#114); il banner/privacy di FixMyWeb non promette piu' annunci (accessiscan#90); i giri locali su F1/F2/F4/B7 sono stati eseguiti (`A/local-round.cjs`: 18/18, 18/18, 18/18, 17/17 dopo le correzioni).

Dettaglio per reperto (passo → atteso → osservato → evidenza → classificazione → stato): `A/FINDINGS.md`.
Evidenze: `reports/omni-07nov-2026/evidence/<slug>/`. Ledger: `run-events.jsonl` (fasi `A-*`).

## PR mergiate e verificate in produzione (commit letto da `/api/health`)

| PR                                                                          | repo          | cosa                                                                                                                                                                                    | prod      | verifica                                                                                                                                           |
| --------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [churnguard#88](https://github.com/antonioalt3000-cyber/churnguard/pull/88) | PaymentRescue | la dashboard mostrava il piano vecchio fino a 30 s dopo un upgrade (e «Demo Mode» dopo il collegamento Stripe): `plan`/`email`/`isConnected` ora letti live sopra lo snapshot in cache  | `80afb41` | sul vivo 5/5: signup → `free` → riscatto come stesso account → **la lettura successiva dice `scale`** (152 ms); giro pubblico 6/6; sweep 33 pagine |
| [documint#89](https://github.com/antonioalt3000-cyber/documint/pull/89)     | ParseFlow     | fatture europee restituite con cifre sbagliate o vuote (HTTP 200): migliaia a spazio, IVA PL presa per totale, NL a zero, nota di credito senza segno, numero fattura vuoto in 5 lingue | `f27e164` | stessa matrice di prima: **da 15 rossi a 91/91**; `journey-core` f4 12/12; pubblico 6/6; sweep 31 pagine                                           |

Entrambe: test rosso prima del fix, gate lint 0 / `tsc` 0 / suite / build, CI + preview verdi, merge solo mio.

## Reperti

| id                | cosa                                                                                                       | classe          | stato                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------- |
| A-F3-1            | dashboard F3 col piano stale (cache 30 s senza invalidazione da nessun writer)                             | **prodotto**    | ✅ corretto, verificato in prod                   |
| A-F4-MX           | estrattore F4: 4 famiglie di numeri sbagliati in silenzio + numero fattura                                 | **prodotto**    | ✅ corretto, verificato in prod                   |
| A-F4-MX (residuo) | `lineItems` vuoti con migliaia a spazio / segno meno                                                       | prodotto        | ⚠️ aperto: parser di riga non toccato             |
| A-ENV-1           | dev Turbopack di F3 ricarica la pagina in ciclo (`reloadPage "HMR hash mismatch"`)                         | ambiente        | aggirato con `A/run-prod.cjs`; causa non risalita |
| A-SONDA-1         | `journey-deep.cjs`: profilo condiviso già loggato + `button[type=submit]` generico → falso rosso su f2     | **sonda**       | ✅ corretto nella copia A                         |
| A-SONDA-2         | piano in dashboard letto dal testo (esiste solo con Stripe collegato)                                      | sonda           | ✅ oracolo = `/api/dashboard`                     |
| A-SONDA-3         | PDF via GET (405) e «redirect→169.254» vacuo: httpbin rifiuta da solo                                      | sonda           | ✅ corrette/tolta la riga                         |
| A-SONDA-4         | F2 anonimo fuori dal browser: 403 del gate → «4xx» vacui                                                   | sonda           | ✅ rifatto dal browser con controllo positivo     |
| A-RESIDUI-1       | `Buffer()` deprecato: è `pdf-parse@1.1.4` (pdf.js 1.10 incorporato), non codice nostro                     | dipendenza      | accettato, motivo scritto                         |
| A-RESIDUI-2       | PostHog su F2/B7: **non attivo in prod** (nessuna variabile `NEXT_PUBLIC_POSTHOG_KEY`), blocco CSP latente | config          | decisione del fondatore                           |
| A-RESIDUI-3       | `/signup` force-static F4/B7: 307 con corpo da 41/50 KB e 16 script senza nonce                            | prodotto minore | aperto per scelta (inerte per i browser)          |

## Cosa è stato provato (oracolo indipendente + controllo interno)

- **Denaro in produzione, 5/5** (`journey-deep`, coupon `internal`, browser isolato): riscatto 200, feature core, nessun errore di console. F2: secondo riscatto con la stessa email → 409 con la causa vera.
- **F3 locale** (build di produzione + mock Upstash/Stripe/Brevo, 48 controlli): price id esatto (growth mensile, scale annuale), checkout senza sessione 401, webhook firmato 200 / **falso 400**, **Redis giù → 503 su me/dashboard/login senza sloggare**, **dunning end-to-end sul mock Brevo** (destinatario, mittente `hello@`, importo 49.00, link firmato, evento ripetuto → nessun secondo messaggio, passo 2 via cron, cron con segreto sbagliato 401, `recovered`, cron muto dopo il recupero). I 6 rossi del 4 nov: 4 erano della sonda (campo `sample`, dunning su Resend non mockato), 2 aspettative sbagliate sul modulo DSAR.
- **F3 calcolatore ROI**: 74/74 in produzione; il controllo negativo (`QA_PERTURB=1`) lo fa diventare rosso (4 FAIL).
- **B7**: matrice SSRF **34/34** (27 bersagli screenshot, 4 PDF: decimale, esadecimale, ottale, IPv6-mapped, metadata, CGNAT, `file://`, DNS rebinding via nomi pubblici; controlli positivi 200); dimensioni 320…3840 esatte, byte = `Content-Length`, 13 parametri ostili → 400 con messaggio.
- **F1/F2** casi limite: 10 URL ostili → 4xx, pagina vuota/404 senza NaN, determinismo (F2 dal browser, con controllo positivo).
- **F4**: matrice di fatture sintetiche in 7 lingue (IVA 0/4/10/19/20/21/22/23, nota di credito, totale zero, mezzo centesimo, `1.234,56` / `1,234.56` / `2 434,56`) 91/91 dopo il fix.

## NON provato (dichiarato)

- **Redirect da URL pubblico verso IP interno** su B7, end-to-end: httpbin e httpbingo rifiutano da soli un redirect interno e non ho un redirector che non si autoprotegga. Letto nel codice (`renderer.ts` rivalida ogni richiesta, `redirect:"error"` sui fetch), non provato.
- **Giro locale autenticato su f1, f2, f4, b7**: eseguito solo F3. Per gli altri: il giro di denaro in produzione + i controlli di produzione, non il giro locale con Redis giù, checkout→price id e webhook firmato.
- **Matrice «cliente fedele»** sulle F-series: **non eseguita nel browser**. Letto nel codice che non hanno il gate con orologio del client (`form_ts`, honeypot, `too_fast`, BotID nelle rotte redeem/signup); doppio invio / due schede / tracker bloccati / UA Safari-Firefox / refresh dopo il riscatto non provati qui.
- **Dunning reale** (pagamento fallito vero) e **pagamento con carta vera**: vincoli.
- Gli oracoli F1 (media categorie) e F2 (12 contrasti, passati+rilievi=controlli) sono quelli del baseline del coordinatore, non rifatti.
- Il fix `lineItems` (migliaia a spazio / segno) non è stato fatto.

## Per il fondatore (non toccato da me)

1. **`CRON_SECRET` su FixMyWeb** (R4, invariato) e la `CRON_SECRET` Sensitive di F4 (cron non verificabili da qui).
2. **PostHog su F2/B7**: o si imposta `NEXT_PUBLIC_POSTHOG_KEY` e si aggiunge `eu.i.posthog.com` a `connect-src`, o si tolgono `PostHogInit` e il preconnect in `F2/layout.tsx`. Oggi non è attivo.
3. **`pdf-parse`**: sostituirlo (o no) per eliminare l'avviso `Buffer()`; è una decisione di rischio sull'estrazione.
4. Il banner cookie di FixMyWeb dice «serve relevant ads» ma nessun annuncio è caricato (AdSense rimosso dalla CSP il 4 nov).
5. Dati di collaudo scritti in produzione, tutti in `REDIS-WRITES.jsonl`: account `antonio.alt3000+qa07nov{f1,f2,f3,f4,b7}@gmail.com` e `…+qa07novf3plan@…`, coupon `internal` (compreso `QAOCT-5D83-97B8` di f2, coniato e non usato). Le chiavi del riscatto fatto dalla mia prova su f2 (`redeem-probe.cjs`) sono state registrate **dopo** la scrittura (errore di procedura, dichiarato); quelle di f3 (`f3-prod-plan-verify.cjs`) e dei `journey-deep` **prima**.

## CROSS-FAMILY (per il coordinatore: un solo scrittore)

- **`journey-deep.cjs` (copia del coordinatore)**: usa `Journey.open` sul profilo Chrome condiviso e `button[type=submit]` generico; con un profilo già loggato il click colpisce il submit sbagliato e dà un falso rosso su **qualunque** prodotto. La copia `A/journey-deep.cjs` usa `openIsolated` e `form:has(#redeem-code) button[type=submit]`.
- **Verdi vacui da evitare** (due casi miei): un controllo «bloccato» fuori dal browser quando c'è un gate che risponde 403 prima di ogni validazione; un test di redirect con un servizio che si autoprotegge. Regola: **controllo positivo prima, e verificare chi ha prodotto il rifiuto**.
- **Schema `cached("dashboard", userId, 30)` con `plan` dentro lo snapshot**: cercato in tutti i 10 repo, **solo F3**. Non applicabile ai B.
- **`run-dev.cjs <slug> turbo`** non è utilizzabile su F3 (ciclo di reload, nessuna idratazione); `A/run-prod.cjs <slug>` (build di produzione + `next start` sotto gli stessi mock) funziona. Il Flusso B ha usato Turbopack con successo su cfg: non so se il difetto è solo di F3.
- Su Windows italiano `netstat` scrive «IN ASCOLTO» (non LISTENING): per fermare i processi di un ambiente QA usare `A/stop-env.ps1` (ricerca per riga di comando).
