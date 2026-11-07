# Omni-QA dei 10 SaaS — 6-7 novembre 2026 (round 3)

> Mandato: ricollaudare i 10 SaaS come un cliente nel browser reale, verificare i risultati con oracoli
> matematici, correggere alla radice senza regressioni. Tre flussi: **coordinatore** (baseline, trasversale,
> verifica indipendente), **A** (F1 F2 F3 F4 B7), **B** (CardForge EmailGuard HeaderShield HookLab SEOScope).
> Dettaglio dei reperti (passo → atteso → osservato → evidenza → classificazione → stato):
> `A/FINDINGS.md`, `B/FINDINGS.md`. Stato e verifiche del coordinatore: `COORDINATOR-NOTES.md`.

**Premessa sulla data.** Il round precedente (4-5 nov) si era chiuso il 6 nov alle 21:40 UTC; questo è partito
alle 23:15 UTC dello stesso giorno. Non erano «passati giorni»: ho comunque trattato tutto come non verificato.

---

## 1. Verdetto

**Nessuna regressione rispetto al round 4-5 nov**, e **11 famiglie di difetti di prodotto trovate e corrette**
con **23 PR mergiate** (contate io, con `gh pr list --state merged`, esclusi Dependabot), ciascuna con **test rosso
prima del fix**. Tutte **live**: su **10/10** la produzione serve il `master` remoto (campo `commit` di
`/api/health`, non `state=READY`). L'unica PR non Dependabot ancora aperta è documint#79 (tua, solo documentazione).
Il round è **chiuso**: nessun reperto resta senza un fix, una prova o un motivo scritto.

