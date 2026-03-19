---
name: auto-blog
description: Generate SEO blog articles based on GSC data that link to tool pages for indexation boost
user-invocable: true
argument-hint: "[topic or category]"
---

## Auto-Blog: genera articoli SEO basati su dati reali

Genera articoli blog ottimizzati che linkano a pagine tool per boost di indicizzazione e traffico.

### Step 1: Identifica topic ad alto potenziale

Se viene fornito un argomento, usalo. Altrimenti:
1. Usa `mcp__google-search-console__get_search_analytics` con `dimensions: "query"` per le top query
2. Raggruppa le query per cluster tematico (es. tutte le query su "percentage", "BMI", "converter")
3. Identifica cluster con alte impressioni ma pochi click → opportunità di contenuto
4. Incrocia con i tool non indicizzati (priorità a chi ha bisogno di link interni)

### Step 2: Genera l'articolo

Per il topic scelto, genera un articolo in tutte le 6 lingue (en, it, es, fr, de, pt):
- **Titolo**: keyword-rich, es. "How to Calculate [X]: Complete Guide with Free Online Tool"
- **Lunghezza**: 800-1500 parole per lingua
- **Struttura**:
  1. Introduzione con la keyword nel primo paragrafo
  2. Sezioni H2 che coprono aspetti del topic
  3. Link a 5-10 tool pages con anchor text descrittivo (es. `<Link href="/{lang}/tools/bmi-calculator">calcola il tuo BMI gratuitamente</Link>`)
  4. FAQ section (3-5 domande) con FAQ schema
  5. Conclusione con CTA
- **SEO**: metaTitle < 60 char, metaDescription < 160 char, keyword nel primo H1

### Step 3: Aggiungi a lib/blog.ts

1. Leggi `lib/blog.ts` per capire la struttura degli articoli esistenti
2. Aggiungi il nuovo articolo con:
   - slug unico
   - date: data odierna
   - category appropriata
   - excerpt in 6 lingue
   - content completo in 6 lingue
3. Il blog index e la sitemap si aggiornano automaticamente

### Step 4: Aggiorna content calendar

Aggiorna `C:\Users\ftass\.claude\projects\C--Users-ftass-toolkit-online\memory\content-calendar.md` con:
```
| Data | Titolo | Tool linkati | Stato |
|------|--------|-------------|-------|
| [oggi] | [titolo] | [lista slug] | pubblicato |
```

### Step 5: Cross-posting (opzionale)

Se l'utente lo richiede, usa `/publish-article` per cross-postare su Dev.to con:
- Link canonical al blog di toolkitonline.vip
- Tag appropriati per la community Dev.to

### Step 6: Verifica

1. `npx next build` deve passare
2. Verifica che il nuovo articolo appaia nella sitemap
3. Mostra l'URL dell'articolo per tutte le 6 lingue
