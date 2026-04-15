# ToolKit Online — Project Context
> **Info condivise portfolio:** vedi `C:/Users/ftass/portfolio-config.md` per account, API keys, monetizzazione, e convenzioni globali.

## ⚠️ Session Management (da Insights analisi)
- **Prima di iniziare**: leggere SEMPRE i file memoria e handoff per non ripetere lavoro già fatto
- **Max 6 agenti paralleli** — oltre si perde il controllo e la sessione finisce senza completare
- **Prima di fine sessione**: SEMPRE commit + build check + aggiornare memoria
- **Task troppo grandi**: spezzare in milestone committabili, non lanciare tutto insieme
- **Mai suggerire setup già completati**: controllare memoria prima di proporre azioni

## ⚠️ ACCESSO PIATTAFORME — REGOLA ASSOLUTA
- **SEMPRE leggere `shared-memory/platform-access-methods.md`** PRIMA di accedere a qualsiasi piattaforma
- **SEMPRE aggiornare** quel file DOPO ogni tentativo (successo/fallimento)
- **MAI riprovare** un metodo marcato ❌ — è spreco di tempo
- **4 tool browser**: Playwright → Chrome DevTools → Chrome MCP → Firecrawl
- **Ordine**: API diretta → Playwright → Chrome DevTools → marcare 🔒 manuale
- **Max 2 tentativi per metodo**, poi passare al successivo

## ⚠️ AUTO-MIGLIORAMENTO CONTINUO — Regola permanente
- **LEGGERE `shared-memory/auto-improvement-system.md` ad OGNI sessione e task**
- **DOPO ogni azione**: misurare risultato, confrontare con precedente, migliorare
- **MAI ripetere lo stesso errore** — se qualcosa non funziona, documentare e cambiare approccio
- **Se qualcosa funziona bene** → analizzare PERCHÉ e replicare il pattern
- **Se qualcosa non funziona** → analizzare PERCHÉ e cambiare strategia
- **Ogni task deve finire con**: cosa ho imparato? cosa miglioro per la prossima volta?
- **Qualità SEMPRE crescente**: ogni blog migliore del precedente, ogni email migliore della precedente

## ⚠️ Content Guidelines
- **MAI includere dettagli monetizzazione** (revenue, income, strategie prezzi) in contenuti pubblici (blog, Reddit, Dev.to) se non richiesto esplicitamente

## ⚡ AZIONE AUTOMATICA AD OGNI SESSIONE
All'inizio di ogni sessione, DEVI:
1. Salutare l'utente e ricordargli di lanciare `/learn` per il ciclo di analisi automatico
2. Se l'utente dice "vai" o "inizia" o simili, esegui `/learn` automaticamente
3. Il sistema `/learn` analizza i dati GSC, confronta con lo storico, e suggerisce le priorità

## Overview
Portfolio di micro-tool gratuiti per generare traffico SEO e monetizzare con Google AdSense.
- **URL:** https://toolkitonline.vip
- **Stack:** Next.js 16 + TypeScript + Tailwind CSS
- **Hosting:** Vercel (auto-deploy da GitHub)
- **Lingue:** 6 (IT, EN, ES, FR, DE, PT)
- **Monetizzazione:** Google AdSense (ca-pub-7033623734141087)

## Account & Servizi
- **GitHub:** antonioalt3000-cyber/toolkit-online (branch: master)
- **Vercel:** auto-deploy da GitHub
- **Dominio:** toolkitonline.vip (Porkbun)
- **GTM:** GTM-WKG7WCXZ
- **Google Search Console:** verificato con file HTML
- **AdSense:** in attesa approvazione

## Architettura
- `app/[lang]/tools/[tool-name]/page.tsx` — pagine tool
- `lib/translations.ts` — traduzioni + toolList + getToolsByCategory()
- `components/` — Header, Footer, componenti condivisi
- `app/sitemap.ts` — sitemap dinamica
- `app/robots.ts` — robots.txt
- `app/api/google-verification/route.ts` — verifica Google Search Console
- `public/` — assets statici, ads.txt, manifest.json

## Tool attuali → vedi `lib/translations.ts`
> `toolList` e `getToolsByCategory()` sono la fonte di verità. Non duplicare qui.

## Convenzioni
- Ogni tool è un file `page.tsx` con 'use client'
- Le traduzioni vanno in `lib/translations.ts` nell'oggetto `tools` E in `getToolsByCategory()`
- La sitemap si genera automaticamente da `toolList`
- Commit messages in inglese, comunicazione con l'utente in italiano
- Il dominio base nella sitemap è hardcoded come fallback: 'https://toolkitonline.vip'
- Ogni tool DEVE avere: ToolPageWrapper, SEO article (300-400 parole x6 lingue), FAQ accordion (4-5 domande)
- Layout tool: max-w-2xl

