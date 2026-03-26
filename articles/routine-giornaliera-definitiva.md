# Routine Giornaliera — 6 Business Online
> Ultima modifica: 26 marzo 2026

## Panoramica Settimanale

| Giorno | Ora (CET) | Attivita | Business | Piattaforma |
|--------|-----------|----------|----------|-------------|
| **LUN** | 09:00 | Analisi GSC + report | Tutti 6 | GSC, Analytics |
| **MAR** | 10:00 | Scrittura contenuti | Rotazione | Blog B0, Dev.to |
| **MER** | 10:00 | Pubblicazione social | Rotazione | Dev.to, LinkedIn, Quora |
| **GIO** | 10:00 | Check tecnico + Reddit | Tutti 6 | Vercel, Reddit |
| **VEN** | 10:00 | SEO upgrade + LinkedIn | B0 focus | GSC, LinkedIn, Quora |
| **SAB** | 20:00 | Pinterest pins | Rotazione | Pinterest |
| **DOM** | — | Riposo | — | — |

---

## LUNEDI — Analisi Settimanale (09:00 CET)

### Cosa fare:
1. Lancia `/learn` su B0 per analisi GSC automatica
2. Controlla metriche GSC per ogni sito:
   - toolkitonline.vip (B0)
   - captureapi.dev (B7)
   - complipilot.dev (F1)
   - fixmyweb.dev (F2)
   - paymentrescue.dev (F3)
   - parseflow.dev (F4)
3. Confronta con settimana precedente
4. Identifica: pagine in crescita, CTR basso con impressioni alte, nuove query
5. Scrivi 3 azioni prioritarie per la settimana

### Output: `memory/weekly-report-[data].md`

---

## MARTEDI — Content Creation (10:00 CET)

### Rotazione contenuti (ciclo 6 settimane):
| Settimana | Blog B0 | Dev.to | Focus |
|-----------|---------|--------|-------|
| 1 | Tool highlight | CaptureAPI article | B7 |
| 2 | Comparison page | CompliPilot article | F1 |
| 3 | SEO how-to | AccessiScan article | F2 |
| 4 | Calculator guide | ChurnGuard article | F3 |
| 5 | Developer tips | DocuMint article | F4 |
| 6 | Best-of listicle | ToolKit Online article | B0 |

### Cosa scrivere:
- **Blog B0**: 400+ parole, keyword da lunedi, 3 link interni
- **Dev.to**: 800+ parole, tecnico, link naturali ai nostri siti
- **LinkedIn**: 2 post per la settimana (200-500 char, link nei commenti)

### Articoli Dev.to gia pronti:
- `articles/devto-article-4-free-apis.md` — "5 Free APIs Every Developer Should Know"

---

## MERCOLEDI — Social Publishing (10:00-15:00 CET)

### Pubblicazioni:
| Ora | Piattaforma | Cosa | Regole |
|-----|------------|------|--------|
| 10:00 | LinkedIn | Post #1 settimana | Link nei COMMENTI, non nel post |
| 13:00 | Dev.to | Articolo (se pronto) | Max 4 tag, no martedi |
| 14:00 | Quora | 1 risposta | 90% informativo, 10% link |

### Template post LinkedIn:
```
[Hook di 1 riga che genera curiosita]

[3-5 righe di valore genuino]

[CTA soft: "Link in the first comment"]

#DevTools #SaaS #BuildInPublic
```

### Contenuti pronti: `articles/social-content-ready.md`

---

## GIOVEDI — Technical Check + Reddit (10:00 CET)

### Check tecnico (30 min):
```bash
# 1. Build B0
cd C:/Users/ftass/toolkit-online && npm run build

# 2. Check tutti i domini
for url in toolkitonline.vip captureapi.dev complipilot.dev fixmyweb.dev paymentrescue.dev parseflow.dev; do
  echo "$url: $(curl -sI https://$url | head -1)"
done
```

