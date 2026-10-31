# Ticket clienti — audit 30 giorni, fix, collaudo, bozze

**Sessione**: 28-29 ottobre 2026 · **Finestra audit**: 28 set → 29 ott 2026 · **Account**: `antonio.alt3000` + Brevo

---

## 1. Perimetro dell'audit

| Fonte            | Come è stata chiusa                                                  | Esito                                                          |
| ---------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| Gmail inbox 30gg | 803 thread → filtro per destinatario `*.dev` di supporto → 47 thread | 2 ticket reali                                                 |
| Gmail **spam**   | CDP 9223 su `#spam` (il connettore Gmail non lo restituisce)         | 31 righe, 0 ticket                                             |
| Brevo            | `GET /v3/inbound/events` → `[]`                                      | **Nessuna casella in entrata**: Brevo ha solo eventi in uscita |
| Brevo outbound   | eventi 30gg per i due mittenti + `sender=hello@parseflow.dev`        | **0 email inviate** → i ticket erano davvero senza risposta    |

🔑 Il primo probe sullo spam ha restituito `count:0` ed era un **falso zero**: validato su `document.title` = `Spam (30)` e `bodyLen` prima di fidarsi. Senza quella validazione avrei dichiarato "spam pulito" per la ragione sbagliata.

## 2. I ticket

| #   | Cliente                                    | Data             | Stato prima           | Esito          |
| --- | ------------------------------------------ | ---------------- | --------------------- | -------------- |
| T1  | Mahad Bajwa — `mahad@asaan.io`             | 26 ott 17:04 UTC | aperto, **non letto** | fix + bozza    |
| T2  | Rick — `richard@sablon.net` (LTD DealFuel) | 27 ott 20:46 UTC | aperto                | fix + bozza    |
| T3  | Rob — `robca45@proton.me` (FixMyWeb)       | 1 ott            | **già chiuso 30 set** | nessuna azione |

## 3. Difetti corretti — tutti in `lib/extractor.ts` + envelope i18n

| #   | Difetto                                                                                                | Ancoraggio                 | PR  |
| --- | ------------------------------------------------------------------------------------------------------ | -------------------------- | --- |
| 1   | Una sola regex email non ancorata su tutto il documento → `vendor.email === customer.email` **sempre** | `lib/extractor.ts:989-990` | #77 |
| 2   | Stesso difetto sul telefono                                                                            | `:993-1008`                | #77 |
| 3   | `address` e `taxId` dichiarati e mai assegnati                                                         | `:973`, `:1010`            | #77 |
| 4   | `\bde\b` cattura la preposizione spagnola → `vendor = "facturación: 2026-10-27"`                       | `:268` + `:977`            | #77 |
| 5   | `\bclient\b` non può matchare `"Cliente"`; `proveedor`/`CIF`/`NIF` assenti                             | `:269`                     | #77 |
| 6   | `extractDate` restituiva la **prima data del documento** senza etichetta → `due_date` fantasma         | `:666-676`                 | #77 |
| 7   | Mesi spagnoli non riconosciuti                                                                         | `:670`                     | #77 |
| 8   | Confidence = contatore di campi non vuoti, tetto 0,95: un vendor **sbagliato** valeva +0,05            | `:232-274`                 | #77 |
| 9   | `getResultFields` cercava `result.fields`, inesistente su ogni tipo → label = chiavi envelope          | `extract/route.ts:37-44`   | #78 |
| 10  | Stesso helper duplicato alla lettera nel batch                                                         | `batch/route.ts:41-48`     | #78 |
| 11  | Chiavi `data` camelCase vs dizionari snake_case, nessuna mappatura; `?? key` mascherava il guasto      | `lib/i18n/index.ts:79`     | #78 |

