# ToolKit Online — Project Context
> **Info condivise portfolio:** vedi `C:/Users/ftass/portfolio-config.md` per account, API keys, monetizzazione, e convenzioni globali.

## ⚠️ Session Management (da Insights analisi)
- **Prima di iniziare**: leggere SEMPRE i file memoria e handoff per non ripetere lavoro già fatto
- **Max 6 agenti paralleli** — oltre si perde il controllo e la sessione finisce senza completare
- **Prima di fine sessione**: SEMPRE commit + build check + aggiornare memoria
- **Task troppo grandi**: spezzare in milestone committabili, non lanciare tutto insieme
- **Mai suggerire setup già completati**: controllare memoria prima di proporre azioni

## ⚠️ Content Guidelines
- **MAI includere dettagli monetizzazione** (revenue, income, strategie prezzi) in contenuti pubblici (blog, Reddit, Dev.to) se non richiesto esplicitamente
- **boss2 è DIVERSO da boss** — sempre confermare scope prima di lavorare

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

## Tool attuali (114 tool = 684 pagine)
### Finance (22)
vat-calculator, percentage-calculator, loan-calculator, salary-calculator, tip-calculator, discount-calculator, electricity-calculator, invoice-generator, invoice-calculator, mortgage-calculator, currency-converter, fuel-cost-calculator, compound-interest-calculator, investment-calculator, paycheck-calculator, profit-margin-calculator, sales-tax-calculator, roi-calculator, mortgage-amortization, inflation-calculator, retirement-calculator, debt-payoff-calculator

### Text (21)
word-counter, lorem-ipsum-generator, text-case-converter, character-counter, text-to-slug, markdown-preview, html-encoder, text-diff, typing-speed-test, character-map, text-to-speech, grammar-checker, resume-builder, ai-text-detector, text-repeater, emoji-picker, word-frequency-counter, line-counter, note-taking, flashcard-maker, font-identifier

### Health (10)
bmi-calculator, calorie-calculator, body-fat-calculator, ideal-weight-calculator, water-intake-calculator, sleep-calculator, pregnancy-calculator, pace-calculator, breathing-exercise, noise-generator

### Conversion (14)
unit-converter, base64-converter, time-zone-converter, cooking-converter, csv-to-json, url-encoder, jpg-to-pdf, pdf-to-jpg, word-to-pdf, number-to-words, temperature-converter, pdf-merge, pdf-compress, image-to-text

### Developer (22)
json-formatter, color-picker, password-generator, qr-code-generator, barcode-generator, screen-resolution, screen-recorder, regex-tester, hex-converter, hash-generator, binary-converter, binary-translator, color-converter, ip-lookup, cron-expression-generator, timestamp-converter, color-palette-generator, internet-speed-test, keyboard-tester, mic-test, webcam-test, gradient-generator

### Math (18)
age-calculator, speed-calculator, date-calculator, random-number-generator, aspect-ratio-calculator, grade-calculator, countdown-timer, fraction-calculator, gpa-calculator, scientific-calculator, stopwatch, percentage-change-calculator, pomodoro-timer, habit-tracker, standard-deviation-calculator, matrix-calculator, probability-calculator, chart-maker

### Images (7)
image-compressor, image-resizer, photo-editor, pixel-ruler, meme-generator, pixel-art-maker, background-remover

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

## Stato attuale (Marzo 2026)
- **143 tool** = 858 pagine + 42 pagine hub categoria = **900 pagine**
- **GA4**: G-30KL6W6WJY — collegato a Search Console ✅
- **AdSense**: in attesa approvazione
- **PWA**: Service Worker attivo
- **text-repeater IT**: posizione 7 (prima pagina Google!)
- **fuel-cost-calculator IT**: posizione 10.9 (quasi prima pagina)
