---
paths:
  - "app/[lang]/tools/**"
---

# Tool Creation Rules

## Struttura obbligatoria per ogni tool
- File: `app/[lang]/tools/[tool-name]/page.tsx` con `'use client'`
- Traduzioni: `lib/translations.ts` nell'oggetto `tools` E in `getToolsByCategory()`
- Layout: max-w-2xl, ToolPageWrapper
- SEO article: 300-400 parole x 6 lingue
- FAQ accordion: 4-5 domande
- Internal links: 2-3 link ad altri tool correlati

## Checklist qualita' tool
- Validazione input con messaggio errore visibile
- Copy button + Reset button
- Stati errore colorati (rosso)
- NO `any`, NO `console.log`, NO stringhe hardcoded
- Funzioni max 40 righe
- Edge cases: input vuoto, numeri negativi, valori estremi

## Traduzioni
Tutte le 6 lingue: IT, EN, ES, FR, DE, PT
