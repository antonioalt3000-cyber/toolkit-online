# Sicurezza 10 SaaS — scansione del 31 ottobre 2026

Strumenti: **osv-scanner 2.7.0** (Google, lockfile → OSV.dev), **gitleaks 8.30.1**
(storia git), **knip 6.44.0** (codice morto), più `semgrep-sast` già in CI su tutti
e 10 i repo. Binari scaricati dalle release ufficiali e verificati con i SHA256SUMS
pubblicati nella stessa release.

---

## 1. Il dato che conta: cosa è raggiungibile in produzione

`osv-scanner` elenca 17 pacchetti vulnerabili sui 10 repo. La severità da sola non
dice niente: quello che conta è se la dipendenza finisce davvero davanti a un cliente.

### 🔴 Raggiungibile dal client — CORRETTO in questa sessione

| Pacchetto | Sev | Dove | Catena | Esito |
|---|---|---|---|---|
| `dompurify` 3.4.16 → **3.4.17** | **9.2** | F1, F2, F3, F4, B7 | `jspdf` e `posthog-js` → **bundle client** | override applicato |

Tre bypass del sanitizzatore (GHSA-c6gr-qvv4-5v3f, GHSA-cg2g-xh64-v4q7,
GHSA-mrv2-3pqr-j5jr). **Non è dev-only**: arriva nel bundle che ogni visitatore
scarica. `npm audit`, che gira già nel workflow `security-audit`, non l'aveva
segnalato — è il buco che `osv-scanner` colma leggendo il lockfile contro OSV.dev.

### 🟡 Raggiungibile dal server — CORRETTO

| Pacchetto | Sev | Dove | Catena |
|---|---|---|---|
| `undici` 7.30.0 → **7.30.1** | 7.5 | F2, SEOScope | `cheerio` (fetch lato server nello scanner) |
| `postcss-selector-parser` 6.1.4 → **6.1.5** | 5.9 | F2 | toolchain CSS in build |
| `ip-address` 10.7.3 → **10.7.5** | 6.3 | B7 | `socks` → `proxy-agent` |

### ⚪ Presente ma NON raggiungibile — lasciato, con motivo

| Pacchetto | Sev | Perché non si tocca |
|---|---|---|
| `extract-zip` 2.0.1 | 8.6 | `@puppeteer/browsers`: serve a **scaricare** Chromium, non gira a runtime su Vercel. Nessuna fix pubblicata. |
| `zod` 3.25.76 | 8.2 | transitiva di `chromium-bidi` (dentro `puppeteer-core`). Il nostro codice usa zod 4.6.7. Forzare zod 4 romperebbe chromium-bidi: va atteso l'upstream. |
| `uuid` 8.3.2 | 7.5 | transitiva di `exceljs` 4.4.0. Un override a uuid 11 è possibile ma cambia il modulo sotto una libreria di export: da fare con un collaudo dedicato, non in blocco. |
| `tinypool` 1.1.1 | **9.5** | pool di worker di **vitest**: esiste solo in `devDependencies`, non viene mai eseguito in produzione. La fix è un bump major di vitest (3 → 4) su 10 repo, con ~7.400 test da rivalidare. |
| `vite`, `@vitest/mocker`, `vitest`, `esbuild`, `minimatch`, `glob`, `deepmerge` | 2.5–7.5 | stessa natura: toolchain di sviluppo. |

🔑 **Il punto da ricordare**: la voce più grave del report (`tinypool`, 9.5) è
irrilevante per i clienti, e quella che conta davvero (`dompurify`, 9.2) era
l'unica mescolata in mezzo alla toolchain. Leggere la lista per severità avrebbe
fatto spendere un bump major di vitest e lasciato il bundle client vulnerabile.

---

## 2. Segreti nella storia git

224 finding grezzi, raggruppati per forma della riga: **222 sono falsi positivi**.
Sono snippet `curl` nella documentazione (`docs/`, `blog-posts.ts`, articoli
Dev.to), fixture nei test, e righe dove una proprietà TypeScript si chiama
letteralmente `key:` — per esempio `legal-dates.ts:63`, dove una proprieta' chiamata `key` tiene il nome di un articolo di legge (il valore e' una stringa descrittiva, non un segreto; non lo cito alla lettera perche' farebbe scattare la stessa regola su questo report).

Due sono reali, entrambi in `scripts/batch-scan-outreach*.js`, commit del 7 aprile 2026:

| Segreto | Repo | Stato verificato |
|---|---|---|
| Chiave Brevo `xkeysib-…` | F1, F2 | ✅ **già ruotata**: l'hash del valore in storia **non** corrisponde a quello nel vault. L'esposizione è inerte, e il backlog storico "Brevo key rotation" si può chiudere. |
| `INTERNAL_SECRET_KEY` (45 char) | F1, F2 | 🔴 **ancora attiva**: il valore in produzione su Vercel è **identico byte per byte** a quello in storia. |

### 🔴 Azione che resta al fondatore: ruotare `INTERNAL_SECRET_KEY`

Cosa concede quella chiave, via header `x-internal-key`:
- **F1**: salta same-origin, rate limit guest, quota, riserva dello slot e lock
  anti-duplicato in `/api/scan` → scansioni illimitate **senza account**;
- **F2**: salta quota e rate limit per IP.

Perché non l'ho ruotata io: è una credenziale condivisa fra Vercel e i segreti di
GitHub Actions (il workflow `watchdog` la usa). Cambiarla in un posto solo rompe il
watchdog in silenzio, e una rotazione di segreti è decisione tua, non un deploy.

Passi, nell'ordine:
1. generare un valore nuovo (`openssl rand -hex 24`);
2. Vercel → progetti F1 e F2 → Settings → Environment Variables → `INTERNAL_SECRET_KEY` (Production);
3. aggiornare l'omonimo secret in GitHub Actions su **entrambi** i repo;
4. redeploy di F1 e F2, poi una corsa manuale del workflow `watchdog` per conferma.

La storia git non si riscrive: i repo sono privati e un `filter-repo` invaliderebbe
ogni clone e ogni riferimento a commit nei report. La rotazione rende il valore
inerte, che è l'obiettivo.

---

## 3. Cosa era già coperto (e che non ho reinstallato)

Su tutti e 10 i repo girano già: `semgrep-sast` (p/owasp-top-ten + p/typescript +
p/secrets), `lighthouse`, `security-audit` (npm audit), `watchdog`, `auto-fix`,
Dependabot, Trivy. Le run del 29-30 ottobre sono verdi. Nessun MCP nuovo
installato: il registry non offre nulla di code-security che superi questi CLI, e
i due MCP browser pertinenti sono vietati dalla regola sulla porta 9223.
