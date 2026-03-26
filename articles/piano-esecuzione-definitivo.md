# Piano Esecuzione Definitivo — Promozione 6 Business

> Versione: 1.0 | Data: 26 marzo 2026
> Identita: DevToolsmith | Email: antonio.alt3000@gmail.com | No Twitter

---

## 1. ACCESSO PIATTAFORME — Come entrare

### Profili GIA ATTIVI (login via Playwright)

| # | Piattaforma | URL Login | Metodo | Stato |
|---|------------|-----------|--------|-------|
| 1 | GitHub | github.com/login | Gia loggato in Playwright | ✅ Profilo completo |
| 2 | Dev.to | dev.to/enter → "Continue with GitHub" | GitHub OAuth | ✅ Profilo completo |
| 3 | Product Hunt | producthunt.com/login → "Sign in with Github" | GitHub OAuth | ✅ Profilo completo |
| 4 | DevHunt | devhunt.org → GitHub login (bottone in alto) | GitHub OAuth | Serve re-login |
| 5 | SaaSHub | saashub.com/login → Recovery password | Email+pw (pw persa) | Serve recovery |
| 6 | AlternativeTo | alternativeto.net/signin/ | Email+pw | Captcha blocca |
| 7 | Uneed | uneed.best → Google login | Google OAuth | ✅ Attivo |
| 8 | Launching Next | launchingnext.com/submit/ | Nessun login | ✅ Form aperto |

### Profili DA CREARE

| # | Piattaforma | URL Signup | Metodo login | Username | Passi |
|---|------------|-----------|-------------|----------|-------|
| 9 | **Reddit** | reddit.com/register | Google login | devtoolsmith | 1. Naviga a reddit.com/register 2. Click "Continue with Google" 3. Utente autorizza 4. Scegli username "devtoolsmith" 5. Compila bio |
| 10 | **LinkedIn** | linkedin.com/signup | Email | DevToolsmith | 1. Naviga a linkedin.com/signup 2. Email: antonio.alt3000@gmail.com 3. Utente inserisce password 4. Compila profilo completo |
| 11 | **Quora** | quora.com | Google login | DevToolsmith | 1. Naviga a quora.com 2. Click "Continue with Google" 3. Utente autorizza 4. Compila bio e credenziali |
| 12 | **Indie Hackers** | indiehackers.com/sign-up | Google login | devtoolsmith | 1. Naviga a indiehackers.com/sign-up 2. Click Google 3. Compila profilo |
| 13 | **Pinterest Business** | business.pinterest.com | Google login | DevToolsmith | 1. Naviga a business.pinterest.com 2. Click "Create account" 3. Google login 4. Business type: "Software" |

### Directory DA REGISTRARE (solo form, no profilo permanente)

| # | Directory | URL Submit | Login necessario? | Metodo |
|---|-----------|-----------|-------------------|--------|
| 14 | BetaList | betalist.com/submit | Si (email) | Email signup |
| 15 | StartupBase | startupbase.io/submit | Si (email) | Email signup |
| 16 | SideProjectors | sideprojectors.com → "Post a Project" | Si (Google) | Google login |
| 17 | MicroLaunch | microlaunch.net/submit | Si (email) | Email signup |
| 18 | Peerlist | peerlist.io | Si (Google) | Google login |
| 19 | StackShare | stackshare.io | Si (GitHub) | GitHub OAuth |
| 20 | ToolFinder | toolfinder.co/submit | No/Email | Form aperto |
| 21 | TAIFT | theresanaiforthat.com/submit/ | No | Form aperto |
| 22 | Futurepedia | futurepedia.io/submit-tool | No | Form aperto |
| 23 | FutureTools | futuretools.io/submit-a-tool | No | Form aperto |
| 24 | TopAI.tools | topai.tools/submit | No | Form aperto |
| 25 | ToolsForHumans | toolsforhumans.ai/submit | No | Form aperto |
| 26 | G2 | g2.com/products/new | Si (email business) | Email signup |
| 27 | Capterra | capterra.com/vendors/sign-up | Si (email) | Email signup |
| 28 | SaaSWorthy | saasworthy.com/list-product | Si (email) | Email signup |
| 29 | TrustRadius | trustradius.com | Si (email) | Email signup |
| 30 | RapidAPI | rapidapi.com | Si (GitHub) | GitHub OAuth |
| 31 | Software Advice | softwareadvice.com | Si (email) | Email signup |
| 32 | GetApp | getapp.com | Si (email) | Email signup |

