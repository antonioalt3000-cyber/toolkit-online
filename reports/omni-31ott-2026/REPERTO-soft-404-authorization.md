# Reperto — una rotta inesistente risponde 200 se la richiesta porta `Authorization`

**Trovato**: 31 ottobre 2026, durante il collaudo del cliente pagante via browser reale.
**Approfondito e in parte ritrattato**: 3 novembre 2026.
**Prodotti colpiti**: CardForge, EmailGuard, HeaderShield, HookLab, SEOScope (i 5 round-2).
**Prodotti sani**: CompliPilot, FixMyWeb, PaymentRescue, ParseFlow, CaptureAPI.
**Stato**: confermato, riproducibile, **causa nello strato di hosting**. **Caso API chiuso su
tutti e 5** (CardForge [#50](https://github.com/antonioalt3000-cyber/cardforge/pull/50) e EmailGuard
[#55](https://github.com/antonioalt3000-cyber/emailguard/pull/55), mergiate e verificate; gli altri
tre erano gia' coperti). Caso **pagine** ancora aperto: da segnalare a Vercel, §6.

---

## 1. Riproduzione

```bash
# nessun header: corretto
curl -s -o /dev/null -w '%{http_code}\n' https://getcardforge.dev/pagina-inventata
# -> 404

# stessa URL, un header Authorization qualsiasi: sbagliato
curl -s -o /dev/null -w '%{http_code}\n' https://getcardforge.dev/pagina-inventata \
  -H 'Authorization: Bearer qualunque'
# -> 200
```

Il corpo è la pagina «Page not found» (`X-Matched-Path: /_not-found`, `robots: noindex`):
il contenuto è giusto, **lo stato è sbagliato**. Riverificato il 3 novembre: invariato.

## 2. Cosa lo scatena

Misurato su `getcardforge.dev`, URL nuova a ogni tentativo:

| Header inviato | Stato |
|---|---|
| nessuno | 404 ✅ |
| `Authorization: Bearer x` · `Basic …` · `x` (nemmeno uno schema valido) | **200** ❌ |
| `Proxy-Authorization` · `Cookie` · `X-Api-Key` | 404 ✅ |

Solo `Authorization`, con qualunque valore. **Non è la cache**: una URL unica
(`X-Vercel-Cache: MISS`, quindi la funzione viene eseguita) senza header dà 404.

## 3. 🔴 Ritrattazione: NON è il middleware

Il 31 ottobre avevo scritto che la causa era il middleware dei 5 round-2, che reinoltra la
richiesta con header modificati (`NextResponse.next({ request: { headers } })`), contro il
`NextResponse.next()` semplice dei F-series. **La correlazione era apparente.** Tre prove del
3 novembre la smontano:

1. **Non si riproduce in locale.** `npm run build` + `next start` sullo stesso commit, stesso
   middleware: 404 in tutti i casi, con e senza `Authorization`, su pagine e su `/api`. Quindi
   non è Next e non è il nostro codice: lo stato si perde **nello strato di hosting**.
2. **Si riproduce su path che il middleware NON copre.** Il matcher di CardForge esclude
   esplicitamente `api`, e `/api/inventata` + `Authorization` risponde 200 comunque.
3. **Non si riproduce su `/_next/static/…`**, l'unica path esclusa che non raggiunge mai la
   funzione (la serve lo strato statico).

🔑 La regola vera è più semplice: **ogni richiesta che arriva alla funzione Next con un header
`Authorization` e che cadrebbe in 404 torna 200.**

Cade anche la spiegazione che avevo dato per la differenza fra `/api` e le pagine: i matcher
non la giustificano. CardForge **esclude** `api` e mostra il difetto lì; HeaderShield lo
**include** e lì risponde 404 correttamente.

🔑 **Lo split su `/api` ha una spiegazione banale, trovata il 3 novembre**: HeaderShield
(`src/app/api/[[...slug]]/route.ts`) e HookLab (`src/app/api/[[...catchall]]/route.ts`)
**hanno gia' una catch-all** che risponde `apiError("NOT_FOUND", …, 404)`. Rispondono 404 perche'
la rotta esiste. CardForge ed EmailGuard non l'avevano, e cadevano nel fallthrough. Non era una
differenza di piattaforma: era una rotta presente in tre prodotti su cinque e assente in due.

Perché i 5 F-series siano immuni **sul caso pagine** resta non spiegato: stessa versione di Next
(16.4.3), stessa piattaforma.

## 4. Perché non si corregge nel middleware

Era la mia prima idea: ridurre la lista di header reinoltrati così che `authorization` non vi
compaia. **Non è praticabile.** Next serializza *ogni* chiave passata in
`x-middleware-override-headers`, e il consumatore
(`next/dist/server/lib/router-utils/resolve-routes.js:426-430`) **cancella ogni header di
richiesta assente da quella lista**. È un replace, non un merge: passare 3 header farebbe
arrivare all'app una richiesta senza `cookie`, `host`, `user-agent`. L'attuale
`new Headers(req.headers)` è l'uso corretto e deve restare.

Togliere il solo `authorization` dal set romperebbe l'autenticazione Bearer sulle rotte `/api`
di EmailGuard, HeaderShield, HookLab e SEOScope, i cui matcher includono `api`.

## 5. Cosa è stato fatto invece

**Un 404 JSON da una rotta che esiste.** Lo stato di una rotta **matchata** si conserva fino al
client — i 400 e i 401 che queste API già restituiscono arrivano intatti — quindi rispondere da
una catch-all `/api/[...unmatched]` aggira il fallthrough e dà un 404 corretto a prescindere da
cosa fa l'hosting.

Non è un cerotto: per un prodotto che vende una API è anche la risposta giusta. Un client che
sbaglia un path riceve l'envelope di errore strutturato con un `X-Request-Id` da citare in
assistenza e il path che ha chiesto, invece di una pagina HTML.

Era anche, si è scoperto, la convenzione che tre dei cinque prodotti già seguivano: la modifica
li allinea invece di inventare un meccanismo nuovo.

**Esito misurato.** Su preview (via `vercel curl`, le preview hanno Deployment Protection) e poi
in produzione: `/api/<inesistente>` + `Authorization` passa da **200 + HTML** a **404 + JSON**;
`POST` su una path sbagliata da 200 a 404; nessuna rotta ombreggiata (`/api/health` 200,
`/api/openapi.json` 200, `/api/v1/card` 401, `/api/v1/verify` 401).

Resta fuori il caso **pagine**: lì il 200 persiste. Impatto trascurabile (la pagina not-found è
già `noindex, nofollow`), e qualunque rimedio richiederebbe di toccare la CSP con nonce di
cinque siti in produzione per sistemare uno stato HTTP.

## 6. Da segnalare a Vercel

C'è una riproduzione minima e pulita da allegare a un ticket:

> Un progetto Next 16.4.3 su Vercel risponde 200 (invece di 404) a una path inesistente quando
> la richiesta porta un header `Authorization` di qualunque valore. Il corpo è la pagina
> not-found, `X-Matched-Path: /_not-found`. Lo stesso build sotto `next start` risponde 404.
> Non dipende dalla cache (si riproduce con `X-Vercel-Cache: MISS`) né dal middleware (avviene
> anche su path escluse dal matcher). Altri progetti dello stesso account, stessa versione di
> Next, non ne sono affetti.

Il ticket lo deve aprire il fondatore: serve l'account.
