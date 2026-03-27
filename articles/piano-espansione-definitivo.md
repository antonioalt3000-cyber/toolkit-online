# Piano di Espansione Definitivo — 7 Business
> Creato: 26 marzo 2026
> Aggiornato con ricerca approfondita piattaforme e routine completa

## TASK AUTOMATICI ATTIVI (9 scheduled tasks)

| Task | Quando | Cosa fa |
|---|---|---|
| `daily-marketing-routine` | Lun-Sab 09:00 | ROUTINE COMPLETA: email, health check, analytics, bug fix, promozione, espansione |
| `monday-analysis` | Lun 09:00 | Analisi GSC TUTTI i 6 siti + GA4 + Stripe + AdSense + competitor |
| `tuesday-content` | Mar 10:00 | Crea blog post B0 + SaaS |
| `thursday-technical` | Gio 10:00 | Build check, lint, deploy, uptime, security TUTTI i 7 business |
| `friday-content-upgrade` | Ven 10:00 | SEO upgrade 1 pagina + miglioramenti UX + Indie Hackers |
| `daily-social-promotion` | Lun-Sab 12:00 | Reminder contenuti social + check cosa manca |
| `afternoon-email-check` | Lun-Sab 16:00 | Check email urgente (deploy, vendite, sicurezza) |
| `pinterest-weekly` | Mar+Sab 20:00 | Crea pin Pinterest |
| `monthly-directory-check` | 1° del mese 10:00 | Verifica listing directory |

### Flusso giornaliero tipo:
```
09:00 — daily-marketing-routine (PRINCIPALE)
         ├── Email check
         ├── Health check tutti i siti
         ├── Analytics rapido
         ├── Bug check
         ├── Promozione del giorno (Reddit, LinkedIn, Quora, Dev.to, etc.)
         └── Report + suggerimenti espansione

12:00 — daily-social-promotion (REMINDER)
         └── Cosa hai fatto? Cosa manca?

16:00 — afternoon-email-check (URGENZE)
         └── Deploy falliti? Vendite? Problemi?

20:00 — pinterest-weekly (Mar+Sab)
         └── Crea e pubblica pin
```

### Nota: Se l'utente parte in ritardo
Tutto si scala automaticamente. Se dice "vai" alle 11:00, la routine parte alle 11:00. Nessuna azione persa.

### Autorizzazione Totale (26 marzo 2026)
L'utente ha autorizzato Claude ad eseguire TUTTA la routine senza chiedere.
Dettagli: `memory/pre-authorization-rules.md`

### Regola Anti-Loop
Max 2 tentativi per piattaforma. Errore 429/403/Cloudflare → STOP IMMEDIATO.
Mai insistere, mai rischiare ban. Documenta e passa avanti.
Dettagli: `memory/pre-authorization-rules.md`

### File di Riferimento Routine
| File | Cosa contiene |
|---|---|
| `memory/pre-authorization-rules.md` | Cosa posso fare senza chiedere + limiti tentativi |
| `memory/platform-access-playbook.md` | Come accedere a ogni piattaforma (13 piattaforme) |
| `articles/social-content-ready.md` | 13 contenuti pronti da pubblicare |
| `articles/piano-giornaliero-4-settimane.md` | Calendario dettagliato 4 settimane |
| `.claude/projects/.../memory/MEMORY.md` | Stato completo portfolio + regole |
| `portfolio-state.md` | Stato live tutti i 7 business |

---

## MAPPA COMPLETA: Piattaforme × Business

### A) ONE-TIME (registra e dimentica) — Backlink permanenti

| Piattaforma | B0 | B7 | F1 | F2 | F3 | F4 | PA | Stato |
|---|---|---|---|---|---|---|---|---|
| SourceForge | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ 26/3 |
| SaaSHub | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | — | +5 da fare |
| FutureTools | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | ✅ fatto |
| StackShare | — | ✅ | ❌ | ❌ | ❌ | ❌ | — | 1/giorno |
| DevHunt | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | — | +5 da fare |
| AlternativeTo | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | — | +5 da fare |
| Uneed | — | ✅ | ❌ | ❌ | ❌ | ❌ | — | +5 da fare |
| LaunchingNext | — | ✅ | ❌ | ❌ | ❌ | ❌ | — | +5 da fare |
| BetaList | — | ❌ | ❌ | ❌ | ❌ | ❌ | — | Serve password |
| Slant.co | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | NUOVO |
| GitHub Awesome Lists | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | NUOVO - ALTA PRIORITA |

