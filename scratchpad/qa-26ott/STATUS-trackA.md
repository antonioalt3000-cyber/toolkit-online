# Traccia A — stato (27 ott 2026)

## Sessione 26 ott (riepilogo): 9 PR mergiate/deployate — vedi reports/qa-10saas-26ott-2026.md

## Sessione 27 ott — ripresa su richiesta "continua con i claim di recupero PaymentRescue e le og:image mancanti"

### PR mergiate oggi

| Repo                       | PR  | Commit  | Contenuto                                                                                                                                                                                                         |
| -------------------------- | --- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| churnguard (PaymentRescue) | #76 | ee4b968 | 8 affermazioni di recupero incoerenti allineate a 30-50%, 5 case study inventate in llms-full.txt sostituite, tabella concorrenti senza fonte rimossa, test di guardia generalizzato (non più blocklist di frasi) |
| documint (ParseFlow)       | #76 | 229700a | og:image su 4 pagine (case-studies, free, playground, blog/pdf-parsing-guide)                                                                                                                                     |
| churnguard (PaymentRescue) | #77 | 51bfc94 | og:image su 5 pagine (calculator, free, pricing, recovery, tools/churn-predictor)                                                                                                                                 |

### PR in attesa CI

| Repo             | PR   | Contenuto                                                                                    |
| ---------------- | ---- | -------------------------------------------------------------------------------------------- |
| capture-api (B7) | #106 | og:image su 2 pagine (free, screenshot-api) — esteso layout-share-metadata.test.ts esistente |

## Scoperta chiave di oggi

Il pattern "declaring own openGraph loses the file-based image" **non vale per il segmento radice** (app/page.tsx + app/opengraph-image.tsx nella stessa cartella): verificato empiricamente che l'home di ParseFlow mantiene l'og:image anche dichiarando un proprio openGraph senza `images`. I guard test di F1/F2 escludevano già correttamente root page.tsx/layout.tsx — comportamento corretto, solo non documentato esplicitamente finora.

Su B7 CaptureAPI non esiste un file `app/opengraph-image.tsx` — l'immagine è generata da una route dinamica `/api/v1/og` e cablata esplicitamente in `layout.tsx` via `OG_IMAGE_URL`/`OG_IMAGE_ALT`. Stesso bug (openGraph proprio sovrascrive quello del layout), fix diverso (aggiungere `images:` con l'URL dinamico, non una costante file-based).

## Da fare (prossimo giro)

1. Verificare deploy prod delle 4 PR di oggi (health check + curl og:image diretto).
2. Mergiare capture-api#106 quando la CI è verde.
3. **Rimasto dal round 26 ott, non ancora toccato**:
   - ParseFlow `/redeem` bottone "Activate Enterprise Plan" a 3.62:1 (sotto AA) — stesso pattern --on-brand o colore diretto.
   - EmailGuard: card demo mostra "MX records ✕" su sintassi non valida anche quando il controllo MX non è stato eseguito.
   - CardForge: playground mai testato in produzione.
   - Viaggio cliente autenticato completo (signup→email→redeem→checkout→webhook→guasto Redis→cancellazione) — nessuno dei 10 SaaS testato end-to-end in locale.
   - Suite/tsc/lint non rieseguiti su EmailGuard, SEOScope, CardForge dopo il 20 ott.
4. Alert solo-dev (tinypool critical + vite high su tutti i 10 repo) — mai affrontati, proporre come sessione separata.

## Note tecniche

- `next build | head` → SIGPIPE, build senza BUILD_ID. Mai farlo.
- `example.com` non risolve da questa macchina.
- Harness persistente: `toolkit-online/scratchpad/qa-infra/`. launch.json ha `qa26-<saas>-prodbuild` per f1,f2,f3,f4,hsh,hkl,b7.
