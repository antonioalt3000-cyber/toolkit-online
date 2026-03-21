---
description: Create multiple new tools at once using parallel agents
argument-hint: "[tool1,tool2,tool3,...] [category]"
---

Create a batch of new tools for ToolKit Online. Parse $ARGUMENTS to get the tool slugs and category.

## Steps:

1. **Parse input**: Split the comma-separated tool slugs from $ARGUMENTS[0], category from $ARGUMENTS[1]

2. **Leggi un tool esistente di riferimento** della stessa categoria — usa come template

3. **Launch parallel agents**: Use the Agent tool to create tools in parallel (max 4-5 agents at once)
   Each agent MUST:
   - Leggere PRIMA un tool esistente simile come riferimento
   - Create the page at `app/[lang]/tools/[slug]/page.tsx` with full functionality
   - Include ToolPageWrapper, SEO article (300-400 words), FAQ (4-5 questions)
   - Translate everything in 6 languages
   - Include: copy button, reset button, input validation, colored result cards
   - NO `any` types, NO `console.log`
   - 2-3 internal links ad altri tool correlati

4. **Update translations.ts**: Add all new tools to the `tools` object and `getToolsByCategory()` and `toolList`

5. **Quality Gate (OBBLIGATORIO):**
   ```bash
   npm run lint
   npm run build
   ```
   - Se lint fallisce → FIXA immediatamente
   - Se build fallisce → FIXA immediatamente
   - Ri-esegui finché ENTRAMBI passano

6. **Verifica rapida traduzioni**: per ogni tool, controlla che tutte le 6 lingue siano presenti in translations.ts

7. **Report finale**: Mostra per ogni tool:
   - ✅ / ❌ Build status
   - ✅ / ❌ Lint status
   - ✅ / ❌ Traduzioni 6 lingue
   - URL per tutte le lingue

## Regole:
- **MAI** saltare il quality gate
- **MAI** lasciare errori per l'utente
- Se un agent produce codice con errori, FIX prima di procedere
- Ogni tool deve essere COMPLETO e funzionale al primo tentativo