### B) LAUNCH (una volta, ma con preparazione)

| Piattaforma | Business | Quando | Prep necessaria |
|---|---|---|---|
| Product Hunt | F2 AccessiScan | Settimana 4 (aprile) | 2 sett. di preparazione |
| Product Hunt | F1 CompliPilot | Maggio | Dopo F2 |
| Product Hunt | B7 CaptureAPI | Giugno | Dopo F1 |
| Hacker News (Show HN) | B0 ToolKit Online | Settimana 3 | Karma HN + post tecnico |
| Hacker News (Show HN) | B7 CaptureAPI | Settimana 5 | Articolo architettura |

### C) RICORRENTI (pubblicita' giornaliera/settimanale)

| Piattaforma | Frequenza | Rischio | Business | ROI |
|---|---|---|---|---|
| Reddit | 5 commenti/giorno + 1 post/sett | MEDIO | Tutti 7 | ALTO (se virale) |
| LinkedIn | 3 post/settimana | BASSO | F1,F3,B7 (B2B) | ALTO per lead |
| Quora | 1 risposta/giorno (lun-ven) | BASSO | Tutti 7 | MEDIO-ALTO (SEO) |
| Dev.to | 1 articolo/settimana | BASSO | B0,B7,F1-F4 | ALTO (backlink dofollow) |
| Medium | 1 articolo/settimana | BASSO | F1,PA,B7 | MEDIO |
| Pinterest | 3-5 pin/giorno | BASSO | PA(70%)+B0(20%)+SaaS(10%) | ALTO per PA |
| Hashnode | 1 articolo/2 settimane | ZERO | B7,F2,F4 | MEDIO (cross-post) |
| Indie Hackers | 1 post/settimana | BASSO | B7,F1-F4 | MEDIO (networking) |

---

## QUICK WINS — Settimana 1-2 (effort basso, impatto alto)

### GitHub Awesome Lists (BACKLINK DA DA-100!)
PR una tantum — backlink permanente dofollow dal dominio piu autorevole del web.

| Lista | Business | Repo |
|---|---|---|
| awesome-accessibility | F2 | github.com/brunopulis/awesome-a11y |
| awesome-web-scraping | B7 | github.com/AchoArnold/discount-for-student-dev |
| awesome-developer-tools | B7+B0 | varie |
| awesome-free-tools | B0 | varie |
| awesome-saas | Tutti SaaS | github.com/topics/awesome-saas |
| awesome-ai | F1 | github.com/topics/awesome-ai |
| free-for-dev | B0+B7 | github.com/ripienaar/free-for-dev |

### Slant.co (SEO passivo)
Aggiungi prodotti come "alternative" nelle categorie:
- "Best screenshot API?" → B7
- "Best free online tools?" → B0
- "Best accessibility testing tools?" → F2
- "Best compliance tools?" → F1

### r/InternetIsBeautiful (potenziale virale)
1 post per B0: "140+ privacy-first tools in 6 languages"
- Potenziale: 50K-500K visite in 48h
- Richiede: account con 100+ karma e 30+ giorni

---

## CALENDARIO SETTIMANALE DEFINITIVO

### LUNEDI — Analisi + Community Building
| Ora | Azione | Business | Piattaforma | Tempo |
|-----|--------|----------|-------------|-------|
| 09:00 | Analisi GSC + GA4 + email check | Tutti 7 | Google | 30min |
| 10:00 | Reddit: 5 commenti genuini | — | Reddit | 30min |
| 11:00 | Quora: 1 risposta (rotazione) | Rotazione | Quora | 20min |
| 12:00 | Pinterest: 3-5 pin | PA(3)+B0(1)+SaaS(1) | Pinterest | 30min |

### MARTEDI — Content Day (LinkedIn + Medium)
| Ora | Azione | Business | Piattaforma | Tempo |
|-----|--------|----------|-------------|-------|
| 09:00 | LinkedIn post (rotazione) | Rotazione | LinkedIn | 15min |
| 10:00 | Reddit: 5 commenti genuini | — | Reddit | 30min |
| 13:00 | Medium: scrivi/pubblica articolo | Rotazione | Medium | 60min |
| 14:00 | Quora: 1 risposta | Rotazione | Quora | 20min |