| #   | prodotto                                       | difetto (osservato da cliente)                                                                                                                                                                                                                                                                                                | PR                                                                                                        | stato                              |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | PaymentRescue                                  | dopo un upgrade o un riscatto la dashboard mostrava il **piano vecchio fino a 30 s** (cache che nessun writer invalidava)                                                                                                                                                                                                     | churnguard#88                                                                                             | ✅ riletto 152 ms dopo il riscatto |
| 2   | ParseFlow                                      | fatture europee (FR/PL/NL, nota di credito, numero fattura) restituite con **cifre sbagliate o vuote e HTTP 200**: 15 rossi su 88                                                                                                                                                                                             | documint#89                                                                                               | ✅ matrice 91/91                   |
| 3   | ParseFlow                                      | **righe** della fattura vuote con migliaia a spazio e col segno meno (il testo vero arriva con gli spazi collassati)                                                                                                                                                                                                          | documint#90 · #91                                                                                         | ✅ matrice con righe 130/130       |
| 4   | ParseFlow                                      | blog con un meccanismo falso («traccia i confini di pagina», l'esito invece è vero) e un «−30% di errori» mai misurato                                                                                                                                                                                                        | documint#90                                                                                               | ✅                                 |
| 5   | FixMyWeb                                       | banner cookie e privacy promettevano **annunci che non esistono**, in contraddizione con la cookie policy                                                                                                                                                                                                                     | accessiscan#90                                                                                            | ✅ letto nel browser               |
| 6   | CardForge                                      | un password manager che compila l'honeypot leggeva «ricarica la pagina», consiglio inutile (R16)                                                                                                                                                                                                                              | cardforge#57                                                                                              | ✅                                 |
| 7   | EmailGuard · HeaderShield · SEOScope           | un rifiuto anti-bot si leggeva come **«Invalid or expired coupon code»** (la famiglia del bug CardForge del 6 nov); EmailGuard rifiutava anche un tab aperto da 6 h e mostrava «Bot detected.» a una persona                                                                                                                  | emailguard#60 · headershield#60 · seoscope#66                                                             | ✅ provato in produzione           |
| 8   | HeaderShield · HookLab · SEOScope · EmailGuard | il signup rispondeva **200 di successo finto** (nessuna chiave creata) o un 400 con la causa sbagliata                                                                                                                                                                                                                        | hooklab#63 + le tre sopra                                                                                 | ✅                                 |
| 9   | CFG · EG · HSH · HKL · SEO                     | il grafico d'attività della dashboard **perdeva le richieste** con l'orologio del cliente indietro (`bucketByDay` identico nei 5)                                                                                                                                                                                             | #58 · #61 · #61 · #64 · #67                                                                               | ✅ test rosso 5/5 prima            |
| 10  | ParseFlow · CaptureAPI · 5 round-2             | con Redis giù il **checkout rispondeva 500** invece di 503 (7 prodotti su 10; F1, F2, F3 no)                                                                                                                                                                                                                                  | documint#92 · capture-api#114 · cardforge#59 · emailguard#62 · headershield#62 · hooklab#65 · seoscope#68 | ✅ 503 senza addebito              |
| 11  | HookLab                                        | **`/redeem` non applicava il gate anti-bot**: esisteva in `lib/anti-bot.ts` e già usato su `/signup`, ma lo schema di `/redeem` scartava in silenzio `company_website`/`elapsed_ms` e la route non chiamava `checkAntiBot` — un honeypot compilato o un invio scriptato passavano senza giudizio, a differenza dei 4 fratelli | hooklab#66                                                                                                | ✅ verificato in produzione        |

I punti 7-9, 11 sono lo stesso difetto di fondo del 6 nov, cercato nei fratelli dello chassis: i form dei round-2
ora misurano il tempo con un orologio monotono (`performance.now()` → `elapsed_ms`), nessuno legge più l'orologio del
browser per decidere, e ogni rifiuto dice la **causa vera** con un consiglio seguibile. Il punto 10 si è ripetuto su
7 repo: cercare lo stesso schema nei fratelli ha reso ogni volta.

## 2. Come è stato collaudato (numeri misurati)

- **Baseline di regressione** (coordinatore, 6 nov e di nuovo sui commit finali il 7): sweep di **253 pagine**
  (0 non-200, 0 senza og:image, 0 metadata ereditati, 0 h1 multipli, 0 backslash→500), giro pubblico **60/60**, feature
  core con oracolo verde ovunque tranne i casi in §3-§4. CSP **in produzione** su 10 prodotti × 3 pagine: **30/30**, 0
  violazioni, React idratato, 0 script inline senza nonce. Indirizzi pubblicati nel DOM servito: **0** non
  consegnabili; sonda RCPT: 10 `250`, 2 `554` attesi, controllo interno `554`.
- **Commit finali in produzione:** f1 `67d23a2` · f2 `946e843` · f3 `80afb41` · f4 `c6f6728` · b7 `1945ec8` · cfg
  `9ed8924` · eg `4ed29e6` · hsh `951f6f1` · hkl `454cfab` · seo `805a51d`.
- **Riscatto reale in produzione, 10/10** (coupon `internal: true`, plus-alias del fondatore, contesto Chrome
  isolato): F1 4/4, F2 (200, account Enterprise), F3 4/4, F4 5/5, B7 5/5, CFG/EG/HSH/HKL/SEO 5/5 ciascuno.
- **Oracoli indipendenti:** ROI PaymentRescue 74 controlli · SSRF CaptureAPI 34 (27 bersagli, nessuno passa) ·
  dimensioni e byte CaptureAPI 34 · matrice fatture ParseFlow **130/130** · casi limite F1/F2 · casi limite core dei
  round-2: CardForge 72 PNG su 72 alla dimensione dichiarata, HookLab 19/19, HeaderShield 21/21, SEOScope 86/86 su 16
  pagine reali, EmailGuard 12/12 col DNS reale. Ogni oracolo ha un controllo negativo (diventa rosso se lo perturbo).
- **Giri locali autenticati** su build di produzione con mock Upstash/Stripe/Brevo: F3 48, F1 17/17, F2 18/18, F4 18/18
  e B7 17/17 dopo i fix, CFG/EG/HSH 34/34, HKL 36/36, SEO 36/36. Checkout → **price id esatto**, webhook firmato 200,
  **firma falsa/assente/vecchia/alterata 400**, evento ripetuto senza effetto, **Redis giù → 503 senza sloggare**, e il
  **dunning di PaymentRescue end-to-end sul mock Brevo** (importo ed email esatti, secondo passo con testo diverso,
  `recovered`, poi silenzio).
- **Matrice «cliente fedele»** (nessuna scorciatoia: orologio ±3 s…±1 giorno, fuso/RTL, autofill sull'honeypot, invio
  veloce, doppio click, due schede, 3G, UA mobile, tracker bloccati, refresh): completa su CardForge (24 + 9 scenari);
  in produzione con coupon veri R01/R02b/R07/R18-R22 su CardForge, EmailGuard, HeaderShield, SEOScope: **32/32**. (Il
  riepilogo di B dice 40/40 su «5 prodotti»; la sua tabella ne elenca 4 — HookLab `/redeem` non ha anti-bot — e
  riporto ciò che la tabella mostra.) Ogni rifiuto giudicato su due domande: la causa detta è vera? il consiglio è
  seguibile?

## 3. Autocritica — i falsi rossi sono stati della sonda, e li elenco

Un collaudo che non sbaglia mai in proprio favore va guardato con sospetto; qui ogni rosso è passato da selftest e
controllo negativo prima di essere creduto. **Della sonda o dell'ambiente, non dei prodotti:** `journey-core` senza
oracolo per F3; la verifica CSP dava 30/30 rosso perché MSYS trasformava `/` in `C:/Program Files/Git/` (mio errore,
già in memoria); il dev server Turbopack di F3 in loop di reload; il profilo Chrome condiviso ancora autenticato da una
sessione precedente (falso rosso su FixMyWeb); un 403 del gate anti-bot che rendeva vuoti i «4xx» sugli URL ostili; il
«redirect verso metadata» che era il rifiuto di httpbin e non il nostro; un banner non trovato che dava verde su
stringa vuota; prezzi mensili letti dall'ambiente mentre sono nel sorgente; test unitari scritti su righe con buchi
larghi mentre l'estrattore vede gli spazi collassati; un `next dev` rimasto vivo che rispondeva al posto del build
nuovo. **Mio, del coordinatore:** il primo giro CSP (MSYS) e la lacuna F3.
🔑 **Lezioni:** leggere l'input vero del componente prima di scrivere il test · un controllo che passa su una stringa
vuota non prova nulla · un rosso identico su tutti i prodotti è quasi sempre la sonda · quando un difetto si trova in un
prodotto, cercarlo nei fratelli dello chassis (qui: 5/5, 7/7).

## 4. Cosa NON è stato collaudato, e cosa non ho potuto misurare nell'ultimo giro

- ✅ **Chiuso**: lo snapshot T1 dei pool partner, inizialmente bloccato perché `%TEMP%\claude\qa-secrets` era sparita
  durante il giro finale (nessuno script nostro la cancella, verificato con grep; non so chi sia stato — resta per te
  in §5). Rigenerata da `vercel env pull` per-progetto (lo stesso metodo con cui era nata) e confrontata con T0:
  **`totalDelivered`/`totalUsed` dei pool PARTNER sono invariati su tutti e 10** — solo `internal.*` è cresciuto, esattamente
  i coupon `internal: true` coniati e riscattati da questo stesso round. Non più una deduzione dal disegno: una misura.
- Nessun pagamento con carta vera (vincolo): checkout verificato fino alla pagina Stripe e sul mock. Dunning reale: nessuna
  email consegnabile finché un pagamento non fallisce davvero; provato su mock. Redis giù **non** riprodotto in
  produzione (non si tocca l'Upstash di produzione): provato in locale e sul commit servito.
- **Redirect da URL pubblico verso IP interno su CaptureAPI** end-to-end: servirebbe un redirector esposto; letto nel
  codice (`renderer.ts` rivalida ogni salto) e coperto da test unitari.
- `noindex` e più `<h1>` su SEOScope in produzione (nessuna pagina reale li aveva); UA Safari/Firefox con BotID e
  cookie di terze parti disattivati in produzione; matrice «cliente fedele» completa su EG/HSH/HKL/SEO (eseguito un
  sottoinsieme) e subset sulle F-series (letto nel codice: non hanno il gate con orologio, non provato nel browser).
- ✅ **Verificato, non un gap**: `/api/checkout/complete` esiste su 7 prodotti su 10 (F1, B7, i 5 round-2; F2/F3/F4
  non ce l'hanno) ed era già protetto contro lo stesso schema del reperto 10 (`isRedisUnavailable` → 503, mai 500) da
  un round precedente (3 ott), con un test di regressione dedicato su tutti e 7. Rilanciato su ognuno: **14/14 verdi**.
  Non era una lacuna di questo round, solo non ri-controllata.
- Il percorso positivo dei cron di F4 non è esercitabile: `CRON_SECRET` è Sensitive e `vercel env pull` la dà vuota.

## 5. Voci per il fondatore

**Decisioni tue** (non le ho prese): `CRON_SECRET` di FixMyWeb assente — R4, accenderla fa partire email a clienti veri ·
~~**HookLab `/redeem` non ha anti-bot**~~ — **chiuso dopo il tuo via libera**: hooklab#66, stesso schema dei 4
fratelli (`checkAntiBot`/`antiBotRefusal`, già usato su `/signup`); la causa vera era che lo **schema** di `/redeem`
scartava in silenzio `company_website`/`elapsed_ms` prima ancora che la route potesse giudicarli. Verificato in
produzione sul commit `f459bec`: honeypot → `FORM_UNVERIFIED`, invio veloce → `FORM_TOO_FAST`, nessun campo (bundle
vecchio) e tempo plausibile → raggiungono il controllo del coupon invariati (fail-open intatto). 25/25 test nel file,
917/917 nel repo · il toggle «Advertising» dei banner di F1-F4 pilota segnali di consenso senza annunci (e la privacy di F4
dice «optional analytics/advertising cookies»): decisione tua/legale, cambia lo stato di consenso salvato · `pdf-parse`
(ferma alla 1.1.4) emette `Buffer()` deprecato: sostituirla è una decisione di prodotto · PostHog su F2/B7 non è attivo
in produzione (manca la chiave): se lo vuoi, la CSP blocca `eu.i.posthog.com` · `/signup` `force-static` di F4/B7: inerte
per i browser, aperto per scelta.

**Azioni tue, invariate:** rotazione di `INTERNAL_SECRET_KEY` (F1/F2) · riconiare le chiavi API già in storia git ·
credenziali Upstash alle preview · ticket Vercel sul soft-404 · alias di posta su Porkbun · documint#79 · PR Dependabot ·
portali DealMirror/DealFuel. **Nuovo:** l'IP condiviso di Brevo risulta su SpamCop e la mail con la chiave di un cliente
EmailGuard ha avuto un soft bounce il 5 nov (non risolvibile dal codice) · da capire chi ha cancellato
`%TEMP%\claude\qa-secrets` durante questo stesso round (rigenerata da `vercel env pull`, §4: non blocca più nulla).
Indagato: nessun nostro script la tocca, nessun task pianificato dedicato trovato; la cartella padre `claude` in
`%TEMP%` esiste da marzo (non ricreata, solo la sottocartella è sparita), compatibile con la manutenzione automatica
periodica di Windows su `%TEMP%` (`SilentCleanup`, attiva su questa macchina) — **ipotesi plausibile, non una prova**.
Per evitare la ripetizione: i prossimi segreti QA andrebbero scritti fuori da `%TEMP%` (la cartella scratchpad della
sessione non viene ripulita allo stesso modo).

## 6. Come rifare questo round

```bash
export MSYS_NO_PATHCONV=1
node reports/omni-07nov-2026/baseline-run.cjs            # tutti, ordine alternato; un marker per prodotto
node reports/omni-07nov-2026/pool-readonly.cjs T1 && node reports/omni-07nov-2026/pool-readonly.cjs diff T0 T1
node reports/omni-07nov-2026/journey-deep.cjs <slug>     # cliente pagante in produzione (contesto isolato, usa ./lib.cjs)
node reports/omni-07nov-2026/B/fidelity-matrix.cjs <slug> [redeem|signup] [--prod|--prod-real]
node reports/omni-07nov-2026/csp-browser-check.cjs https://<dominio> / /pricing /redeem
python -I reports/omni-07nov-2026/rcpt-probe.py
```

Slug: `f1 f2 f3 f4 b7 cfg eg hsh hkl seo`. Serve Chrome su :9223 (profilo `chrome-automation-profile`) e i segreti QA in
`%TEMP%/claude/qa-secrets/<slug>.qa` (vedi §4: da ricreare). Prima di credere a un rosso: `node
scratchpad/qa-infra/selftest.cjs` dalla sua cartella. In locale usare la **build di produzione**
(`A/run-prod.cjs <slug>`): il dev Turbopack di F3 va in loop di reload.
