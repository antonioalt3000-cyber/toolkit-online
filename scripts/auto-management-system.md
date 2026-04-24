# SISTEMA DI AUTOGESTIONE COMPLETO
> Eseguito automaticamente da /boss ad ogni sessione
> Aggiornato: 3 aprile 2026

## FLUSSO COMPLETO — Ogni sessione /boss

```
STEP 1: MONITOR (check tutto)
├── Gmail: risposte outreach, DM Reddit, Capterra/G2, RapidAPI, bounce
├── Reddit: notifiche DM (via Gmail notification)
├── DealMirror: stato listing
├── Uneed: stato submission
├── Script: node monitor-responses.js
└── Output: report con azioni necessarie

STEP 2: RESPOND (rispondi a tutto)
├── Email risposte umane → crea draft personalizzato
├── Reddit DM lavori → login via magic link, rispondi con quote
├── Marketplace update → segui istruzioni
└── Bounce → rimuovi da CONTACTS_REGISTRY.md

STEP 3: PUBLISH (pubblica contenuti in coda)
├── bash daily-routine.sh
│   ├── Email outreach (2-5/giorno)
│   ├── Contenuti Hashnode/Dev.to (quando schedulati)
│   ├── Bluesky posts (quando schedulati)
│   └── monitor-responses.js (alla fine)
└── Verifica: tutto pubblicato OK

STEP 4: REFILL (riempi code vuote)
├── Email < 10? → Cerca 50 contatti VERIFICATI, genera email
├── Contenuti < 2? → Scrivi 2 articoli pillar (1200+ parole)
├── Bluesky < 5? → Crea 6 post
├── Reddit > 7 giorni dall'ultimo? → Nuovo post [For Hire]
└── Aggiorna CONTACTS_REGISTRY.md

STEP 5: GROW (espandi canali)
├── Iscriviti a nuove piattaforme (1 per sessione)
├── Submetti tool su marketplace (Uneed, DealMirror, etc.)
├── Cerca bounty su Algora/IssueHunt
└── Cerca job su Upwork/Freelancer da proporre

STEP 6: REPORT (aggiorna stato)
├── portfolio-state.md con numeri sessione
├── SHARED.md con lezioni apprese
├── CONTACTS_REGISTRY.md con nuovi contatti
└── Comunica all'utente cosa è successo
```

## CANALI ATTIVI E COME MONITORARLI

### 1. Email Outreach (Brevo SMTP)
- **Monitor**: Gmail MCP query per risposte
- **Query**: `(subject:re:) (to:hello@fixmyweb.dev OR to:hello@captureapi.dev OR to:hello@complipilot.dev OR to:hello@paymentrescue.dev OR to:hello@parseflow.dev) -from:mailer-daemon after:LAST_SESSION_DATE`
- **Azione risposte**: Draft risposta personalizzata via Gmail MCP
- **Refill**: 50 email verificate per sessione

### 2. Reddit r/forhire
- **Post attivo**: https://www.reddit.com/r/forhire/comments/1sbn8hr/
- **Monitor DM**: Gmail query `from:reddit (subject:message OR subject:sent) after:LAST_SESSION_DATE`
- **Login**: Magic link (email → Gmail MCP → click nel browser)
- **Repost**: Ogni 7 giorni (prossimo: 10 aprile 2026)
- **Azione DM**: Rispondi con quote usando template da check-responses.md

### 3. RapidAPI (B7 + F4)
- **B7**: https://rapidapi.com/antonioalt3000/api/captureapi
- **F4**: https://rapidapi.com/antonioalt3000/api/documint-pdf-extractor
- **Monitor**: Gmail query `from:rapidapi after:LAST_SESSION_DATE`
- **Azione**: Monitorare nuovi subscriber e usage

### 4. DealMirror (in corso)
- **Contatto**: pratyush@dealmirror.com
- **Stato**: Draft risposta pronta con pricing LTD $49/$99/$199
- **Monitor**: Gmail query `from:dealmirror after:LAST_SESSION_DATE`
- **Azione**: Completare listing quando confermato

### 5. Uneed (in corso)
- **Contatto**: contact@uneed.best
- **Stato**: Draft risposta pronta, link submission ricevuto
- **Monitor**: Gmail query `from:uneed after:LAST_SESSION_DATE`
- **Azione**: Submittere 5 tool su uneed.best/submit-a-tool

### 6. Capterra (in attesa)
- **Stato**: F2 submitted, in review
- **Monitor**: Gmail query `from:capterra OR from:gartner after:LAST_SESSION_DATE`
- **Azione**: Se approvata → submit F1, F3, F4

### 7. Hashnode + Dev.to (contenuti)
- **Hashnode**: Pubblicazione automatica via daily-routine.sh
- **Dev.to**: Pubblicazione automatica via daily-routine.sh
- **Monitor**: Verifica pubblicazione nel log
- **Refill**: 2 articoli pillar quando coda < 2

### 8. Bluesky
- **Pubblicazione**: Automatica via daily-routine.sh
- **Refill**: 6 post quando coda < 5

## PIATTAFORME DA ISCRIVERSI (ordine priorità)

### Prossime sessioni
| Sessione | Piattaforma | Metodo login | Azione |
|----------|-------------|-------------|--------|
| 21 | Algora (console.algora.io) | GitHub OAuth | Signup + cerca bounty |
| 21 | IssueHunt (issuehunt.io) | GitHub OAuth | Signup + cerca bounty |
| 22 | Uneed submission | Browser (già registrati) | Submit 5 tool |
| 22 | Legiit (legiit.com) | Email signup | Crea 3 gig |
| 23 | SEOClerks | Email signup | Crea gig SEO |
| 23 | Codementor (codementor.io) | GitHub OAuth | Profilo + servizi |
| 24 | r/slavelabour post | Reddit (già loggati) | Post micro-task |

### Bloccate (serve tuo intervento)
| Piattaforma | Problema | Cosa ti serve |
|-------------|---------|---------------|
| Contra.com | Google blocca browser MCP | Login manuale |
| LinkedIn | Serve login | Login manuale |
| G2 | DataDome CAPTCHA | Login manuale |
| Fiverr | CAPTCHA probabile | Login manuale |
| Upwork | CAPTCHA probabile | Login manuale |

## QUERY GMAIL COMPLETE — copia-incolla

```
# TUTTE le risposte in un'unica query
(subject:re: OR subject:reply) (to:hello@fixmyweb.dev OR to:hello@captureapi.dev OR to:hello@complipilot.dev OR to:hello@paymentrescue.dev OR to:hello@parseflow.dev) after:YYYY-MM-DD

# Reddit DM
from:reddit (subject:message OR subject:direct OR subject:comment) after:YYYY-MM-DD

# Marketplace/Platform updates
from:capterra OR from:gartner OR from:g2 OR from:rapidapi OR from:dealmirror OR from:uneed after:YYYY-MM-DD

# Bounce/Errori
from:mailer-daemon OR from:postmaster OR subject:undeliverable after:YYYY-MM-DD

# Lead caldi (aziende con ticket aperto)
from:paddle OR from:maxio OR from:chargebee OR from:craftmypdf after:YYYY-MM-DD
```