### Reddit (12:00-15:00 CET):
| Settimana | Subreddit | Business | Tipo post |
|-----------|-----------|----------|-----------|
| 1 | r/webdev | B0 | Show & Tell |
| 2 | r/SideProject | B7 | Journey/Launch |
| 3 | r/startups | F1 | Lessons learned |
| 4 | r/SaaS | F3 | Metrics/Journey |
| 5 | r/InternetIsBeautiful | B0 | Tool showcase |
| 6 | r/accessibility | F2 | Educational |

**Regola 90/10**: 9 interazioni genuine per 1 post promozionale

### Contenuti pronti: `articles/social-content-ready.md`

---

## VENERDI — SEO Upgrade + LinkedIn (10:00 CET)

### SEO (1 ora):
1. Prendi la pagina B0 con piu impressioni ma CTR < 3%
2. Riscrivi meta title + description (keyword esatte da GSC)
3. Aggiungi/migliora FAQ (3-5 domande basate su query GSC)
4. Aggiungi 2-3 internal links
5. Verifica build dopo le modifiche

### LinkedIn post #2 (16:00-17:00 CET)

### Quora (14:00-16:00 CET):
- Cerca domande recenti su: online tools, screenshot API, compliance, accessibility
- 1 risposta dettagliata con link naturale

### Fine settimana:
- Aggiorna `portfolio-state.md` con il lavoro della settimana

---

## SABATO — Pinterest (20:00-23:00 CET)

### Rotazione pin:
| Settimana | Business | Tipo pin |
|-----------|----------|----------|
| 1 | B0 | Infografica "Top 10 Online Tools" |
| 2 | B7 | Screenshot demo API |
| 3 | F1+F2 | Checklist compliance/accessibility |
| 4 | F3+F4 | Infografica payment recovery/doc parsing |

### Specifiche:
- **Formato**: 1000x1500px verticale (2:3)
- **Max**: 5 pin/giorno, intervallo 3h
- **Descrizione**: 150-220 char con keyword
- **Hashtag**: 2-5 per pin

---

## Directory — Azioni una tantum (da completare)

### Fatte:
- [x] SaaSHub — B7
- [x] Uneed — B7
- [x] Launching Next — B7
- [x] FutureTools — B0, B7, F1, F2, F4
- [x] StackShare — B7 (CaptureAPI)
- [x] DevHunt — B0

### Da fare (1 al giorno per limiti piattaforma):
- [ ] StackShare 27/3 → toolkitonline.vip (B0)
- [ ] StackShare 28/3 → complipilot.dev (F1)
- [ ] StackShare 29/3 → fixmyweb.dev (F2)
- [ ] StackShare 30/3 → paymentrescue.dev (F3)
- [ ] StackShare 31/3 → parseflow.dev (F4)
- [ ] BetaList — B7, F1 (serve signup)
- [ ] Peerlist — profilo + B7 (serve Google login)
- [ ] SaaSHub — +5 business (serve password recovery)
- [ ] Uneed — +5 business (serve login)

### Saltate (a pagamento):
- Futurepedia ($247), TopAI.tools ($47)

### Non funzionanti:
- ToolsForHumans (404), MicroLaunch (404), 1000tools (SSL)

---

## Profili Creati

| Piattaforma | Username | Stato | Bio |
|------------|----------|-------|-----|
| GitHub | antonioalt3000-cyber | ✅ | DevToolsmith bio + avatar |
| Dev.to | DevToolsmith | ✅ | Bio + avatar |
| Product Hunt | DevToolsmith | ✅ | Onboarding completo |
| Indie Hackers | devtoolsmith | ✅ | Account creato |
| StackShare | Antonio | ✅ | Login Google |
| Reddit | No-Worker-5959 | ✅ | Da aggiornare bio |

### Da creare:
- [ ] LinkedIn — profilo professionale
- [ ] Quora — account Google
- [ ] Pinterest Business — per SaaS

---

## Metriche KPI (target)

| Periodo | Metrica | Target |
|---------|---------|--------|
| Settimana 1-2 | Directory listing | 10+ |
| Mese 1 | Backlink totali | 20+ |
| Mese 1 | Impressioni GSC B0 | 3000+/settimana |
| Mese 2 | Reddit karma | 100+ |
| Mese 2 | Primo cliente pagante | 1 |
| Mese 3 | Product Hunt launch B7 | Top 10 del giorno |