**PR mergiate e LIVE IN PRODUZIONE** (commit `37c3333`, 29 ott 00:34 UTC): [#77](https://github.com/antonioalt3000-cyber/documint/pull/77) · [#78](https://github.com/antonioalt3000-cyber/documint/pull/78)

Verifica su `https://parseflow.dev` con i PDF veri: Rick → `vendor.name` = `Empresa Ejemplo`, `dueDate` = `""`, 9 label spagnole; Mahad → `customer.email` = `""`, scadenza dichiarata e totale intatti. `/api/health` → `commit: 37c3333`, `redis: ok`.

## 4. Collaudo

### Gate

`675 test passati` (61 file, di cui 22 nuovi) · `tsc --noEmit` pulito · `npm run lint` 0 errori (38 warning preesistenti, file non toccati) · `npm run build` OK.

I 12 test nuovi che coprono i sintomi segnalati **fallivano su HEAD** con esattamente i valori riportati dai clienti. Esclusione worktree già presente in `vitest.config.ts`: nessun rosso fantasma.

### Browser reale — CDP 9223, dev server locale

Caricati nel playground i **PDF veri allegati dai clienti**, scaricati da Gmail via sessione autenticata.

**Rick — `factura.pdf`**, confronto con la risposta di produzione che lui ha ricevuto:

| campo                     | prima (sua risposta)         | dopo                         |
| ------------------------- | ---------------------------- | ---------------------------- |
| `vendor.name`             | `facturacion 2026-10-27`     | `Empresa Ejemplo`            |
| `dueDate`                 | `2026-10-27`                 | `""`                         |
| `invoiceDate`             | `2026-10-27`                 | `2026-10-27`                 |
| `invoiceNumber` / `total` | `F-1001` / `125`             | invariati                    |
| `confidence`              | `0.85`                       | `0.80`                       |
| `localized.labels`        | 8 chiavi envelope in inglese | 9 label di campo in spagnolo |

**Mahad — `synthetic-invoice-165.pdf`** (scenario Auto-detect, il suo esatto): `customer.email` da `billing@fictional-studio.example` a `""`; la sua scadenza _dichiarata_ resta `2026-11-25` — le scadenze non sono state semplicemente eliminate.

Screenshot in `evidence/`.

### Percorso cliente pagante — coupon interni

- Coupon usato: **`QA-MAST-0194-1C97`** (già esistente e marcato `internal=1`; **non ho coniato un lotto nuovo** — coniarlo gonfierebbe `totalDelivered`, numero che i partner vedono in `coupon-stats`, che non segmenta per pool).
- Riscattato con `antonio.alt3000+qa-pfl-29ott@gmail.com` → account Enterprise (Lifetime) + API key. La welcome email **non è partita** (`BREVO_API_KEY` non caricata nel dev server): nessuna email reale inviata.
- **Guardia di sicurezza verificata**: stesso coupon con `estraneo@example.com` → `400 Invalid or expired coupon code` (messaggio generico, nessuna fuga d'informazione) e coupon **restituito al pool**.
- `/api/v1/extract` autenticata con `lang=es` sul PDF di Rick → envelope spagnolo corretto.

### Isolamento pool partner — dimostrato, non affermato

| pool                       | pre                  | post                     |
| -------------------------- | -------------------- | ------------------------ |
| `PFL-DF-*` (DealFuel/Andy) | 247 validi / 3 usati | **247 / 3 — invariato**  |
| `PFL-*` nudo (DealMirror)  | 314 / 48             | **314 / 48 — invariato** |
| altro                      | 359 / 42             | **359 / 42 — invariato** |
| `QA-MAST-*` (interno)      | 7 / 4                | 6 / 5                    |

L'unica variazione nell'intero stato coupon è il singolo QA-MAST interno consumato di proposito. Pool Andy ancora a 250 totali.

## 5. Claim OCR — correzione

Il prodotto **non ha alcun motore OCR** (nessuna dipendenza, nessun code path; immagini rifiutate 422 su ogni piano). Il repo è onesto in 34 punti. La promessa falsa era **nostra**, in `shared-memory`, ed è stata corretta con archive pattern (13 righe in 3 file). Dettaglio e causa in `03-bozza-partner-ocr.md`.

## 6. Invii

| File                      | Destinatario                                    | Quando si può inviare                                                                   |
| ------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `01-bozza-mahad.md`       | `mahad@asaan.io`                                | ✅ **inviata 01:27 UTC, delivered** — `<202610290127.19424938407@smtp-relay.mailin.fr>` |
| `02-bozza-rick.md`        | `richard@sablon.net`                            | ✅ **inviata 01:27 UTC, delivered** — `<202610290127.20876040445@smtp-relay.mailin.fr>` |
| `03-bozza-partner-ocr.md` | DealFuel + DealMirror — **invio del fondatore** | ancora da inviare                                                                       |

Entrambe inviate con `In-Reply-To`/`References` sul Message-ID originale del cliente, così la loro risposta resta nel thread invece di aprirne uno nuovo invisibile. Tre log aggiornati.

🔴 **Aperto**: a Rick è stato offerto il **rimborso integrale** se l'OCR era il motivo dell'acquisto. Se accetta, va processato.

## 7. Fuori scope, dichiarato

- **Documentazione** (tua scelta di scope): `app/docs/page.tsx:378` documenta un parametro `language` che il codice non legge mai — **è la causa diretta del tentativo di Rick** e resta una trappola per il prossimo cliente; `app/docs/page.tsx:589` pubblica limiti 1.000/10.000 mentre il codice applica 5.000/25.000; `components/HelpCenter.tsx:113` pubblicizza `?lang=` in query string che non funziona; `public/llms-full.txt:210` documenta una forma `due_date` mai esistita.
- Confidence per campo sulle fatture (opzione non scelta).
- `/document-ocr`: nega l'OCR due volte ma ha intestazione "More Than Just OCR", in sitemap a priorità 0.9.
- `isQaCode` (`backfill-internal-coupons/route.ts:45`): `q[bc]?$` marca interno qualunque prefisso che finisce in `Q`/`QB`/`QC`.
- `coupon-stats` non segmenta per pool.
- Rotazione `ADMIN_API_SECRET` ParseFlow ancora pendente.
- `CLAUDE.md` del repo ha una modifica **non committata** scritta da `next dev` (blocco `nextjs-agent-rules`): lasciata fuori dalle PR di proposito.