---

## 2. ORARI OTTIMALI (CET/Spagna) — Basati su ricerca

| Piattaforma | Giorni migliori | Ore CET | Max frequenza | Regola #1 |
|-------------|----------------|---------|---------------|-----------|
| **Reddit** | Lun-Gio | 12:00-15:00 | 1/sub/24h, 2 totali/giorno | 90% genuino, 10% promo |
| **LinkedIn** | Mar-Gio | 10:00-12:00 | 3-5/settimana | Link nel 1° commento |
| **Dev.to** | Mer, Gio, Sab | 13:00-15:00 | 2-3/settimana | No martedi (76% flop) |
| **Quora** | Mer-Gio | 14:00-16:00 | 3-5 risposte/sett | 90% informativo, 10% link |
| **Product Hunt** | Mar-Gio | 09:01 (= 00:01 PST) | 1 lancio/prodotto | Mai chiedere upvote |
| **Indie Hackers** | Giovedi | 15:00-18:00 | 1-2/settimana | Numeri MRR nel titolo |
| **Pinterest** | Dom-Mar | 21:00-23:00 | 5 pin/giorno, 3h intervallo | Formato 1000x1500 (2:3) |
| **Directory** | Qualsiasi | Qualsiasi | 3 min tra submission | Aggiorna ogni trimestre |

---

## 3. TIMER AUTOMATICI DA IMPOSTARE

### Timer 1: Analisi settimanale (GIA ATTIVO)
- **taskId:** monday-analysis
- **Cron:** `0 9 * * 1` (Lun 09:00)
- **Fa:** Analisi GSC 6 siti, confronto, priorita

### Timer 2: Content creation (GIA ATTIVO)
- **taskId:** tuesday-content
- **Cron:** `0 10 * * 2` (Mar 10:00)
- **Fa:** 1 blog B0 + 1 blog SaaS (rotazione)

### Timer 3: Tech check (GIA ATTIVO)
- **taskId:** thursday-technical
- **Cron:** `0 10 * * 4` (Gio 10:00)
- **Fa:** Check build, deploy, errori tutti i siti

### Timer 4: Content upgrade (GIA ATTIVO)
- **taskId:** friday-content-upgrade
- **Cron:** `0 10 * * 5` (Ven 10:00)
- **Fa:** Espandi top pages, articolo Dev.to bisettimanale

### Timer 5: Promozione quotidiana (DA CREARE)
- **taskId:** daily-social-promotion
- **Cron:** `0 12 * * 1-6` (Lun-Sab 12:00)
- **Fa:** Prepara contenuti social del giorno, notifica utente cosa postare

### Timer 6: Pinterest settimanale (DA CREARE)
- **taskId:** pinterest-weekly
- **Cron:** `0 20 * * 2,6` (Mar+Sab 20:00)
- **Fa:** Crea 5 pin Pinterest per i 6 business

### Timer 7: Directory check mensile (DA CREARE)
- **taskId:** monthly-directory-check
- **Cron:** `0 10 1 * *` (1° del mese, 10:00)
- **Fa:** Verifica listing approvati, aggiorna descrizioni, aggiungi nuovi prodotti

---

## 4. SEQUENZA DI ESECUZIONE — Ordine preciso

### FASE A: Impostare timer (5 min)
1. ~~Timer 1-4: GIA ATTIVI~~
2. Creare timer 5: daily-social-promotion
3. Creare timer 6: pinterest-weekly
4. Creare timer 7: monthly-directory-check

