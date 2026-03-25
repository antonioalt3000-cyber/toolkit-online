---
paths:
  - ".claude/skills/deploy/**"
---

# Pre-Deploy Checklist

Prima di ogni deploy, verificare:
1. `npm run lint` → 0 errori
2. `npm run build` → compilazione OK
3. Traduzioni complete (6 lingue)
4. SEO article presente (300-400 parole)
5. FAQ accordion (4-5 domande)
6. Nessun console.log nel codice
7. Nessun tipo `any`
8. Validazione input presente
9. Copy/Reset button funzionanti
10. Layout max-w-2xl rispettato
11. ToolPageWrapper utilizzato
12. Tool registrato in toolList + getToolsByCategory()
