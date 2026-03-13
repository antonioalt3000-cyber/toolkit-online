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

## Tool attuali (99 tool = 594 pagine)
### Finance (20)
vat-calculator, percentage-calculator, loan-calculator, salary-calculator, tip-calculator, discount-calculator, electricity-calculator, invoice-generator, invoice-calculator, mortgage-calculator, currency-converter, fuel-cost-calculator, compound-interest-calculator, investment-calculator, paycheck-calculator, profit-margin-calculator, sales-tax-calculator, roi-calculator, mortgage-amortization, inflation-calculator

### Text (20)
word-counter, lorem-ipsum-generator, text-case-converter, character-counter, text-to-slug, markdown-preview, html-encoder, text-diff, typing-speed-test, character-map, text-to-speech, grammar-checker, resume-builder, ai-text-detector, text-repeater, emoji-picker, word-frequency-counter, line-counter, note-taking, flashcard-maker

### Health (10)
bmi-calculator, calorie-calculator, body-fat-calculator, ideal-weight-calculator, water-intake-calculator, sleep-calculator, pregnancy-calculator, pace-calculator, breathing-exercise, noise-generator

### Conversion (11)
unit-converter, base64-converter, time-zone-converter, cooking-converter, csv-to-json, url-encoder, jpg-to-pdf, pdf-to-jpg, word-to-pdf, number-to-words, temperature-converter

### Developer (18)
json-formatter, color-picker, password-generator, qr-code-generator, barcode-generator, screen-resolution, screen-recorder, regex-tester, hex-converter, hash-generator, binary-converter, binary-translator, color-converter, ip-lookup, cron-expression-generator, timestamp-converter, color-palette-generator, internet-speed-test

### Math (14)
age-calculator, speed-calculator, date-calculator, random-number-generator, aspect-ratio-calculator, grade-calculator, countdown-timer, fraction-calculator, gpa-calculator, scientific-calculator, stopwatch, percentage-change-calculator, pomodoro-timer, habit-tracker

### Images (6)
image-compressor, image-resizer, photo-editor, pixel-ruler, meme-generator, pixel-art-maker

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
- Target raggiunto: 99 tool (obiettivo iniziale 100+) — continuare ad espandere
- Creare account Dev.to + Sellix per automazione
- Articoli SEO su Dev.to per backlink
- Prodotti digitali su Sellix
- Google Analytics (GA4 Measurement ID)