### FASE B: Creare account mancanti via Playwright (30 min)
Per ogni account: navigo alla pagina → utente fa Google login → io compilo profilo

5. Reddit — reddit.com/register → Google → username "devtoolsmith" → bio
6. LinkedIn — linkedin.com/signup → email → utente pw → profilo completo
7. Quora — quora.com → Google → bio + credenziali
8. Indie Hackers — indiehackers.com → Google → profilo
9. Pinterest Business — business.pinterest.com → Google → setup business

### FASE C: Caricare avatar su tutte le piattaforme (15 min)
10. Dev.to — upload avatar-final.png
11. Product Hunt — upload avatar (serve navigare settings)
12. Reddit — upload avatar dopo creazione
13. LinkedIn — upload avatar dopo creazione
14. Quora — upload avatar dopo creazione
15. Indie Hackers — upload avatar dopo creazione
16. Pinterest — upload avatar dopo creazione

### FASE D: Directory submission — Giorno 1 (20 min)
17. SaaSHub — aggiungere B0, F1, F2, F3, F4 (serve recovery pw)
18. AlternativeTo — tutti e 6 (serve risolvere captcha)

### FASE E: Directory submission — Giorno 2 (20 min)
19. Uneed — aggiungere B0, F1, F2, F3, F4
20. StackShare — B7, F4 (GitHub OAuth)
21. Peerlist — profilo + B0, B7

### FASE F: Directory submission — Giorni 3-10
(Continuare con la lista completa — 3 directory/giorno)

### FASE G: Content posting — Iniziare ciclo
22. Pubblicare Dev.to #4
23. Primo Reddit post (dopo 7+ giorni di karma building)
24. Primo LinkedIn post
25. Prime Quora risposte
26. Primi Pinterest pin

---

## 5. CONTENUTI PER PIATTAFORMA — Formato e stile

### Reddit
- **Formato:** Titolo accattivante + body 200-400 parole + screenshot
- **Link:** Nel body, naturale, mai UTM
- **Stile:** Racconto in prima persona, problema→soluzione
- **CTA:** "Would love your feedback" / "Happy to answer questions"

