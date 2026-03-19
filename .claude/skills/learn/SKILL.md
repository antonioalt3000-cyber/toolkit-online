---
name: learn
description: Self-learning loop that analyzes what worked, saves insights, and recommends next actions
user-invocable: true
---

## Learn: ciclo di apprendimento autodidatta

Questo è l'orchestratore principale del sistema autodidatta. Analizza i dati, confronta con lo storico, apprende cosa funziona, e raccomanda le prossime azioni.

### Step 1: Gather — Raccogli dati freschi

Esegui `/dashboard` per ottenere i dati GSC aggiornati.

### Step 2: Compare — Confronta con lo storico

1. Leggi `C:\Users\ftass\.claude\projects\C--Users-ftass-toolkit-online\memory\performance-history.md`
2. Calcola i delta settimana su settimana:
   - Δ impressioni totali
   - Δ click totali
   - Δ CTR medio
   - Δ posizione media
3. Per ogni tool ottimizzato (da `optimization-log.md`):
   - La posizione è migliorata dopo l'ottimizzazione?
   - Il CTR è migliorato dopo la riscrittura dei meta tag?
4. Per ogni tool creato di recente (da `growth-queue.md`):
   - Ha già impressioni? Dopo quanti giorni?
   - In quale lingua performa meglio?

### Step 3: Analyze — Identifica pattern

Analizza i dati per rispondere a queste domande:
1. **Quali categorie crescono più velocemente?** (impressioni per tool per categoria)
2. **Quale lingua performa meglio?** (CTR per lingua)
3. **Le ottimizzazioni SEO funzionano?** (confronta pre/post per ogni tool ottimizzato)
4. **Quali tool nuovi hanno guadagnato trazione velocemente?** (tempo da creazione a prima impressione)
5. **I blog articoli hanno aiutato l'indicizzazione?** (tool linkati sono ora indicizzati?)

### Step 4: Learn — Salva insight

Aggiorna `C:\Users\ftass\.claude\projects\C--Users-ftass-toolkit-online\memory\learnings.md` con nuovi insight:

```markdown
## [DATA] — Sessione di apprendimento

### Cosa funziona
- [es. "I tool finance hanno 3x più impressioni per tool rispetto ai tool images"]
- [es. "La lingua italiana genera il CTR più alto (0.5% vs 0.1% per le altre)"]
- [es. "L'ottimizzazione dei meta tag ha portato +30% CTR su fuel-cost-calculator"]

### Cosa non funziona
- [es. "I tool images hanno 0 impressioni dopo 30 giorni — probabilmente non indicizzati"]
- [es. "Gli articoli blog sulla categoria math non hanno generato traffico"]

### Pattern identificati
- [es. "I tool con FAQ > 5 domande rankano meglio"]
- [es. "I tool con articolo SEO > 400 parole hanno posizione media migliore"]

### Raccomandazioni strategiche
- [es. "Prossimo batch: 5 tool finance (categoria più forte)"]
- [es. "Scrivere 3 articoli blog su finance per boost indicizzazione"]
- [es. "Ottimizzare meta tag per tutti i tool con > 100 impressioni e CTR < 1%"]
```

### Step 5: Recommend — Suggerisci priorità sessione

Basandosi sui dati e sugli insight, presenta all'utente:

1. **TOP PRIORITY**: L'azione con il ROI più alto (es. "Ottimizza fuel-cost-calculator IT — a 1 posizione dalla prima pagina")
2. **CRESCITA**: Batch di nuovi tool da creare (basato su categorie vincenti e query GSC)
3. **INDICIZZAZIONE**: Azioni per migliorare il tasso di indicizzazione
4. **CONTENUTO**: Articoli blog da scrivere
5. **PROSSIMO CHECK**: Quando rifare l'analisi (suggerisci "tra 7 giorni per dare tempo a Google di recrawlare")

### Automazione

Il flusso ideale per ogni sessione è:
```
/learn → (analisi automatica) → utente sceglie priorità →
/seo-optimize [tool] o /auto-grow o /auto-blog o /index-boost →
/deploy → fine sessione
```

Questo crea un ciclo continuo: **dati → analisi → azione → misurazione → apprendimento**.
