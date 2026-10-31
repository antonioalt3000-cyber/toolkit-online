# Reperto — una rotta inesistente risponde 200 se la richiesta porta `Authorization`

**Trovato**: 31 ottobre 2026, durante il collaudo del cliente pagante via browser reale.
**Prodotti colpiti**: CardForge, EmailGuard, HeaderShield, HookLab, SEOScope (i 5 round-2).
**Prodotti sani**: CompliPilot, FixMyWeb, PaymentRescue, ParseFlow, CaptureAPI.
**Stato**: confermato e riproducibile. **Non corretto** in questa sessione, per la ragione al §4.

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

Il corpo è la pagina «Page not found» (`X-Matched-Path: /_not-found`,
`<title>Page not found — …</title>`, `robots: noindex, nofollow`): il contenuto è
giusto, **lo stato è sbagliato**.

## 2. Cosa l'ha scatenato e cosa no

Misurato su `getcardforge.dev`, una URL nuova a ogni tentativo:

| Header inviato | Stato |
|---|---|
| nessuno | 404 ✅ |
| `Authorization: Bearer x` | **200** ❌ |
| `Authorization: Basic eHg6eXk=` | **200** ❌ |
| `Authorization: x` (nemmeno uno schema valido) | **200** ❌ |
| `Proxy-Authorization: Bearer x` | 404 ✅ |
| `Cookie: a=b` | 404 ✅ |
| `X-Api-Key: x` | 404 ✅ |

Quindi: **solo** l'header `Authorization`, con qualunque valore.

🔑 **Non è la cache.** Prima ipotesi scartata con un test: una URL unica (quindi
`X-Vercel-Cache: MISS`, la funzione viene eseguita) **senza** header risponde 404.
La stessa URL unica **con** l'header risponde 200. L'header è la causa, non il
percorso edge/funzione.

## 3. Perché proprio quei 5

La correlazione è esatta, 5 su 5 contro 5 su 5:

| Middleware | Repo | Esito |
|---|---|---|
| `NextResponse.next({ request: { headers: forwarded } })` | cardforge, emailguard, headershield, hooklab, seoscope | **200** |
| `NextResponse.next()` semplice | complipilot, capture-api (e gli altri F-series) | 404 |

I 5 round-2 **reinoltrano la richiesta con header modificati** — serve a passare
il nonce CSP e l'`X-Request-Id` al layout. Quel reinoltro fa ridispacciare la
richiesta dentro Next, e in presenza di `Authorization` la pagina not-found torna
con 200 invece di 404.

Variante secondaria non spiegata: su CardForge ed EmailGuard anche una rotta
`/api/...` inesistente risponde 200, mentre su HeaderShield, HookLab e SEOScope
le `/api/...` restano 404 correttamente — malgrado il `matcher` del middleware
escluda `api` in tutti e cinque.

## 4. Impatto, senza gonfiarlo

- **SEO: trascurabile.** La pagina not-found porta già `robots: noindex, nofollow`,
  quindi Google non la indicizza comunque.
- **Integrazione API: reale.** Questi sono cinque prodotti che vendono una API.
  Uno sviluppatore che sbaglia un path riceve `200` con dentro HTML: il suo
  `if (res.ok) return res.json()` non fallisce con un 404 pulito, ma con un errore
  di parsing JSON che non dice niente. È il tipo di difetto che fa perdere mezz'ora
  a un cliente nuovo, nel momento peggiore — la prima integrazione.

## 5. Perché non l'ho corretto

Il reinoltro degli header non è un residuo da cancellare: è il canale con cui
passa il **nonce CSP** al root layout. Toglierlo spegnerebbe la CSP con nonce su
cinque siti per aggiustare uno stato HTTP — un cambio molto peggiore del difetto.

La correzione giusta è una delle due, e vuole una verifica in locale prima della
produzione:
1. restringere il `matcher` così che il reinoltro non copra i percorsi che possono
   finire in not-found, oppure
2. passare il nonce senza reinoltrare la richiesta (per esempio generandolo nel
   layout e leggendolo da `headers()` nel solo ramo che serve HTML valido).

Va fatta su un repo, verificata con la riproduzione del §1 in locale, e solo
dopo replicata sugli altri quattro.

🔑 **La lezione del reperto**: lo ha trovato un giro di *richieste autenticate*,
non uno sweep delle pagine pubbliche. Nessuna suite dei 10 repo lo copriva, e
nessuno dei round QA precedenti lo aveva visto, perché un visitatore anonimo non
manda mai `Authorization` — e un cliente con una chiave API lo manda sempre.
