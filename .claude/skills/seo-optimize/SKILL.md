---
name: seo-optimize
description: Optimize a tool's SEO based on real Google Search Console data
user-invocable: true
argument-hint: "[tool-slug]"
---

## SEO Optimize: ottimizzazione basata su dati reali

Ottimizza il tool `$0` usando dati reali da Google Search Console.

### Step 1: Raccogli dati GSC per il tool

1. Usa `mcp__google-search-console__get_search_analytics` con `dimensions: "query"` e filtra per le pagine che contengono `$0`
2. Raccogli per tutte le 6 varianti linguistiche: `/en/tools/$0`, `/it/tools/$0`, `/es/tools/$0`, `/fr/tools/$0`, `/de/tools/$0`, `/pt/tools/$0`
3. Identifica:
   - Quale variante linguistica performa meglio
   - Le top 10 query che portano impressioni
   - CTR attuale per ogni variante
   - Posizione media per ogni variante

### Step 2: Analizza e classifica il problema

**Se CTR basso (< 2%) con buone impressioni (> 50):**
→ Il problema è nei meta tag. Vai a Step 3A.

**Se posizione vicina a pagina 1 (8-20):**
→ Il problema è nel contenuto. Vai a Step 3B.

**Se posizione in calo rispetto alla baseline:**
→ Il contenuto è stale. Vai a Step 3C.

### Step 3A: Ottimizza Meta Tag

1. Leggi le entry correnti in `lib/translations.ts` per `$0`
2. Riscrivi `metaTitle` per ogni lingua:
   - Includi la keyword esatta più cercata (da dati GSC) all'inizio
   - Mantieni < 60 caratteri
   - Aggiungi un element di curiosità/benefit (es. "Free", "Instant", "2026")
3. Riscrivi `metaDescription`:
   - Includi la keyword principale + una secondaria
   - Aggiungi call-to-action ("Calculate now", "Try free")
   - Mantieni < 160 caratteri
4. Modifica `lib/translations.ts` con i nuovi valori

### Step 3B: Espandi Contenuto (per posizioni 8-20)

1. Leggi `app/[lang]/tools/$0/page.tsx`
2. Espandi l'articolo SEO:
   - Aggiungi 150-200 parole extra mirate alle query GSC reali
   - Integra le keyword esatte nel testo in modo naturale
   - Aggiungi 2-3 link interni ad altri tool correlati (usa `<a href="/{lang}/tools/[related-tool]">`)
3. Aggiungi 2-3 nuove domande FAQ:
   - Basate sulle query long-tail da GSC
   - Risposte di 50-80 parole con keyword
4. Ripeti per tutte le 6 lingue

### Step 3C: Refresh Contenuto Stale

1. Aggiorna l'articolo SEO con informazioni più recenti
2. Aggiungi riferimenti temporali (es. "nel 2026", "aggiornato")
3. Verifica che tutte le FAQ siano ancora rilevanti
4. Aggiungi 1-2 nuove FAQ

### Step 4: Verifica

1. Esegui `npx next build` per verificare che non ci siano errori
2. Mostra un riepilogo delle modifiche:
   - Prima/dopo dei meta tag
   - Parole aggiunte all'articolo SEO
   - FAQ aggiunte
   - Link interni aggiunti
3. Suggerisci di deployare con `/deploy`

### Step 5: Log ottimizzazione

Aggiorna `C:\Users\ftass\.claude\projects\C--Users-ftass-toolkit-online\memory\optimization-log.md` con:
```
## [DATA] - $0
- Tipo: [meta-tag | contenuto | refresh]
- Posizione pre: X
- Query target: [lista]
- Modifiche: [descrizione]
```
