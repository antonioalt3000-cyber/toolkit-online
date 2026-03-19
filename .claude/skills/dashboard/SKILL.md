---
name: dashboard
description: Performance dashboard that queries GSC data, compares with baseline, and recommends priority actions
user-invocable: true
---

## Dashboard: analisi performance e raccomandazioni

All'inizio di ogni sessione, esegui questa analisi per capire lo stato del sito e decidere le priorità.

### Step 1: Raccogli dati GSC (ultimi 7 giorni)

1. Usa `mcp__google-search-console__get_search_analytics` con:
   - `date_range: "last_7_days"`
   - Metriche: clicks, impressions, ctr, position
2. Ripeti con `dimensions: "page"` per avere i dati per pagina
3. Ripeti con `dimensions: "query"` per avere le query di ricerca

### Step 2: Carica baseline

Leggi il file `C:\Users\ftass\.claude\projects\C--Users-ftass-toolkit-online\memory\performance-history.md` per confrontare con i dati precedenti.

### Step 3: Classifica le pagine in bucket

Per ogni pagina con dati, assegnala a uno o più bucket:

| Bucket | Criterio | Azione suggerita |
|--------|----------|------------------|
| **Near Page 1** | Posizione 8-20, impressioni > 30 | `/seo-optimize [slug]` — espandi contenuto |
| **High Impressions / Low CTR** | Impressioni > 50, CTR < 1% | Riscrivi metaTitle + metaDescription |
| **Losing Ground** | Posizione peggiorata vs baseline | Refresh contenuto |
| **Zero Visibility** | 0 impressioni dopo 30+ giorni | `/index-boost` — verifica indicizzazione |
| **Winners** | Posizione migliorata, click in aumento | Mantieni e replica il pattern |

### Step 4: Salva snapshot

Aggiorna `performance-history.md` con un nuovo snapshot:
```markdown
## [DATA ODIERNA]
- Total impressions: X
- Total clicks: X
- Avg CTR: X%
- Avg position: X
- Pages near page 1: [lista]
- High impressions/low CTR: [lista]
- Winners: [lista]
- Tools totali: X
- Pagine indicizzate stimate: X
```

### Step 5: Produci raccomandazioni

Presenta all'utente una lista prioritizzata:
1. **URGENTE** — Tool vicini a pagina 1 (posizione 8-20) da ottimizzare subito
2. **ALTO** — Tool con alto volume ma basso CTR (meta tag da riscrivere)
3. **MEDIO** — Nuovi tool da creare basati su query GSC senza tool corrispondente
4. **BASSO** — Tool con zero visibilità da investigare

Chiedi all'utente quale azione vuole eseguire per prima.