### LinkedIn
- **Formato:** 200-500 caratteri + 1 immagine/carosello
- **Link:** Nel PRIMO COMMENTO, mai nel post
- **Stile:** Professionale, insight-driven, numeri concreti
- **Hashtag:** 3-5 (#SaaS #WebDev #IndieHacker #BuildInPublic #Accessibility)
- **CTA:** "What's your experience with X?" (domanda per engagement)

### Dev.to
- **Formato:** 800-1500 parole, code snippets, screenshot
- **Tag:** Max 4 (webdev, javascript, tutorial, beginners)
- **Link:** Naturali nel corpo dell'articolo
- **Cover image:** Obbligatoria per CTR
- **CTA:** "If you found this useful, follow for more" (nel footer)

### Quora
- **Formato:** 150-500 parole per risposta, con bullet points
- **Link:** 1 link per risposta, dove naturale
- **Stile:** Esperto che risponde, con esperienza diretta
- **CTA:** Nessuno — la risposta utile e il CTA

### Indie Hackers
- **Formato:** Journey post con numeri (MRR, utenti, traffico)
- **Link:** Nel body
- **Stile:** Onesto, trasparente, con struggle e vittorie
- **CTA:** "What would you do differently?" (community engagement)

### Pinterest
- **Formato:** Immagine verticale 1000x1500 (2:3), testo overlay bold
- **Descrizione:** 150-220 caratteri + 3-5 hashtag
- **Link:** Ogni pin linka alla pagina specifica del tool
- **Board:** 1 board per categoria (Free Tools, Developer APIs, Accessibility, etc.)
- **Stile:** Infografiche, checklist visive, screenshot con annotazioni

---

## 6. DATI PRODOTTI PER SUBMISSION RAPIDA

### Copia-incolla per ogni directory:

**B0 ToolKit Online:**
- URL: https://toolkitonline.vip
- Name: ToolKit Online
- Tagline: 140+ Free Online Tools — No Signup Required
- Description: Free collection of 140+ browser-based tools for developers, designers, and everyday tasks. Calculators, converters, text tools, image editors, and developer utilities. Available in 6 languages. No registration, no ads, completely free.
- Category: Online Tools / Productivity / Developer Tools
- Pricing: Free
- Alternatives to: SmallSEOTools, iLovePDF, Online-Convert

**B7 CaptureAPI:**
- URL: https://captureapi.dev
- Name: CaptureAPI
- Tagline: Screenshot & PDF API — Capture any webpage in milliseconds
- Description: Fast, reliable API for capturing web pages as high-quality PNG, JPEG, or PDF. Features include full-page screenshots, custom viewports, dark mode, ad blocking, and OG image generation. Free tier with 200 screenshots/month. Built with Next.js and Puppeteer on Vercel.
- Category: Developer Tools / API / Screenshot / PDF Generation
- Pricing: Freemium (Free $0 / Starter $9 / Pro $29 / Business $79)
- Alternatives to: Urlbox, ScreenshotAPI, ApiFlash, Browserless

**F1 CompliPilot:**
- URL: https://complipilot.dev
- Name: CompliPilot
- Tagline: EU AI Act & GDPR Compliance Scanner — 200+ Automated Checks
- Description: Automated compliance scanning platform for EU AI Act and GDPR. Runs 200+ checks across transparency, data protection, risk assessment, and documentation requirements. Get an instant compliance report with actionable recommendations. Free scan available.
- Category: Compliance / Legal Tech / AI Tools / RegTech
- Pricing: Freemium (Free 3 scans / Starter $29 / Pro $79 / Enterprise $199)
- Alternatives to: OneTrust, Credo AI, TrustArc, AI Verify

**F2 AccessiScan:**
- URL: https://fixmyweb.dev
- Name: AccessiScan
- Tagline: WCAG Accessibility Scanner — 201 Automated Checks
- Description: Comprehensive web accessibility testing tool with 201 automated WCAG 2.1/2.2 checks across Perceivable, Operable, Understandable, and Robust categories. Twice the checks of WAVE. Includes No Overlay Promise, Accessibility Statement Generator, and VPAT Generator.
- Category: Accessibility / Web Development / Testing / QA
- Pricing: Freemium (Free 5 scans/day / Starter $9 / Pro $29 / Enterprise $79)
- Alternatives to: WAVE, axe, accessiBe, Siteimprove, Pope Tech

**F3 ChurnGuard:**
- URL: https://paymentrescue.dev
- Name: ChurnGuard
- Tagline: Automated Payment Recovery & Dunning for SaaS
- Description: Reduce involuntary churn with automated payment recovery. Smart 3-step dunning email sequences triggered by failed payments. Stripe Connect integration, real-time analytics dashboard, and customizable email templates. Calculate your potential recovery with the free churn calculator.
- Category: SaaS Tools / Payments / Billing / Subscription Management
- Pricing: Freemium (Free calculator / Starter $29 / Growth $59 / Scale $99)
- Alternatives to: Churnkey, ChurnBuster, Dunning.io, Butter Payments

**F4 DocuMint:**
- URL: https://parseflow.dev
- Name: DocuMint
- Tagline: Document Parsing API — Extract Structured Data from PDF & Invoices
- Description: API for extracting structured JSON data from PDF documents, invoices, and receipts. Upload any document and get clean, structured data back. Supports native PDF text extraction with plans for OCR and AI extraction. Free tier with 100 pages/month.
- Category: Developer Tools / API / Document Management / Data Extraction
- Pricing: Freemium (Free 100 pages / Starter $19 / Pro $49 / Enterprise $149)
- Alternatives to: Mindee, Nanonets, DocParser, Amazon Textract
