---
name: auto-grow
description: Automatically suggests and creates new high-volume tools when a session starts
user-invocable: true
---

## Auto-Grow: crescita data-driven basata su dati reali

Sistema intelligente che usa dati Google Search Console per decidere quali tool creare.

### Step 1: Conta tool attuali

Leggi `lib/translations.ts` e conta i tool in `toolList`. Mostra il conteggio per categoria usando `getToolsByCategory()`.

### Step 2: Analizza dati GSC (se disponibile)

1. Usa `mcp__google-search-console__get_search_analytics` con `dimensions: "query"` per gli ultimi 28 giorni
2. Identifica query che portano impressioni ma NON hanno un tool corrispondente → domanda organica reale
3. Analizza quali categorie performano meglio (più impressioni per tool)

### Step 3: Prioritizza nuovi tool

Algoritmo di priorità:
- **Tier 1 — Domanda reale**: Query GSC che portano impressioni senza tool corrispondente
- **Tier 2 — Categoria forte**: Tool in categorie che performano bene (es. finance se ha più impressioni/tool)
- **Tier 3 — Gap categoria**: Categorie sottorappresentate (bilanciamento del portfolio)
- **Tier 4 — Alto volume generico**: Tool con alto volume di ricerca stimato

### Step 4: Aggiorna growth queue

Aggiorna `C:\Users\ftass\.claude\projects\C--Users-ftass-toolkit-online\memory\growth-queue.md` con:
```markdown
## Growth Queue — Aggiornata [DATA]
### Target: 200 tool entro Q2 2026

| # | Slug | Categoria | Fonte | Priorità | Stato |
|---|------|-----------|-------|----------|-------|
| 1 | [slug] | [cat] | [GSC/volume/gap] | [1-4] | queued |
```

### Step 5: Proponi batch

Presenta all'utente i top 10 tool raccomandati con:
- Slug e categoria
- Perché sono prioritari (fonte dati)
- Stima del potenziale

Chiedi all'utente quanti tool vuole creare e quali.

### Step 6: Esegui

Se l'utente approva, usa `/add-tools-batch [slug1,slug2,...] [category]` per creare i tool in parallelo.

### Step 7: Aggiorna stato

Dopo la creazione, aggiorna `growth-queue.md` cambiando lo stato dei tool creati da `queued` a `created`.

### Fallback (senza dati GSC)

Se GSC non è disponibile, usa questa lista statica di tool ad alto volume:

1. savings-goal-calculator (finance) — ~200K ricerche/mese
2. tip-splitting-calculator (finance) — ~100K ricerche/mese
3. reading-time-calculator (text) — ~80K ricerche/mese
4. heart-rate-zone-calculator (health) — ~150K ricerche/mese
5. bra-size-calculator (health) — ~500K ricerche/mese
6. shoe-size-converter (conversion) — ~300K ricerche/mese
7. yaml-formatter (dev) — ~100K ricerche/mese
8. sql-formatter (dev) — ~200K ricerche/mese
9. quadratic-equation-solver (math) — ~150K ricerche/mese
10. photo-collage-maker (images) — ~200K ricerche/mese
