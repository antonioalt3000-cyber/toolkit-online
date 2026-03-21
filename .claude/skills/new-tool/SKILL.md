---
description: Create a new tool with full translations, SEO content, and FAQ
argument-hint: "[tool-slug] [category]"
---

Create a new tool for ToolKit Online. The tool slug is $ARGUMENTS[0] and the category is $ARGUMENTS[1].

## Step 0: Preparazione (MAI saltare!)
1. **Leggi un tool esistente simile** per capire il pattern esatto:
   - Leggi la struttura di almeno 1 tool della stessa categoria
   - Nota: import, componenti usati, stili Tailwind, struttura traduzioni
2. **Pianifica edge cases** prima di scrivere codice:
   - Input vuoto → mostra placeholder, non errore
   - Numeri negativi → validazione con messaggio
   - Valori estremi → limiti ragionevoli
   - Caratteri speciali → gestione sicura

## Step 1: Crea il tool page
File: `app/[lang]/tools/$0/page.tsx`

**Requisiti OBBLIGATORI** (checklist):
- [ ] `'use client'` in prima riga
- [ ] Import ToolPageWrapper da @/components/ToolPageWrapper
- [ ] useState e useParams
- [ ] Tool UI interattivo e funzionale
- [ ] **Copy button** con navigator.clipboard + feedback visivo
- [ ] **Reset button** che pulisce tutti gli stati
- [ ] **Validazione input** con messaggi di errore colorati (rosso)
- [ ] **Risultati in card colorate** (bg-green-50, bg-blue-50, etc.)
- [ ] **Nessun `any` type** — tutti tipi espliciti
- [ ] **Nessun `console.log`** nel codice
- [ ] SEO article (300-400 parole) in 6 lingue (en, it, es, fr, de, pt)
- [ ] FAQ accordion (4-5 domande) targeting long-tail keywords
- [ ] **2-3 internal links** ad altri tool correlati
- [ ] Wrap in `<ToolPageWrapper toolSlug="$0">`
- [ ] Layout max-w-2xl
- [ ] Funzioni max 40 righe (spezza in helper functions se necessario)

## Step 2: Aggiungi traduzioni
File: `lib/translations.ts`

- [ ] Entry nell'oggetto `tools` con: name, description, metaTitle, metaDescription × 6 lingue
- [ ] Slug aggiunto nell'array corretto in `getToolsByCategory()`
- [ ] Slug aggiunto in `toolList`
- [ ] metaTitle: include keyword principale + "Online" + "Free/Gratis"
- [ ] metaDescription: include CTA + keyword varianti

## Step 3: Auto-revisione (OBBLIGATORIA — falla TU, non l'utente!)

### 3a. Rileggi TUTTO il codice generato
Cerca attivamente:
- Import mancanti o non usati
- Traduzioni mancanti in qualsiasi delle 6 lingue
- Bottoni senza onClick handler
- Stati di errore non gestiti
- Stili Tailwind inconsistenti con gli altri tool
- Variabili non utilizzate
- Funzioni che non returnano nulla

### 3b. Test mentale — simula l'uso
1. L'utente apre il tool → cosa vede? (placeholder, istruzioni chiare?)
2. L'utente non inserisce nulla e clicca calcola → errore gestito?
3. L'utente inserisce valori validi → risultato corretto?
4. L'utente clicca copy → feedback visivo?
5. L'utente clicca reset → tutto pulito?
6. L'utente cambia lingua → traduzioni corrette?

### 3c. Esegui verifiche automatiche
```bash
npm run lint
npm run build
```
Se FALLISCE → **fixa subito**, non lasciare all'utente.

## Step 4: Report finale
Mostra:
- ✅ URL del tool per tutte le 6 lingue
- ✅ Conferma build OK
- ✅ Conferma lint OK
- ✅ Checklist completata al 100%

## Regole FERREE:
- **MAI** dire "tutto ok" senza aver eseguito lint e build
- **MAI** lasciare errori all'utente da fixare
- **MAI** usare `any` type
- **MAI** lasciare console.log
- **MAI** saltare la fase di auto-revisione
- Se il build fallisce, FIX e ri-esegui finché non passa
