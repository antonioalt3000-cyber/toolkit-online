---
description: Scansione automatica qualità codice. Esegui SEMPRE dopo aver creato/modificato tool o componenti. Trova errori, tipi any, console.log, traduzioni mancanti, e problemi di build PRIMA che l'utente debba chiederlo.
---

# Quality Check — Controllo Qualità Automatico

Esegui un controllo qualità completo sul codice modificato.

## Step 1: Identifica i file modificati
Usa `git diff --name-only` per trovare i file cambiati. Se non ci sono diff, chiedi all'utente quale file controllare.

## Step 2: Controlli automatici (esegui TUTTI)

### 2a. TypeScript Compilation
```bash
npx tsc --noEmit 2>&1 | head -50
```
Se ci sono errori, FIXALI immediatamente.

### 2b. ESLint
```bash
npm run lint 2>&1 | head -50
```
Se ci sono errori, FIXALI immediatamente.

### 2c. Build Test
```bash
npm run build 2>&1 | tail -20
```
Se fallisce, FIXA immediatamente.

## Step 3: Controlli manuali (leggi i file e verifica)

Per ogni file .tsx/.ts modificato, verifica:

1. **Tipi `any`**: cerca `: any` — sostituisci con tipo esplicito
2. **console.log**: cerca `console.log` — rimuovi o sostituisci con commento
3. **Import inutilizzati**: controlla che ogni import sia usato
4. **Traduzioni**: se è un tool, verifica che TUTTE le 6 lingue abbiano le traduzioni in translations.ts
5. **Validazione input**: ogni input utente deve avere validazione con messaggio errore
6. **Edge cases**: cosa succede con input vuoto? Numero negativo? Stringa troppo lunga?
7. **Copy button**: presente e funzionante?
8. **Reset button**: presente e funzionante?
9. **SEO article**: 300-400 parole in 6 lingue?
10. **FAQ**: 4-5 domande con risposte?
11. **Internal links**: almeno 2 link ad altri tool?
12. **toolList + getToolsByCategory()**: tool registrato?

## Step 4: Report finale

Mostra un report con:
- ✅ Check passati
- ❌ Problemi trovati (con fix suggerito)
- ⚠️ Warning (non bloccanti)

Se ci sono ❌, FIXA tutto prima di dichiarare il task completo.

## Importante
- NON dichiarare mai "tutto ok" senza aver ESEGUITO i comandi
- NON saltare step — eseguili TUTTI
- Se un fix causa un nuovo errore, ri-esegui i controlli
- Solo quando TUTTO è verde, il check è completo

$ARGUMENTS