### MERCOLEDI — Content Day (LinkedIn + Dev.to)
| Ora | Azione | Business | Piattaforma | Tempo |
|-----|--------|----------|-------------|-------|
| 09:00 | LinkedIn post (rotazione) | Rotazione | LinkedIn | 15min |
| 10:00 | Reddit: 5 commenti genuini | — | Reddit | 30min |
| 13:00 | Dev.to: pubblica articolo tecnico | Rotazione | Dev.to | 60min |
| 14:00 | Quora: 1 risposta | Rotazione | Quora | 20min |
| 15:00 | Hashnode cross-post (ogni 2 sett.) | Rotazione | Hashnode | 10min |

### GIOVEDI — Tech Check + Community
| Ora | Azione | Business | Piattaforma | Tempo |
|-----|--------|----------|-------------|-------|
| 09:00 | Check tecnico: build, deploy, uptime | Tutti 7 | Vercel | 20min |
| 10:00 | Reddit: 5 commenti + 1 post (da sett.3) | Rotazione | Reddit | 40min |
| 12:00 | Pinterest: 3-5 pin | PA(3)+SaaS(2) | Pinterest | 30min |
| 14:00 | Quora: 1 risposta | Rotazione | Quora | 20min |
| 15:00 | LinkedIn post (rotazione) | Rotazione | LinkedIn | 15min |

### VENERDI — SEO + Indie Hackers
| Ora | Azione | Business | Piattaforma | Tempo |
|-----|--------|----------|-------------|-------|
| 10:00 | SEO upgrade: 1 pagina (CTR basso) | Rotazione | GSC | 45min |
| 12:00 | Pinterest: 3-5 pin | PA(3)+B0(2) | Pinterest | 30min |
| 14:00 | Quora: 1 risposta | Rotazione | Quora | 20min |
| 16:00 | Indie Hackers: milestone/update | SaaS focus | IH | 20min |

### SABATO — Pinterest Batch + PA Upload
| Ora | Azione | Business | Piattaforma | Tempo |
|-----|--------|----------|-------------|-------|
| 12:00 | Pinterest: 5 pin batch | PA(4)+B0(1) | Pinterest | 30min |
| 15:00 | Upload prodotti PA | PA | Payhip/Gumroad | 30min |

### DOMENICA — RIPOSO

### Tempo totale: ~9.5 ore/settimana

---

## ROTAZIONI DETTAGLIATE

### Rotazione Quora (ciclo 2 settimane, 10 risposte)
| # | Business | Domanda tipo |
|---|---|---|
| 1 | B0 | "Best free online tools for developers?" |
| 2 | B7 | "Best free screenshot API?" |
| 3 | F1 | "How to comply with EU AI Act?" |
| 4 | F2 | "How to test WCAG accessibility?" |
| 5 | F3 | "How to reduce SaaS payment churn?" |
| 6 | F4 | "Best document parsing API?" |
| 7 | PA | "Best ADHD planner printables?" |
| 8 | B0 | "Best free online calculators?" |
| 9 | B7 | "How to generate PDF from URL?" |
| 10 | B0 | "Alternatives to SmallSEOTools?" |

### Rotazione Dev.to (ciclo 7 settimane)
| Sett | Business | Articolo |
|------|----------|----------|
| 1 | B7 | "5 Free APIs Every Developer Should Know" ✅ FATTO |
| 2 | F1 | "How I Built an EU AI Act Compliance Scanner" |
| 3 | F2 | "201 WCAG Checks: Building an Accessibility Scanner" |
| 4 | B0 | "Building 900 Pages with Programmatic SEO in Next.js" |
| 5 | F3 | "Reducing Payment Churn with Automated Dunning" |
| 6 | F4 | "Parsing PDFs to JSON: A Developer's Guide" |
| 7 | B0 | "The Complete Guide to Client-Side Web Tools" |

### Rotazione LinkedIn (ciclo 3 settimane, 3 post/sett)
| Sett | Mar | Gio | Ven |
|------|-----|-----|-----|
| 1 | B0 (SEO lessons) | B7 (build in public) | PA (digital products) |
| 2 | F1 (EU AI Act) | F2 (accessibility) | B0 (programmatic SEO) |
| 3 | F3 (payment churn) | F4 (doc parsing) | B7 (API lessons) |

