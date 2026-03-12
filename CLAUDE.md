# ToolKit Online — Project Context

## Overview
Portfolio di micro-tool gratuiti per generare traffico SEO e monetizzare con Google AdSense.
- **URL:** https://toolkitonline.vip
- **Stack:** Next.js 16 + TypeScript + Tailwind CSS
- **Hosting:** Vercel (auto-deploy da GitHub)
- **Lingue:** 6 (IT, EN, ES, FR, DE, PT)
- **Monetizzazione:** Google AdSense (ca-pub-7033623734141087)

## Account & Servizi
- **GitHub:** antonioalt3000-cyber/toolkit-online (branch: master)
- **Vercel:** auto-deploy da GitHub
- **Dominio:** toolkitonline.vip (Porkbun)
- **GTM:** GTM-WKG7WCXZ
- **Google Search Console:** verificato con file HTML
- **AdSense:** in attesa approvazione

## Architettura
- `app/[lang]/tools/[tool-name]/page.tsx` — pagine tool
- `lib/translations.ts` — traduzioni + toolList + getToolsByCategory()
- `components/` — Header, Footer, componenti condivisi
- `app/sitemap.ts` — sitemap dinamica
- `app/robots.ts` — robots.txt
- `app/api/google-verification/route.ts` — verifica Google Search Console
- `public/` — assets statici, ads.txt, manifest.json

## Tool attuali (40 tool = 240 pagine)
### Finance (11)
vat-calculator, percentage-calculator, loan-calculator, salary-calculator, tip-calculator, discount-calculator, electricity-calculator, invoice-generator, mortgage-calculator, currency-converter, fuel-cost-calculator

### Text (7)
word-counter, lorem-ipsum-generator, text-case-converter, character-counter, text-to-slug, markdown-preview, html-encoder

### Health (2)
bmi-calculator, calorie-calculator

### Conversion (5)
unit-converter, base64-converter, time-zone-converter, cooking-converter, csv-to-json

### Developer (7)
json-formatter, color-picker, password-generator, qr-code-generator, screen-resolution, regex-tester, hex-converter

### Math (7)
age-calculator, speed-calculator, date-calculator, random-number-generator, aspect-ratio-calculator, grade-calculator, countdown-timer

### Images (1)
image-compressor

## Convenzioni
- Ogni tool è un file `page.tsx` con 'use client'
- Le traduzioni vanno in `lib/translations.ts` nell'oggetto `tools` E in `getToolsByCategory()`
- La sitemap si genera automaticamente da `toolList`
- Commit messages in inglese, comunicazione con l'utente in italiano
- Il dominio base nella sitemap è hardcoded come fallback: 'https://toolkitonline.vip'
- Ogni tool DEVE avere: ToolPageWrapper, SEO article (300-400 parole x6 lingue), FAQ accordion (4-5 domande)
- Layout tool: max-w-2xl

## Skill disponibili (slash commands)
- `/new-tool [slug] [category]` — Crea un nuovo tool completo
- `/deploy [messaggio]` — Build + commit + push + verifica
- `/seo-check [slug]` — Analisi SEO di un tool
- `/add-tools-batch [slug1,slug2,...] [category]` — Crea tool in batch
- `/publish-article [topic]` — Pubblica articolo su Dev.to (richiede API key)

## Prossimi passi
- Attendere approvazione AdSense
- Aggiungere nuovi tool (target: 100+) — vedi .claude/projects/strategy.md
- Creare account Dev.to + Sellix per automazione
- Articoli SEO su Dev.to per backlink
- Prodotti digitali su Sellix
- Google Analytics (GA4 Measurement ID)