## ⚠️ STANDARD QUALITÀ — OBBLIGATORI (mai saltare)

### Prima di scrivere codice
1. **Leggi il pattern esistente**: apri 1-2 tool simili per capire la struttura ESATTA
2. **Verifica traduzioni**: controlla che TUTTE le 6 lingue siano coperte
3. **Pianifica edge cases**: input vuoti, numeri negativi, valori estremi, caratteri speciali

### Durante la scrittura del codice
- **MAI usare `any`** — usa tipi espliciti TypeScript
- **MAI lasciare `console.log`** nel codice di produzione
- **MAI hardcodare stringhe** — tutto in translations.ts
- **Ogni input DEVE avere validazione** con messaggio di errore visibile
- **Ogni tool DEVE avere**: copy button, reset button, stati di errore colorati
- **Funzioni max 40 righe** — spezza in funzioni più piccole
- **Nomi variabili descrittivi** — no `x`, `temp`, `data` generici

### DOPO aver scritto il codice (SEMPRE, mai saltare!)
1. **`npm run lint`** — fix tutti i warning/errori
2. **`npm run build`** — verifica che compila senza errori
3. **Controlla visivamente**: rileggi TUTTO il codice generato cercando:
   - Import mancanti o inutilizzati
   - Traduzioni mancanti in qualsiasi lingua
   - Stati di errore non gestiti
   - Bottoni senza onClick handler
   - Stili Tailwind inconsistenti col resto del progetto
4. **Test manuale mentale**: simula l'uso del tool passo per passo
   - Cosa succede se l'input è vuoto?
   - Cosa succede con valori negativi?
   - Cosa succede con input molto lunghi?
   - Il copy button funziona?
   - Il reset pulisce tutto?

### Sicurezza
- **dangerouslySetInnerHTML**: il progetto ha 91+ occorrenze senza sanitizzazione. Per nuovo codice, se possibile usa JSX diretto. Se necessario dangerouslySetInnerHTML, usa solo con contenuto hardcoded/trustato, MAI con input utente.
- **No eval()**, no innerHTML con dati utente, no dynamic import di URL utente

### Se il build o lint FALLISCE
- **NON dire "lo lascio a te da fixare"**
- **FIX IMMEDIATAMENTE** prima di rispondere all'utente
- **Ri-esegui build/lint** dopo il fix per confermare
- **Solo quando tutto passa**, marca il task come completo

### Checklist pre-deploy (usata da /deploy)
```
□ npm run lint → 0 errori
□ npm run build → compilazione OK
□ Traduzioni complete (6 lingue)
□ SEO article presente (300-400 parole)
□ FAQ accordion (4-5 domande)
□ Meta tags (title, description) in tutte le lingue
□ Internal links (2-3 link ad altri tool)
□ Nessun console.log nel codice
□ Nessun tipo `any`
□ Validazione input presente
□ Copy button funzionante
□ Reset button funzionante
□ Layout max-w-2xl rispettato
□ ToolPageWrapper utilizzato
□ Tool registrato in toolList
□ Tool in getToolsByCategory()
```

## Skill disponibili (slash commands)
### Sistema autodidatta (ciclo di crescita)
- `/learn` — Ciclo completo: analisi GSC → confronto storico → raccomandazioni (ESEGUIRE AD OGNI SESSIONE)
- `/dashboard` — Analisi performance GSC + classificazione pagine in bucket
- `/seo-optimize [slug]` — Ottimizzazione SEO basata su dati GSC reali
- `/index-boost` — Boost indicizzazione con hub pages, blog mirati
- `/auto-blog [topic]` — Genera articoli SEO con link interni
- `/auto-grow` — Crescita data-driven: suggerisce nuovi tool basati su query GSC

### Operativi
- `/new-tool [slug] [category]` — Crea un nuovo tool completo (con quality check integrato)
- `/deploy [messaggio]` — Quality gate + build + commit + push + verifica
- `/seo-check [slug]` — Analisi SEO di un tool
- `/add-tools-batch [slug1,slug2,...] [category]` — Crea tool in batch (con quality check)
- `/publish-article [topic]` — Pubblica articolo su Dev.to
- `/quality-check` — Scansione qualità codice: lint, build, any types, console.log, traduzioni

## Stato attuale → vedi `~/portfolio-state.md`
> Dati aggiornati, metriche GSC, task aperti sono in portfolio-state.md. Non duplicare qui.
