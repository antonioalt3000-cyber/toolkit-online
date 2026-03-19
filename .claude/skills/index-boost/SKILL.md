---
name: index-boost
description: Boost page indexation rate with hub pages, sitemap segmentation, and targeted blog articles
user-invocable: true
---

## Index Boost: porta l'indicizzazione dal 7% al 50%+

Sistema multi-approccio per far indicizzare più pagine da Google.

### Step 1: Analizza stato indicizzazione

1. Usa `mcp__google-search-console__get_search_analytics` con `dimensions: "page"` per vedere quali pagine hanno impressioni (= indicizzate)
2. Confronta con la lista completa di tool da `lib/translations.ts` (toolList)
3. Identifica i tool senza nessuna impressione in nessuna lingua = probabilmente non indicizzati
4. Raggruppa per categoria: quale categoria ha il tasso di indicizzazione più basso?

### Step 2: Crea/Aggiorna pagine hub per categoria

Per ogni categoria (finance, text, health, conversion, dev, math, images):
- Verifica se esiste `app/[lang]/tools/category/[category]/page.tsx`
- Se non esiste, creala con:
  - Lista di tutti i tool della categoria con nome, descrizione e link
  - Testo SEO introduttivo (200-300 parole) sulla categoria
  - Schema BreadcrumbList JSON-LD
  - Link a tutte le 6 varianti linguistiche (hreflang)
- Queste hub pages funzionano come entry point per il crawler di Google

### Step 3: Verifica sitemap segmentata

Controlla che `app/sitemap.ts` generi sitemap segmentate:
- Se è un singolo file monolitico, suggerisci il refactoring (vedi piano)
- Ogni segmento dovrebbe avere < 200 URL

### Step 4: Genera blog articoli mirati

Per le categorie con il tasso di indicizzazione più basso:
1. Genera un articolo tipo "Top X Free [Category] Tools Online in 2026"
2. L'articolo deve linkare a TUTTI i tool della categoria (anchor text descrittivo)
3. Scrivi in tutte le 6 lingue
4. Aggiungi a `lib/blog.ts`

Esempio articoli:
- "Top 27 Free Finance Calculators Online (2026)" → linka tutti i 27 tool finance
- "10 Free Image Tools: Compress, Resize, Edit Online" → linka tutti i 10 tool images
- "Best Free Developer Tools for 2026" → linka tutti i 29 tool dev

### Step 5: Aggiungi link interni nelle pagine tool

Per ogni tool non indicizzato:
- Trova 2-3 tool correlati che SONO indicizzati
- Aggiungi nel loro articolo SEO un link al tool non indicizzato
- Questo crea un percorso di crawling: Google trova tool indicizzato → segue link → trova tool non indicizzato

### Step 6: Ping Google

Dopo il deploy, esegui:
```bash
curl "https://www.google.com/ping?sitemap=https://toolkitonline.vip/sitemap.xml"
```

### Step 7: Report

Mostra:
- Numero tool non indicizzati per categoria
- Hub pages create/aggiornate
- Blog articoli generati
- Link interni aggiunti
- Prossimi step suggeriti
