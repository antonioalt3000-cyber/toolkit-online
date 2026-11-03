# 10-SaaS Omni-Upgrade & Browser QA — report finale

**31 ottobre 2026.** Mandato: audit zero-trust dei 10 SaaS, installazione di strumenti
sicuri, upgrade A→Z, collaudo del cliente via browser reale. Autonomia fino al deploy e
journey **in produzione**, come deciso dal fondatore.

I 10 prodotti: **F1** CompliPilot · **F2** FixMyWeb · **F3** PaymentRescue · **F4** ParseFlow ·
**B7** CaptureAPI · **CardForge** · **EmailGuard** · **HeaderShield** · **HookLab** · **SEOScope**.
(Gli altri 5 `business-new-*` sono fermi al 26 agosto: fuori perimetro.)

---

## 1. Strumenti installati e configurati

Prima di installare qualunque cosa ho guardato cosa c'era: su **tutti e 10** girano già in CI
`semgrep-sast` (p/owasp-top-ten + p/typescript + p/secrets), `lighthouse`, `security-audit`
(npm audit), `watchdog`, `auto-fix`, Dependabot e Trivy, con run verdi del 29-30 ottobre; in
locale ci sono 652 skill e gli MCP Vercel, Supabase, Stripe, Gmail, Context7, filesystem.
Reinstallare quella roba sarebbe stato teatro.

**I tre buchi reali**, colmati da release ufficiali con SHA256 verificato contro i
`SHA256SUMS` pubblicati nella stessa release, installati in `~/bin`:

| Tool | Versione | Fonte | Perché serviva |
|---|---|---|---|
| `osv-scanner` | 2.7.0 | `github.com/google/osv-scanner` | legge il **lockfile** contro OSV.dev: prende transitive che `npm audit` non riporta |
| `gitleaks` | 8.30.1 | `github.com/gitleaks/gitleaks` | scansiona la **storia git** — nessuno strumento del portfolio la guardava |
| `knip` | 6.44.0 | npm `knip` (webpro-nl) | motore per il dead-code: la skill `dead-code-auditor` esisteva senza motore |

🟢 **Verifica sicurezza fonti**: tre repository ufficiali di primo livello, binari con
checksum confrontato, nessuna dipendenza transitiva eseguita in installazione. Tutti e tre
collaudati su un repo campione prima dell'uso sui 10 (gitleaks ha trovato il suo primo
risultato utile sul contenuto in staging di `toolkit-online`).

**Tre scelte di non-installazione, motivate**: **Semgrep** non supporta Windows nativo e il
workflow in CI fa già esattamente quelle regole, quindi si lancia con `gh workflow run`;
**nessun MCP nuovo**, perché il registry non espone niente di code-security che superi questi
CLI e i due MCP browser pertinenti sono vietati dalla regola sulla porta 9223 — aggiungerne
sarebbe superficie d'attacco e token a parità di risultato; **nessun Playwright**, perché
`cdp-journey.cjs` copre il bisogno rispettando la regola.

**Auto-controllo**: esisteva già a pezzi (`checkpoint.py`, skill `verify-my-work`,
`task-tracker`, `portfolio-deploy-verify`). Mancava una cosa sola: un registro che
sopravvivesse alla compattazione del contesto su 10 repo. Creati `RUN-LEDGER.md`,
`progress.cjs` (JSONL append-only, stdlib, zero dipendenze) e `REDIS-WRITES.jsonl` — senza
quest'ultimo il teardown in produzione sarebbe stato impossibile.

---

## 2. Migliorie applicate: 8 PR mergiate e in produzione

Gate per ogni repo prima della PR: `lint` 0 errori, `tsc --noEmit`/`typecheck` pulito, suite
completa verde, `build` verde. CI attesa **per nome** prima di ogni merge.

