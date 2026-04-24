# CHECK RESPONSES — Procedura automatica per /boss

> Eseguire ad OGNI sessione /boss PRIMA di qualsiasi altra azione.
> Questo checklist viene eseguito dal boss agent usando Gmail MCP e Chrome DevTools.

## 1. Email Risposte Outreach (Gmail MCP)

Eseguire queste query Gmail in ordine:

```
# Risposte REALI (non auto-reply) alle nostre email outreach
(subject:re: OR subject:reply OR subject:response) (to:hello@fixmyweb.dev OR to:hello@captureapi.dev OR to:hello@complipilot.dev OR to:hello@paymentrescue.dev OR to:hello@parseflow.dev) -from:mailer-daemon -subject:automatic -subject:auto-reply after:YYYY-MM-DD

# Lead caldi da monitorare (aziende che hanno aperto ticket)
from:paddle OR from:maxio OR from:chargebee OR from:zuora after:YYYY-MM-DD

# Capterra/G2 approvazione
from:capterra OR from:gartner OR from:g2 after:YYYY-MM-DD

# Reddit DM (Reddit invia notifica email per ogni DM)
from:reddit (subject:message OR subject:sent OR subject:direct) after:YYYY-MM-DD

# RapidAPI (nuovi subscriber o usage)
from:rapidapi after:YYYY-MM-DD

# Email bounce (problemi deliverability)
from:mailer-daemon OR from:postmaster OR subject:undeliverable OR subject:bounced after:YYYY-MM-DD
```

Sostituire `YYYY-MM-DD` con la data dell'ultima sessione.

## 2. Reddit DM Check (Chrome DevTools)

Se Gmail mostra notifiche Reddit DM:
1. Login via magic link (email → Gmail → click link nel browser)
2. Navigare a https://www.reddit.com/message/inbox/
3. Leggere i messaggi
4. Rispondere con quote personalizzato per il servizio richiesto

## 3. Template Risposte

### Per richiesta WCAG Audit:
```
Hi! Thanks for reaching out.

For a WCAG 2.2 accessibility audit, here's what I provide:
- Full 201-point scan of your website
- Detailed report with every issue and severity level
- Fix code snippets for each problem
- Accessibility statement generation

Pricing: $50 for single page, $100 for full site (up to 20 pages).
Turnaround: 24-48 hours.

Send me your URL and I'll start right away.
```

### Per richiesta SEO Audit:
```
Hi! Thanks for your interest.

My SEO technical audit covers:
- Core Web Vitals analysis
- Meta tags, schema markup, sitemap review
- Mobile-friendliness and page speed
- Competitor comparison (up to 3 competitors)
- Actionable recommendations prioritized by impact

Pricing: $30 for quick scan, $75 for comprehensive audit with competitor analysis.
Turnaround: 24 hours.

Send me your URL to get started.
```

### Per richiesta Bug Fix:
```
Hi! Happy to help with that.

To give you an accurate quote, I need:
1. What's the bug/issue? (description + screenshots if possible)
2. What tech stack? (React, Next.js, Node, etc.)
3. Can you share the repo or relevant code?

Typical pricing: $30-100 depending on complexity.
Turnaround: Usually same day for simple fixes, 24-48h for complex ones.
```

### Per richiesta Code Review:
```
Hi! I'd be happy to review your code.

My review covers:
- Security vulnerabilities (OWASP top 10)
- Performance bottlenecks
- Best practices and clean code
- TypeScript type safety
- Architecture suggestions

Pricing: $50 for single file/component, $100 for full project review.
Turnaround: 24-48 hours.

Share your repo and I'll get started.
```

### Per richiesta API Development:
```
Hi! Thanks for reaching out.

For API development, I need to understand:
1. What data/functionality do you need the API to handle?
2. Any third-party integrations required?
3. Authentication requirements?
4. Expected usage volume?

Typical pricing: $75-150 depending on scope.
Turnaround: 2-5 days for a complete API.

Let's discuss the details!
```

## 4. Azione dopo check

- Se ci sono risposte REALI → rispondere immediatamente usando i template
- Se ci sono DM Reddit → rispondere via browser
- Se ci sono bounce → rimuovere email dal CONTACTS_REGISTRY.md
- Se Capterra approvata → procedere con listing F1, F3, F4
- Se RapidAPI ha nuovi user → monitorare usage
- SEMPRE aggiornare portfolio-state.md con le risposte ricevute