### Rotazione Medium (ciclo 6 settimane)
| Sett | Business | Topic |
|------|----------|-------|
| 1 | B0 | "Top 10 Free Online Tools Every Developer Needs" |
| 2 | PA | "Best ADHD Planners & Printables 2026" |
| 3 | B7 | "Why Every SaaS Needs a Screenshot API" |
| 4 | F1+F2 | "EU Compliance 2026: AI Act + Accessibility" |
| 5 | PA | "How I Created 200+ Digital Products with Automation" |
| 6 | F3 | "The Hidden Revenue Leak: Failed Payments" |

### Rotazione Reddit Post (da settimana 3, 1/sett)
| Sett | Subreddit | Business | Post |
|------|-----------|----------|------|
| 3 | r/webdev | B0 | "I built 140+ free browser tools" |
| 3 | r/SideProject | B7 | "My screenshot API side project" |
| 4 | r/InternetIsBeautiful | B0 | "140+ privacy-first tools" |
| 4 | r/selfhosted | B7 | "Screenshot API architecture" |
| 5 | r/startups | Tutti | "5 SaaS in 3 months" |
| 5 | r/ADHD | PA | "Free ADHD planner printables" |
| 6 | r/accessibility | F2 | "201 WCAG checks" |
| 6 | r/SaaS | F3 | "Failed payments cost 9% revenue" |

---

## PRIORITA' PER FASE

### Fase 1: Foundation (Settimane 1-2)
**Obiettivo:** Costruire presenza base, karma, e quick wins
1. Reddit karma building (5 commenti/giorno) — NO post ancora
2. Pinterest pin giornalieri (PA focus)
3. LinkedIn 3x/settimana
4. Quora 1/giorno
5. GitHub Awesome Lists PR (backlink DA-100)
6. Slant.co listings
7. Dev.to 1 articolo/settimana

### Fase 2: Content Engine (Settimane 3-4)
**Obiettivo:** Produzione contenuti costante + primi post Reddit
1. Primi post Reddit (r/webdev, r/SideProject)
2. Medium 1/settimana (candidatura a publications)
3. Indie Hackers settimanale
4. Hashnode cross-post
5. Preparazione Product Hunt launch F2

### Fase 3: Launches (Settimane 5-8)
**Obiettivo:** Lanci grossi per massimo impatto
1. Product Hunt launch F2 (AccessiScan)
2. Hacker News Show HN (B0 o B7)
3. r/InternetIsBeautiful (B0) — potenziale virale
4. BetaList submissions

### Fase 4: Scale (Mesi 2-3)
**Obiettivo:** Scalare cio che funziona, eliminare cio che non funziona
1. Product Hunt launch F1, poi B7
2. StackOverflow reputation building
3. Medium publication submissions
4. Analisi ROI per piattaforma → raddoppia dove funziona

---

## KPI E OBIETTIVI

| Piattaforma | Mese 1 | Mese 2 | Mese 3 |
|---|---|---|---|
| Reddit | 100 karma | 500 karma, 3 post | 1000 karma |
| LinkedIn | 50 connessioni | 200, 1K imp/post | 500 conn |
| Quora | 20 risposte | 50, 5K views | 100, 20K views |
| Dev.to | 4 articoli | 8, 100 follower | 12, 500 follower |
| Medium | 4 articoli | 8, publication | 12 articoli |
| Pinterest | 60 pin, 3 board | 120 pin, 6 board | 200 pin, 10K imp |
| Hashnode | 2 articoli | 4 articoli | 6 articoli |
| IH | 4 post | 8, 50 follower | 12 post |
| Backlink totali | 20+ | 40+ | 60+ |
| Product Hunt | — | 1 lancio | 2 lanci |
| Primo cliente pagante | — | 1 | 5+ |

---

## REGOLE DI SICUREZZA (rischio ZERO)

1. MAI automatizzare Reddit, HN, StackOverflow — ban permanente
2. Un solo account per piattaforma
3. MAI chiedere upvote — specialmente su PH e HN
4. Contenuto DIVERSO per ogni piattaforma — mai cross-post identico
5. Reddit: 90/10 — 9 commenti genuini per 1 post promozionale
6. Quora: link solo alla fine, come "bonus", non come focus
7. LinkedIn: link nei COMMENTI, mai nel post
8. Pinterest: max 5 pin/giorno, intervallo 3h
9. Product Hunt: 1 lancio/prodotto, 3-4 settimane tra lanci
10. MAI menzionare AdSense o monetizzazione nei post pubblici