| PR | Prodotto | Contenuto | Suite |
|---|---|---|---|
| [complipilot#71](https://github.com/antonioalt3000-cyber/complipilot/pull/71) | F1 | dompurify 3.4.17 | 944 |
| [accessiscan#82](https://github.com/antonioalt3000-cyber/accessiscan/pull/82) | F2 | dompurify, undici, postcss-selector-parser | 661 |
| [accessiscan#83](https://github.com/antonioalt3000-cyber/accessiscan/pull/83) | F2 | `/api/auth/me` 200 per l'anonimo | 663 |
| [churnguard#79](https://github.com/antonioalt3000-cyber/churnguard/pull/79) | F3 | `/api/auth/me` + dompurify | 672 |
| [documint#81](https://github.com/antonioalt3000-cyber/documint/pull/81) | F4 | contrasto AA dei CTA + dompurify | 676 |
| [capture-api#108](https://github.com/antonioalt3000-cyber/capture-api/pull/108) | B7 | dompurify + ip-address | 922 |
| [seoscope#60](https://github.com/antonioalt3000-cyber/seoscope/pull/60) | SEOScope | undici 7.30.1 | 801 |
| [emailguard#53](https://github.com/antonioalt3000-cyber/emailguard/pull/53) | EmailGuard | righe DNS non asserite | 573 |

### La vulnerabilità che contava

🔑 **`dompurify` 3.4.16 → 3.4.17, CVSS 9.2, su 5 prodotti.** Tre bypass del sanitizzatore.
**Non è dev-only**: arriva nel bundle che ogni visitatore scarica, via `jspdf` e `posthog-js`.
Il workflow `security-audit` con `npm audit` gira da mesi e non l'aveva mai segnalata.

Il contrario vale per la voce **più grave** del report: `tinypool` 9.5 su 10/10 è il pool di
worker di **vitest** e non gira in produzione. Letta per severità, la lista avrebbe fatto
spendere un bump major di vitest su dieci repo e lasciato il bundle client bucato. Il
discriminante è la catena (`npm ls <pkg> --all`), non il punteggio. Dettaglio completo,
incluse le quattro voci lasciate deliberatamente, in `SECURITY-10SAAS.md`.

### I difetti di prodotto chiusi

- **F4 — contrasto sotto AA sulla prima schermata di un cliente pagante.** I due CTA di
  `/redeem` erano `bg-cyan-600` con testo bianco: **3.62:1**, e `hover:bg-cyan-500` scendeva a
  **2.37:1**. Ora 5.28 e 7.22:1, verificato **in produzione** (`parseflow.dev/redeem` serve
  `bg-cyan-700/800`). Il guard che ho aggiunto ha poi trovato **un secondo difetto che non
  stavo cercando**: il bottone del Help Center scendeva a 2.47:1 in hover, sotto anche il 3:1
  che si applica a un'icona.
- **F3 e F2 — ogni pagina pubblica produceva un 401.** L'header sta nel root layout e richiede
  `/api/auth/me` a ogni cambio rotta, quindi un visitatore anonimo collezionava un 401 per
  pagina, in console e nel pannello di rete di chiunque valutasse il prodotto. Ora: nessun
  cookie → 200 con utente nullo; cookie presente ma scaduto → 401 (segnale vero); Redis giù →
  503. Verificato live: `paymentrescue.dev/api/auth/me` risponde 200 all'anonimo.
  🔑 Avevo trattato questo come specifico di F3; **è stato il giro nel browser a mostrarmi che
  F2 aveva lo stesso difetto**, che altrimenti restava.
- **EmailGuard — un controllo mai eseguito riportato come fallito.** La demo dava
  «MX records ✕» per un indirizzo malformato, ma il validatore esce **prima** di interrogare
  il DNS: a chi scriveva `foo@` veniva detto che il dominio non ha record MX, cosa che il
  prodotto non ha modo di sapere. Ora quelle righe compaiono solo se una query è avvenuta —
  la stessa regola che la riga blacklist seguiva già.

Ogni fix è accompagnato da un guard, e **ogni guard è stato provato in negativo**: rimosso il
fix, il guard fallisce. (Non è pedanteria: il primo guard del contrasto passava a vuoto perché
un `\b` si era perso nel transito, e l'ho scoperto solo con quella prova.)

---

## 3. Collaudo del cliente, in produzione

Protezioni, dato che il fondatore ha scelto il journey live: coupon coniati **`internal: true`**,
riscattabili solo dall'email del fondatore (`isFounderEmail` è hardcoded nei 10) → **i pool
DealMirror e DealFuel non sono stati sfiorati**; ogni chiave Redis registrata in
`REDIS-WRITES.jsonl` **prima** della scrittura (15+ voci); nessun pagamento con carta reale.

Il mese si comprime con tre leve, non si attende: cron invocati col proprio segreto,
riscrittura dei timestamp, e la chiave-mese `YYYY-MM` che azzera la quota da sé.

| Prodotto | Esito | Cosa è stato esercitato davvero |
|---|---|---|
| **CardForge** | 6/7 | coupon → riscatto → chiave → **card PNG reale da 27.560 byte**. 🔑 L'audit lo dava come **mai testato**: è il suo primo collaudo end-to-end. |
| **PaymentRescue** | **7/7** | riscatto HTTP 200, dashboard dunning col piano `scale`, cron che accettano il proprio segreto e **rifiutano** quello sbagliato (401) |
| **CaptureAPI** | **7/7** | riscatto, screenshot PNG verificato per firma, cron |
| **ParseFlow** | **4/4** | riscatto, dashboard estrazioni, cron |
| **EmailGuard** | 6/7 | riscatto, verifica email con punteggio; unico rosso = il soft-404 del §4 |
| **CompliPilot** | **7/7** | riscatto, **scan AI Act reale** (`overallScore` 72 con punteggi per categoria), cron. Al primo giro dava 6/7: l'oracolo cercava `score` dove il prodotto risponde `overallScore`. Corretto e rimisurato. |
| **FixMyWeb** | vedi sotto | 409 su email esistente — comportamento **corretto**, verificato a parte |
| **HeaderShield** | **8/8** | riscatto, scan header con voto, cron accettati e segreto sbagliato respinto |
| **HookLab** | **8/8** | riscatto, lista endpoint webhook, cron |
| **SEOScope** | **8/8** | riscatto, audit SEO con punteggio, cron |

Tutti e 10 i domini: **home 200 e `/api/health` 200**; sweep pubblico separato 6/6 per prodotto
(home, `/redeem`, mobile 375px, zero errori di console, zero risposte ≥400).

🔑 **La verifica più utile di tutta la giornata** non era in programma. Su F2 il riscatto con
un'email che ha già un account risponde **409** — e la cosa da controllare non era il codice di
stato ma i soldi: il coupon **viene restituito al pool** (`smove used→valid`). Provato
end-to-end: 409 sull'email esistente, poi **lo stesso codice riscatta** su un'email nuova
(piano Enterprise, email di benvenuto consegnata). È una guardia anti-dirottamento deliberata,
documentata nel codice, e funziona.

---

## 4. Reperto: una rotta inesistente risponde 200 con `Authorization` — caso API chiuso il 3 nov

Sui **5 repo round-2** (CardForge, EmailGuard, HeaderShield, HookLab, SEOScope) una rotta che
non esiste risponde **HTTP 200**, col corpo della pagina 404, se la richiesta porta un header
`Authorization` di qualunque valore. I 5 F-series rispondono 404 correttamente.

La correlazione è esatta: i 5 colpiti usano `NextResponse.next({ request: { headers } })` nel
middleware — serve a passare il **nonce CSP** al layout — i sani usano `NextResponse.next()`
semplice. **Non è la cache**: una URL unica con `X-Vercel-Cache: MISS` e nessun header dà 404.

Impatto onesto: trascurabile per la SEO (la pagina not-found è già `noindex`), **reale per
l'integrazione** — sono cinque prodotti che vendono una API, e uno sviluppatore che sbaglia un
path riceve 200 con dentro HTML invece di un 404 pulito.

### Aggiornamento 3 novembre — causa ritrattata, caso API chiuso

La causa che avevo attribuito al middleware **era sbagliata** e l'ho ritrattata. Tre prove:
non si riproduce in locale (`next start`, stesso commit, 404 sempre), si riproduce su path che
il matcher **esclude**, e non si riproduce su `/_next/static` che non raggiunge la funzione.
La regola vera: ogni richiesta che arriva alla funzione Next con `Authorization` e che cadrebbe
in 404 torna 200. È lo strato di hosting, non il nostro codice.

Lo split fra `/api` e pagine aveva una spiegazione banale: **HeaderShield e HookLab avevano già
una catch-all** `/api` che risponde 404, CardForge ed EmailGuard no. Non piattaforma: una rotta
presente in tre prodotti su cinque.

Chiuso il caso che danneggiava i clienti: [cardforge#50](https://github.com/antonioalt3000-cyber/cardforge/pull/50)
e [emailguard#55](https://github.com/antonioalt3000-cyber/emailguard/pull/55), mergiate, verificate
su preview (`vercel curl`) e in produzione. **Tutti e 5 i prodotti** rispondono ora
`404 application/json` su `/api/<inesistente>` anche con `Authorization`.

Resta aperto il caso **pagine** (200 su tutti e 5): impatto trascurabile, la not-found è
`noindex`, e il rimedio toccherebbe la CSP con nonce di cinque siti. C'è una riproduzione minima
pronta per un ticket Vercel in `REPERTO-soft-404-authorization.md` §6 — lo deve aprire il
fondatore, serve l'account.

🔑 **Perché nessuno l'aveva visto**: l'hanno trovato richieste **autenticate**. Un visitatore
anonimo non manda mai `Authorization`; un cliente con una chiave API lo manda sempre. Gli sweep
pubblici dei round precedenti non potevano scovarlo.

---

## 5. 🔴 Resta a te: ruotare `INTERNAL_SECRET_KEY`

`gitleaks` ha prodotto 224 finding sulla storia dei 10 repo. **222 sono falsi positivi**:
snippet `curl` nella documentazione, fixture dei test, e righe dove una proprietà TypeScript si
chiama letteralmente `key` e tiene il nome di un articolo di legge (`legal-dates.ts:63`). Non lo cito alla lettera: la citazione farebbe scattare la stessa regola su questo report, come ho verificato passando `gitleaks` sui deliverable prima di committarli.

I due veri sono in `scripts/batch-scan-outreach*.js`, commit del 7 aprile 2026:

- **Chiave Brevo** — ✅ **già ruotata**: l'hash del valore in storia non corrisponde a quello
  nel vault. L'esposizione è inerte e il backlog storico «Brevo key rotation», aperto dal
  7 maggio, **si può chiudere**.
- **`INTERNAL_SECRET_KEY`** — 🔴 il valore in produzione su F1 e F2 è **identico byte per byte**
  a quello committato. Via header `x-internal-key` salta same-origin, rate limit, quota e lock
  su `/api/scan`, **senza alcun account**.

Non l'ho ruotata perché è condivisa fra Vercel e i secret di GitHub Actions (la usa il workflow
`watchdog`): cambiarla in un posto solo rompe il watchdog in silenzio, e una rotazione di
segreti è una tua decisione, non un deploy. I quattro passi sono in `SECURITY-10SAAS.md` §2.

**Nota di trasparenza**: mascherando l'output del vault ho usato un elenco di prefissi invece
di una forma generica, e 5 chiavi creator (`eg_`, `seo_`, `hsh_`, `hkl_`, `cfg_`) sono finite in
chiaro nel transcript locale di questa sessione. È la stessa lezione del 31 agosto, che non mi
ha fermato. Sono chiavi QA dei nostri prodotti, non di clienti, e la procedura di rigenerazione
è documentata in `creator-test-access-permanent`: dimmelo e le riconio.

---

## 6. Cosa non è stato fatto, e perché

- **Rotazione di `INTERNAL_SECRET_KEY`** e delle 5 chiavi creator → §5, decisione tua.
- **Soft-404 con `Authorization`** → §4: va verificato in locale prima di toccare la CSP di
  cinque siti in produzione.
- **`tinypool` 9.5 e la toolchain dev** (vite, vitest, esbuild, minimatch, glob): richiedono un
  bump major di vitest su 10 repo con ~7.400 test da rivalidare. Non girano in produzione:
  è manutenzione pianificabile, non un'urgenza.
- **Cancellazione account self-service** (`/api/user/delete` e `/export` esistono su tutti e 10
  ma nessun prodotto ha un bottone): è una scelta uniforme del portfolio, non una dimenticanza
  di F3 come sembrava. Aggiungere una cancellazione irreversibile a 10 dashboard è una feature
  con flusso di conferma, non un fix da fare non presidiato.
- **Guasto Redis**: provato solo in locale. In produzione non è inducibile e non l'ho finto.
- **Il teardown dei coupon interni**: le 15+ chiavi sono registrate. Non le ho cancellate perché
  il token Upstash da `vercel env pull` non è utilizzabile in scrittura (gotcha noto) e la
  pratica dei round precedenti è lasciare gli account QA del fondatore, documentati. L'elenco è
  in `REDIS-WRITES.jsonl`.
- **CSP con nonce sui 5 F-series**: fuori perimetro per scelta, già valutata e scartata per
  costo il 4 settembre (46 pagine).

---

## 7. Stato finale, senza arrotondare

**10/10 live e sani** (home 200, `/api/health` 200). **8 PR mergiate e deployate**, ogni deploy
verificato con `READY` + dominio pubblico in `curl` non autenticato, e due fix confermati
*comportamentalmente* in produzione (il 200 anonimo su `paymentrescue.dev`, le tonalità
`cyan-700/800` servite da `parseflow.dev`).

**Zero difetti di prodotto aperti fra quelli che ho trovato e potuto chiudere.** Resta aperto
un reperto nuovo (§4) e una rotazione di segreto che è tua (§5).

Non scrivo «100% perfetto»: tre dei rossi nel collaudo erano **miei** — un oracolo che leggeva
il testo della pagina invece della rete, una sonda il cui valore di ritorno non avevo letto, e
un bottone che credevo rotto e invece aspettava una spunta. Li ho corretti e rimisurati, ed è
per questo che i numeri qui sopra valgono qualcosa; ma un collaudo che non sbaglia mai in
proprio favore va guardato con sospetto, non celebrato.
